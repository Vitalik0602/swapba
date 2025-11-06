// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button } from '@mui/material';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';

function Home() {
  const categories = [
    { id: 'auto', title: 'Автомобили', image: 'https://via.placeholder.com/150?text=Auto' },
    { id: 'realty', title: 'Недвижимость', image: 'https://via.placeholder.com/150?text=Realty' },
    { id: 'clothes', title: 'Одежда', image: 'https://via.placeholder.com/150?text=Clothes' },
    { id: 'electronics', title: 'Электроника', image: 'https://via.placeholder.com/150?text=Electronics' },
    { id: 'services', title: 'Услуги', image: 'https://via.placeholder.com/150?text=Services' },
  ];

  const { data: popularAds = [], isLoading } = useQuery({
    queryKey: ['popularAds'],
    queryFn: async () => {
      const adsQuery = query(collection(db, 'ads'), orderBy('createdAt', 'desc'), limit(6));
      const adsSnapshot = await getDocs(adsQuery);
      return adsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="container"
    >
      {/* Баннер */}
      <Box className="banner">
        <Typography variant="h1" sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
          Добро пожаловать на Swapix
        </Typography>
        <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
          Покупайте, продавайте и обменивайтесь товарами легко и быстро
        </Typography>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            component={Link}
            to="/search"
            variant="contained"
            sx={{ background: 'var(--bg-1)', color: 'var(--accent)', fontWeight: 600 }}
          >
            Начать поиск
          </Button>
        </motion.div>
      </Box>

      {/* Поиск */}
      <SearchBar />

      {/* Категории */}
      <Box className="categories-grid">
        <Typography variant="h5" sx={{ fontFamily: 'var(--font-heading)', fontWeight: 600, mb: 2 }}>
          Категории
        </Typography>
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <CategoryCard category={category} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Популярные объявления */}
      <Box className="popular-ads">
        <Typography variant="h5" sx={{ fontFamily: 'var(--font-heading)', fontWeight: 600, mb: 2 }}>
          Популярные объявления
        </Typography>
        {isLoading ? (
          <Typography sx={{ color: 'var(--text)' }}>Загрузка...</Typography>
        ) : (
          <Grid container spacing={2}>
            {popularAds.map((ad) => (
              <Grid item xs={12} sm={6} md={4} key={ad.id}>
                <motion.div whileHover={{ scale: 1.05 }} className="card">
                  <Card sx={{ background: 'var(--bg-2)', borderRadius: 'var(--radius)' }}>
                    {ad.imageUrl && <CardMedia component="img" height="140" image={ad.imageUrl} alt={ad.title} />}
                    <CardContent>
                      <Typography variant="h6" sx={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
                        {ad.title}
                      </Typography>
                      <Typography sx={{ color: 'var(--muted)' }}>{ad.price} ₽</Typography>
                      <Button
                        component={Link}
                        to={`/ad/${ad.id}`}
                        variant="outlined"
                        sx={{ mt: 1, borderColor: 'var(--accent)', color: 'var(--accent)' }}
                      >
                        Подробнее
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </motion.div>
  );
}

export default Home;