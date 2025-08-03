import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';

function App() {
  const [isDark, setIsDark] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
    }
  }, []);

  // Toggle theme and save to localStorage
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<Home isDark={isDark} toggleTheme={toggleTheme} />} 
        />
        <Route 
          path="/search" 
          element={<SearchResults isDark={isDark} toggleTheme={toggleTheme} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;