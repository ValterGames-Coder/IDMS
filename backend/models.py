from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class DiagramType(str, enum.Enum):
    BPMN = "bpmn"
    ERD = "erd"
    DFD = "dfd"

# Association table for project members
project_members = Table(
    'project_members',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('project_id', Integer, ForeignKey('projects.id'), primary_key=True),
    Column('joined_at', DateTime(timezone=True), server_default=func.now())
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    shared_projects = relationship("Project", secondary=project_members, back_populates="members")
    locks = relationship("DiagramLock", back_populates="user", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    owner = relationship("User", back_populates="projects")
    members = relationship("User", secondary=project_members, back_populates="shared_projects")
    diagrams = relationship("Diagram", back_populates="project", cascade="all, delete-orphan")
    invites = relationship("ProjectInvite", back_populates="project", cascade="all, delete-orphan")

class Diagram(Base):
    __tablename__ = "diagrams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    diagram_type = Column(Enum(DiagramType), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    content = Column(Text)  # JSON content of the diagram
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    project = relationship("Project", back_populates="diagrams")
    elements = relationship("DiagramElement", back_populates="diagram", cascade="all, delete-orphan")
    locks = relationship("DiagramLock", back_populates="diagram", cascade="all, delete-orphan")

class DiagramElement(Base):
    __tablename__ = "diagram_elements"
    
    id = Column(Integer, primary_key=True, index=True)
    diagram_id = Column(Integer, ForeignKey("diagrams.id"), nullable=False)
    element_type = Column(String, nullable=False)  # node, edge, etc.
    element_data = Column(Text, nullable=False)  # JSON data of the element
    position_x = Column(Integer)
    position_y = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    diagram = relationship("Diagram", back_populates="elements")

class DiagramLock(Base):
    __tablename__ = "diagram_locks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    diagram_id = Column(Integer, ForeignKey("diagrams.id"), nullable=False)
    locked_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="locks")
    diagram = relationship("Diagram", back_populates="locks")

class ProjectInvite(Base):
    __tablename__ = "project_invites"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    project = relationship("Project", back_populates="invites")
    creator = relationship("User")