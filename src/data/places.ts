export interface Place {
  name: string; // 地点名称（如：上海市）
  nameEn?: string; // 英文名称（可选）
  country: string; // 国家
  lat: number; // 纬度
  lng: number; // 经度
  visitedDate: string; // 访问时间（ISO 格式：2024-05-01）
  description?: string; // 备注描述（可选）
}

export const PLACES: Place[] = [
  {
    name: '上海市',
    nameEn: 'Shanghai',
    country: '中国',
    lat: 31.2304,
    lng: 121.4737,
    visitedDate: '2024-05-01',
    description: '2024年5月上海之行',
  },
  {
    name: '北京市',
    nameEn: 'Beijing',
    country: '中国',
    lat: 39.9042,
    lng: 116.4074,
    visitedDate: '2023-10-15',
  },
  {
    name: '广州市',
    nameEn: 'Guangzhou',
    country: '中国',
    lat: 23.1291,
    lng: 113.2644,
    visitedDate: '2023-08-20',
  },
];
