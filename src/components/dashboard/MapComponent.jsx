// components/dashboard/MapComponent.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader, Route, Clock, Navigation } from 'lucide-react';
import { loadGoogleMapsScript } from '../../utils/loadGoogleMapsScript.jsx';
import PropTypes from 'prop-types';

const MapComponent = ({ apiKey }) => {
  const mapContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const searchBoxRef = useRef(null);

  // Use a ref to store currentPosition to avoid closure issues
  const currentPositionRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize the map
  const initializeMap = useCallback(async () => {
    try {
      const maps = await loadGoogleMapsScript(apiKey);

      if (!mapContainerRef.current) {
        setError('Map container not found');
        setLoading(false);
        return;
      }

      // Create map instance
      const map = new maps.Map(mapContainerRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        styles: [
          {
            elementType: 'geometry',
            stylers: [{ color: '#242f3e' }],
          },
          {
            elementType: 'labels.text.fill',
            stylers: [{ color: '#746855' }],
          },
          {
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#242f3e' }],
          },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;

      // Initialize services
      directionsServiceRef.current = new maps.DirectionsService();
      directionsRendererRef.current = new maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });

      // Initialize search box
      if (searchInputRef.current) {
        searchBoxRef.current = new maps.places.SearchBox(searchInputRef.current);

        map.addListener('bounds_changed', () => {
          searchBoxRef.current.setBounds(map.getBounds());
        });

        searchBoxRef.current.addListener('places_changed', () => {
          const places = searchBoxRef.current.getPlaces();
          
          // Defensive check for 'places'
          if (!places || places.length === 0) {
            console.warn('No places found');
            return;
          }

          const place = places[0];
          if (!place.geometry || !place.geometry.location) {
            console.warn('Selected place has no geometry');
            return;
          }

          if (currentPositionRef.current) {
            calculateRoute(place.geometry.location);
          } else {
            map.setCenter(place.geometry.location);
            map.setZoom(15);
          }
        });
      }

      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentPosition(pos);
            currentPositionRef.current = pos; // Update ref
            map.setCenter(pos);
            map.setZoom(13);

            new maps.Marker({
              position: pos,
              map,
              icon: {
                path: maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: '#3b82f6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
              title: 'Your Location',
            });
          },
          (geolocationError) => {
            console.error('Geolocation error:', geolocationError);
            setError('Could not retrieve your location. Please enable location services.');
            setLoading(false);
          }
        );
      } else {
        setError('Geolocation is not supported by your browser.');
        setLoading(false);
      }

      setLoading(false);
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to load Google Maps. Please try again later.');
      setLoading(false);
    }
  }, [apiKey]); // Removed 'currentPosition' from dependencies

  useEffect(() => {
    initializeMap();

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }

      // Also clear listeners from searchBox
      if (searchBoxRef.current) {
        window.google.maps.event.clearInstanceListeners(searchBoxRef.current);
      }

      // Clear directions renderer
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [initializeMap]);

  const calculateRoute = useCallback(
    async (destinationLocation) => {
      if (
        !currentPositionRef.current ||
        !directionsServiceRef.current ||
        !directionsRendererRef.current
      ) {
        setError('Route calculation is not available.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await directionsServiceRef.current.route({
          origin: currentPositionRef.current,
          destination: destinationLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });

        directionsRendererRef.current.setDirections(result);
        setRouteInfo({
          distance: result.routes[0].legs[0].distance.text,
          duration: result.routes[0].legs[0].duration.text,
        });
      } catch (err) {
        console.error('Route calculation error:', err);
        setError('Could not calculate route. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const recenterMap = () => {
    if (currentPositionRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(currentPositionRef.current);
      mapInstanceRef.current.setZoom(13);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white">Distance Calculator</h2>
        <p className="text-sm text-gray-400">Find routes and travel distances</p>
      </div>

      {/* Search Section */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/30">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Enter destination..."
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2 
                text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Destination"
            />
          </div>
          {loading && (
            <div className="px-4 py-2">
              <Loader className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Route Information */}
        {routeInfo && (
          <div className="absolute top-4 right-4 bg-gray-900/90 p-4 rounded-lg border border-gray-700/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <Route className="h-5 w-5" />
                <span>Distance:</span>
                <span className="font-semibold text-white">{routeInfo.distance}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="h-5 w-5" />
                <span>Est. Time:</span>
                <span className="font-semibold text-white">{routeInfo.duration}</span>
              </div>
            </div>
          </div>
        )}

        {/* Current Location Button */}
        {currentPosition && mapInstanceRef.current && (
          <button
            onClick={recenterMap}
            className="absolute bottom-4 right-4 bg-blue-600 p-2 rounded-lg text-white 
              hover:bg-blue-700 transition-colors shadow-lg"
            aria-label="Recenter Map"
          >
            <Navigation className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/30 
          rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

MapComponent.propTypes = {
  apiKey: PropTypes.string.isRequired,
};

export default MapComponent;
