// src/components/AddressAutocomplete.js
import React, { useState, useEffect } from 'react';
import { TextField, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

function AddressAutocomplete({ value, onChange }) {
  const [address, setAddress] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (address.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Ошибка при получении адресов:', error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [address]);

  const handleSelect = (suggestion) => {
    setAddress(suggestion.display_name);
    onChange({
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    });
    setSuggestions([]);
  };

  return (
    <Box sx={{ position: 'relative', mb: 2 }}>
      <TextField
        label="Адрес"
        fullWidth
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        sx={{ input: { color: 'var(--text)' }, label: { color: 'var(--muted)' } }}
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
              key={suggestion.place_id}
              whileHover={{ backgroundColor: 'rgba(255, 109, 0, 0.1)' }}
              sx={{ p: 1, cursor: 'pointer' }}
              onClick={() => handleSelect(suggestion)}
            >
              <Typography sx={{ color: 'var(--text)' }}>{suggestion.display_name}</Typography>
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default AddressAutocomplete;