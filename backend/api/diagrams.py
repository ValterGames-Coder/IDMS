from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.auth import get_current_user
from schemas.user import User
from schemas.diagram import DiagramCreate, Diagram, DiagramLock
import crud

router = APIRouter(tags=["diagrams"])

@router.get("/projects/{project_id}/diagrams/", response_model=list[Diagram])
async def read_diagrams(
    project_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Check if user has access to project
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if not crud.is_project_member(db, project_id=project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    diagrams = crud.get_project_diagrams(db, project_id=project_id)
    return diagrams

@router.post("/projects/{project_id}/diagrams/", response_model=Diagram)
async def create_diagram(
    project_id: int, 
    diagram: DiagramCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Check if user has access to project
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if not crud.is_project_member(db, project_id=project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Create a new diagram with the correct project_id
    diagram_data = diagram.model_dump()
    diagram_data['project_id'] = project_id
    diagram_with_project = DiagramCreate(**diagram_data)
    return crud.create_diagram(db=db, diagram=diagram_with_project)

@router.get("/diagrams/{diagram_id}", response_model=Diagram)
async def read_diagram(
    diagram_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_diagram = crud.get_diagram(db, diagram_id=diagram_id)
    if db_diagram is None:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    # Check if user has access to project
    if not crud.is_project_member(db, project_id=db_diagram.project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return db_diagram

@router.put("/diagrams/{diagram_id}", response_model=Diagram)
async def update_diagram(
    diagram_id: int, 
    diagram_update: dict, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_diagram = crud.get_diagram(db, diagram_id=diagram_id)
    if db_diagram is None:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    # Check if user has access to project
    if not crud.is_project_member(db, project_id=db_diagram.project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.update_diagram(db=db, diagram_id=diagram_id, diagram_update=diagram_update)

@router.delete("/diagrams/{diagram_id}")
async def delete_diagram(
    diagram_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_diagram = crud.get_diagram(db, diagram_id=diagram_id)
    if db_diagram is None:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    # Check if user has access to project
    if not crud.is_project_member(db, project_id=db_diagram.project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    crud.delete_diagram(db=db, diagram_id=diagram_id)
    return {"message": "Diagram deleted successfully"}

# Lock endpoints
@router.post("/diagrams/{diagram_id}/lock", response_model=DiagramLock)
async def lock_diagram(
    diagram_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_diagram = crud.get_diagram(db, diagram_id=diagram_id)
    if db_diagram is None:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    # Check if user has access to project
    if not crud.is_project_member(db, project_id=db_diagram.project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check if diagram is already locked
    existing_lock = crud.get_active_diagram_lock(db, diagram_id=diagram_id)
    if existing_lock:
        # If locked by another user, return the existing lock instead of error
        if existing_lock.user_id != current_user.id:
            return existing_lock
    
    return crud.create_or_update_diagram_lock(db=db, diagram_id=diagram_id, user_id=current_user.id)

@router.delete("/diagrams/{diagram_id}/lock")
async def unlock_diagram(
    diagram_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_diagram = crud.get_diagram(db, diagram_id=diagram_id)
    if db_diagram is None:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    # Check if user has access to project
    if not crud.is_project_member(db, project_id=db_diagram.project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    crud.unlock_diagram(db=db, diagram_id=diagram_id, user_id=current_user.id)
    return {"message": "Diagram unlocked successfully"}

@router.get("/diagrams/{diagram_id}/lock", response_model=DiagramLock)
async def get_diagram_lock(
    diagram_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_diagram = crud.get_diagram(db, diagram_id=diagram_id)
    if db_diagram is None:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    # Check if user has access to project
    if not crud.is_project_member(db, project_id=db_diagram.project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    lock = crud.get_active_diagram_lock(db, diagram_id=diagram_id)
    if lock is None:
        raise HTTPException(status_code=404, detail="Diagram is not locked")
    
    return lock

