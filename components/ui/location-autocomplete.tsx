"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { City, Country } from "country-state-city";

interface LocationSuggestion {
  city: string;
  country: string;
  display: string;
  state?: string;
}

interface LocationAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function LocationAutocomplete({
  value = "",
  onChange,
  placeholder = "Ex: Yaoundé, Cameroun",
  id,
  className,
  disabled = false,
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Memoize all cities data for performance
  const allCities = useMemo(() => {
    const cities = City.getAllCities();
    const countries = Country.getAllCountries();
    const countryMap = new Map(countries.map(c => [c.isoCode, c.name]));

    return cities.map(city => ({
      city: city.name,
      country: countryMap.get(city.countryCode) || city.countryCode,
      state: city.stateCode,
      display: `${city.name}, ${countryMap.get(city.countryCode) || city.countryCode}`,
    }));
  }, []);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter suggestions based on input
  useEffect(() => {
    const searchTerm = inputValue.trim().toLowerCase();

    // Only show suggestions after 3 characters
    if (searchTerm.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);

    // Debounce search for better performance
    const timer = setTimeout(() => {
      const filtered = allCities
        .filter(location =>
          location.city.toLowerCase().includes(searchTerm) ||
          location.country.toLowerCase().includes(searchTerm) ||
          location.display.toLowerCase().includes(searchTerm)
        )
        .slice(0, 15); // Limit to 15 suggestions

      setSuggestions(filtered);
      setOpen(filtered.length > 0);
      setLoading(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      setLoading(false);
    };
  }, [inputValue, allCities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.display);
    onChange(suggestion.display);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            id={id}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn("pr-10", className)}
            disabled={disabled}
            autoComplete="off"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {suggestions.length === 0 ? (
              <CommandEmpty>
                {inputValue.length >= 3
                  ? "Aucune suggestion trouvée"
                  : "Tapez au moins 3 caractères"}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={`${suggestion.city}-${suggestion.country}-${suggestion.state}-${index}`}
                    value={suggestion.display}
                    onSelect={() => handleSelectSuggestion(suggestion)}
                    className="cursor-pointer"
                  >
                    <MapPin className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate">{suggestion.city}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {suggestion.state ? `${suggestion.state}, ` : ''}{suggestion.country}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
