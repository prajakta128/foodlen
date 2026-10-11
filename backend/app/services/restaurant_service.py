from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..models import Restaurant, MenuItem, User


class RestaurantService:
    def __init__(self, db: Session):
        self.db = db

    def create_restaurant(self, user: User, payload: dict) -> Restaurant:
        restaurant = Restaurant(owner_id=user.id, **payload)
        self.db.add(restaurant)
        self.db.commit()
        self.db.refresh(restaurant)
        return restaurant

    def list_restaurants(
        self, search: str | None = None, page: int = 1, page_size: int = 20
    ) -> tuple[list[tuple[Restaurant, int]], int]:
        """Public listing — every restaurant that's been created, real menu-item
        counts included so the frontend can show actual data completeness
        instead of a fabricated rating or transparency label."""
        query = self.db.query(Restaurant, func.count(MenuItem.id).label("menu_item_count")).outerjoin(
            MenuItem, MenuItem.restaurant_id == Restaurant.id
        )
        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(Restaurant.name.ilike(like), Restaurant.city.ilike(like), Restaurant.address.ilike(like))
            )
        query = query.group_by(Restaurant.id)
        total = query.count()
        rows = (
            query.order_by(Restaurant.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return rows, total

    def get_my_restaurants(self, user: User) -> list[Restaurant]:
        return self.db.query(Restaurant).filter(Restaurant.owner_id == user.id).all()

    def get_restaurant(self, restaurant_id: int) -> Restaurant:
        restaurant = self.db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
        if not restaurant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
        return restaurant

    def update_restaurant(self, restaurant: Restaurant, payload: dict) -> Restaurant:
        for key, value in payload.items():
            if value is not None:
                setattr(restaurant, key, value)
        self.db.commit()
        self.db.refresh(restaurant)
        return restaurant

    def delete_restaurant(self, restaurant: Restaurant) -> None:
        self.db.delete(restaurant)
        self.db.commit()

    def add_menu_item(self, restaurant: Restaurant, payload: dict) -> MenuItem:
        menu_item = MenuItem(restaurant_id=restaurant.id, **payload)
        self.db.add(menu_item)
        self.db.commit()
        self.db.refresh(menu_item)
        return menu_item

    def list_menu_items(self, restaurant: Restaurant) -> list[MenuItem]:
        return self.db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id).all()

    def get_menu_item(self, restaurant: Restaurant, menu_item_id: int) -> MenuItem:
        menu_item = self.db.query(MenuItem).filter(MenuItem.id == menu_item_id, MenuItem.restaurant_id == restaurant.id).first()
        if not menu_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
        return menu_item

    def update_menu_item(self, menu_item: MenuItem, payload: dict) -> MenuItem:
        for key, value in payload.items():
            if value is not None:
                setattr(menu_item, key, value)
        self.db.commit()
        self.db.refresh(menu_item)
        return menu_item

    def delete_menu_item(self, menu_item: MenuItem) -> None:
        self.db.delete(menu_item)
        self.db.commit()
