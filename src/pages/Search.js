// src/pages/Search.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  startAt,
  endAt,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import {
  Grid,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Button,
  Skeleton,
} from '@mui/material';
import AdCard from '../components/AdCard';
import Filters from '../components/Filters';
import { motion } from 'framer-motion';

function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialTerm = searchParams.get('q')?.trim() || '';

  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
  });

  // Синхронизация URL с фильтрами
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice);

    const newUrl = `${location.pathname}?${params.toString()}`;
    if (location.search !== `?${params.toString()}`) {
      navigate(newUrl, { replace: true });
    }
  }, [searchTerm, filters, navigate, location.pathname, location.search]);

  const { data: ads = [], isLoading, error } = useQuery({
    queryKey: ['search', searchTerm, filters],
    queryFn: async () => {
      let q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));

      // Поиск по заголовку
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        q = query(
          q,
          orderBy('titleLower'),
          startAt(term),
          endAt(term + '\uf8ff')
        );
      }

      // Фильтры
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.minPrice !== undefined) {
        q = query(q, where('price', '>=', filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        q = query(q, where('price', '<=', filters.maxPrice));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!searchTerm || !!filters.category || filters.minPrice !== undefined || filters.maxPrice !== undefined,
    staleTime: 1000 * 30,
  });

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = searchTerm || filters.category || filters.minPrice !== undefined || filters.maxPrice !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="container"
    >
      <Typography
        variant="h4"
        sx={{
          color: 'var(--text)',
          mb: 4,
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        {searchTerm ? `Результаты по запросу: "${searchTerm}"` : 'Все объявления'}
      </Typography>

      <Grid container spacing={3}>
        {/* Фильтры */}
        <Grid item xs={12} md={3}>
          <Filters
            initialValues={filters}
            onFilter={handleFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </Grid>

        {/* Результаты */}
        <Grid item xs={12} md={9}>
          {isLoading ? (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, i) => (
                <Grid item xs={12} sm={6} md={6} lg={4} key={i}>
                  <Box sx={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <Skeleton variant="rectangular" height={140} />
                    <Box sx={{ p: 2 }}>
                      <Skeleton width="80%" />
                      <Skeleton width="40%" />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              Не удалось выполнить поиск. Попробуйте позже.
            </Alert>
          ) : ads.length > 0 ? (
            <Grid container spacing={3}>
              {ads.map((ad) => (
                <Grid item xs={12} sm={6} md={6} lg={4} key={ad.id}>
                  <AdCard ad={ad} />
                </Grid>
              ))}
            </Grid>
          ) : hasActiveFilters ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography
                variant="h6"
                sx={{ color: 'var(--muted)', mb: 2, fontSize: '1.2rem' }}
              >
                Ничего не найдено
              </Typography>
              <Typography sx={{ color: 'var(--muted)', mb: 3 }}>
                Попробуйте изменить фильтры или поисковый запрос
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ category: '', minPrice: undefined, maxPrice: undefined });
                }}
                sx={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
              >
                Сбросить фильтры
              </Button>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
                Начните поиск — введите запрос или выберите фильтры
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </motion.div>
  );
}

export default Search;