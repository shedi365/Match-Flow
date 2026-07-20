from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# Schemas para el Token JWT
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    gamertag: Optional[str] = None

# Schemas para el Usuario
class UserBase(BaseModel):
    gamertag: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    gamertag: str
    password: str

class UserResponse(UserBase):
    id: int
    role_name: str
    created_at: datetime

    class Config:
        from_attributes = True
