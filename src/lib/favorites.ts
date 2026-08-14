import type { AnimalType } from './medications';

export interface FavoriteMed {
  medicationId: string;
  name: string;
  genericName: string;
  category: string;
  species: AnimalType[];
}

const FAVORITES_KEY = 'vetcalc-favorites';

export function getFavorites(): FavoriteMed[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addFavorite(med: FavoriteMed): void {
  const favs = getFavorites();
  if (!favs.find((f) => f.medicationId === med.medicationId)) {
    favs.push(med);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  }
}

export function removeFavorite(medicationId: string): void {
  const favs = getFavorites().filter((f) => f.medicationId !== medicationId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export function isFavorite(medicationId: string): boolean {
  return getFavorites().some((f) => f.medicationId === medicationId);
}
