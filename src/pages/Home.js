// src/pages/Home.js — ПОЛНЫЙ, С ДОБАВЛЕННЫМИ КАТЕГОРИЯМИ (включая "Автомобили")
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  TextField,
  Button,
  Paper,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, ChevronRight, DirectionsCar, Smartphone, Checkroom, MenuBook, SportsSoccer, Category, Home as HomeIcon, Build, ChildCare } from '@mui/icons-material';
import AdCard from '../components/AdCard';
import { motion } from 'framer-motion';

const categories = [
  { id: 'Автомобили', label: 'Автомобили', icon: <DirectionsCar sx={{ fontSize: 40 }} /> },
  { id: 'Электроника', label: 'Электроника', icon: <Smartphone sx={{ fontSize: 40 }} /> },
  { id: 'Одежда', label: 'Одежда', icon: <Checkroom sx={{ fontSize: 40 }} /> },
  { id: 'Книги', label: 'Книги', icon: <MenuBook sx={{ fontSize: 40 }} /> },
  { id: 'Спорт', label: 'Спорт', icon: <SportsSoccer sx={{ fontSize: 40 }} /> },
  { id: 'Недвижимость', label: 'Недвижимость', icon: <HomeIcon sx={{ fontSize: 40 }} /> },
  { id: 'Инструменты', label: 'Инструменты', icon: <Build sx={{ fontSize: 40 }} /> },
  { id: 'Детские товары', label: 'Детские товары', icon: <ChildCare sx={{ fontSize: 40 }} /> },
  { id: 'Другое', label: 'Другое', icon: <Category sx={{ fontSize: 40 }} /> },
];

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['ads'],
    queryFn: async () => {
      const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (catId) => {
    navigate(`/category/${catId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container"
    >
      {/* Герой-секция с поиском */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 300, md: 400 },
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          mb: 5,
          background: 'linear-gradient(135deg, var(--accent) 0%, #ff8a00 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 800, width: '100%' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '4rem' },
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            Swapix
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontWeight: 500,
              opacity: 0.9,
              fontSize: { xs: '1.1rem', md: '1.5rem' },
            }}
          >
            Покупай и продавай рядом
          </Typography>

          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Что ищем?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'white',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  height: 56,
                },
                input: { color: '#333' },
              }}
            />
            <Button
              type="submit"
              size="large"
              sx={{
                background: '#333',
                color: 'white',
                px: 4,
                borderRadius: '50px',
                fontWeight: 600,
                '&:hover': { background: '#111' },
              }}
            >
              <SearchIcon sx={{ fontSize: 28 }} />
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Категории */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
          Популярные категории
        </Typography>
        <Grid container spacing={2}>
          {categories.map((cat) => (
            <Grid item xs={6} sm={4} md={2.4} key={cat.id}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Paper
                  onClick={() => handleCategoryClick(cat.id)}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius)',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--stroke)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: 'var(--accent)',
                      boxShadow: '0 8px 25px rgba(255, 109, 0, 0.2)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      mb: 1,
                      color: 'var(--accent)',
                    }}
                  >
                    {cat.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{cat.label}</Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Свежие объявления */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Свежие объявления
          </Typography>
          <Button
            endIcon={<ChevronRight />}
            sx={{ color: 'var(--accent)', fontWeight: 600 }}
            onClick={() => navigate('/')}
          >
            Все
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress sx={{ color: 'var(--accent)' }} size={48} />
          </Box>
        ) : ads.length > 0 ? (
          <Grid container spacing={3}>
            {ads.map((ad) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ad.id}>
                <AdCard ad={ad} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: 'var(--muted)', fontSize: '1.2rem' }}>
              Нет объявлений
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2, background: 'var(--gradient)' }}
              onClick={() => navigate('/create')}
            >
              Создать первое
            </Button>
          </Box>
        )}
      </Box>

      {/* Баннер "Создать объявление" */}
      <Box
        sx={{
          mt: 8,
          p: { xs: 4, md: 6 },
          background: 'var(--gradient)',
          borderRadius: 'var(--radius)',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Продай ненужное за минуты
        </Typography>
        <Typography sx={{ mb: 3, opacity: 0.9, fontSize: '1.1rem' }}>
          Бесплатно • Быстро • Безопасно
        </Typography>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="large"
            variant="contained"
            sx={{
              background: 'white',
              color: '#ff6d00',
              px: 5,
              py: 1.5,
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
            onClick={() => navigate('/create')}
          >
            Разместить объявление
          </Button>
        </motion.div>
      </Box>

      {/* Преимущества */}
      <Box sx={{ mt: 8, mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
          Почему Swapix?
        </Typography>
        <Grid container spacing={3}>
          {[
            { title: 'Бесплатно', desc: 'Размещение без комиссии', icon: 'free_breakfast' },
            { title: 'Быстро', desc: 'Покупатель найдётся за часы', icon: 'bolt' },
            { title: 'Безопасно', desc: 'Чат и проверка пользователей', icon: 'verified_user' },
            { title: 'Удобно', desc: 'Поиск рядом с вами', icon: 'location_on' },
          ].map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--stroke)',
                  borderRadius: 'var(--radius)',
                  height: '100%',
                }}
              >
                <Box sx={{ fontSize: '3rem', mb: 1, color: 'var(--accent)' }}>
                  {item.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>{item.title}</Typography>
                <Typography sx={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
                  {item.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </motion.div>
  );
}

export default Home;