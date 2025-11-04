from sqlalchemy.orm import Session
from models.project import Project
from models.user import User
from schemas.project import ProjectCreate

# Project CRUD operations
def get_project(db: Session, project_id: int):
    return db.query(Project).filter(Project.id == project_id).first()

def get_user_projects(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Project).filter(Project.owner_id == user_id).offset(skip).limit(limit).all()

def create_project(db: Session, project: ProjectCreate, user_id: int):
    db_project = Project(
        name=project.name,
        description=project.description,
        owner_id=user_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: int, project_update: dict):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project:
        for key, value in project_update.items():
            setattr(db_project, key, value)
        db.commit()
        db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project:
        db.delete(db_project)
        db.commit()
    return db_project

def is_project_member(db: Session, project_id: int, user_id: int):
    """Check if a user is a member of a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return False
    # Owner is always a member
    if project.owner_id == user_id:
        return True
    # Check if user is in members list
    user = db.query(User).filter(User.id == user_id).first()
    return user in project.members if user else False

def add_project_member(db: Session, project_id: int, user_id: int):
    """Add a user as a member of a project."""
    # Check if already a member
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        user = db.query(User).filter(User.id == user_id).first()
        if user and user not in project.members:
            project.members.append(user)
            db.commit()
    return project

def remove_project_member(db: Session, project_id: int, user_id: int):
    """Remove a user from project members."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        user = db.query(User).filter(User.id == user_id).first()
        if user and user in project.members:
            project.members.remove(user)
            db.commit()
    return project

def get_user_accessible_projects(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get all projects accessible by a user (owned or member of)."""
    # Get owned projects
    owned_projects = db.query(Project).filter(Project.owner_id == user_id).all()
    
    # Get projects where user is a member
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        member_projects = user.shared_projects
        # Combine and remove duplicates
        all_projects = list(set(owned_projects + member_projects))
        return all_projects[skip:skip+limit]
    
    return owned_projects[skip:skip+limit]

