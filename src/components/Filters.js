// src/components/Filters.js
import React, { useState } from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';

function Filters({ onFilter }) {
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleApply = () => {
    onFilter({ category, minPrice: Number(minPrice) || undefined, maxPrice: Number(maxPrice) || undefined });
  };

  return (
    <Box className="glass" sx={{ p: 2, borderRadius: 'var(--radius)' }}>
      <Typography
        variant="h6"
        sx={{ color: 'var(--text)', mb: 2, fontFamily: 'var(--font-heading)', fontWeight: 600 }}
      >
        Фильтры
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: 'var(--muted)' }}>Категория</InputLabel>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ color: 'var(--text)', background: 'var(--bg-2)' }}
        >
          <MenuItem value="">Все категории</MenuItem>
          <MenuItem value="auto">Автомобили</MenuItem>
          <MenuItem value="realty">Недвижимость</MenuItem>
          <MenuItem value="clothes">Одежда</MenuItem>
          <MenuItem value="electronics">Электроника</MenuItem>
          <MenuItem value="services">Услуги</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Минимальная цена (₽)"
        type="number"
        fullWidth
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        sx={{ mb: 2, input: { color: 'var(--text)' }, label: { color: 'var(--muted)' } }}
      />
      <TextField
        label="Максимальная цена (₽)"
        type="number"
        fullWidth
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        sx={{ mb: 2, input: { color: 'var(--text)' }, label: { color: 'var(--muted)' } }}
      />
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleApply}
          sx={{ background: 'var(--gradient)', color: 'var(--text)', fontWeight: 600 }}
        >
          Применить
        </Button>
      </motion.div>
    </Box>
  );
}

export default Filters;