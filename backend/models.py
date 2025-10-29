from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class DiagramType(str, enum.Enum):
    BPMN = "bpmn"
    ERD = "erd"
    DFD = "dfd"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    projects = relationship("Project", back_populates="owner")
    locks = relationship("DiagramLock", back_populates="user")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    owner = relationship("User", back_populates="projects")
    diagrams = relationship("Diagram", back_populates="project")

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
    elements = relationship("DiagramElement", back_populates="diagram")
    locks = relationship("DiagramLock", back_populates="diagram")

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