from sqlalchemy.orm import Session
from models.invite import ProjectInvite
from datetime import datetime, timedelta
import secrets

# Project Invite CRUD operations
def create_project_invite(db: Session, project_id: int, created_by: int, expires_in_hours: int = 24):
    """Create a new project invite with a unique token."""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
    
    db_invite = ProjectInvite(
        token=token,
        project_id=project_id,
        created_by=created_by,
        expires_at=expires_at,
        is_active=True
    )
    db.add(db_invite)
    db.commit()
    db.refresh(db_invite)
    return db_invite

def get_invite_by_token(db: Session, token: str):
    """Get invite by token."""
    return db.query(ProjectInvite).filter(ProjectInvite.token == token).first()

def get_active_project_invites(db: Session, project_id: int):
    """Get all active invites for a project."""
    return db.query(ProjectInvite).filter(
        ProjectInvite.project_id == project_id,
        ProjectInvite.is_active == True,
        ProjectInvite.expires_at > datetime.utcnow()
    ).all()

def deactivate_invite(db: Session, invite_id: int):
    """Deactivate an invite."""
    db.query(ProjectInvite).filter(ProjectInvite.id == invite_id).update({"is_active": False})
    db.commit()

