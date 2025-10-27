
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import MemberProfile from './pages/MemberProfile';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/member/:slug" element={<MemberProfile />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
