import React, { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Search,
  Home,
  User,
  Zap,
  X,
  ChevronUp,
  ServerCrash,
  ChevronDown,
} from "lucide-react";

interface Property {
  link: string;
  area_m2: number;
  building_age: number;
  room_count: number;
  total_price_toman?: number;
  price_per_m2_toman?: number;
  deposit_toman?: number;
  monthly_rent_toman?: number;
}

interface ApiResults {
  city: string;
  sales_properties: Property[];
  rentals_properties: Property[];
}

// City suggestions pool
const cityPool = [
  "Tehran",
  "Mashhad",
  "Tabriz",
  "Qom",
  "Karaj",
  "Isfahan",
  "Shiraz",
  "Ahvaz",
  "Rasht",
  "Yazd",
  "Sari",
  "Hamedan",
  "Gorgan",
  "Urmia",
  "Bushehr",
  "Zanjan",
  "Qazvin",
  "Ardabil",
  "Kerman",
  "Kermanshah",
  "Zahedan",
  "Semnan"
];

function App() {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestedCities, setSuggestedCities] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState({
    rent: false,
    sale: false,
  });
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [results, setResults] = useState<ApiResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
    }

    // Generate random city suggestions
    const shuffled = [...cityPool].sort(() => 0.5 - Math.random());
    setSuggestedCities(shuffled.slice(0, 5));
  }, []);

  // Toggle theme and save to localStorage
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Calling the Django backend API
      const response = await fetch(
        `http://127.0.0.1:8000/api/get-data/${searchQuery.trim()}/`
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "An unknown server error occurred." }));
        throw new Error(errorData.error || "Failed to fetch data from server.");
      }

      const data: ApiResults = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(
        err.message ||
          "Could not connect to the backend. Is the Django server running?"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleModalOpen = () => {
    setShowModal(true);
    setActiveTab("signin");
    setFormData({ username: "", email: "", password: "" });
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFormData({ username: "", email: "", password: "" });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePropertyTypeChange = (type: "rent" | "sale") => {
    setPropertyTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "signin") {
      alert(`Sign In: ${formData.username}`);
    } else {
      alert(`Sign Up: ${formData.username} - ${formData.email}`);
    }
    handleModalClose();
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isDark
            ? "bg-gray-800/95 border-gray-700"
            : "bg-white/95 border-gray-200"
        } backdrop-blur-sm border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Auth buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleModalOpen}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <User size={18} />
                <span>Sign In / Sign Up</span>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-yellow-400"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* Right side - Logo */}
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  isDark
                    ? "bg-gradient-to-br from-blue-600 to-purple-600"
                    : "bg-gradient-to-br from-blue-500 to-purple-500"
                }`}
              >
                <Zap className="text-white" size={24} />
              </div>
              <span
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                MMD
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Site title */}
          <div className="text-center mb-16">
            <h1
              className={`text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 ${
                isDark
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500"
              }`}
            >
              MMD
            </h1>
            <p
              className={`text-lg sm:text-xl ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Find the best property with one click!
            </p>
          </div>

          {/* Search section */}
          <div className="max-w-2xl mx-auto">
            <div
              className={`relative rounded-2xl p-1 ${
                isDark
                  ? "bg-gradient-to-r from-gray-800 to-gray-700 shadow-2xl"
                  : "bg-gradient-to-r from-white to-gray-50 shadow-2xl border border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="type the city name"
                  className={`flex-1 px-6 py-4 text-lg rounded-l-2xl border-0 focus:outline-none focus:ring-0 ${
                    isDark
                      ? "bg-gray-800 text-white placeholder-gray-400"
                      : "bg-white text-gray-900 placeholder-gray-500"
                  }`}
                />
                <button
                  onClick={handleSearch}
                  className={`flex items-center space-x-2 px-8 py-4 rounded-r-2xl font-semibold text-lg transition-all duration-200 ${
                    isDark
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25"
                      : "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-lg hover:shadow-gray-500/25"
                  }`}
                >
                  <Search size={20} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
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
                        ? "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-300"
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
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {showAdvanced ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  <span>advanced options</span>
                  {showAdvanced ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                {showAdvanced && (
                  <div
                    className={`mt-4 p-4 rounded-lg transition-all duration-300 ${
                      showAdvanced
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2"
                    } ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                  >
                    <div className="flex justify-center space-x-6">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={propertyTypes.rent}
                          onChange={() => handlePropertyTypeChange("rent")}
                          className={`w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 border-2 ${
                            isDark
                              ? "bg-gray-800 border-gray-600 checked:bg-blue-600"
                              : "bg-gray-100 border-gray-300 checked:bg-blue-600"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Rent
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={propertyTypes.sale}
                          onChange={() => handlePropertyTypeChange("sale")}
                          className={`w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 border-2 ${
                            isDark
                              ? "bg-gray-800 border-gray-600 checked:bg-blue-600"
                              : "bg-gray-100 border-gray-300 checked:bg-blue-600"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Sale
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto mt-16 text-center">
            {isLoading && (
              <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-gray-800/50">
                <div className="animate-pulse text-blue-400">
                  <Zap size={48} />
                </div>
                <p className="text-lg font-medium text-gray-300">
                  AI is analyzing the best properties...
                </p>
                <p className="text-sm text-gray-500">
                  This might take a moment, especially for a new city.
                </p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-red-900/20 border border-red-500/30">
                <ServerCrash size={48} className="text-red-500" />
                <p className="text-lg font-medium text-red-400">
                  Oops! An error occurred.
                </p>
                <p className="text-sm text-gray-400">{error}</p>
              </div>
            )}

            {results && (
              <div className="space-y-12">
                {/* Sales Results */}
                <div>
                  <h2 className="text-3xl font-bold mb-6">
                    Top 5 Sale Properties
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.sales_properties.map((prop, index) => (
                      <div
                        key={`sale-${index}`}
                        className={`p-6 rounded-xl text-left transition-all duration-300 ${
                          isDark ? "bg-gray-800" : "bg-white border"
                        }`}
                      >
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Home size={20} /> Property Details
                        </h3>
                        <p>
                          <strong className="font-medium">Area:</strong>{" "}
                          {prop.area_m2} m²
                        </p>
                        <p>
                          <strong className="font-medium">Age:</strong>{" "}
                          {prop.building_age} years
                        </p>
                        {prop.total_price_toman && (
                          <p>
                            <strong className="font-medium">Price:</strong>{" "}
                            {prop.total_price_toman.toLocaleString()} Toman
                          </p>
                        )}
                        <a
                          href={prop.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-4 text-center font-semibold py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          View Listing
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rent Results */}
                <div>
                  <h2 className="text-3xl font-bold mb-6">
                    Top 5 Rent Properties
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.rentals_properties.map((prop, index) => (
                      <div
                        key={`rent-${index}`}
                        className={`p-6 rounded-xl text-left transition-all duration-300 ${
                          isDark ? "bg-gray-800" : "bg-white border"
                        }`}
                      >
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Home size={20} /> Property Details
                        </h3>
                        <p>
                          <strong className="font-medium">Area:</strong>{" "}
                          {prop.area_m2} m²
                        </p>
                        <p>
                          <strong className="font-medium">Age:</strong>{" "}
                          {prop.building_age} years
                        </p>
                        {prop.deposit_toman && (
                          <p>
                            <strong className="font-medium">Deposit:</strong>{" "}
                            {prop.deposit_toman.toLocaleString()} Toman
                          </p>
                        )}
                        {prop.monthly_rent_toman && (
                          <p>
                            <strong className="font-medium">Rent:</strong>{" "}
                            {prop.monthly_rent_toman.toLocaleString()} Toman
                          </p>
                        )}
                        <a
                          href={prop.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-4 text-center font-semibold py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                        >
                          View Listing
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer
          className={`mt-20 border-t ${
            isDark
              ? "border-gray-800 bg-gray-900"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                © 2025 MMD. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleModalClose}
          ></div>

          {/* Modal Content */}
          <div
            className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={handleModalClose}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                isDark
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="pt-12 px-8 pb-0">
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => handleTabChange("signin")}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === "signin"
                      ? isDark
                        ? "bg-blue-600 text-white"
                        : "bg-gray-900 text-white"
                      : isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleTabChange("signup")}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === "signup"
                      ? isDark
                        ? "bg-blue-600 text-white"
                        : "bg-gray-900 text-white"
                      : isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Field */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Enter your username"
                    required
                  />
                </div>

                {/* Email Field (Sign Up only) */}
                {activeTab === "signup" && (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                )}

                {/* Password Field */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                    isDark
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      : "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700"
                  }`}
                >
                  {activeTab === "signin" ? "Sign In" : "Sign Up"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
