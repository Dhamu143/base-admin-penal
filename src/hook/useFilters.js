import { useState, useCallback } from "react";

export const useFilters = (initialPage = 1) => {
  const [filters, setFilters] = useState({
    language: "",
    godId: "",
    page: initialPage,
  });

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, 
    }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setFilters((prev) => ({ 
      ...prev, 
      page: newPage 
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ 
      language: "", 
      godId: "", 
      page: 1 
    });
  }, []);

  return {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  };
};