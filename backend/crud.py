from sqlalchemy.orm import Session
from models import User, Project, Diagram, DiagramElement, DiagramLock
from schemas import UserCreate, ProjectCreate, DiagramCreate
from auth import get_password_hash
from typing import List, Optional
from datetime import datetime

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

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

# Diagram CRUD operations
def get_diagram(db: Session, diagram_id: int):
    return db.query(Diagram).filter(Diagram.id == diagram_id).first()

def get_project_diagrams(db: Session, project_id: int):
    return db.query(Diagram).filter(Diagram.project_id == project_id).all()

def create_diagram(db: Session, diagram: DiagramCreate):
    db_diagram = Diagram(
        name=diagram.name,
        diagram_type=diagram.diagram_type,
        project_id=diagram.project_id
    )
    db.add(db_diagram)
    db.commit()
    db.refresh(db_diagram)
    return db_diagram

def update_diagram(db: Session, diagram_id: int, diagram_update: dict):
    db_diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if db_diagram:
        for key, value in diagram_update.items():
            setattr(db_diagram, key, value)
        db.commit()
        db.refresh(db_diagram)
    return db_diagram

def delete_diagram(db: Session, diagram_id: int):
    db_diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if db_diagram:
        db.delete(db_diagram)
        db.commit()
    return db_diagram

# Diagram Element CRUD operations
def get_diagram_elements(db: Session, diagram_id: int):
    return db.query(DiagramElement).filter(DiagramElement.diagram_id == diagram_id).all()

def create_diagram_element(db: Session, element_data: dict):
    db_element = DiagramElement(**element_data)
    db.add(db_element)
    db.commit()
    db.refresh(db_element)
    return db_element

def update_diagram_element(db: Session, element_id: int, element_update: dict):
    db_element = db.query(DiagramElement).filter(DiagramElement.id == element_id).first()
    if db_element:
        for key, value in element_update.items():
            setattr(db_element, key, value)
        db.commit()
        db.refresh(db_element)
    return db_element

def delete_diagram_element(db: Session, element_id: int):
    db_element = db.query(DiagramElement).filter(DiagramElement.id == element_id).first()
    if db_element:
        db.delete(db_element)
        db.commit()
    return db_element

# Diagram Lock CRUD operations
def get_active_diagram_lock(db: Session, diagram_id: int):
    return db.query(DiagramLock).filter(
        DiagramLock.diagram_id == diagram_id,
        DiagramLock.is_active == True
    ).first()

def create_or_update_diagram_lock(db: Session, diagram_id: int, user_id: int):
    # Check if there's already an active lock by this user
    existing_lock = db.query(DiagramLock).filter(
        DiagramLock.diagram_id == diagram_id,
        DiagramLock.user_id == user_id,
        DiagramLock.is_active == True
    ).first()
    
    if existing_lock:
        # Update the existing lock timestamp
        existing_lock.locked_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_lock)
        return existing_lock
    else:
        # Create new lock
        db_lock = DiagramLock(
            diagram_id=diagram_id,
            user_id=user_id,
            is_active=True
        )
        db.add(db_lock)
        db.commit()
        db.refresh(db_lock)
        return db_lock

def unlock_diagram(db: Session, diagram_id: int, user_id: int):
    db.query(DiagramLock).filter(
        DiagramLock.diagram_id == diagram_id,
        DiagramLock.user_id == user_id,
        DiagramLock.is_active == True
    ).update({"is_active": False})
    db.commit()

def unlock_all_user_locks(db: Session, user_id: int):
    db.query(DiagramLock).filter(
        DiagramLock.user_id == user_id,
        DiagramLock.is_active == True
    ).update({"is_active": False})
    db.commit()



