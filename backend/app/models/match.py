import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class MatchStatus(str, enum.Enum):
    PENDING = "PENDING"
    AWAITING_VALIDATION = "AWAITING_VALIDATION"
    DISPUTE = "DISPUTE"
    COMPLETED = "COMPLETED"

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    player1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    player2_id = Column(Integer, ForeignKey("users.id"), nullable=True) 
    
    round = Column(Integer, nullable=False, default=1) 
    
    score_p1 = Column(Integer, nullable=True)
    score_p2 = Column(Integer, nullable=True)
    
    status = Column(Enum(MatchStatus), default=MatchStatus.PENDING, nullable=False)
    
    evidence_url = Column(String(500), nullable=True)
    
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reported_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relaciones
    tournament = relationship("Tournament", back_populates="matches")
    player1 = relationship("User", foreign_keys=[player1_id])
    player2 = relationship("User", foreign_keys=[player2_id])
    winner = relationship("User", foreign_keys=[winner_id])
    reported_by = relationship("User", foreign_keys=[reported_by_id])
