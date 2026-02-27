export interface Place {
  name: string; // 地点名称（如：上海市）
  nameEn?: string; // 英文名称（可选）
  country: string; // 国家
  lat: number; // 纬度
  lng: number; // 经度
  firstVisitDate: string; // 初次访问时间（ISO 格式：2024-05 或 2024-05-01）
  description?: string; // 备注描述（可选）
}

export const PLACES: Place[] = [
  {
    name: '上海市',
    nameEn: 'Shanghai',
    country: '中国',
    lat: 31.2312707,
    lng: 121.4700152,
    firstVisitDate: '2024-05',
  },
  {
    name: '北京市',
    nameEn: 'Beijing',
    country: '中国',
    lat: 39.9057136,
    lng: 116.3912972,
    firstVisitDate: '2019-08',
  },
  {
    name: '广州市',
    nameEn: 'Guangzhou',
    country: '中国',
    lat: 23.1288454,
    lng: 113.2590064,
    firstVisitDate: '2023-08-20',
  },
];
