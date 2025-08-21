// 전북특별자치도 농기계 데이터 (jeoubuk_tools.json 기반)
import type { Machinery } from '../types/rental';
import jeoubukToolsData from './jeoubuk_tools.json';

// 사업소명을 officeId로 매핑
const officeNameToId: Record<string, string> = {
  '계남 농기계 임대사업장': 'jeoubuk-gyenam',
  '장수 농기계 임대사업장': 'jeoubuk-jangsu',
  '강진 농기계 임대사업장': 'jeoubuk-gangjin',
  '신덕 농기계 임대사업장': 'jeoubuk-sindeok',
  '오수 농기계 임대사업장': 'jeoubuk-osu',
  '임실 농기계 임대사업장': 'jeoubuk-imsil',
  '인월 농기계 임대사업장': 'jeoubuk-inwol',
  '금지 농기계 임대사업장': 'jeoubuk-geumji',
  '사매 농기계 임대사업장': 'jeoubuk-samae',
  '마령 농기계 임대사업장': 'jeoubuk-maryeong',
  '동향 농기계 임대사업장': 'jeoubuk-donghyang',
  '부귀 농기계 임대사업장': 'jeoubuk-bugwi',
  '안천 농기계 임대사업장': 'jeoubuk-ancheon',
  '상전 농기계 임대사업장': 'jeoubuk-sangjeon',
  '이백 농기계 임대사업장': 'jeoubuk-ibaek',
  '김제 농기계 임대사업장': 'jeoubuk-gimje',
  '봉남 농기계 임대사업장': 'jeoubuk-bongnam',
  '만경 농기계 임대사업장': 'jeoubuk-mangyeong',
  '공덕 농기계 임대사업장': 'jeoubuk-gongdeok',
  '무주 농기계 임대사업장': 'jeoubuk-muju',
  '전주 농기계 임대사업장': 'jeoubuk-jeonju',
  '진안 농기계 임대사업장': 'jeoubuk-jinan',
  '정천 농기계 임대사업장': 'jeoubuk-jeongcheon',
  '상서 농기계 임대사업장': 'jeoubuk-sangseo',
  '보안 농기계 임대사업장': 'jeoubuk-boan',
  '동진 농기계 임대사업장': 'jeoubuk-dongjin',
  '옹동 농기계 임대사업장': 'jeoubuk-ongdong',
  '소양 농기계 임대사업장': 'jeoubuk-soyang',
  '삼례 농기계 임대사업장': 'jeoubuk-samrye',
  '구이 농기계 임대사업장': 'jeoubuk-gui',
  '고산 농기계 임대사업장': 'jeoubuk-gosan',
  '정우 농기계 임대사업장': 'jeoubuk-jeongwoo',
  '금마 농기계 임대사업장': 'jeoubuk-geumma',
  '소성 농기계 임대사업장': 'jeoubuk-soseong',
  '개정 농기계 임대사업장': 'jeoubuk-gaejeong',
  '임피 농기계 임대사업장': 'jeoubuk-impi',
  '옥서 농기계 임대사업장': 'jeoubuk-okseo',
  '함열 농기계 임대사업장': 'jeoubuk-hamyeol',
  '고창 농기계 임대사업장': 'jeoubuk-gochang',
  '해리 농기계 임대사업장': 'jeoubuk-haeri',
  '대산 농기계 임대사업장': 'jeoubuk-daesan',
  '흥덕 농기계 임대사업장': 'jeoubuk-heungdeok',
  '순창 농기계 임대사업장': 'jeoubuk-sunchang',
  '복흥 농기계 임대사업장': 'jeoubuk-bokheung',
};

// JSON 데이터를 Machinery 형태로 변환
function transformJeoubukData(): Machinery[] {
  const machineryMap = new Map<string, Machinery>();

  Object.entries(jeoubukToolsData).forEach(([officeName, equipmentList]) => {
    const officeId = officeNameToId[officeName] || `jeoubuk-${officeName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;

    equipmentList.forEach((equipment: any, index: number) => {
      const machineryKey = `${officeId}-${equipment.농기계명}`;
      
      if (!machineryMap.has(machineryKey)) {
        // 새로운 농기계 추가
        machineryMap.set(machineryKey, {
          id: `${officeId}-${equipment.농기계명.replace(/[^a-zA-Z0-9]/g, '')}-${Math.random().toString(36).substring(2, 11)}`,
          name: equipment.농기계명,
          image: `/images/machinery/${equipment.농기계명}.jpg`,
          category: equipment.주작업 || '일반',
          officeId: officeId,
          specifications: []
        });
      }

      // 스펙 추가
      const machinery = machineryMap.get(machineryKey)!;
      machinery.specifications.push({
        id: `${equipment.표준코드}-${index}`,
        specification: equipment.규격 || '표준',
        manufacturer: equipment.제조사 || '제조사 미상',
        totalCount: equipment.totalCount || 1,
        availableCount: equipment.availableCount || 1,
        rentalPrice: equipment.임대금액 || 0,
        description: equipment.주작업 || '',
        standardCode: equipment.표준코드 || '',
      });
    });
  });

  return Array.from(machineryMap.values());
}

// 실제 JSON 데이터에서 변환된 전북 농기계 데이터
export const jeoubukMachinery: Machinery[] = transformJeoubukData();

// 비동기 함수로도 제공 (호환성을 위해)
export const getJeoubukMachinery = async (): Promise<Machinery[]> => {
  return Promise.resolve(jeoubukMachinery);
};