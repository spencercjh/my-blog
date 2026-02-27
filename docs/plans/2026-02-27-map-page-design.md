# 地图页面设计方案

## 概述

在 Docusaurus 博客中添加一个新的地图页面，展示去过的地方（精确到市一级）。使用交互式地图，支持缩放和拖拽，地点标记带访问时间信息，点击标记时在弹窗中显示详细信息。

## 技术选型

- **地图库**：react-leaflet（Leaflet 的 React 封装）
- **数据源**：OpenStreetMap
- **样式**：CSS Modules
- **类型**：TypeScript

## 架构设计

### 文件结构

```
src/
├── data/
│   └── places.ts           # 地点数据配置
├── components/
│   └── TravelMap.tsx       # 地图核心组件
├── pages/
│   ├── map.tsx            # 地图页面
│   └── map.module.css     # 地图页面样式
docusaurus.config.ts        # 添加导航项
```

### 技术依赖

需要安装：

- `leaflet` - OpenStreetMap 核心库
- `react-leaflet` - Leaflet 的 React 组件封装
- `@types/leaflet` - TypeScript 类型定义

## 数据结构

```typescript
interface Place {
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
  },
  // ...
];
```

## 组件设计

### TravelMap.tsx

```typescript
interface TravelMapProps {
  places: Place[];
}
```

使用 react-leaflet 组件：

- `MapContainer`：地图容器，设置初始中心点和缩放级别
- `TileLayer`：加载 OpenStreetMap 瓦片
- `Marker`：地点标记
- `Popup`：点击标记时弹出的信息框

### map.tsx

```typescript
// 导入 PLACES 从 places.ts
// 使用 Docusaurus Layout 组件
// 渲染 TravelMap 组件
// 页面标题："我走过的地方"
```

## 样式设计

使用 CSS Modules 控制样式：

- 地图容器高度：600px（或使用视口高度）
- 响应式适配：移动端自动调整
- Popup 样式：优化字体和间距

## 导航配置

在 `docusaurus.config.ts` 的 navbar items 中添加：

```typescript
{ to: '/map', label: '足迹', position: 'left' }
```

位置在 Blog 和 Tags 之后。

## 验证方案

1. **本地验证**：
   - `npm run start` 启动开发服务器
   - 访问 `http://localhost:3000/map`
   - 验证地图正常加载、标记正确显示、弹窗正常工作
   - 验证导航栏 "足迹" 链接正确跳转

2. **测试数据验证**：
   - 添加几个测试地点（北京、上海、深圳）
   - 验证标记位置准确性
   - 验证访问时间在弹窗中正确显示

3. **响应式测试**：
   - 在不同屏幕尺寸下测试地图显示
