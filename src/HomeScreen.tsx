import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { RecipeGridCard } from './components';
import { colors } from './theme';
import type { Recipe, RecipeSummary } from './types';

const categoryIcons: Record<string, string> = {
  Beef: '🥩', Chicken: '🍗', Dessert: '🍰', Lamb: '🍖', Miscellaneous: '🍲',
  Pasta: '🍝', Pork: '🍖', Seafood: '🦐', Side: '🥗', Starter: '🥘',
  Vegan: '🥬', Vegetarian: '🥕', Breakfast: '🥞', Goat: '🍛',
  Pizza: '🍕', Italian: '🍅', 'Stir-fry': '🥘', Asian: '🥢', Cookies: '🍪',
  Baking: '🧁', Salsa: '🌶️', Salad: '🥗', Quinoa: '🥣', Bruschetta: '🥖',
  Caprese: '🍅', Shrimp: '🍤', Biryani: '🍚', Indian: '🍛',
};

export function HomeScreen({
  categories,
  category,
  setCategory,
  query,
  setQuery,
  recipes,
  personal,
  loading,
  error,
  retry,
  openRecipe,
  openFavorites,
  openMine,
}: {
  categories: string[];
  category: string;
  setCategory: (value: string) => void;
  query: string;
  setQuery: (value: string) => void;
  recipes: RecipeSummary[];
  personal: Recipe[];
  loading: boolean;
  error: string;
  retry: () => void;
  openRecipe: (recipe: RecipeSummary) => void;
  openFavorites: () => void;
  openMine: () => void;
}) {
  const allRecipes = query || category ? recipes : [...personal, ...recipes];
  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.topLine}>
        <View style={styles.avatar}><Text style={styles.avatarText}>👨‍🍳</Text></View>
        <Text style={styles.hello}>Hello, Chef!</Text>
      </View>
      <Text style={styles.hero}>Make your own food,{`\n`}stay at <Text style={styles.heroAccent}>home</Text></Text>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search recipes"
          placeholderTextColor="#9AA1AB"
          style={styles.searchInput}
          accessibilityLabel="Search recipes"
          returnKeyType="search"
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        <CategoryChip title="My Food" icon="🍽️" active={false} onPress={openMine} highlight="green" />
        <CategoryChip title="My Favorites" icon="❤️" active={false} onPress={openFavorites} highlight="green" />
        <CategoryChip title="All" icon="✨" active={!category} onPress={() => setCategory('')} />
        {categories.map((item) => (
          <CategoryChip
            key={item}
            title={item}
            icon={categoryIcons[item] ?? '🍴'}
            active={category === item}
            onPress={() => setCategory(item)}
          />
        ))}
      </ScrollView>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{query ? 'Search results' : category || 'Recipes'}</Text>
        {!loading && <Text style={styles.count}>{allRecipes.length} recipes</Text>}
      </View>
      {loading && <ActivityIndicator size="large" color={colors.orange} style={styles.loader} />}
      {!loading && error ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageTitle}>Could not load recipes</Text>
          <Text style={styles.messageText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={retry} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
      {!loading && !error && allRecipes.length === 0 && (
        <View style={styles.messageBox}>
          <Text style={styles.messageTitle}>No recipes found</Text>
          <Text style={styles.messageText}>Try another search or category.</Text>
        </View>
      )}
      {!loading && !error && (
        <View style={styles.grid}>
          {allRecipes.map((recipe) => (
            <RecipeGridCard key={recipe.id} recipe={recipe} onPress={() => openRecipe(recipe)} />
          ))}
        </View>
      )}
      <Text style={styles.credit}>Public sample recipes powered by DummyJSON</Text>
    </ScrollView>
  );
}

function CategoryChip({
  title, icon, active, onPress, highlight = 'orange',
}: {
  title: string;
  icon: string;
  active: boolean;
  onPress: () => void;
  highlight?: 'orange' | 'green';
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={styles.categoryChip}>
      <View style={[styles.categoryCircle, { borderColor: highlight === 'green' ? colors.green : active ? colors.orange : colors.border }]}>
        <Text style={styles.categoryEmoji}>{icon}</Text>
      </View>
      <Text style={[styles.categoryLabel, active && { color: colors.orange, fontWeight: '800' }]} numberOfLines={1}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 38, maxWidth: 780, width: '100%', alignSelf: 'center' },
  topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { height: 50, width: 50, borderRadius: 25, backgroundColor: '#FFF0D0', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 27 },
  hello: { color: colors.muted, fontSize: 14, backgroundColor: '#F4F5F7', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  hero: { color: colors.ink, fontSize: 30, lineHeight: 42, fontWeight: '700', marginTop: 27, marginBottom: 24 },
  heroAccent: { color: colors.orange, fontWeight: '800' },
  searchBox: { borderRadius: 15, backgroundColor: '#F5F6F8', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 51, marginBottom: 27 },
  searchIcon: { color: colors.muted, fontSize: 28, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: colors.ink, height: '100%' },
  categories: { gap: 15, paddingRight: 15, paddingBottom: 8 },
  categoryChip: { width: 76, alignItems: 'center' },
  categoryCircle: { height: 64, width: 64, borderRadius: 32, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  categoryEmoji: { fontSize: 27 },
  categoryLabel: { marginTop: 7, color: colors.muted, fontSize: 11, textAlign: 'center' },
  sectionHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 22, marginBottom: 18 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: colors.ink },
  count: { color: colors.muted, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  loader: { paddingVertical: 50 },
  messageBox: { alignItems: 'center', paddingVertical: 55, paddingHorizontal: 30 },
  messageTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  messageText: { color: colors.muted, marginTop: 8, textAlign: 'center' },
  retryButton: { marginTop: 18, paddingVertical: 10, paddingHorizontal: 18, backgroundColor: colors.orange, borderRadius: 9 },
  retryText: { color: '#FFFFFF', fontWeight: '800' },
  credit: { textAlign: 'center', color: '#A5ABB3', fontSize: 11, marginTop: 25 },
});
