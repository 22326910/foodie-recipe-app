import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Recipe } from './types';

const STORAGE_KEY = 'foodie-recipes-v1';

export type SavedData = {
  personal: Recipe[];
  favorites: Recipe[];
};

export async function loadSavedData(): Promise<SavedData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return { personal: [], favorites: [] };
  const parsed = JSON.parse(raw) as Partial<SavedData>;
  return {
    personal: Array.isArray(parsed.personal) ? parsed.personal : [],
    favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
  };
}

export async function saveData(data: SavedData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
