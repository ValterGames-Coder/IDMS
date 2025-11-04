from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.diagram import DiagramType
from schemas.user import User

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

