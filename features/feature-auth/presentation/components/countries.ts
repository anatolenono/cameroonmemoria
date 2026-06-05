import { listCountries } from 'countries-ts';

const rawCountries = listCountries();

// Remove duplicates by country code
export const countries = Array.from(
  new Map(rawCountries.map(c => [c.code, c])).values()
);
