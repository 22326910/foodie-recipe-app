import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';
import type { RecipeSummary } from './types';

export function ActionButton({
  title,
  onPress,
  tone = 'orange',
  style,
}: {
  title: string;
  onPress: () => void;
  tone?: 'orange' | 'dark' | 'green' | 'red' | 'light';
  style?: object;
}) {
  const background = {
    orange: colors.orange,
    dark: '#4B5563',
    green: colors.green,
    red: colors.red,
    light: colors.cream,
  }[tone];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: background, opacity: pressed ? 0.8 : 1 }, style]}
    >
      <Text style={[styles.buttonText, tone === 'light' && { color: colors.ink }]}>{title}</Text>
    </Pressable>
  );
}

export function BackButton({ onPress, label = 'Back to Home' }: { onPress: () => void; label?: string }) {
  return <ActionButton title={`←  ${label}`} onPress={onPress} tone="dark" />;
}

export function RecipeImage({ uri, style }: { uri: string; style?: object }) {
  return uri ? (
    <Image source={{ uri }} style={[styles.image, style]} resizeMode="cover" />
  ) : (
    <View style={[styles.image, styles.imagePlaceholder, style]}>
      <Text style={styles.imagePlaceholderText}>🍽️</Text>
    </View>
  );
}

export function RecipeGridCard({ recipe, onPress }: { recipe: RecipeSummary; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.gridCard}>
      <RecipeImage uri={recipe.image} style={styles.gridImage} />
      <Text style={styles.gridTitle} numberOfLines={2}>{recipe.title}</Text>
      <Text style={styles.gridCategory}>{recipe.category}</Text>
    </Pressable>
  );
}

export function RecipeListCard({
  recipe,
  onPress,
  actions,
}: {
  recipe: RecipeSummary;
  onPress: () => void;
  actions?: ReactNode;
}) {
  return (
    <View style={styles.listCard}>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.listMain}>
        <RecipeImage uri={recipe.image} style={styles.listImage} />
        <View style={styles.listText}>
          <Text style={styles.listTitle} numberOfLines={2}>{recipe.title}</Text>
          <Text style={styles.listCategory}>{recipe.category}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
      {actions}
    </View>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  image: { backgroundColor: '#F3F4F6' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 42 },
  gridCard: { width: '48%', marginBottom: 22 },
  gridImage: { width: '100%', aspectRatio: 1, borderRadius: 24 },
  gridTitle: { color: colors.ink, fontSize: 15, fontWeight: '700', marginTop: 9 },
  gridCategory: { color: colors.muted, fontSize: 12, marginTop: 3 },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginBottom: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  listMain: { flexDirection: 'row', alignItems: 'center' },
  listImage: { width: 84, height: 84, borderRadius: 15 },
  listText: { flex: 1, marginLeft: 14 },
  listTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  listCategory: { fontSize: 13, color: colors.muted, marginTop: 5 },
  chevron: { fontSize: 28, color: colors.muted, paddingHorizontal: 4 },
});
