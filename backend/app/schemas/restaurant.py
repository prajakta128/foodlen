from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class RestaurantBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: str | None = None
    address: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = Field(default=None, max_length=30)
    email: str | None = None
    verification_status: str = "pending"


class RestaurantCreate(RestaurantBase):
    pass


class RestaurantUpdate(RestaurantBase):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = None


class RestaurantOut(RestaurantBase):
    id: int
    owner_id: int

    model_config = ConfigDict(from_attributes=True)


class RestaurantListItemOut(RestaurantOut):
    # Real signal of how complete this restaurant's data is — never a fabricated rating.
    menu_item_count: int = 0


class RestaurantListOut(BaseModel):
    items: list[RestaurantListItemOut]
    total: int
    page: int
    pageSize: int
    hasMore: bool


class MenuItemBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: str | None = None
    price: float = Field(..., ge=0)
    ingredients: str | None = None
    allergens: str | None = None
    nutrition_json: dict | None = None
    image_url: str | None = None
    is_active: bool = True


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(MenuItemBase):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    price: float | None = Field(default=None, ge=0)
    is_active: bool | None = None


class MenuItemOut(MenuItemBase):
    id: int
    restaurant_id: int

    model_config = ConfigDict(from_attributes=True)
