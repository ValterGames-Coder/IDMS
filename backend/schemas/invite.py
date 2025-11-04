from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Invite schemas
class ProjectInviteCreate(BaseModel):
    expires_in_hours: Optional[int] = 24  # Default 24 hours

class ProjectInvite(BaseModel):
    id: int
    token: str
    project_id: int
    created_by: int
    expires_at: datetime
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class ProjectInviteInfo(BaseModel):
    project_name: str
    project_description: Optional[str] = None
    owner_username: str
    is_valid: bool
    is_expired: bool

