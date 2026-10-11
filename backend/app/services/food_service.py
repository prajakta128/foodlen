from __future__ import annotations

import httpx
from fastapi import HTTPException

OFF_BASE = "https://world.openfoodfacts.org"
USER_AGENT = "FoodLens/1.0 (contact: support@foodlens.app)"

NUTRISCORE_POINTS = {"a": 95, "b": 80, "c": 60, "d": 40, "e": 20}
NOVA_POINTS = {1: 95, 2: 75, 3: 50, 4: 25}


def _grade_from_score(score: int) -> str:
    if score >= 85:
        return "excellent"
    if score >= 65:
        return "good"
    if score >= 45:
        return "fair"
    return "needs-attention"


def _slugify(text: str) -> str:
    return "-".join(text.lower().strip().split())[:64] or "item"


def _extract_allergens(off_product: dict) -> list[dict]:
    tags = off_product.get("allergens_tags") or []
    out = []
    for tag in tags:
        name = tag.split(":")[-1].replace("-", " ").strip()
        if not name:
            continue
        out.append({"id": _slugify(name), "name": name.title(), "severity": "high"})
    return out


def _extract_ingredients(off_product: dict) -> list[dict]:
    text = off_product.get("ingredients_text") or off_product.get("ingredients_text_en") or ""
    allergen_names = {a["name"].lower() for a in _extract_allergens(off_product)}
    ingredients = []
    if text:
        parts = [p.strip(" .") for p in text.replace("(", ",").replace(")", ",").split(",")]
        seen = set()
        for part in parts:
            if not part or len(part) > 60:
                continue
            key = part.lower()
            if key in seen:
                continue
            seen.add(key)
            ingredients.append(
                {
                    "id": _slugify(part),
                    "name": part,
                    "isAllergen": any(a in key for a in allergen_names),
                }
            )
            if len(ingredients) >= 30:
                break
    return ingredients


def _compute_score(off_product: dict, allergens: list[dict]) -> dict:
    nutriscore = (off_product.get("nutriscore_grade") or "").lower()
    nova = off_product.get("nova_group")
    ecoscore = (off_product.get("ecoscore_grade") or "").lower()

    nutrition_score = NUTRISCORE_POINTS.get(nutriscore, 50)
    transparency_score = 90 if off_product.get("ingredients_text") else 40
    allergen_score = 90 if off_product.get("allergens_tags") is not None else 50
    if allergens:
        allergen_score = max(allergen_score - len(allergens) * 3, 40)
    claim_score = NOVA_POINTS.get(nova, 55)

    overall = round(
        nutrition_score * 0.4
        + transparency_score * 0.2
        + allergen_score * 0.2
        + claim_score * 0.2
    )

    return {
        "overall": overall,
        "nutritionScore": nutrition_score,
        "transparencyScore": transparency_score,
        "allergenScore": allergen_score,
        "claimAccuracyScore": claim_score,
        "recommendation": _grade_from_score(overall),
    }


def normalize_product(off_product: dict) -> dict | None:
    if not off_product or not off_product.get("product_name"):
        return None

    barcode = off_product.get("code") or off_product.get("_id") or ""
    nutrients = off_product.get("nutriments") or {}
    allergens = _extract_allergens(off_product)
    ingredients = _extract_ingredients(off_product)

    nutrition = {
        "calories": nutrients.get("energy-kcal_100g"),
        "protein": nutrients.get("proteins_100g"),
        "carbohydrates": nutrients.get("carbohydrates_100g"),
        "fat": nutrients.get("fat_100g"),
        "saturatedFat": nutrients.get("saturated-fat_100g"),
        "fiber": nutrients.get("fiber_100g"),
        "sugar": nutrients.get("sugars_100g"),
        "sodium": nutrients.get("sodium_100g"),
        "salt": nutrients.get("salt_100g"),
    }

    categories = [c.strip() for c in (off_product.get("categories") or "").split(",") if c.strip()]

    return {
        "id": barcode,
        "name": off_product.get("product_name") or "Unknown product",
        "brand": off_product.get("brands", "").split(",")[0].strip() or "Unknown brand",
        "barcode": barcode,
        "category": categories[-1] if categories else "Uncategorized",
        "subcategory": categories[0] if len(categories) > 1 else None,
        "imageUrl": off_product.get("image_front_url") or off_product.get("image_url"),
        "nutrition": nutrition,
        "ingredients": ingredients,
        "allergens": allergens,
        "servingSize": (off_product.get("serving_size") or "100 g").split(" ")[0],
        "servingUnit": "g",
        "packageSize": off_product.get("quantity"),
        "manufacturerInfo": {
            "name": off_product.get("brands", "").split(",")[0].strip() or "Unknown",
            "country": (off_product.get("countries") or "").split(",")[0].strip() or "Unknown",
        },
        "score": _compute_score(off_product, allergens),
        "nutriscoreGrade": (off_product.get("nutriscore_grade") or "").upper() or None,
        "novaGroup": off_product.get("nova_group"),
        "ecoscoreGrade": (off_product.get("ecoscore_grade") or "").upper() or None,
        "labels": [l.strip() for l in (off_product.get("labels") or "").split(",") if l.strip()][:8],
        "dataSource": "Open Food Facts",
        "sourceUrl": f"https://world.openfoodfacts.org/product/{barcode}",
        "ingredientsRawText": off_product.get("ingredients_text") or off_product.get("ingredients_text_en") or None,
    }


async def get_product_by_barcode(barcode: str) -> dict | None:
    url = f"{OFF_BASE}/api/v2/product/{barcode}.json"
    async with httpx.AsyncClient(timeout=10, headers={"User-Agent": USER_AGENT}) as client:
        resp = await client.get(url)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Open Food Facts is unavailable right now.")
    data = resp.json()
    if data.get("status") != 1:
        return None
    return normalize_product(data.get("product") or {})


async def search_products(query: str, page: int = 1, page_size: int = 20) -> dict:
    url = f"{OFF_BASE}/api/v2/search"
    params = {
        "search_terms": query,
        "page": page,
        "page_size": page_size,
        "fields": (
            "code,product_name,brands,categories,image_front_url,image_url,"
            "nutriments,ingredients_text,allergens_tags,serving_size,quantity,"
            "countries,nutriscore_grade,nova_group,ecoscore_grade,labels"
        ),
    }
    async with httpx.AsyncClient(timeout=10, headers={"User-Agent": USER_AGENT}) as client:
        resp = await client.get(url, params=params)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Open Food Facts is unavailable right now.")
    data = resp.json()
    raw_items = data.get("products") or []
    items = [p for p in (normalize_product(p) for p in raw_items) if p]
    total = data.get("count", len(items))
    return {
        "items": items,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "hasMore": page * page_size < total,
    }


async def search_by_category(category: str, page: int = 1, page_size: int = 20) -> dict:
    url = f"{OFF_BASE}/api/v2/search"
    params = {
        "categories_tags_en": category,
        "page": page,
        "page_size": page_size,
        "sort_by": "unique_scans_n",
        "fields": (
            "code,product_name,brands,categories,image_front_url,image_url,"
            "nutriments,ingredients_text,allergens_tags,serving_size,quantity,"
            "countries,nutriscore_grade,nova_group,ecoscore_grade,labels"
        ),
    }
    async with httpx.AsyncClient(timeout=10, headers={"User-Agent": USER_AGENT}) as client:
        resp = await client.get(url, params=params)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Open Food Facts is unavailable right now.")
    data = resp.json()
    raw_items = data.get("products") or []
    items = [p for p in (normalize_product(p) for p in raw_items) if p]
    total = data.get("count", len(items))
    return {
        "items": items,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "hasMore": page * page_size < total,
    }
