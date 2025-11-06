// src/components/Filters.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { Slider, Checkbox, FormControlLabel, Typography, Box, TextField, Button } from '@mui/material';
import { motion } from 'framer-motion';

function Filters({ onFilter }) {
  const { register, watch, handleSubmit } = useForm({
    defaultValues: {
      priceMin: 0,
      priceMax: 1000000,
      category: [],
      location: ''
    }
  });

  const watchedValues = watch();

  React.useEffect(() => {
    onFilter(watchedValues);
  }, [watchedValues, onFilter]);

  const onSubmit = (data) => {
    onFilter(data);
  };

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="filter-panel"
    >
      <Typography variant="h6" sx={{ color: 'var(--text)', marginBottom: '20px' }}>
        Фильтры
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="body2" sx={{ color: 'var(--muted)', marginBottom: '10px' }}>
            Цена от {watchedValues.priceMin} до {watchedValues.priceMax} ₽
          </Typography>
          <Slider
            value={[watchedValues.priceMin, watchedValues.priceMax]}
            onChange={(e, value) => {
              register('priceMin').onChange({ target: { value: value[0] } });
              register('priceMax').onChange({ target: { value: value[1] } });
            }}
            min={0}
            max={1000000}
            sx={{ color: 'var(--accent)' }}
          />
        </Box>
        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="body2" sx={{ color: 'var(--muted)', marginBottom: '10px' }}>
            Категории
          </Typography>
          {['auto', 'realty', 'clothes', 'electronics', 'services'].map((cat) => (
            <FormControlLabel
              key={cat}
              control={<Checkbox {...register('category')} value={cat} sx={{ color: 'var(--accent)' }} />}
              label={cat}
              sx={{ color: 'var(--text)' }}
            />
          ))}
        </Box>
        <Box sx={{ marginBottom: '20px' }}>
          <TextField
            label="Локация"
            fullWidth
            {...register('location')}
            sx={{
              input: { color: 'var(--text)' },
              '& .MuiOutlinedInput-root': { background: 'var(--glass-strong)', borderRadius: 'var(--radius)' }
            }}
          />
        </Box>
        <Button type="submit" variant="contained" sx={{ background: 'var(--accent)', width: '100%' }}>
          Применить
        </Button>
      </form>
    </motion.div>
  );
}

export default Filters;