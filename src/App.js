// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { auth } from './firebase/firebase';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdDetails from './pages/AdDetails';
import CreateAd from './pages/CreateAd';
import EditAd from './pages/EditAd';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Messages from './pages/Messages';
import Category from './pages/Category';
import Search from './pages/Search';
import { Typography } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" sx={{ color: 'var(--text)' }}>
          Загрузка...
        </Typography>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Navbar user={user} />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ad/:id" element={<AdDetails />} />
            <Route path="/create" element={<CreateAd />} />
            <Route path="/edit/:id" element={<EditAd />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/favorites" element={<Favorites />} />
            <Route path="/profile/messages" element={<Messages />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </QueryClientProvider>
  );
}

export default App;