import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Place } from '../data/places';

// 创建自定义图标实例，避免全局原型修改
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface TravelMapProps {
  places: Place[];
}

const TravelMap: React.FC<TravelMapProps> = ({ places }) => {
  // 计算所有地点的边界，自动适配地图视图
  const bounds =
    places.length > 0
      ? places.map(place => [place.lat, place.lng] as [number, number])
      : [[35.8617, 104.1954] as [number, number]];

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <MapContainer bounds={bounds} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((place, index) => (
          <Marker
            key={`${place.name}-${index}`}
            position={[place.lat, place.lng]}
            icon={customIcon}
          >
            <Popup>
              <div>
                <h3>{place.name}</h3>
                {place.nameEn && <p>{place.nameEn}</p>}
                <p>国家: {place.country}</p>
                <p>访问时间: {place.visitedDate}</p>
                {place.description && <p>备注: {place.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default React.memo(TravelMap);
