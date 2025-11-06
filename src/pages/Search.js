// src/pages/Search.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Grid, Typography, CircularProgress, Box } from '@mui/material';
import AdCard from '../components/AdCard';
import Filters from '../components/Filters';
import { motion } from 'framer-motion';

function Search() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('q') || '';
  const [filters, setFilters] = useState({ category: '', minPrice: undefined, maxPrice: undefined });

  const { data: ads = [], isLoading, error } = useQuery({
    queryKey: ['search', searchTerm, filters],
    queryFn: async () => {
      if (!searchTerm && !filters.category && !filters.minPrice && !filters.maxPrice) return [];
      let q = query(collection(db, 'ads'));
      if (searchTerm) {
        q = query(q, where('title', '>=', searchTerm), where('title', '<=', searchTerm + '\uf8ff'));
      }
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.minPrice) {
        q = query(q, where('price', '>=', filters.minPrice));
      }
      if (filters.maxPrice) {
        q = query(q, where('price', '<=', filters.maxPrice));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  });

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
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
        <Typography color="error">Ошибка поиска: {error.message}</Typography>
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
        sx={{ color: 'var(--text)', mb: 3, fontFamily: 'var(--font-heading)', fontWeight: 700 }}
      >
        Результаты поиска: {searchTerm || 'Все объявления'}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Filters onFilter={handleFilter} />
        </Grid>
        <Grid item xs={12} md={9}>
          <Grid container spacing={2}>
            {ads.length > 0 ? (
              ads.map((ad) => (
                <Grid item xs={12} sm={6} md={4} key={ad.id}>
                  <AdCard ad={ad} />
                </Grid>
              ))
            ) : (
              <Typography sx={{ color: 'var(--muted)' }}>Ничего не найдено</Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </motion.div>
  );
}

export default Search;