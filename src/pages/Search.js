// src/pages/Search.js
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import AdCard from '../components/AdCard';
import Filters from '../components/Filters';
import { Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';

function Search() {
  const [searchParams] = useSearchParams();
  const queryStr = searchParams.get('q');
  const [filters, setFilters] = React.useState({});

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['search', queryStr, filters],
    queryFn: async () => {
      const adsCollection = collection(db, 'ads');
      let q = query(adsCollection);
      if (queryStr) q = query(q, where('title', '>=', queryStr), where('title', '<=', queryStr + '\uf8ff'));
      const adsSnapshot = await getDocs(q);
      let adsList = adsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Применяем фильтры
      if (filters.priceMin) adsList = adsList.filter(ad => ad.price >= filters.priceMin);
      if (filters.priceMax) adsList = adsList.filter(ad => ad.price <= filters.priceMax);

      return adsList;
    }
  });

  if (isLoading) {
    return <div className="loader" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container"
      style={{ padding: '30px' }}
    >
      <Typography variant="h4" sx={{ color: 'var(--text)', fontFamily: 'Montserrat', marginBottom: '20px' }}>
        Результаты поиска: {queryStr || 'Все'}
      </Typography>
      <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
        <Grid item xs={12} md={3}>
          <Filters onFilter={setFilters} />
        </Grid>
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            {ads.map(ad => (
              <Grid item xs={12} sm={6} md={4} key={ad.id}>
                <AdCard ad={ad} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </motion.div>
  );
}

export default Search;