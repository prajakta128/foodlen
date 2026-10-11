from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..api.dependencies import get_current_user, require_restaurant_owner
from ..core.database import get_db
from ..models import Restaurant, MenuItem, User
from ..schemas.restaurant import (
    MenuItemCreate,
    MenuItemOut,
    MenuItemUpdate,
    RestaurantCreate,
    RestaurantListItemOut,
    RestaurantListOut,
    RestaurantOut,
    RestaurantUpdate,
)
from ..services.restaurant_service import RestaurantService

router = APIRouter(prefix="/api/restaurants", tags=["Restaurants"])


@router.get("", response_model=RestaurantListOut, summary="List restaurants")
def list_restaurants(
    db: Annotated[Session, Depends(get_db)],
    search: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> RestaurantListOut:
    rows, total = RestaurantService(db).list_restaurants(search=search, page=page, page_size=page_size)
    items = [
        RestaurantListItemOut(**RestaurantOut.model_validate(restaurant).model_dump(), menu_item_count=count)
        for restaurant, count in rows
    ]
    return RestaurantListOut(
        items=items,
        total=total,
        page=page,
        pageSize=page_size,
        hasMore=page * page_size < total,
    )


@router.post("", response_model=RestaurantOut, status_code=status.HTTP_201_CREATED, summary="Create a restaurant")
def create_restaurant(
    payload: RestaurantCreate,
    current_user: Annotated[User, Depends(require_restaurant_owner)],
    db: Annotated[Session, Depends(get_db)],
) -> Restaurant:
    service = RestaurantService(db)
    return service.create_restaurant(current_user, payload.model_dump())


@router.get("/my", response_model=list[RestaurantOut], summary="List my restaurants")
def my_restaurants(
    current_user: Annotated[User, Depends(require_restaurant_owner)],
    db: Annotated[Session, Depends(get_db)],
) -> list[Restaurant]:
    return RestaurantService(db).get_my_restaurants(current_user)


@router.get("/{restaurant_id}", response_model=RestaurantOut, summary="Get restaurant details")
def get_restaurant(restaurant_id: int, db: Annotated[Session, Depends(get_db)]) -> Restaurant:
    return RestaurantService(db).get_restaurant(restaurant_id)


@router.patch("/{restaurant_id}", response_model=RestaurantOut, summary="Update a restaurant")
def update_restaurant(
    restaurant_id: int,
    payload: RestaurantUpdate,
    current_user: Annotated[User, Depends(require_restaurant_owner)],
    db: Annotated[Session, Depends(get_db)],
) -> Restaurant:
    restaurant = RestaurantService(db).get_restaurant(restaurant_id)
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own restaurant")
    return RestaurantService(db).update_restaurant(restaurant, payload.model_dump(exclude_unset=True))


@router.delete("/{restaurant_id}", summary="Delete a restaurant")
def delete_restaurant(
    restaurant_id: int,
    current_user: Annotated[User, Depends(require_restaurant_owner)],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    restaurant = RestaurantService(db).get_restaurant(restaurant_id)
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own restaurant")
    RestaurantService(db).delete_restaurant(restaurant)
    return {"message": "Restaurant deleted successfully"}


@router.post("/{restaurant_id}/menu", response_model=MenuItemOut, summary="Add menu item")
def add_menu_item(
    restaurant_id: int,
    payload: MenuItemCreate,
    current_user: Annotated[User, Depends(require_restaurant_owner)],
    db: Annotated[Session, Depends(get_db)],
) -> MenuItem:
    restaurant = RestaurantService(db).get_restaurant(restaurant_id)
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only modify your own restaurant menu")
    return RestaurantService(db).add_menu_item(restaurant, payload.model_dump())


@router.get("/{restaurant_id}/menu", response_model=list[MenuItemOut], summary="List menu items")
def list_menu_items(
    restaurant_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[MenuItem]:
    restaurant = RestaurantService(db).get_restaurant(restaurant_id)
    return RestaurantService(db).list_menu_items(restaurant)


@router.patch("/{restaurant_id}/menu/{item_id}", response_model=MenuItemOut, summary="Update a menu item")
def update_menu_item(
    restaurant_id: int,
    item_id: int,
    payload: MenuItemUpdate,
    current_user: Annotated[User, Depends(require_restaurant_owner)],
    db: Annotated[Session, Depends(get_db)],
) -> MenuItem:
    restaurant = RestaurantService(db).get_restaurant(restaurant_id)
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only modify your own restaurant menu")
    menu_item = RestaurantService(db).get_menu_item(restaurant, item_id)
    return RestaurantService(db).update_menu_item(menu_item, payload.model_dump(exclude_unset=True))


@router.delete("/{restaurant_id}/menu/{item_id}", summary="Delete a menu item")
def delete_menu_item(
    restaurant_id: int,
    item_id: int,
    current_user: Annotated[User, Depends(require_restaurant_owner)],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    restaurant = RestaurantService(db).get_restaurant(restaurant_id)
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only modify your own restaurant menu")
    menu_item = RestaurantService(db).get_menu_item(restaurant, item_id)
    RestaurantService(db).delete_menu_item(menu_item)
    return {"message": "Menu item deleted successfully"}
