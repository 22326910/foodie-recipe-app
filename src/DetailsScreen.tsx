import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getRecipe } from './mealApi';
import { RecipeImage } from './components';
import { colors } from './theme';
import type { Recipe, RecipeSummary } from './types';

export function DetailsScreen({
  selected, favorite, onBack, onToggleFavorite,
}: {
  selected: RecipeSummary;
  favorite: boolean;
  onBack: () => void;
  onToggleFavorite: (recipe: Recipe) => void;
}) {
  const [recipe, setRecipe] = useState<Recipe | null>('ingredients' in selected ? selected as Recipe : null);
  const [loading, setLoading] = useState(!('ingredients' in selected));
  const [error, setError] = useState('');

  useEffect(() => {
    if ('ingredients' in selected) {
      setRecipe(selected as Recipe);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    getRecipe(selected.id)
      .then((value) => { if (active) { setRecipe(value); setError(''); } })
      .catch(() => { if (active) setError('Please check your connection and try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selected]);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.heroWrap}>
        <RecipeImage uri={recipe?.image || selected.image} style={styles.heroImage} />
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backPill}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
          onPress={() => recipe && onToggleFavorite(recipe)}
          disabled={!recipe}
          style={styles.heartPill}
        >
          <Text style={[styles.heart, favorite && styles.heartActive]}>{favorite ? '♥' : '♡'}</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{selected.title}</Text>
      <Text style={styles.subtitle}>{selected.category}{recipe?.area ? `  |  ${recipe.area}` : ''}</Text>
      <View style={styles.facts}>
        <Fact icon="🕒" label={recipe?.prepMinutes ? `${recipe.prepMinutes} Mins` : '— Mins'} />
        <Fact icon="👥" label={recipe?.servings ? `${recipe.servings} Servings` : '— Servings'} />
        <Fact icon="🔥" label={recipe?.calories ? `${recipe.calories} Cal` : '— Cal'} />
        <Fact icon="🍳" label={recipe?.difficulty ?? '—'} />
      </View>
      {loading && <ActivityIndicator size="large" color={colors.orange} style={styles.loading} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {recipe && (
        <>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={`${index}-${ingredient}`} style={styles.ingredient}>
              <View style={styles.bullet} />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((step, index) => (
            <View key={`${index}-${step}`} style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function Fact({ icon, label }: { icon: string; label: string }) {
  return <View style={styles.fact}><Text style={styles.factIcon}>{icon}</Text><Text style={styles.factText}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  page: { paddingBottom: 50, maxWidth: 780, width: '100%', alignSelf: 'center' },
  heroWrap: { position: 'relative', marginHorizontal: 6, marginTop: 6 },
  heroImage: { width: '100%', height: 350, borderRadius: 28 },
  backPill: { position: 'absolute', left: 18, top: 20, backgroundColor: '#FFFFFF', borderRadius: 25, paddingVertical: 12, paddingHorizontal: 17 },
  backText: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  heartPill: { position: 'absolute', right: 18, top: 20, width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#FFFFFF' },
  heart: { color: colors.ink, fontSize: 28, lineHeight: 32 },
  heartActive: { color: '#E65158' },
  title: { color: colors.ink, fontSize: 28, fontWeight: '900', textAlign: 'center', marginTop: 30, paddingHorizontal: 15 },
  subtitle: { color: colors.muted, fontSize: 15, textAlign: 'center', marginTop: 8 },
  facts: { flexDirection: 'row', gap: 7, marginHorizontal: 16, marginTop: 28, marginBottom: 25 },
  fact: { flex: 1, minHeight: 82, backgroundColor: '#F7F7F8', borderRadius: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  factIcon: { fontSize: 22 },
  factText: { color: colors.ink, fontSize: 10, fontWeight: '800', marginTop: 8, textAlign: 'center' },
  loading: { marginTop: 45 },
  error: { textAlign: 'center', color: colors.red, marginTop: 35 },
  sectionTitle: { color: colors.ink, fontSize: 23, fontWeight: '900', marginHorizontal: 20, marginTop: 22, marginBottom: 13 },
  ingredient: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cream, borderRadius: 13, paddingVertical: 14, paddingHorizontal: 16, marginHorizontal: 20, marginBottom: 8 },
  bullet: { height: 11, width: 11, borderRadius: 6, backgroundColor: colors.yellow, marginRight: 13 },
  ingredientText: { color: colors.ink, fontSize: 15, flex: 1 },
  step: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, alignItems: 'flex-start' },
  stepNumber: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  stepNumberText: { color: '#FFFFFF', fontWeight: '900' },
  stepText: { color: colors.ink, flex: 1, fontSize: 15, lineHeight: 23 },
});
