from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.match import MatchStatus
from app.schemas.user import UserResponse

class MatchBase(BaseModel):
    tournament_id: int
    round_number: int
    match_number: int
    player1_id: Optional[int] = None
    player2_id: Optional[int] = None
    winner_id: Optional[int] = None
    score_p1: Optional[int] = None
    score_p2: Optional[int] = None
    penalties_p1: Optional[int] = None
    penalties_p2: Optional[int] = None
    p1_has_reported: bool = False
    p2_has_reported: bool = False
    p1_evidence_url: Optional[str] = None
    p2_evidence_url: Optional[str] = None
    reported_by_id: Optional[int] = None

class MatchCreate(MatchBase):
    pass

class MatchResponse(MatchBase):
    id: int
    status: MatchStatus
    
    # Podríamos incluir los schemas de los usuarios para renderizar los nombres fácilmente
    player1: Optional[UserResponse] = None
    player2: Optional[UserResponse] = None
    winner: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class MatchReport(BaseModel):
    score_p1: int
    score_p2: int
    penalties_p1: Optional[int] = None
    penalties_p2: Optional[int] = None
    evidence_url: Optional[str] = None

class MatchVerify(BaseModel):
    score_p1: int
    score_p2: int
    penalties_p1: Optional[int] = None
    penalties_p2: Optional[int] = None
    winner_id: int

class MatchRivalAction(BaseModel):
    action: str # "ACCEPT" or "REJECT"
