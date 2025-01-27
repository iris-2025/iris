import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader, MapPin, Thermometer, Wind, Droplets, Sun } from 'lucide-react';

const WeatherComponent = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);
  
  const API_KEY = 'dd6f2e748bbdb0e2bb54397657872508';
  
  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) throw new Error('Weather data fetch failed');
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchPlaces = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      if (!response.ok) throw new Error('Location search failed');
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Location search error:', err);
      setSearchResults([]);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debouncing
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(query);
    }, 500);
  };

  const handleLocationSelect = (location) => {
    setSearchResults([]);
    fetchWeather(location.lat, location.lon);
  };

  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(pos);
          fetchWeather(pos.lat, pos.lng);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Could not retrieve your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [getCurrentLocation]);

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white">Weather Forecast</h2>
        <p className="text-sm text-gray-400">Check weather conditions anywhere</p>
      </div>

      {/* Search Section */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            onChange={handleSearch}
            placeholder="Search location..."
            className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2 
              text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(result)}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700/50 flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{result.name}, {result.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weather Display */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : weather ? (
          <div className="space-y-6">
            {/* Location and Main Weather */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">{weather.name}</h3>
              <div className="flex justify-center items-center gap-2">
                <img 
                  src={getWeatherIcon(weather.weather[0].icon)}
                  alt={weather.weather[0].description}
                  className="w-16 h-16"
                />
                <span className="text-4xl font-bold text-white">
                  {Math.round(weather.main.temp)}°C
                </span>
              </div>
              <p className="text-gray-300 capitalize">{weather.weather[0].description}</p>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-300">
                  <Thermometer className="h-5 w-5" />
                  <span>Feels like</span>
                </div>
                <p className="text-xl font-semibold text-white mt-1">
                  {Math.round(weather.main.feels_like)}°C
                </p>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-300">
                  <Wind className="h-5 w-5" />
                  <span>Wind</span>
                </div>
                <p className="text-xl font-semibold text-white mt-1">
                  {Math.round(weather.wind.speed)} m/s
                </p>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-300">
                  <Droplets className="h-5 w-5" />
                  <span>Humidity</span>
                </div>
                <p className="text-xl font-semibold text-white mt-1">
                  {weather.main.humidity}%
                </p>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-300">
                  <Sun className="h-5 w-5" />
                  <span>Pressure</span>
                </div>
                <p className="text-xl font-semibold text-white mt-1">
                  {weather.main.pressure} hPa
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/30 
          rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Current Location Button */}
      <div className="p-4 border-t border-gray-700/50">
        <button
          onClick={getCurrentLocation}
          className="w-full bg-blue-600 py-2 px-4 rounded-lg text-white hover:bg-blue-700 
            transition-colors flex items-center justify-center gap-2"
        >
          <MapPin className="h-5 w-5" />
          Use Current Location
        </button>
      </div>
    </div>
  );
};

export default WeatherComponent;