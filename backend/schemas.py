from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from models import DiagramType

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ProjectWithDiagrams(Project):
    diagrams: List["Diagram"] = []

# Diagram schemas
class DiagramBase(BaseModel):
    name: str
    diagram_type: DiagramType

class DiagramCreate(DiagramBase):
    project_id: Optional[int] = None

class DiagramUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None

class Diagram(DiagramBase):
    id: int
    project_id: int
    content: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Diagram element schemas
class DiagramElementBase(BaseModel):
    element_type: str
    element_data: str
    position_x: Optional[int] = None
    position_y: Optional[int] = None

class DiagramElementCreate(DiagramElementBase):
    diagram_id: int

class DiagramElement(DiagramElementBase):
    id: int
    diagram_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Lock schemas
class DiagramLockBase(BaseModel):
    diagram_id: int

class DiagramLock(DiagramLockBase):
    id: int
    user_id: int
    locked_at: datetime
    is_active: bool
    user: User
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None