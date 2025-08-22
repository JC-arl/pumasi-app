#!/usr/bin/env python3
"""
2025년 농기계 수요 예측 스크립트
XGBoost 모델을 사용하여 6계열(트랙터/수확기/파쇄기/탈곡기/이앙기/살포기) 월별 수요 예측
"""

import json
import argparse
import pandas as pd
import numpy as np
import xgboost as xgb
from pathlib import Path
import os
from dotenv import load_dotenv


def load_env():
    """환경변수 로드"""
    load_dotenv()
    return os.getenv('API_KEY')


def load_artifacts(model_path, features_path, encoders_path, impute_path):
    """모델과 메타데이터 로드"""
    # XGBoost 모델 로드
    booster = xgb.Booster()
    booster.load_model(model_path)
    
    # 피처 순서 로드
    with open(features_path, 'r', encoding='utf-8') as f:
        features_data = json.load(f)
        features = features_data['features']
    
    # 인코더 로드
    with open(encoders_path, 'r', encoding='utf-8') as f:
        encoders = json.load(f)
    
    # 대체통계 로드
    with open(impute_path, 'r', encoding='utf-8') as f:
        impute_stats = json.load(f)
    
    return booster, features, encoders, impute_stats


def get_weather_fallback(impute_stats):
    """기상 데이터 대체값 생성 (월별)"""
    weather_data = []
    
    # 12개월에 대해 impute_stats의 평균값 사용
    for month in range(1, 13):
        weather_data.append({
            'month': month,
            '평균기온(°C)': impute_stats['num_means']['평균기온(°C)'],
            '일강수량(mm)': impute_stats['num_means']['일강수량(mm)'],
            '합계 일조시간(hr)': impute_stats['num_means']['합계 일조시간(hr)']
        })
    
    return pd.DataFrame(weather_data)


def build_features(year, categories, weather_df, encoders, impute_stats, features):
    """피처 매트릭스 구축"""
    data = []
    
    # 6계열 x 12개월 = 72행 생성
    for category in categories:
        for month in range(1, 13):
            row = {}
            
            # 기본 피처
            row['year'] = year
            row['month'] = month
            
            # 기상 데이터 (월별)
            weather_month = weather_df[weather_df['month'] == month].iloc[0]
            row['평균기온(°C)'] = weather_month['평균기온(°C)']
            row['일강수량(mm)'] = weather_month['일강수량(mm)']
            row['합계 일조시간(hr)'] = weather_month['합계 일조시간(hr)']
            
            # 토양/환경 데이터 (impute_stats 평균값 사용)
            row['soil_ec'] = impute_stats['num_means']['soil_ec']
            row['soil_temper'] = impute_stats['num_means']['soil_temper']
            row['soil_humidty'] = impute_stats['num_means']['soil_humidty']
            row['temperature'] = impute_stats['num_means']['temperature']
            row['humidity'] = impute_stats['num_means']['humidity']
            row['sunshine'] = impute_stats['num_means']['sunshine']
            
            # 기계종류 인코딩
            machine_map = encoders['machine_map']
            # 카테고리명에 따른 매핑
            category_machine_map = {
                '트랙터': '트랙터',
                '수확기': '땅속작물수확기',
                '파쇄기': '잔가지파쇄기',
                '탈곡기': '콩탈곡기',
                '이앙기': '승용이앙기',
                '살포기': '퇴비살포기'
            }
            
            machine_name = category_machine_map.get(category, category)
            # 정확한 매칭을 위해 키에서 검색
            machine_enc = -1
            for key, value in machine_map.items():
                if machine_name in key:
                    machine_enc = value
                    break
            
            row['기계종류_enc'] = machine_enc
            
            # stage_enc, crops_step_enc (최빈값 사용)
            stage_map = encoders['stage_map']
            crop_map = encoders['crop_map']
            
            stage_mode = impute_stats['stage_mode']
            crop_mode = impute_stats['crop_mode']
            
            row['stage_enc'] = stage_map.get(stage_mode, 2)  # nan -> 2
            row['crops_step_enc'] = crop_map.get(crop_mode, 2)  # nan -> 2
            
            data.append(row)
    
    df = pd.DataFrame(data)
    
    # features 순서에 맞게 컬럼 정렬
    df = df[features]
    
    return df


def predict_demand(booster, X, features):
    """수요 예측"""
    # DMatrix 생성
    dmatrix = xgb.DMatrix(X, feature_names=features)
    
    # 예측 수행
    predictions = booster.predict(dmatrix)
    
    # 음수 클리핑 및 반올림
    predictions = np.maximum(predictions, 0)
    predictions = np.round(predictions).astype(int)
    
    return predictions


def to_month_json(predictions, year, categories):
    """월별 JSON 형태로 변환"""
    result = {
        "year": year,
        "monthly": []
    }
    
    # 계열명 매핑
    category_display_map = {
        '트랙터': '트랙터 계열',
        '수확기': '수확기 계열',
        '파쇄기': '파쇄기 계열',
        '탈곡기': '탈곡기 계열',
        '이앙기': '이양기 계열',
        '살포기': '살포기 계열'
    }
    
    # 예측값을 월별로 재구성 (6계열 x 12개월)
    pred_matrix = predictions.reshape(len(categories), 12)
    
    for month in range(12):
        month_data = {"월": month + 1}
        
        for i, category in enumerate(categories):
            display_name = category_display_map[category]
            month_data[display_name] = int(pred_matrix[i][month])
        
        result["monthly"].append(month_data)
    
    return result


def save_json(data, output_path):
    """JSON 파일 저장"""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"예측 결과 저장: {output_path}")


def main():
    parser = argparse.ArgumentParser(description='2025년 농기계 수요 예측')
    parser.add_argument('--year', type=int, default=2025, help='예측 연도')
    parser.add_argument('--station', type=str, default='146', help='기상관측소 코드')
    parser.add_argument('--model', type=str, required=True, help='XGBoost 모델 경로')
    parser.add_argument('--features', type=str, required=True, help='피처 순서 JSON 경로')
    parser.add_argument('--encoders', type=str, required=True, help='인코더 JSON 경로')
    parser.add_argument('--impute', type=str, required=True, help='대체통계 JSON 경로')
    parser.add_argument('--out', type=str, required=True, help='출력 JSON 경로')
    
    args = parser.parse_args()
    
    print(f"2025년 농기계 수요 예측 시작...")
    
    # 환경변수 로드
    api_key = load_env()
    print(f"API 키 로드: {'OK' if api_key else 'SKIP'}")
    
    # 모델과 메타데이터 로드
    print("모델 및 메타데이터 로드 중...")
    booster, features, encoders, impute_stats = load_artifacts(
        args.model, args.features, args.encoders, args.impute
    )
    print(f"피처 수: {len(features)}")
    
    # 기상 데이터 (대체값 사용)
    print("기상 데이터 생성 중 (대체값 사용)...")
    weather_df = get_weather_fallback(impute_stats)
    print(f"월별 기상 데이터: {len(weather_df)}개월")
    
    # 피처 매트릭스 구축
    print("피처 매트릭스 구축 중...")
    categories = ["트랙터", "수확기", "파쇄기", "탈곡기", "이앙기", "살포기"]
    X = build_features(args.year, categories, weather_df, encoders, impute_stats, features)
    print(f"피처 매트릭스 크기: {X.shape}")
    
    # 수요 예측
    print("수요 예측 중...")
    predictions = predict_demand(booster, X, features)
    print(f"예측 완료: {len(predictions)}개 값")
    
    # JSON 형태로 변환
    print("결과 변환 중...")
    result_json = to_month_json(predictions, args.year, categories)
    
    # 결과 저장
    save_json(result_json, args.out)
    
    # 결과 요약 출력
    print("\n=== 예측 결과 요약 ===")
    for month_data in result_json["monthly"][:3]:  # 첫 3개월만 출력
        print(f"월: {month_data['월']}")
        for key, value in month_data.items():
            if key != '월':
                print(f"  {key}: {value}건")
        print()
    
    print("예측 완료!")


if __name__ == "__main__":
    main()