# %% 0) 의존성
import os, json, requests
import pandas as pd
from urllib.parse import urlencode
from xgboost import XGBRegressor

# -----------------------------
# 1) 아티팩트 로드(모델·스키마·인코딩·결측통계)
#    * 이미 만들어둔 파일 사용 권장
# -----------------------------
MODEL_PATH = "xgb_machine_demand_model.json"
FEATURES_PATH = "features.json"        # {"features": [...]}
ENCODERS_PATH = "encoders.json"        # {"machine_map": {...}, "stage_map": {...}, "crop_map": {...}}
IMPUTE_PATH = "impute_stats.json"      # {"num_means": {...}, "stage_mode": "...", "crop_mode": "..."}

model = XGBRegressor()
model.load_model(MODEL_PATH)

with open(FEATURES_PATH, "r", encoding="utf-8") as f:
    FEATURES = json.load(f)["features"]

with open(ENCODERS_PATH, "r", encoding="utf-8") as f:
    ENCODERS = json.load(f)

with open(IMPUTE_PATH, "r", encoding="utf-8") as f:
    IMP = json.load(f)
NUM_MEANS = IMP["num_means"]
STAGE_MODE = IMP["stage_mode"]
CROP_MODE  = IMP["crop_mode"]

# -----------------------------
# 2) 기상청 ASOS 일자료 → 월자료 집계
#    (avgTa: 월평균, sumRn/sumSsHr: 월합)
# -----------------------------
ASOS_URL = "http://apis.data.go.kr/1360000/AsosDalyInfoService/getWthrDataList"
KMA_KEY = os.getenv("KMA_SERVICE_KEY")  # 환경변수 or 문자열로 직접 입력

def fetch_asos_daily(stn_id: str, start_dt: str, end_dt: str, page_size=999):
    page = 1
    items = []
    while True:
        params = {
            "serviceKey": KMA_KEY,
            "dataType": "JSON",
            "dataCd": "ASOS",
            "dateCd": "DAY",
            "startDt": start_dt,
            "endDt": end_dt,
            "stnIds": stn_id,
            "pageNo": page,
            "numOfRows": page_size,
        }
        res = requests.get(ASOS_URL, params=params, timeout=30)
        res.raise_for_status()
        j = res.json()
        header = j["response"]["header"]
        if header["resultCode"] != "00":
            raise RuntimeError(f"KMA API error: {header}")
        body = j["response"]["body"]
        total = int(body["totalCount"])
        arr = body["items"].get("item", [])
        if not arr:
            break
        items.extend(arr)
        if page * page_size >= total:
            break
        page += 1
    return pd.DataFrame(items)

def daily_to_monthly(df_daily: pd.DataFrame) -> pd.DataFrame:
    if df_daily.empty:
        return pd.DataFrame(columns=["year","month","평균기온(°C)","일강수량(mm)","합계 일조시간(hr)"])
    df = df_daily.copy()
    df["tm"] = pd.to_datetime(df["tm"])
    df["year"] = df["tm"].dt.year
    df["month"] = df["tm"].dt.month
    for c in ["avgTa","sumRn","sumSsHr"]:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")
    mon = df.groupby(["year","month"]).agg({
        "avgTa": "mean",
        "sumRn": "sum",
        "sumSsHr": "sum",
    }).reset_index()
    return mon.rename(columns={"avgTa":"평균기온(°C)", "sumRn":"일강수량(mm)", "sumSsHr":"합계 일조시간(hr)"})

def get_monthly_weather_from_kma(stn_id: str, year: int) -> pd.DataFrame:
    start_dt = f"{year}0101"
    end_dt   = f"{year}1231"
    daily = fetch_asos_daily(stn_id, start_dt, end_dt)
    return daily_to_monthly(daily)

# -----------------------------
# 3) 보조 유틸
# -----------------------------
def map_with_fallback(value, mapping: dict, default_key=None):
    if value in mapping:
        return mapping[value]
    # 미학습 카테고리 등장 시: default_key 우선, 없으면 첫번째 값
    return mapping.get(default_key, list(mapping.values())[0])

def build_month_rows(machine_name: str, year: int, stn_id: str, use_api=True) -> pd.DataFrame:
    # (A) 기상: API or 평균값 백업
    if use_api and KMA_KEY:
        try:
            w = get_monthly_weather_from_kma(stn_id, year)
        except Exception as e:
            print(f"[WARN] KMA API 실패 → 평균값 사용. {e}")
            w = pd.DataFrame({"year":[year]*12, "month":list(range(1,13)),
                              "평균기온(°C)":[NUM_MEANS.get("평균기온(°C)", 20.0)]*12,
                              "일강수량(mm)":[NUM_MEANS.get("일강수량(mm)", 80.0)]*12,
                              "합계 일조시간(hr)":[NUM_MEANS.get("합계 일조시간(hr)", 180.0)]*12})
    else:
        w = pd.DataFrame({"year":[year]*12, "month":list(range(1,13)),
                          "평균기온(°C)":[NUM_MEANS.get("평균기온(°C)", 20.0)]*12,
                          "일강수량(mm)":[NUM_MEANS.get("일강수량(mm)", 80.0)]*12,
                          "합계 일조시간(hr)":[NUM_MEANS.get("합계 일조시간(hr)", 180.0)]*12})

    # (B) 생육/센서: 평균/최빈값 자동 채움
    w["기계종류_enc"]   = map_with_fallback(machine_name, ENCODERS["machine_map"])
    w["soil_ec"]        = NUM_MEANS["soil_ec"]
    w["soil_temper"]    = NUM_MEANS["soil_temper"]
    w["soil_humidty"]   = NUM_MEANS["soil_humidty"]
    w["temperature"]    = NUM_MEANS["temperature"]
    w["humidity"]       = NUM_MEANS["humidity"]
    w["sunshine"]       = NUM_MEANS["sunshine"]
    w["stage_enc"]      = map_with_fallback(STAGE_MODE, ENCODERS["stage_map"])
    w["crops_step_enc"] = map_with_fallback(CROP_MODE,  ENCODERS["crop_map"])

    # (C) 피처 순서 정렬
    X = w[FEATURES]
    return X

def predict_year(machine_name: str, year: int, stn_id: str="108", use_api=True) -> pd.DataFrame:
    X = build_month_rows(machine_name, year, stn_id, use_api=use_api)
    y = model.predict(X)
    out = X[["year","month"]].copy()
    out.insert(0, "농기계명", machine_name)
    out["예측사용건수"] = y
    return out

# -----------------------------
# 4) 사용 예시
# -----------------------------
if __name__ == "__main__":
    # 예: 서울(108) 지점, 굴삭기, 2026년
    df_forecast = predict_year(machine_name="굴삭기", year=2026, stn_id="108", use_api=True)
    print(df_forecast)
