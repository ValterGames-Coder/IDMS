from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.auth import get_current_user
from schemas.user import User
from schemas.project import ProjectCreate, Project
import crud

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/", response_model=list[Project])
async def read_projects(
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    projects = crud.get_user_accessible_projects(db, user_id=current_user.id, skip=skip, limit=limit)
    return projects

@router.post("/", response_model=Project)
async def create_project(
    project: ProjectCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    return crud.create_project(db=db, project=project, user_id=current_user.id)

@router.get("/{project_id}", response_model=Project)
async def read_project(
    project_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if not crud.is_project_member(db, project_id=project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return db_project

@router.delete("/{project_id}")
async def delete_project(
    project_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    crud.delete_project(db=db, project_id=project_id)
    return {"message": "Project deleted successfully"}

