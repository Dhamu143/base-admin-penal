import React, { useState, useEffect } from 'react';
import PageLoader from '../components/PageLoader/PageLoader';

const GlobalLoader = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleLoadingState = (event) => {
      setIsLoading(event.detail.isLoading);
    };

    window.addEventListener('api-loading-state', handleLoadingState);
    return () => {
      window.removeEventListener('api-loading-state', handleLoadingState);
    };
  }, []);

  return isLoading ? <PageLoader /> : null;
};

export default GlobalLoader; 