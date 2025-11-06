// src/pages/AdDetails.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { Box, Typography, Button, CircularProgress, Rating } from '@mui/material';
import { Favorite, FavoriteBorder, Chat, Phone } from '@mui/icons-material';
import MapView from '../components/MapView';
import { motion } from 'framer-motion';

function AdDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ad, isLoading, error } = useQuery({
    queryKey: ['ad', id],
    queryFn: async () => {
      const adRef = doc(db, 'ads', id);
      const adSnap = await getDoc(adRef);
      if (!adSnap.exists()) {
        throw new Error('Объявление не найдено');
      }
      const adData = { id: adSnap.id, ...adSnap.data() };
      const userRef = doc(db, 'users', adData.userId);
      const userSnap = await getDoc(userRef);
      return { ...adData, seller: userSnap.exists() ? userSnap.data() : {} };
    },
  });

  const { data: isFavorite = false } = useQuery({
    queryKey: ['favorites', auth.currentUser?.uid, id],
    queryFn: async () => {
      if (!auth.currentUser) return false;
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() && userSnap.data().favorites?.includes(id);
    },
    enabled: !!auth.currentUser,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!auth.currentUser) throw new Error('Войдите в аккаунт');
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(
        userRef,
        { favorites: isFavorite ? arrayRemove(id) : arrayUnion(id) },
        { merge: true }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites', auth.currentUser?.uid]);
    },
    onError: (error) => {
      console.error('Ошибка при добавлении в избранное:', error);
      alert('Ошибка при добавлении в избранное');
    },
  });

  const startChatMutation = useMutation({
    mutationFn: async () => {
      if (!auth.currentUser) throw new Error('Войдите в аккаунт');
      const chatId = `${auth.currentUser.uid}_${ad.userId}_${id}`;
      await setDoc(doc(db, 'chats', chatId), {
        participants: [auth.currentUser.uid, ad.userId],
        adId: id,
        createdAt: new Date(),
      });
      return chatId;
    },
    onSuccess: (chatId) => {
      navigate(`/profile/messages?chat=${chatId}`);
    },
    onError: (error) => {
      console.error('Ошибка при создании чата:', error);
      alert('Ошибка при создании чата');
    },
  });

  const handleToggleFavorite = () => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const handleStartChat = () => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
    startChatMutation.mutate();
  };

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
        <Typography color="error">Ошибка: {error.message}</Typography>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2, background: 'var(--gradient)', color: 'var(--text)' }}
          >
            Вернуться на главную
          </Button>
        </motion.div>
      </Box>
    );
  }

  const isValidLocation = ad.location && Array.isArray(ad.location) && ad.location.length === 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="container"
    >
      <Box className="glass" sx={{ p: 3, borderRadius: 'var(--radius)' }}>
        <Typography
          variant="h4"
          sx={{ color: 'var(--text)', mb: 2, fontFamily: 'var(--font-heading)', fontWeight: 700 }}
        >
          {ad.title}
        </Typography>
        {ad.imageUrl && (
          <Box
            component="img"
            src={ad.imageUrl}
            alt={ad.title}
            sx={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: 'var(--radius)', mb: 2 }}
          />
        )}
        <Typography variant="h6" sx={{ color: 'var(--text)', mb: 1 }}>
          Цена: {ad.price} ₽
        </Typography>
        <Typography sx={{ color: 'var(--muted)', mb: 2 }}>{ad.description}</Typography>
        <Typography sx={{ color: 'var(--muted)', mb: 2 }}>Категория: {ad.category}</Typography>
        <Typography sx={{ color: 'var(--muted)', mb: 2 }}>Адрес: {ad.address || 'Не указан'}</Typography>
        <Typography sx={{ color: 'var(--muted)', mb: 2 }}>
          Продавец: {ad.seller?.displayName || 'Аноним'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ color: 'var(--muted)', mr: 1 }}>Рейтинг продавца:</Typography>
          <Rating value={ad.seller?.rating || 0} readOnly precision={0.5} />
          <Typography sx={{ color: 'var(--muted)', ml: 1 }}>({ad.seller?.ratingCount || 0})</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<Chat />}
              onClick={handleStartChat}
              sx={{ background: 'var(--gradient)', color: 'var(--text)' }}
            >
              Написать продавцу
            </Button>
          </motion.div>
          {ad.seller?.phone && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                startIcon={<Phone />}
                href={`tel:${ad.seller.phone}`}
                sx={{ background: 'var(--bg-1)', color: 'var(--accent)' }}
              >
                Позвонить
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
              onClick={handleToggleFavorite}
              sx={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
            >
              {isFavorite ? 'Убрать из избранного' : 'В избранное'}
            </Button>
          </motion.div>
        </Box>
        {isValidLocation && (
          <Box sx={{ height: '400px', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <MapView location={ad.location} />
          </Box>
        )}
      </Box>
    </motion.div>
  );
}

export default AdDetails;