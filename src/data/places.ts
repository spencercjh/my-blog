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
];
