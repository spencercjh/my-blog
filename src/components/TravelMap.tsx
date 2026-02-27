import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Place } from '../data/places';

// 修复 Leaflet 默认标记图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface TravelMapProps {
  places: Place[];
}

const TravelMap: React.FC<TravelMapProps> = ({ places }) => {
  const defaultCenter: [number, number] =
    places.length > 0 ? [places[0].lat, places[0].lng] : [35.8617, 104.1954]; // 中国中心点

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <MapContainer center={defaultCenter} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((place, index) => (
          <Marker key={`${place.name}-${index}`} position={[place.lat, place.lng]}>
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
