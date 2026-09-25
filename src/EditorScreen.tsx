import { useState } from 'react';
import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton, BackButton, RecipeImage } from './components';
import { colors } from './theme';
import type { Recipe, RecipeDraft } from './types';

function draftFrom(recipe?: Recipe): RecipeDraft {
  return {
    title: recipe?.title ?? '',
    image: recipe?.image ?? '',
    category: recipe?.category ?? '',
    ingredients: recipe?.ingredients.join('\n') ?? '',
    instructions: recipe?.instructions.join('\n') ?? '',
    prepMinutes: recipe?.prepMinutes?.toString() ?? '',
    servings: recipe?.servings?.toString() ?? '',
    calories: recipe?.calories?.toString() ?? '',
    difficulty: recipe?.difficulty ?? 'Easy',
  };
}

export function EditorScreen({ recipe, onBack, onSave }: {
  recipe?: Recipe;
  onBack: () => void;
  onSave: (draft: RecipeDraft, original?: Recipe) => Promise<void>;
}) {
  const [draft, setDraft] = useState<RecipeDraft>(() => draftFrom(recipe));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set<K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function choosePhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.65,
        base64: Platform.OS === 'web',
      });
      if (result.canceled || !result.assets.length) return;
      const asset = result.assets[0];
      if (Platform.OS === 'web') {
        set('image', asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri);
      } else {
        const extension = asset.mimeType === 'image/png' ? 'png' : 'jpg';
        const destination = new File(Paths.document, `foodie-${Date.now()}.${extension}`);
        await new File(asset.uri).copy(destination);
        set('image', destination.uri);
      }
      setError('');
    } catch {
      setError('Could not use that photo. You can paste an image URL instead.');
    }
  }

  async function save() {
    if (!draft.title.trim() || !draft.ingredients.trim() || !draft.instructions.trim()) {
      setError('Add a name, ingredients, and instructions before saving.');
      return;
    }
    const numberFields = [draft.prepMinutes, draft.servings, draft.calories].filter(Boolean);
    if (numberFields.some((value) => !Number.isFinite(Number(value)) || Number(value) < 0)) {
      setError('Time, servings, and calories must be positive numbers.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(draft, recipe);
    } catch {
      setError('Could not save the recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <BackButton onPress={onBack} label="Back" />
      <Text style={styles.heading}>{recipe ? 'Edit Recipe' : 'Add New Recipe'}</Text>
      <Field label="Recipe name" value={draft.title} onChangeText={(value) => set('title', value)} placeholder="e.g. Sunday pasta" />
      <RecipeImage uri={draft.image} style={styles.preview} />
      <ActionButton title="Choose a Photo" tone="light" onPress={choosePhoto} style={styles.photoButton} />
      <Field label="Or image URL" value={draft.image.startsWith('data:') || draft.image.startsWith('file:') ? '' : draft.image} onChangeText={(value) => set('image', value)} placeholder="https://example.com/photo.jpg" autoCapitalize="none" />
      <Field label="Category" value={draft.category} onChangeText={(value) => set('category', value)} placeholder="e.g. Dinner" />
      <Field label="Ingredients — one per line" value={draft.ingredients} onChangeText={(value) => set('ingredients', value)} placeholder={'2 cups flour\n1 teaspoon salt'} multiline />
      <Field label="Instructions — one step per line" value={draft.instructions} onChangeText={(value) => set('instructions', value)} placeholder={'Prepare the ingredients\nCook until ready'} multiline />
      <View style={styles.metrics}>
        <View style={styles.metric}><Field label="Minutes" value={draft.prepMinutes} onChangeText={(value) => set('prepMinutes', value)} placeholder="35" keyboardType="number-pad" /></View>
        <View style={styles.metric}><Field label="Servings" value={draft.servings} onChangeText={(value) => set('servings', value)} placeholder="4" keyboardType="number-pad" /></View>
        <View style={styles.metric}><Field label="Calories" value={draft.calories} onChangeText={(value) => set('calories', value)} placeholder="300" keyboardType="number-pad" /></View>
      </View>
      <Text style={styles.label}>Difficulty</Text>
      <View style={styles.difficulties}>
        {(['Easy', 'Medium', 'Hard'] as const).map((value) => (
          <ActionButton key={value} title={value} tone={draft.difficulty === value ? 'orange' : 'light'} onPress={() => set('difficulty', value)} style={styles.difficulty} />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ActionButton title={saving ? 'Saving…' : 'Save Recipe'} onPress={save} style={styles.saveButton} />
    </ScrollView>
  );
}

function Field({ label, multiline, ...input }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  autoCapitalize?: 'none';
  keyboardType?: 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...input}
        accessibilityLabel={label}
        multiline={multiline}
        placeholderTextColor="#A5ABB3"
        style={[styles.input, multiline && styles.multiline]}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, padding: 16, paddingBottom: 45, maxWidth: 780, width: '100%', alignSelf: 'center' },
  heading: { color: colors.ink, fontSize: 26, fontWeight: '900', textAlign: 'center', marginVertical: 28 },
  field: { marginBottom: 16 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 7 },
  input: { borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: '#FFFFFF', paddingHorizontal: 13, paddingVertical: 12, minHeight: 48, color: colors.ink, fontSize: 15 },
  multiline: { minHeight: 100, lineHeight: 22 },
  preview: { width: '100%', height: 180, borderRadius: 12, marginBottom: 10 },
  photoButton: { marginBottom: 16, minHeight: 45 },
  metrics: { flexDirection: 'row', gap: 10 },
  metric: { flex: 1 },
  difficulties: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  difficulty: { flex: 1, minHeight: 43, paddingHorizontal: 3 },
  error: { color: '#B42318', fontSize: 14, marginVertical: 10 },
  saveButton: { marginTop: 12 },
});
