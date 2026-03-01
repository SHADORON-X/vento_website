import { useState, useCallback } from 'react';
import { searchProducts, searchShops, searchAll } from '../lib/api';

/**
 * Hook géolocalisation + recherche marketplace
 */
export function useGeoSearch() {
  const [userCity, setUserCity] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const detectCity = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Géolocalisation non supportée.');
      return;
    }
    setDetecting(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        setUserCoords({ lat, lng });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            'Votre ville';
          setUserCity(city);
        } catch {
          setUserCity('Votre ville');
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        setGeoError(
          err.code === 1
            ? 'Permission refusée. Activez la géolocalisation.'
            : 'Impossible de détecter votre position.',
        );
      },
      { timeout: 8000, maximumAge: 300_000 },
    );
  }, []);

  const doSearch = useCallback(
    (query, city) => searchAll(query, city ?? userCity),
    [userCity],
  );

  const doSearchProducts = useCallback(
    (query, city, filters) => searchProducts(query, city ?? userCity, filters),
    [userCity],
  );

  const doSearchShops = useCallback(
    (query, city) => searchShops(query, city ?? userCity),
    [userCity],
  );

  return {
    userCity,
    userCoords,
    detecting,
    geoError,
    detectCity,
    searchAll: doSearch,
    searchProducts: doSearchProducts,
    searchShops: doSearchShops,
  };
}
