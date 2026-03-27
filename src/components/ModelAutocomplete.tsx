"use client";

import { useState, useEffect } from 'react';

interface Model {
  id: string;
  name: string;
  nameTh: string;
  slug: string;
  brand: {
    name: string;
  };
}

interface ModelAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (model: Model) => void;
  brandName?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function ModelAutocomplete({
  value,
  onChange,
  onSelect,
  brandName,
  placeholder = "พิมพ์เพื่อค้นหา (เช่น Model 3, ATTO 3)",
  required = false,
  disabled = false,
}: ModelAutocompleteProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      try {
        const url = brandName 
          ? `/api/nev/models?brand=${encodeURIComponent(brandName)}`
          : '/api/nev/models';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const filtered = brandName 
            ? data.filter((m: Model) => m.brand.name === brandName)
            : data;
          setModels(filtered);
          setFilteredModels(filtered);
        }
      } catch (error) {
        console.error('Error loading models:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (brandName) {
      loadModels();
    } else {
      setModels([]);
      setFilteredModels([]);
      setIsLoading(false);
    }
  }, [brandName]);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (inputValue.trim().length > 0) {
      const filtered = models.filter(m => 
        m.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        (m.nameTh && m.nameTh.includes(inputValue))
      );
      setFilteredModels(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredModels(models);
      setShowSuggestions(false);
    }
  };

  const handleModelSelect = (model: Model) => {
    onSelect(model);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => brandName && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={disabled ? "เลือกแบรนด์ก่อน" : (isLoading ? "กำลังโหลด..." : placeholder)}
        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        required={required}
        disabled={disabled || isLoading}
      />
      {showSuggestions && filteredModels.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-y-auto shadow-xl">
          {filteredModels.map((model) => (
            <button
              key={model.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleModelSelect(model);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white transition"
            >
              <div className="font-medium">{model.name}</div>
              {model.nameTh && <div className="text-sm text-gray-400">{model.nameTh}</div>}
            </button>
          ))}
        </div>
      )}
      {showSuggestions && filteredModels.length === 0 && value.trim().length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-4 text-center text-gray-400">
          ไม่พบรุ่น "{value}" สำหรับแบรนด์ {brandName}
        </div>
      )}
    </div>
  );
}
