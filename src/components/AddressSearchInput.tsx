import React, { useState, useRef, useEffect } from 'react';

interface AddressSearchInputProps {
  onSearch: (address: string, isStart: boolean) => void;
  placeholder: string;
  isStart: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const AddressSearchInput: React.FC<AddressSearchInputProps> = ({
  onSearch,
  placeholder,
  isStart,
  value = '',
  onChange
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }

    // Debounce the search
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (newValue.trim()) {
        onSearch(newValue, isStart);
      }
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onSearch(inputValue, isStart);
    }
  };

  return (
    <div className="relative w-full">
      <div
        className={`relative flex items-center overflow-hidden rounded-lg 
          ${isFocused ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-700'}
          bg-gray-900 transition-all duration-200`}
      >
        <div className="flex items-center justify-center pl-3">
          <svg
            className={`w-5 h-5 ${isStart ? 'text-green-500' : 'text-orange-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isStart ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            )}
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none"
        />
        {inputValue && (
          <button
            onClick={() => {
              setInputValue('');
              if (onChange) {
                onChange('');
              }
            }}
            className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressSearchInput; 