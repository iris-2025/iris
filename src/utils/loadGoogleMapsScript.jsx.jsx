// utils/loadGoogleMapsScript.js

let googleMapsScriptLoadingPromise;

export const loadGoogleMapsScript = (apiKey) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is undefined'));
  }

  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!googleMapsScriptLoadingPromise) {
    googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.google && window.google.maps) {
          resolve(window.google.maps);
        } else {
          reject(new Error('Google Maps SDK loaded but unavailable'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps script'));
      };

      document.head.appendChild(script);
    });
  }

  return googleMapsScriptLoadingPromise;
};
