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
    score_p1: Optional[int] = 0
    score_p2: Optional[int] = 0

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
