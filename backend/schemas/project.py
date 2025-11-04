from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

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
    
    class Config:
        from_attributes = True

