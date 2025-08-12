import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  title: string;
  type: string;
  createdAt: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  results,
  onSelect,
  placeholder = 'Search memos...'
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full px-3 sm:px-4 py-3 sm:py-2 pl-9 sm:pl-10 pr-9 sm:pr-10 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
        />
        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 touch-manipulation"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFocused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200"
          >
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onSelect(result);
                    setIsFocused(false);
                  }}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 touch-manipulation"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{result.title}</span>
                    <span className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">{result.type}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 