from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.auth import get_current_user
from schemas.user import User
from schemas.invite import ProjectInviteCreate, ProjectInvite, ProjectInviteInfo
import crud
from datetime import datetime

router = APIRouter(tags=["invites"])

@router.post("/projects/{project_id}/invite", response_model=ProjectInvite)
async def create_project_invite(
    project_id: int, 
    invite_data: ProjectInviteCreate,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Create a new invite link for a project. Only project owner can create invites."""
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only owner can create invites
    if db_project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only project owner can create invites")
    
    invite = crud.create_project_invite(
        db=db, 
        project_id=project_id, 
        created_by=current_user.id,
        expires_in_hours=invite_data.expires_in_hours
    )
    return invite

@router.get("/projects/{project_id}/invites", response_model=list[ProjectInvite])
async def get_project_invites(
    project_id: int,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Get all active invites for a project. Only project owner can see invites."""
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only owner can see invites
    if db_project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only project owner can see invites")
    
    invites = crud.get_active_project_invites(db=db, project_id=project_id)
    return invites

@router.get("/invite/{token}", response_model=ProjectInviteInfo)
async def get_invite_info(token: str, db: Session = Depends(get_db)):
    """Get information about an invite. Does not require authentication."""
    invite = crud.get_invite_by_token(db, token=token)
    if invite is None:
        raise HTTPException(status_code=404, detail="Invite not found")
    
    project = crud.get_project(db, project_id=invite.project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    owner = crud.get_user(db, user_id=project.owner_id)
    
    is_expired = invite.expires_at < datetime.utcnow()
    is_valid = invite.is_active and not is_expired
    
    return ProjectInviteInfo(
        project_name=project.name,
        project_description=project.description,
        owner_username=owner.username,
        is_valid=is_valid,
        is_expired=is_expired
    )

@router.post("/invite/{token}/accept")
async def accept_invite(
    token: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept an invite and join the project."""
    invite = crud.get_invite_by_token(db, token=token)
    if invite is None:
        raise HTTPException(status_code=404, detail="Invite not found")
    
    # Check if invite is valid
    if not invite.is_active:
        raise HTTPException(status_code=400, detail="Invite is no longer active")
    
    if invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invite has expired")
    
    # Check if user is already a member or owner
    if crud.is_project_member(db, project_id=invite.project_id, user_id=current_user.id):
        return {"message": "You are already a member of this project", "project_id": invite.project_id}
    
    # Add user as project member
    crud.add_project_member(db=db, project_id=invite.project_id, user_id=current_user.id)
    
    return {"message": "Successfully joined the project", "project_id": invite.project_id}

@router.delete("/projects/{project_id}/invites/{invite_id}")
async def delete_invite(
    project_id: int,
    invite_id: int,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Deactivate an invite. Only project owner can delete invites."""
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only owner can delete invites
    if db_project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only project owner can delete invites")
    
    crud.deactivate_invite(db=db, invite_id=invite_id)
    return {"message": "Invite deactivated successfully"}

