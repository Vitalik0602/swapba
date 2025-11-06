// src/pages/AdDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import Chat from '../components/Chat';
import MapView from '../components/MapView';
import { Typography, Box, CardMedia, Button, Rating } from '@mui/material';
import { Favorite, Share } from '@mui/icons-material';
import { motion } from 'framer-motion';

function AdDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [error, setError] = useState('');
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const adDoc = doc(db, 'ads', id);
        const adSnapshot = await getDoc(adDoc);
        if (adSnapshot.exists()) {
          setAd({ id: adSnapshot.id, ...adSnapshot.data() });
        } else {
          setError('Объявление не найдено');
        }
      } catch (error) {
        setError('Ошибка при загрузке объявления: ' + error.message);
      }
    };
    fetchAd();
  }, [id]);

  const toggleFavorite = async () => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
    try {
      setFavorite(!favorite);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        favorites: arrayUnion(id)
      });
    } catch (error) {
      console.error('Ошибка добавления в избранное:', error);
    }
  };

  if (error) {
    return (
      <div className="container" style={{ padding: '30px' }}>
        <Typography color="error" sx={{ fontFamily: 'Inter' }}>{error}</Typography>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="container" style={{ padding: '30px' }}>
        <div className="loader" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container"
      style={{ padding: '30px' }}
    >
      <Typography variant="h3" sx={{ color: 'var(--text)', fontFamily: 'Montserrat', fontWeight: 700, marginBottom: '20px' }}>
        {ad.title}
      </Typography>
      <Box sx={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <Button onClick={toggleFavorite} startIcon={<Favorite color={favorite ? 'secondary' : 'inherit'} />}>
          {favorite ? 'Убрать из избранного' : 'В избранное'}
        </Button>
        <Button startIcon={<Share />}>
          Поделиться
        </Button>
      </Box>
      <CardMedia
        component="img"
        height="300"
        image={ad.imageUrl || 'https://via.placeholder.com/800x300?text=Нет+изображения'}
        alt={ad.title}
        sx={{ borderRadius: 'var(--radius)', marginBottom: '20px', objectFit: 'cover' }}
      />
      <Typography variant="h5" sx={{ color: 'var(--accent)', fontFamily: 'Montserrat', marginBottom: '20px' }}>
        {ad.price} ₽
      </Typography>
      <Typography variant="body1" sx={{ color: 'var(--text)', fontFamily: 'Inter', marginBottom: '20px' }}>
        {ad.description}
      </Typography>
      <Typography variant="body2" sx={{ color: 'var(--muted)', fontFamily: 'Inter' }}>
        Создано: {new Date(ad.createdAt.seconds * 1000).toLocaleDateString()}
      </Typography>
      <Typography variant="body2" sx={{ color: 'var(--muted)', fontFamily: 'Inter' }}>
        Локация: {ad.location || 'Не указана'}
      </Typography>
      <Rating value={ad.rating || 4} readOnly sx={{ marginTop: '10px' }} />
      <MapView ads={[ad]} />
      {auth.currentUser && ad.userId !== auth.currentUser.uid && (
        <Chat adId={id} sellerId={ad.userId} />
      )}
    </motion.div>
  );
}

export default AdDetails;