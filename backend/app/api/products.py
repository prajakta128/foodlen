from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from ..schemas.product import ProductOut, ProductSearchResult
from ..services import food_service

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("/search", response_model=ProductSearchResult)
async def search_products(
    query: str = Query(..., min_length=1, alias="query"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50, alias="pageSize"),
):
    result = await food_service.search_products(query, page=page, page_size=page_size)
    return result


@router.get("/category/{category}", response_model=ProductSearchResult)
async def products_by_category(
    category: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50, alias="pageSize"),
):
    result = await food_service.search_by_category(category, page=page, page_size=page_size)
    return result


@router.get("/barcode/{barcode}", response_model=ProductOut)
async def get_by_barcode(barcode: str):
    product = await food_service.get_product_by_barcode(barcode)
    if not product:
        raise HTTPException(status_code=404, detail="No product found for this barcode.")
    return product


@router.get("/{barcode}", response_model=ProductOut)
async def get_product(barcode: str):
    product = await food_service.get_product_by_barcode(barcode)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return product
