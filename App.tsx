import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FavoritesScreen, MineScreen } from './src/CollectionScreen';
import { DetailsScreen } from './src/DetailsScreen';
import { EditorScreen } from './src/EditorScreen';
import { HomeScreen } from './src/HomeScreen';
import { getCategories, getDiscoverRecipes, getRecipesByCategory, previewImage, searchRecipes } from './src/mealApi';
import { loadSavedData, saveData, type SavedData } from './src/storage';
import { colors } from './src/theme';
import type { Recipe, RecipeDraft, RecipeSummary } from './src/types';

type Screen =
  | { name: 'home' }
  | { name: 'favorites' }
  | { name: 'mine' }
  | { name: 'details'; recipe: RecipeSummary }
  | { name: 'editor'; recipe?: Recipe };

const fallbackCategories = [
  'Pizza', 'Italian', 'Vegetarian', 'Stir-fry', 'Asian', 'Cookies',
  'Dessert', 'Baking', 'Pasta', 'Chicken', 'Salsa', 'Salad',
];
const emptySaved: SavedData = { personal: [], favorites: [] };

export default function App() {
  const [stack, setStack] = useState<Screen[]>([{ name: 'home' }]);
  const current = stack[stack.length - 1];
  const [saved, setSaved] = useState<SavedData>(emptySaved);
  const savedRef = useRef<SavedData>(emptySaved);
  const recipeCache = useRef<Map<string, Recipe>>(new Map());
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<string[]>(fallbackCategories);
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [feed, setFeed] = useState<RecipeSummary[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    loadSavedData()
      .then((value) => { savedRef.current = value; setSaved(value); })
      .catch(() => { savedRef.current = emptySaved; setSaved(emptySaved); })
      .finally(() => setReady(true));
    getCategories().then((value) => { if (value.length) setCategories(value); }).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setFeedLoading(true);
      setFeedError('');
      try {
        const trimmed = query.trim();
        const result = trimmed
          ? await searchRecipes(trimmed)
          : category
            ? await getRecipesByCategory(category)
            : await getDiscoverRecipes();
        if (!active) return;
        result.forEach((item) => {
          if ('ingredients' in item) recipeCache.current.set(item.id, item as Recipe);
        });
        setFeed(result.map((item) => ({ ...item, image: previewImage(item.image) })));
      } catch {
        if (active) setFeedError('Connect to the internet to browse public recipes. Your saved recipes still work offline.');
      } finally {
        if (active) setFeedLoading(false);
      }
    }, query ? 350 : 0);
    return () => { active = false; clearTimeout(timer); };
  }, [category, query, retryKey]);

  function push(screen: Screen) { setStack((items) => [...items, screen]); }
  function back() { setStack((items) => items.length > 1 ? items.slice(0, -1) : items); }
  function home() { setStack([{ name: 'home' }]); }
  function openRecipe(recipe: RecipeSummary) {
    push({ name: 'details', recipe: recipeCache.current.get(recipe.id) ?? recipe });
  }
  function chooseCategory(value: string) { setCategory(value); setQuery(''); }
  function chooseQuery(value: string) { setQuery(value); if (value) setCategory(''); }

  async function changeSaved(update: (value: SavedData) => SavedData) {
    const next = update(savedRef.current);
    await saveData(next);
    savedRef.current = next;
    setSaved(next);
  }

  async function toggleFavorite(recipe: Recipe) {
    try {
      await changeSaved((value) => ({
        ...value,
        favorites: value.favorites.some((item) => item.id === recipe.id)
          ? value.favorites.filter((item) => item.id !== recipe.id)
          : [recipe, ...value.favorites],
      }));
    } catch {
      // Keep the current favorite state when local storage is unavailable.
    }
  }

  async function saveRecipe(draft: RecipeDraft, original?: Recipe) {
    const recipe: Recipe = {
      id: original?.id ?? `personal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: draft.title.trim(),
      image: draft.image.trim(),
      category: draft.category.trim() || 'My Recipe',
      ingredients: draft.ingredients.split('\n').map((line) => line.trim()).filter(Boolean),
      instructions: draft.instructions.split('\n').map((line) => line.trim()).filter(Boolean),
      prepMinutes: draft.prepMinutes ? Number(draft.prepMinutes) : undefined,
      servings: draft.servings ? Number(draft.servings) : undefined,
      calories: draft.calories ? Number(draft.calories) : undefined,
      difficulty: draft.difficulty,
      source: 'personal',
    };
    await changeSaved((value) => ({
      personal: [recipe, ...value.personal.filter((item) => item.id !== recipe.id)],
      favorites: value.favorites.map((item) => item.id === recipe.id ? recipe : item),
    }));
    recipeCache.current.set(recipe.id, recipe);
    setStack([{ name: 'home' }, { name: 'mine' }]);
  }

  async function deleteRecipe(id: string) {
    try {
      await changeSaved((value) => ({
        personal: value.personal.filter((item) => item.id !== id),
        favorites: value.favorites.filter((item) => item.id !== id),
      }));
      recipeCache.current.delete(id);
    } catch {
      // Leave the recipe visible if removal could not be persisted.
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {!ready ? (
        <View style={styles.startup}><Text style={styles.brand}>Foodie</Text><ActivityIndicator color={colors.orange} style={styles.spinner} /></View>
      ) : current.name === 'home' ? (
        <HomeScreen
          categories={categories}
          category={category}
          setCategory={chooseCategory}
          query={query}
          setQuery={chooseQuery}
          recipes={feed}
          personal={saved.personal}
          loading={feedLoading}
          error={feedError}
          retry={() => setRetryKey((value) => value + 1)}
          openRecipe={openRecipe}
          openFavorites={() => push({ name: 'favorites' })}
          openMine={() => push({ name: 'mine' })}
        />
      ) : current.name === 'favorites' ? (
        <FavoritesScreen recipes={saved.favorites} onHome={home} onOpen={openRecipe} />
      ) : current.name === 'mine' ? (
        <MineScreen
          recipes={saved.personal}
          onHome={home}
          onAdd={() => push({ name: 'editor' })}
          onOpen={openRecipe}
          onEdit={(recipe) => push({ name: 'editor', recipe })}
          onDelete={deleteRecipe}
        />
      ) : current.name === 'details' ? (
        <DetailsScreen
          selected={current.recipe}
          favorite={saved.favorites.some((item) => item.id === current.recipe.id)}
          onBack={back}
          onToggleFavorite={toggleFavorite}
        />
      ) : (
        <EditorScreen recipe={current.recipe} onBack={back} onSave={saveRecipe} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  startup: { flex: 1, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' },
  brand: { color: '#FFFFFF', fontSize: 52, fontWeight: '900', letterSpacing: 2 },
  spinner: { marginTop: 25 },
});
