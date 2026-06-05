import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ControllerRenderProps } from 'react-hook-form';
import type { RegisterFormValues } from './RegisterForm';
import { countries } from './countries';
import type { Country } from 'countries-ts';

interface CountryComboboxProps {
  field: ControllerRenderProps<RegisterFormValues, 'country'>;
  disabled?: boolean;
}

export function CountryCombobox({ field, disabled }: CountryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = countries.find((c) => c.code === field.value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', !selected && 'text-muted-foreground')}
          disabled={disabled}
        >
          {selected ? (
            <span className="flex items-center gap-2">
              ({selected.countryCode})
            </span>
          ) : (
            'Sélectionner un pays'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Rechercher un pays ou un code..." autoFocus />
          <CommandList>
            <CommandEmpty>Aucun résultat</CommandEmpty>
            <CommandGroup>
              {countries.map((country: Country) => (
                <CommandItem
                  key={country.code}
                  value={country.countryCode + ' ' + country.label}
                  onSelect={() => {
                    field.onChange(country.code);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="text-xs w-10 text-muted-foreground">({country.countryCode})</span>
                  <span>{country.label}</span>
                  {field.value === country.code && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 