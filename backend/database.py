from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./career_finder.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    role = Column(String, default="user") # roles: 'super_admin', 'admin', 'user'
    
    history = relationship("History", back_populates="owner")

class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    results = Column(JSON)
    responses = Column(JSON)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="history")

def init_db():
    Base.metadata.create_all(bind=engine)
