from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class ReportCreate(BaseModel):
    report_type: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., min_length=10, max_length=2000)
    restaurant_id: int | None = None
    product_id: str | None = Field(default=None, max_length=100)


class ReportUpdate(BaseModel):
    status: str = Field(..., pattern="^(open|reviewing|resolved|rejected)$")


class ReportOut(ReportCreate):
    id: int
    user_id: int
    status: str

    model_config = ConfigDict(from_attributes=True)
