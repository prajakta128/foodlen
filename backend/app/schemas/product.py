from __future__ import annotations

from pydantic import BaseModel


class NutritionOut(BaseModel):
    calories: float | None = None
    protein: float | None = None
    carbohydrates: float | None = None
    fat: float | None = None
    saturatedFat: float | None = None
    fiber: float | None = None
    sugar: float | None = None
    sodium: float | None = None
    salt: float | None = None


class IngredientOut(BaseModel):
    id: str
    name: str
    isAllergen: bool = False


class AllergenOut(BaseModel):
    id: str
    name: str
    severity: str = "medium"


class FoodLensScoreOut(BaseModel):
    overall: int
    nutritionScore: int
    transparencyScore: int
    allergenScore: int
    claimAccuracyScore: int
    recommendation: str


class ProductOut(BaseModel):
    id: str
    name: str
    brand: str
    barcode: str
    category: str
    subcategory: str | None = None
    imageUrl: str | None = None
    nutrition: NutritionOut
    ingredients: list[IngredientOut] = []
    allergens: list[AllergenOut] = []
    servingSize: str = "100"
    servingUnit: str = "g"
    packageSize: str | None = None
    manufacturerInfo: dict | None = None
    score: FoodLensScoreOut | None = None
    nutriscoreGrade: str | None = None
    novaGroup: int | None = None
    ecoscoreGrade: str | None = None
    labels: list[str] = []
    dataSource: str = "Open Food Facts"
    sourceUrl: str | None = None
    # Raw, unparsed ingredients text from the source — some real on-pack claims
    # (e.g. "NO SUGAR ADDED") live in here rather than in the structured labels
    # field, so claim-checking needs the full text, not just the parsed list.
    ingredientsRawText: str | None = None


class ProductSearchResult(BaseModel):
    items: list[ProductOut]
    total: int
    page: int
    pageSize: int
    hasMore: bool
