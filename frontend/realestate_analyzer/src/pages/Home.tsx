import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';
import { cities, City } from '../data/cities';
import AnimatedTagline from '../components/AnimatedTagline'; 
import { AuthModalProps } from '../App';

// City suggestions pool
const cityPool = [
    "tehran",
  "mashhad",
  "tabriz",
  "qom",
  "karaj",
  "isfahan",
  "shiraz",
  "rasht",
];

interface HomeProps {
  isDark: boolean;
  toggleTheme: () => void;
  currentUser: string | null;
  onLogout: () => void;
  authModal: AuthModalProps;
}

export default function Home({ isDark, toggleTheme, currentUser, onLogout, authModal }: HomeProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestedCities, setSuggestedCities] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState({
    rent: true,
    sale: true
  });


  // Generate random city suggestions
  useEffect(() => {
    const shuffled = [...cityPool].sort(() => 0.5 - Math.random());
    setSuggestedCities(shuffled.slice(0, 5));
  }, []);

const handleSearch = () => {
  if (!propertyTypes.rent && !propertyTypes.sale) {
    alert('Please select at least one property type (Rent or Sale)');
    return;
  }
  
  const query = searchQuery.trim();
  const queryLower = query.toLowerCase();
  
  const selectedCity = cities.find(
    c => c.persian === query || c.english.toLowerCase() === queryLower
  );

if (!currentUser && selectedCity && !cityPool.includes(selectedCity.english.toLowerCase())) {
      alert('برای جستجوی این شهر، لطفاً ابتدا وارد حساب کاربری خود شوید.');
      authModal.handleModalOpen();
      return;
    }

  if (selectedCity) {

    navigate(`/search?city=${encodeURIComponent(selectedCity.english.toLowerCase())}&rent=${propertyTypes.rent}&sale=${propertyTypes.sale}`);
  } else {
    alert('Please select a valid city from the list or enter its name correctly.');
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const query = e.target.value;
  setSearchQuery(query);

  if (query.length > 0) {
    const queryLower = query.toLowerCase();
    const filteredSuggestions = cities.filter(city =>
      city.persian.startsWith(query) || 
      city.english.toLowerCase().startsWith(queryLower)
    );
    setSuggestions(filteredSuggestions);
  } else {
    setSuggestions([]);
  }
};

const handleSuggestionClick = (city: City) => {
  // Check if the user was typing in Persian
  const isTypingPersian = /[\u0600-\u06FF]/.test(searchQuery);

  // Set the input to the same language the user was typing in
  setSearchQuery(isTypingPersian ? city.persian : city.english);
  
  setSuggestions([]);
};

  const handlePropertyTypeChange = (type: 'rent' | 'sale') => {
    setPropertyTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <Header 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        handleModalOpen={authModal.handleModalOpen}
        currentUser={currentUser} // <-- ارسال props به هدر
        onLogout={onLogout}       // <-- ارسال props به هدر
      />

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          
          {/* Site title */}
          <div className="text-center mb-16">
            <h1 className={`text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 ${
              isDark 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500' 
                : 'text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500'
            }`}>
              PropAk
            </h1>
              <AnimatedTagline isDark={isDark} />
          </div>

          {/* Search section */}
          <div className="max-w-2xl mx-auto">
            <div className={`relative rounded-2xl p-1 ${
              isDark 
                ? 'bg-gradient-to-r from-gray-800 to-gray-700 shadow-2xl' 
                : 'bg-gradient-to-r from-white to-gray-50 shadow-2xl border border-gray-200'
            }`}>
              <div className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleCityInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="type the city name"
                  className={`flex-1 px-6 py-4 text-lg rounded-l-2xl border-0 focus:outline-none focus:ring-0 ${
                    isDark 
                      ? 'bg-gray-800 text-white placeholder-gray-400' 
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  autoComplete="off"
                />
                <button
                  onClick={handleSearch}
                  className={`flex items-center space-x-2 px-8 py-4 rounded-r-2xl font-semibold text-lg transition-all duration-200 ${
                    isDark 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25' 
                      : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-lg hover:shadow-gray-500/25'
                  }`}
                >
                  <Search size={20} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
              
            {suggestions.length > 0 && (
  <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg z-10 overflow-hidden ${
    isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border'
  }`}>
    <ul className="max-h-60 overflow-y-auto">
      {suggestions.map((city) => (
        <li
  key={city.english}
  onClick={() => handleSuggestionClick(city)}
  className={`px-4 py-3 cursor-pointer transition-colors ${ // We removed text-right to support both languages
    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  }`}
>
  {/* If the search query contains Persian characters, show the Persian name, otherwise show the English name */}
  {/[\u0600-\u06FF]/.test(searchQuery) ? city.persian : city.english}
</li>
      ))}
    </ul>
  </div>
)}
            </div>
            
            {/* Search suggestions */}
            <div className="mt-8">
              <div className="flex flex-wrap justify-center gap-3 mb-6">
              {suggestedCities.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
              </div>
              
              {/* Advanced Options */}
              <div className="text-center">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isDark 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <span>advanced options</span>
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                <div className={`mt-4 overflow-hidden transition-all duration-300 ${
                  showAdvanced ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className={`p-4 rounded-lg transform transition-all duration-300 ${
                    showAdvanced ? 'translate-y-0' : '-translate-y-2'
                  } ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="flex justify-center space-x-6">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={propertyTypes.rent}
                          onChange={() => handlePropertyTypeChange('rent')}
                          className={`w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 border-2 ${
                            isDark 
                              ? 'bg-gray-800 border-gray-600 checked:bg-blue-600' 
                              : 'bg-gray-100 border-gray-300 checked:bg-blue-600'
                          }`}
                        />
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Rent
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={propertyTypes.sale}
                          onChange={() => handlePropertyTypeChange('sale')}
                          className={`w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 border-2 ${
                            isDark 
                              ? 'bg-gray-800 border-gray-600 checked:bg-blue-600' 
                              : 'bg-gray-100 border-gray-300 checked:bg-blue-600'
                          }`}
                        />
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Sale
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={`mt-20 border-t ${
          isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                © 2025 Propak. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>

      <AuthModal
        showModal={authModal.showModal}
        isDark={isDark}
        activeTab={authModal.activeTab}
        formData={authModal.formData}
        handleModalClose={authModal.handleModalClose}
        handleTabChange={authModal.handleTabChange}
        handleInputChange={authModal.handleInputChange}
        handleSubmit={authModal.handleSubmit}
      />
    </div>
  );
}