// src/pages/AdDetails.js — ПОЛНЫЙ, ИСПРАВЛЕННЫЙ (импорты Link и Grid добавлены)
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import Chat from '../components/Chat';

function AdDetails() {
  const { id } = useParams();
  const user = auth.currentUser;

  const { data: ad, isLoading } = useQuery({
    queryKey: ['ad', id],
    queryFn: async () => {
      const adRef = doc(db, 'ads', id);
      const adSnap = await getDoc(adRef);
      if (!adSnap.exists()) throw new Error('Объявление не найдено');
      return { id: adSnap.id, ...adSnap.data() };
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </Box>
    );
  }

  if (!ad) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: 'var(--muted)' }}>
          Объявление не найдено
        </Typography>
      </Box>
    );
  }

  const isOwner = user && ad.userId === user.uid;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container"
      sx={{ py: 4 }}
    >
      <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
        {/* Основная информация */}
        <Box>
          <Box sx={{ mb: 3 }}>
            <img
              src={ad.imageUrl || '/placeholder.jpg'}
              alt={ad.title}
              style={{
                width: '100%',
                maxHeight: 500,
                objectFit: 'cover',
                borderRadius: 'var(--radius)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            />
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'var(--text)' }}>
            {ad.title}
          </Typography>

          <Typography variant="h4" sx={{ color: 'var(--accent)', fontWeight: 700, mb: 3 }}>
            {ad.price.toLocaleString()} ₽
          </Typography>

          <Typography variant="body1" sx={{ color: 'var(--text)', mb: 3, lineHeight: 1.7 }}>
            {ad.description || 'Описание отсутствует'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: 'var(--accent)' }}>
              {ad.sellerName?.[0] || '?'}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{ad.sellerName || 'Продавец'}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--muted)' }}>
                {new Date(ad.createdAt?.toDate()).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Боковая панель */}
        <Box>
          {!isOwner && user && <Chat adId={ad.id} />}

          {isOwner && (
            <Box
              sx={{
                p: 3,
                background: 'var(--bg-2)',
                border: '1px solid var(--stroke)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ mb: 2, fontWeight: 600 }}>Это ваше объявление</Typography>
              <Button variant="outlined" sx={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                Редактировать
              </Button>
            </Box>
          )}

          {!user && (
            <Box
              sx={{
                p: 3,
                background: 'var(--bg-2)',
                border: '1px solid var(--stroke)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ mb: 2 }}>Войдите, чтобы написать продавцу</Typography>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                sx={{ background: 'var(--gradient)' }}
              >
                Войти
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Похожие объявления */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Похожие объявления</Typography>
        <Grid container spacing={3}>
          {/* Здесь можно добавить похожие объявления */}
        </Grid>
      </Box>
    </motion.div>
  );
}

export default AdDetails;