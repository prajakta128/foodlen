// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences?: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  allergies: string[];
  dietaryRestrictions: string[];
  favoriteCategories: string[];
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  pushNotifications: boolean;
  productUpdates: boolean;
}

// Nutrition types
export interface Nutrition {
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // mg
  cholesterol?: number; // mg
  saturatedFat?: number; // grams
  transFat?: number; // grams
  vitaminA?: number;
  vitaminC?: number;
  calcium?: number;
  iron?: number;
}

// Ingredient types
export interface Ingredient {
  id: string;
  name: string;
  percentage?: number; // percentage in product
  isAllergen: boolean;
  allergenType?: string; // e.g., "nuts", "dairy", "gluten"
  source: string; // e.g., "manufacturer", "fda", "user"
}

// Allergen types
export interface Allergen {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
}

// Product analysis types
export interface Analysis {
  id: string;
  productId: string;
  nutritionAnalysis: NutritionAnalysis;
  claimAnalysis: ClaimAnalysis;
  ingredientAnalysis: IngredientAnalysis;
  allergenAnalysis: AllergenAnalysis;
  aiExplanation?: string;
  confidence: number; // 0-100
  sources: string[];
  createdAt: Date;
}

export interface NutritionAnalysis {
  summary: string;
  insights: string[];
  concerns: string[];
  recommendations: string[];
}

export interface ClaimAnalysis {
  claims: FoodClaim[];
  claimsVerified: boolean;
  notableAbsences?: string[];
}

export interface FoodClaim {
  id: string;
  claim: string; // e.g., "Natural", "Low Sugar"
  isVerified: boolean;
  confidence: number;
  explanation: string;
}

export interface IngredientAnalysis {
  recognizedPercentage: number;
  unknownIngredients: string[];
  notableIngredients: string[];
}

export interface AllergenAnalysis {
  detectedAllergens: Allergen[];
  mayContainAllergens: Allergen[];
  recommendations: string[];
}

// Product types
export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  category: string;
  subcategory?: string;
  imageUrl?: string;
  nutrition: Nutrition;
  ingredients: Ingredient[];
  allergens: Allergen[];
  servingSize: string;
  servingUnit: string;
  packageSize?: string;
  manufacturerInfo?: {
    name: string;
    country: string;
  };
  analysis?: Analysis;
  score?: FoodLensScore;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodLensScore {
  overall: number; // 0-100
  nutritionScore: number;
  transparencyScore: number;
  allergenScore: number;
  claimAccuracyScore: number;
  recommendation: 'excellent' | 'good' | 'fair' | 'needs-attention';
}

// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  verification_status: 'pending' | 'verified' | 'rejected' | string;
  owner_id: number;
  /** Real count of menu items actually listed — never a fabricated transparency label. */
  menu_item_count?: number;
}

export interface MenuItem {
  id: string;
  restaurant_id: number;
  name: string;
  description?: string;
  price: number;
  /** Free-text as entered by the restaurant owner — not structured/parsed. */
  ingredients?: string;
  allergens?: string;
  nutrition_json?: Record<string, number> | null;
  image_url?: string;
  is_active: boolean;
}

// Report types
export interface Report {
  id: string;
  type: 'inaccurate-nutrition' | 'missing-allergen' | 'wrong-product' | 'other';
  productId?: string;
  restaurantId?: string;
  description: string;
  status: 'pending' | 'under-review' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

// Comparison types
export interface Comparison {
  productA: Product;
  productB: Product;
  differences: ComparisonDifference[];
  winner?: 'A' | 'B' | 'tie';
  recommendation?: string;
}

export interface ComparisonDifference {
  category: string;
  valueA: string | number;
  valueB: string | number;
  winner?: 'A' | 'B' | 'tie';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Admin Dashboard types
export interface AdminDashboard {
  metrics: DashboardMetrics;
  recentReports: Report[];
  topProducts: Product[];
  featureUsage: FeatureUsageStats;
}

export interface DashboardMetrics {
  totalConsumers: number;
  activeConsumers: number;
  totalScans: number;
  productsAnalyzed: number;
  restaurantsAdded: number;
  averageHelpfulness: number;
}

export interface FeatureUsageStats {
  scans: number;
  searches: number;
  comparisons: number;
  restaurantViews: number;
  savedItems: number;
}
