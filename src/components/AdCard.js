// src/components/AdCard.js — ПОЛНЫЙ, РАБОЧИЙ, С ИМЕНЕМ ПРОДАВЦА, КАК НА AVITO
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { motion } from 'framer-motion';

function AdCard({ ad }) {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const isFavorite = user && ad.favorites?.includes(user.uid);

  // Имя продавца: ad.sellerName → "Продавец"
  const sellerName = ad.sellerName?.trim() ? ad.sellerName.trim() : 'Продавец';

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    const adRef = doc(db, 'ads', ad.id);
    const userRef = doc(db, 'users', user.uid);

    try {
      if (isFavorite) {
        await updateDoc(adRef, {
          favorites: arrayRemove(user.uid),
        });
        await updateDoc(userRef, {
          favorites: arrayRemove(ad.id),
        });
      } else {
        await updateDoc(adRef, {
          favorites: arrayUnion(user.uid),
        });
        await updateDoc(userRef, {
          favorites: arrayUnion(ad.id),
        });
      }
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
    }
  };

  const handleClick = () => {
    navigate(`/ad/${ad.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(255, 109, 0, 0.2)' }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={handleClick}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-2)',
          border: '1px solid var(--stroke)',
          borderRadius: 'var(--radius)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'var(--accent)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={ad.imageUrl || '/placeholder.jpg'}
            alt={ad.title}
            sx={{
              objectFit: 'cover',
              borderRadius: 'var(--radius) var(--radius) 0 0',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.03)',
              },
            }}
          />
          <IconButton
            onClick={handleToggleFavorite}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              color: isFavorite ? '#ff1744' : 'white',
              '&:hover': { background: 'rgba(0,0,0,0.7)' },
              transition: 'all 0.2s ease',
            }}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <Chip
            label={ad.category || 'Другое'}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              background: 'var(--accent)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              px: 1,
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: 'var(--text)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '1rem',
              lineHeight: 1.4,
            }}
          >
            {ad.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'var(--muted)',
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.875rem',
              lineHeight: 1.5,
            }}
          >
            {ad.description || 'Без описания'}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 'auto',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              {ad.price.toLocaleString('ru-RU')} ₽
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--muted)',
                fontSize: '0.8rem',
              }}
            >
              {ad.createdAt?.toDate
                ? new Date(ad.createdAt.toDate()).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                  })
                : 'Недавно'}
            </Typography>
          </Box>

          {/* Имя продавца */}
          <Box
            sx={{
              mt: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'var(--muted)',
                fontWeight: 500,
                fontSize: '0.85rem',
              }}
            >
              {sellerName}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AdCard;