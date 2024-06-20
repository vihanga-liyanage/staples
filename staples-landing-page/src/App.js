import React from 'react';
import { Container } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';

const App = () => {
  return (
    <div>
      <Header />
      <Container>
        <HomePage />
      </Container>
      <Footer />
    </div>
  );
};

export default App;
