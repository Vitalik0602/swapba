// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdDetails from './pages/AdDetails';
import CreateAd from './pages/CreateAd';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Messages from './pages/Messages';
import Category from './pages/Category';
import Search from './pages/Search';
import { Typography } from '@mui/material';
import './App.css';

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ padding: '30px' }}>
          <Typography color="error" variant="h6">
            Произошла ошибка. Пожалуйста, обновите страницу или свяжитесь с поддержкой.
          </Typography>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ad/:id" element={<AdDetails />} />
            <Route path="/create" element={<CreateAd />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/ads" element={<Profile />} />
            <Route path="/profile/favorites" element={<Favorites />} />
            <Route path="/profile/messages" element={<Messages />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </QueryClientProvider>
  );
}

export default App;