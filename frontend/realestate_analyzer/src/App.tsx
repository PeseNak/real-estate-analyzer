import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';

// یک نوع برای پراپ‌های مودال تعریف می‌کنیم تا کد تمیزتر باشد
export interface AuthModalProps {
  showModal: boolean;
  activeTab: string;
  formData: { username: string; email: string; password: string; };
  handleModalOpen: () => void;
  handleModalClose: () => void;
  handleTabChange: (tab: string) => void;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

function App() {
  const [isDark, setIsDark] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // State های مودال به اینجا منتقل شدند
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDark(true);
    
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) setCurrentUser(loggedInUser);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('currentUser', username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // توابع مدیریت مودال به اینجا منتقل شدند
  const handleModalOpen = () => {
    setShowModal(true);
    setActiveTab('signin');
    setFormData({ username: '', email: '', password: '' });
  };
  const handleModalClose = () => setShowModal(false);
  const handleTabChange = (tab: string) => setActiveTab(tab);
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = activeTab === 'signin' ? 'login' : 'register';
    const url = `http://127.0.0.1:8000/api/${endpoint}/`;
    const payload = activeTab === 'signin' 
        ? { username: formData.username, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      alert(result.message);
      if (activeTab === 'signin') {
        handleLogin(result.username);
      }
      handleModalClose();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // آبجکتی که تمام پراپ‌های مودال را نگهداری می‌کند
  const authModalProps: AuthModalProps = {
    showModal,
    activeTab,
    formData,
    handleModalOpen,
    handleModalClose,
    handleTabChange,
    handleInputChange,
    handleSubmit,
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              isDark={isDark} 
              toggleTheme={toggleTheme}
              currentUser={currentUser}
              onLogout={handleLogout}
              authModal={authModalProps} // ارسال تمام پراپ‌های مودال به صورت یکجا
            />
          } 
        />
        <Route 
          path="/search" 
          element={
            <SearchResults 
              isDark={isDark} 
              toggleTheme={toggleTheme} 
              currentUser={currentUser}
              onLogout={handleLogout}
              authModal={authModalProps} // ارسال تمام پراپ‌های مودال به صورت یکجا
            />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;