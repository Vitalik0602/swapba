// src/components/MapView.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Фикс иконок Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapView({ ads, center = [55.7558, 37.6173] }) { // Москва по умолчанию
  return (
    <MapContainer center={center} zoom={10} style={{ height: '400px', borderRadius: 'var(--radius)' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {ads.map((ad) => (
        <Marker key={ad.id} position={ad.location || [55.7558, 37.6173]}>
          <Popup>
            <Typography variant="body2">{ad.title}</Typography>
            <Typography variant="body2">{ad.price} ₽</Typography>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;