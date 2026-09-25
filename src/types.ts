export type Recipe = {
  id: string;
  title: string;
  image: string;
  category: string;
  area?: string;
  ingredients: string[];
  instructions: string[];
  prepMinutes?: number;
  servings?: number;
  calories?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  source: 'catalog' | 'personal';
};

export type RecipeSummary = Pick<Recipe, 'id' | 'title' | 'image' | 'category' | 'source'>;

export type RecipeDraft = {
  title: string;
  image: string;
  category: string;
  ingredients: string;
  instructions: string;
  prepMinutes: string;
  servings: string;
  calories: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};
