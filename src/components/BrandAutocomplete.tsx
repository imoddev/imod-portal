"use client";

import { useState, useEffect } from 'react';

interface Brand {
  id: string;
  name: string;
  nameTh: string;
  slug: string;
}

interface BrandAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (brand: Brand) => void;
  placeholder?: string;
  required?: boolean;
}

export default function BrandAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "พิมพ์เพื่อค้นหา (เช่น Tesla, BYD, MG)",
  required = false,
}: BrandAutocompleteProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      try {
        const response = await fetch('/api/nev/brands');
        if (response.ok) {
          const data = await response.json();
          setBrands(data);
          setFilteredBrands(data);
        }
      } catch (error) {
        console.error('Error loading brands:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBrands();
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (inputValue.trim().length > 0) {
      const filtered = brands.filter(b => 
        b.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        (b.nameTh && b.nameTh.includes(inputValue))
      );
      setFilteredBrands(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredBrands(brands);
      setShowSuggestions(false);
    }
  };

  const handleBrandSelect = (brand: Brand) => {
    onSelect(brand);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={isLoading ? "กำลังโหลด..." : placeholder}
        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition"
        required={required}
        disabled={isLoading}
      />
      {showSuggestions && filteredBrands.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-y-auto shadow-xl">
          {filteredBrands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleBrandSelect(brand);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white transition"
            >
              <div className="font-medium">{brand.name}</div>
              {brand.nameTh && <div className="text-sm text-gray-400">{brand.nameTh}</div>}
            </button>
          ))}
        </div>
      )}
      {showSuggestions && filteredBrands.length === 0 && value.trim().length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-4 text-center text-gray-400">
          ไม่พบแบรนด์ "{value}"
        </div>
      )}
    </div>
  );
}
