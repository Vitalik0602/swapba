// src/components/SearchBar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, InputAdornment, Box, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

function SearchBar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Запрос для получения предложений автодополнения
  const { data: suggestions = [] } = useQuery({
    queryKey: ['searchSuggestions', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const q = query(
        collection(db, 'ads'),
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, title: doc.data().title }));
    },
    enabled: !!searchTerm,
  });

  // Обработка отправки формы поиска
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ mb: 4, position: 'relative' }} // Added position: 'relative'
    >
      <form onSubmit={handleSearch}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск объявлений..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            background: 'var(--bg-2)',
            borderRadius: 'var(--radius)',
            input: { color: 'var(--text)' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'var(--muted)' },
              '&:hover fieldset': { borderColor: 'var(--accent)' },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'var(--muted)' }} />
              </InputAdornment>
            ),
          }}
        />
        {suggestions.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              zIndex: 1000,
              background: 'var(--bg-2)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--neon)',
              mt: 1,
              width: '100%',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {suggestions.map((suggestion) => (
              <motion.div
                key={suggestion.id}
                whileHover={{ backgroundColor: 'rgba(255, 109, 0, 0.1)' }}
                sx={{ p: 1, cursor: 'pointer' }}
                onClick={() => navigate(`/ad/${suggestion.id}`)}
              >
                <Typography sx={{ color: 'var(--text)' }}>{suggestion.title}</Typography>
              </motion.div>
            ))}
          </Box>
        )}
      </form>
    </motion.div>
  );
}

export default SearchBar;