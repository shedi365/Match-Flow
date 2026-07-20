import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class TournamentStatus(str, enum.Enum):
    REGISTRATION = "REGISTRATION"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    description = Column(String(500), nullable=True)
    max_players = Column(Integer, default=16, nullable=False)
    status = Column(Enum(TournamentStatus), default=TournamentStatus.REGISTRATION, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    enrollments = relationship("TournamentEnrollment", back_populates="tournament", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")

class TournamentEnrollment(Base):
    __tablename__ = "tournament_enrollments"

    tournament_id = Column(Integer, ForeignKey("tournaments.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    tournament = relationship("Tournament", back_populates="enrollments")
    user = relationship("User")
