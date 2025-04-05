
import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
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

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); // Update parent with text only

    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (newValue.length > 2) {
      setLoading(true);
      debounceTimer.current = setTimeout(async () => {
        const results = await getSuggestions(newValue);
        setSuggestions(results);
        setLoading(false);
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
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              className={icon ? "pl-10" : ""}
              onClick={() => inputValue.length > 2 && setOpen(true)}
              disabled={disabled}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px] overflow-y-auto" align="start">
          <Command>
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
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationAutocomplete;
