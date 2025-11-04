from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, get_db
from models import Base
from schemas import UserCreate, User, Token, ProjectCreate, Project, DiagramCreate, Diagram, DiagramLock, ProjectInviteCreate, ProjectInvite, ProjectInviteInfo
from auth import authenticate_user, create_access_token, get_current_user
from datetime import timedelta
from config import settings
import crud

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="IDMS API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth endpoints
@app.post("/auth/register", response_model=User)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return crud.create_user(db=db, user=user)

@app.post("/auth/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Project endpoints
@app.get("/projects/", response_model=list[Project])
async def read_projects(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = crud.get_user_accessible_projects(db, user_id=current_user.id, skip=skip, limit=limit)
    return projects

@app.post("/projects/", response_model=Project)
async def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_project(db=db, project=project, user_id=current_user.id)

@app.get("/projects/{project_id}", response_model=Project)
async def read_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if not crud.is_project_member(db, project_id=project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return db_project

@app.delete("/projects/{project_id}")
async def delete_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    crud.delete_project(db=db, project_id=project_id)
    return {"message": "Project deleted successfully"}

# Diagram endpoints
@app.get("/projects/{project_id}/diagrams/", response_model=list[Diagram])
async def read_diagrams(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user has access to project
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if not crud.is_project_member(db, project_id=project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    diagrams = crud.get_project_diagrams(db, project_id=project_id)
    return diagrams

@app.post("/projects/{project_id}/diagrams/", response_model=Diagram)
async def create_diagram(project_id: int, diagram: DiagramCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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

@app.get("/diagrams/{diagram_id}", response_model=Diagram)
async def read_diagram(diagram_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_diagram = crud.get_diagram(db, diagram_id=diagram_id)
    if db_diagram is None:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    # Check if user has access to project
    if not crud.is_project_member(db, project_id=db_diagram.project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return db_diagram

@app.put("/diagrams/{diagram_id}", response_model=Diagram)
async def update_diagram(diagram_id: int, diagram_update: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_diagram = crud.get_diagram(db, diagram_id=diagram_id)
    if db_diagram is None:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    # Check if user has access to project
    if not crud.is_project_member(db, project_id=db_diagram.project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.update_diagram(db=db, diagram_id=diagram_id, diagram_update=diagram_update)

@app.delete("/diagrams/{diagram_id}")
async def delete_diagram(diagram_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_diagram = crud.get_diagram(db, diagram_id=diagram_id)
    if db_diagram is None:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    # Check if user has access to project
    if not crud.is_project_member(db, project_id=db_diagram.project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    crud.delete_diagram(db=db, diagram_id=diagram_id)
    return {"message": "Diagram deleted successfully"}

# Lock endpoints
@app.post("/diagrams/{diagram_id}/lock", response_model=DiagramLock)
async def lock_diagram(diagram_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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

@app.delete("/diagrams/{diagram_id}/lock")
async def unlock_diagram(diagram_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_diagram = crud.get_diagram(db, diagram_id=diagram_id)
    if db_diagram is None:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    # Check if user has access to project
    if not crud.is_project_member(db, project_id=db_diagram.project_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    crud.unlock_diagram(db=db, diagram_id=diagram_id, user_id=current_user.id)
    return {"message": "Diagram unlocked successfully"}

@app.get("/diagrams/{diagram_id}/lock", response_model=DiagramLock)
async def get_diagram_lock(diagram_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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

# Project Invite endpoints
@app.post("/projects/{project_id}/invite", response_model=ProjectInvite)
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

@app.get("/projects/{project_id}/invites", response_model=list[ProjectInvite])
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

@app.get("/invite/{token}", response_model=ProjectInviteInfo)
async def get_invite_info(token: str, db: Session = Depends(get_db)):
    """Get information about an invite. Does not require authentication."""
    from datetime import datetime
    
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

@app.post("/invite/{token}/accept")
async def accept_invite(
    token: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept an invite and join the project."""
    from datetime import datetime
    
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

@app.delete("/projects/{project_id}/invites/{invite_id}")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)