// src/components/AdCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Button, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

function AdCard({ ad }) {
  const queryClient = useQueryClient();
  const user = auth.currentUser;

  const { data: isFavorite = false, isLoading } = useQuery({
    queryKey: ['favorite', ad.id, user?.uid],
    queryFn: async () => {
      if (!user) return false;
      const favoriteRef = doc(db, 'favorites', `${user.uid}_${ad.id}`);
      const favoriteSnap = await getDoc(favoriteRef);
      return favoriteSnap.exists();
    },
    enabled: !!user,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Авторизуйтесь, чтобы добавить в избранное');
      const favoriteRef = doc(db, 'favorites', `${user.uid}_${ad.id}`);
      await setDoc(favoriteRef, {
        userId: user.uid,
        adId: ad.id,
        createdAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorite', ad.id, user?.uid]);
      queryClient.invalidateQueries(['favorites', user?.uid]);
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Авторизуйтесь, чтобы удалить из избранного');
      const favoriteRef = doc(db, 'favorites', `${user.uid}_${ad.id}`);
      await deleteDoc(favoriteRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorite', ad.id, user?.uid]);
      queryClient.invalidateQueries(['favorites', user?.uid]);
    },
  });

  const handleFavoriteToggle = () => {
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт');
      return;
    }
    if (isFavorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03, boxShadow: 'var(--neon)' }}
    >
      <Card className="glass" sx={{ background: 'var(--bg-2)', borderRadius: 'var(--radius)', position: 'relative' }}>
        {user && (
          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            <IconButton
              onClick={handleFavoriteToggle}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: isFavorite ? 'var(--accent)' : 'var(--text)',
                background: 'rgba(0,0,0,0.3)',
                '&:hover': { background: 'rgba(0,0,0,0.5)' },
              }}
              disabled={isLoading}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </motion.div>
        )}
        <CardMedia
          component="img"
          image={ad.imageUrl || '/images/no-image.png'}
          alt={ad.title}
          sx={{ borderRadius: 'var(--radius) var(--radius) 0 0', objectFit: 'cover' }}
        />
        <CardContent>
          <Typography variant="h6" sx={{ color: 'var(--text)', fontFamily: 'Montserrat', fontWeight: 600 }}>
            {ad.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--muted)', marginBottom: '10px', fontFamily: 'Inter' }}>
            {ad.description.length > 100 ? ad.description.slice(0, 100) + '...' : ad.description}
          </Typography>
          <Typography variant="h6" sx={{ color: 'var(--accent)', marginBottom: '10px', fontFamily: 'Montserrat' }}>
            {ad.price.toLocaleString()} ₽
          </Typography>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              component={Link}
              to={`/ad/${ad.id}`}
              sx={{
                background: 'var(--gradient)',
                color: 'var(--text)',
                borderRadius: 'var(--radius)',
                fontWeight: 600,
                width: '100%',
                '&:hover': { background: 'var(--accent-2)' },
              }}
            >
              Подробнее
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AdCard;