from pydantic import BaseModel
from typing import List, Optional


class ProductCreate(BaseModel):

    productName: str
    category: str
    price: float

    description: Optional[str] = None

    sizes: List[str] = []
    colors: List[str] = []

    stock: int = 0

    images: List[str] = []

    discount: float = 0

    rating: float = 0

    gender: Optional[str] = None



class ProductUpdate(BaseModel):

    productName: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None

    description: Optional[str] = None

    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None

    stock: Optional[int] = None

    images: Optional[List[str]] = None

    discount: Optional[float] = None

    rating: Optional[float] = None

    gender: Optional[str] = None