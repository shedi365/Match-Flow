from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.tournament import TournamentStatus

class TournamentBase(BaseModel):
    name: str
    description: Optional[str] = None
    max_players: Optional[int] = 16

class TournamentCreate(TournamentBase):
    pass

class TournamentUpdate(TournamentBase):
    pass

class TournamentResponse(TournamentBase):
    id: int
    status: TournamentStatus
    created_at: datetime
    
    class Config:
        from_attributes = True

class TournamentDetailResponse(TournamentResponse):
    enrolled_players_count: int
    is_enrolled: bool

class EnrollmentResponse(BaseModel):
    tournament_id: int
    user_id: int
    enrolled_at: datetime

    class Config:
        from_attributes = True
