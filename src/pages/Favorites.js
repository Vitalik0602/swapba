// src/pages/Favorites.js
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { Grid, Typography, CircularProgress, Box, Button } from '@mui/material';
import AdCard from '../components/AdCard';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Favorites() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const { data: favorites = [], isLoading, error } = useQuery({
    queryKey: ['favorites', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const favoritesQuery = query(collection(db, 'favorites'), where('userId', '==', user.uid));
      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favoriteAds = await Promise.all(
        favoritesSnapshot.docs.map(async (favoriteDoc) => {
          const adId = favoriteDoc.data().adId;
          const adRef = doc(db, 'ads', adId);
          const adSnap = await getDoc(adRef);
          if (adSnap.exists()) {
            return { id: adSnap.id, ...adSnap.data() };
          }
          return null;
        })
      );
      return favoriteAds.filter((ad) => ad !== null);
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container"
      >
        <Typography variant="h6" sx={{ color: 'var(--text)', fontFamily: 'Montserrat', mb: 2 }}>
          Войдите в аккаунт, чтобы просматривать избранное
        </Typography>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ background: 'var(--gradient)', color: 'var(--text)' }}
          >
            Войти
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Ошибка загрузки избранного: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="container"
    >
      <Typography
        variant="h4"
        sx={{ color: 'var(--text)', mb: 3, fontFamily: 'Montserrat', fontWeight: 700 }}
      >
        Избранное
      </Typography>
      {favorites.length > 0 ? (
        <Grid container spacing={2}>
          {favorites.map((ad) => (
            <Grid item xs={12} sm={6} md={4} key={ad.id}>
              <AdCard ad={ad} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography sx={{ color: 'var(--muted)' }}>У вас нет избранных объявлений</Typography>
      )}
    </motion.div>
  );
}

export default Favorites;