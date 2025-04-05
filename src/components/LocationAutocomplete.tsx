import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getSuggestions } from '../services/routeService';

interface Suggestion {
  place_name: string;
  center: [number, number];
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates?: { lng: number, lat: number }) => void;
  placeholder: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  icon = <MapPin className="h-4 w-4 text-gray-500" />,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); // Update parent with text only

    // Open popover when typing
    if (newValue.length > 2) {
      setOpen(true);
    }

    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (newValue.length > 2) {
      setLoading(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await getSuggestions(newValue);
          setSuggestions(results);
          console.log('Suggestions received:', results); // Debug log
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const [lng, lat] = suggestion.center;
    setInputValue(suggestion.place_name);
    onChange(suggestion.place_name, { lng, lat });
    setOpen(false);
    
    // Keep focus on the input after selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent the default Command component behavior for tab and arrow keys
    // This allows the user to continue typing
    if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.stopPropagation(); // Don't let the Command component capture these
    }
    
    // Close the popover on Escape
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {icon}
              </div>
            )}
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={icon ? "pl-10" : ""}
              onFocus={() => inputValue.length > 2 && setOpen(true)}
              disabled={disabled}
              autoComplete="off" // Prevent browser autocomplete from interfering
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px] overflow-y-auto" 
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()} // Prevent auto focus on popover content
        >
          <Command shouldFilter={false}>
            <CommandList>
              <CommandGroup>
                {loading && (
                  <div className="flex items-center justify-center py-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="ml-2 text-sm">Loading suggestions...</span>
                  </div>
                )}
                
                {!loading && suggestions.length === 0 && inputValue.length > 2 && (
                  <p className="py-2 px-2 text-sm text-muted-foreground">
                    No locations found
                  </p>
                )}
                
                {!loading && suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={index}
                    value={suggestion.place_name}
                    onSelect={() => handleSelectSuggestion(suggestion)}
                    className="cursor-pointer"
                  >
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{suggestion.place_name}</span>
                    <Check
                      className={`ml-auto h-4 w-4 ${
                        inputValue === suggestion.place_name
                          ? 'opacity-100'
                          : 'opacity-0'
                      }`}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationAutocomplete;
