// src/components/SearchBar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { motion } from 'framer-motion';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) onSearch(query);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      style={{ maxWidth: '600px', margin: '20px auto' }}
    >
      <TextField
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск объявлений..."
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button type="submit" sx={{ color: 'var(--accent)' }}>
                <Search />
              </Button>
            </InputAdornment>
          ),
          sx: {
            input: { color: 'var(--text)' },
            '& .MuiOutlinedInput-root': {
              background: 'var(--glass-strong)',
              borderRadius: 'var(--radius)',
              '& fieldset': { borderColor: 'var(--stroke)' },
              '&:hover fieldset': { borderColor: 'var(--accent)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--accent)' }
            }
          }
        }}
      />
    </motion.form>
  );
}

export default SearchBar;