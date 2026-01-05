import { z } from 'zod'

export const ingredientSchema = z.object({
  name: z
    .string({ required_error: 'Ingredient name is required' })
    .min(1, 'Ingredient name is required'),
  amount: z
    .string({ required_error: 'Amount is required' })
    .min(1, 'Amount is required'),
  unit: z.string().optional(),
})

export const stepSchema = z.object({
  instruction: z
    .string({ required_error: 'Instruction is required' })
    .min(5, 'Instruction must be at least 5 characters'),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export const recipeSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be at most 500 characters'),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  prepTime: z
    .number({ required_error: 'Prep time is required' })
    .min(1, 'Prep time must be at least 1 minute')
    .max(1440, 'Prep time must be at most 24 hours'),
  cookTime: z
    .number({ required_error: 'Cook time is required' })
    .min(0, 'Cook time cannot be negative')
    .max(1440, 'Cook time must be at most 24 hours'),
  servings: z
    .number({ required_error: 'Servings is required' })
    .min(1, 'Must serve at least 1')
    .max(100, 'Servings must be at most 100'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
    required_error: 'Difficulty is required',
  }),
  categoryId: z
    .string({ required_error: 'Category is required' })
    .min(1, 'Please select a category'),
  ingredients: z
    .array(ingredientSchema)
    .min(1, 'At least one ingredient is required'),
  steps: z
    .array(stepSchema)
    .min(1, 'At least one step is required'),
  tagIds: z.array(z.string()).optional(),
  published: z.boolean().default(false),
})

export type IngredientFormData = z.infer<typeof ingredientSchema>
export type StepFormData = z.infer<typeof stepSchema>
export type RecipeFormData = z.infer<typeof recipeSchema>

// Difficulty options for select
export const difficultyOptions = [
  { label: 'Easy', value: 'EASY' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Hard', value: 'HARD' },
]
