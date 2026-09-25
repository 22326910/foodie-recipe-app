import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton, BackButton, RecipeImage, RecipeListCard } from './components';
import { colors } from './theme';
import type { Recipe } from './types';

export function FavoritesScreen({
  recipes, onHome, onOpen,
}: {
  recipes: Recipe[];
  onHome: () => void;
  onOpen: (recipe: Recipe) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <BackButton onPress={onHome} />
      <Text style={styles.title}>My Favorite Recipes</Text>
      {recipes.length === 0 ? (
        <Text style={styles.empty}>No favorites yet. Tap the heart on a recipe to save it here.</Text>
      ) : recipes.map((recipe) => (
        <RecipeListCard key={recipe.id} recipe={recipe} onPress={() => onOpen(recipe)} />
      ))}
    </ScrollView>
  );
}

export function MineScreen({
  recipes, onHome, onAdd, onOpen, onEdit, onDelete,
}: {
  recipes: Recipe[];
  onHome: () => void;
  onAdd: () => void;
  onOpen: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}) {
  function confirmDelete(recipe: Recipe) {
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${recipe.title}"?`)) onDelete(recipe.id);
    } else {
      Alert.alert('Delete recipe?', `Remove "${recipe.title}" from this device?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(recipe.id) },
      ]);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <BackButton onPress={onHome} />
      <Text style={styles.title}>My Recipes</Text>
      <ActionButton title="Add New Recipe" onPress={onAdd} style={styles.addButton} />
      {recipes.length === 0 ? (
        <Text style={styles.empty}>No recipes added yet.</Text>
      ) : recipes.map((recipe) => (
        <View key={recipe.id} style={styles.myCard}>
          <Pressable accessibilityRole="button" onPress={() => onOpen(recipe)}>
            <RecipeImage uri={recipe.image} style={styles.myImage} />
            <Text style={styles.myTitle}>{recipe.title}</Text>
            <Text style={styles.preview} numberOfLines={1}>{recipe.ingredients.join(', ')}</Text>
            <Text style={styles.preview} numberOfLines={1}>{recipe.instructions.join(' ')}</Text>
          </Pressable>
          <View style={styles.actions}>
            <ActionButton title="Edit" tone="green" onPress={() => onEdit(recipe)} style={styles.action} />
            <ActionButton title="Delete" tone="red" onPress={() => confirmDelete(recipe)} style={styles.action} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, padding: 16, paddingBottom: 45, maxWidth: 780, width: '100%', alignSelf: 'center', flexGrow: 1 },
  title: { color: colors.ink, fontSize: 27, fontWeight: '900', textAlign: 'center', marginVertical: 32 },
  addButton: { marginBottom: 20 },
  empty: { color: colors.muted, textAlign: 'center', fontSize: 16, lineHeight: 24, marginTop: 25, paddingHorizontal: 24 },
  myCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 16, marginBottom: 17, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.09, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  myImage: { width: '100%', height: 195, borderRadius: 13 },
  myTitle: { color: colors.ink, fontSize: 21, fontWeight: '900', marginTop: 13, marginBottom: 4 },
  preview: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 14 },
  action: { flex: 1, minHeight: 45 },
});
