import type { Recipe, RecipeSummary } from './types';

const API = 'https://dummyjson.com';

type CatalogRecipe = {
  id: number;
  name: string;
  image: string;
  tags: string[];
  cuisine: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  servings: number;
  caloriesPerServing: number;
  difficulty: string;
};

async function getJson(path: string): Promise<unknown> {
  const response = await fetch(`${API}${path}`);
  if (!response.ok) throw new Error(`Recipe service returned ${response.status}`);
  return response.json();
}

function recipesFrom(data: unknown): CatalogRecipe[] {
  if (!data || typeof data !== 'object' || !('recipes' in data)) return [];
  const recipes = data.recipes;
  return Array.isArray(recipes) ? recipes as CatalogRecipe[] : [];
}

export function toSummary(item: CatalogRecipe): RecipeSummary {
  return {
    id: String(item.id),
    title: item.name,
    image: item.image,
    category: item.tags?.[0] || item.cuisine || 'Recipe',
    source: 'catalog',
  };
}

export function toRecipe(item: CatalogRecipe): Recipe {
  return {
    ...toSummary(item),
    area: item.cuisine,
    ingredients: item.ingredients,
    instructions: item.instructions,
    prepMinutes: item.prepTimeMinutes,
    servings: item.servings,
    calories: item.caloriesPerServing,
    difficulty: ['Easy', 'Medium', 'Hard'].includes(item.difficulty)
      ? item.difficulty as Recipe['difficulty']
      : undefined,
  };
}

export function previewImage(image: string): string {
  return image;
}

export async function getCategories(): Promise<string[]> {
  const data = await getJson('/recipes/tags');
  return Array.isArray(data) ? data.filter((tag): tag is string => typeof tag === 'string').slice(0, 24) : [];
}

export async function getDiscoverRecipes(): Promise<Recipe[]> {
  const data = await getJson('/recipes?limit=0');
  return recipesFrom(data).map(toRecipe);
}

export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
  const data = await getJson(`/recipes/tag/${encodeURIComponent(category)}?limit=0`);
  return recipesFrom(data).map(toRecipe);
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const data = await getJson(`/recipes/search?q=${encodeURIComponent(query)}&limit=0`);
  return recipesFrom(data).map(toRecipe);
}

export async function getRecipe(id: string): Promise<Recipe> {
  const data = await getJson(`/recipes/${encodeURIComponent(id)}`);
  if (!data || typeof data !== 'object' || !('id' in data)) throw new Error('Recipe not found');
  return toRecipe(data as CatalogRecipe);
}
