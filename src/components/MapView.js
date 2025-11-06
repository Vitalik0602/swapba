// src/components/MapView.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Typography, Box } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

// Фикс иконок Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
  iconUrl: '/images/leaflet/marker-icon.png',
  shadowUrl: '/images/leaflet/marker-shadow.png',
});

function MapView({ ads, location, center = [55.7558, 37.6173] }) {
  // Проверка корректности координат
  const isValidLocation = (loc) =>
    loc &&
    typeof loc.lat === 'number' &&
    typeof loc.lng === 'number' &&
    !isNaN(loc.lat) &&
    !isNaN(loc.lng);

  // Унификация входных данных
  const adsArray = Array.isArray(ads)
    ? ads
    : location
    ? [{ id: 'single', title: 'Объявление', price: 0, location }]
    : [];

  const validAds = adsArray.filter((ad) => isValidLocation(ad.location));

  if (validAds.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography sx={{ color: 'var(--muted)' }}>
          Местоположение не указано
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <MapContainer
        center={validAds[0]?.location ? [validAds[0].location.lat, validAds[0].location.lng] : center}
        zoom={12}
        style={{
          height: '400px',
          borderRadius: 'var(--radius)',
          border: 'var(--glass-border)',
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {validAds.map((ad) => (
          <Marker key={ad.id} position={[ad.location.lat, ad.location.lng]}>
            <Popup>
              <Typography variant="body2">{ad.title}</Typography>
              {ad.price !== undefined && (
                <Typography variant="body2">
                  {ad.price.toLocaleString()} ₽
                </Typography>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </motion.div>
  );
}

export default MapView;