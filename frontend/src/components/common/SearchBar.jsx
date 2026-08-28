import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}) => {
  return (
    <div className={`table-search-wrapper ${className}`}>
      <Search className="table-search-icon" size={18} />
      <input
        type="text"
        className="table-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
