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

function MapView({ ads, center = [55.7558, 37.6173] }) {
  const isValidLocation = (location) =>
    Array.isArray(location) &&
    location.length === 2 &&
    typeof location[0] === 'number' &&
    typeof location[1] === 'number' &&
    !isNaN(location[0]) &&
    !isNaN(location[1]);

  const validAds = ads.filter((ad) => isValidLocation(ad.location));

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
        center={center}
        zoom= {12}
        style={{ height: '400px', borderRadius: 'var(--radius)', border: 'var(--glass-border)' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {validAds.map((ad) => (
          <Marker key={ad.id} position={ad.location}>
            <Popup>
              <Typography variant="body2">{ad.title}</Typography>
              <Typography variant="body2">{ad.price.toLocaleString()} ₽</Typography>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </motion.div>
  );
}

export default MapView;