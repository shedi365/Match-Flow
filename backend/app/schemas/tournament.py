from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.tournament import TournamentStatus

class TournamentBase(BaseModel):
    name: str

class TournamentCreate(TournamentBase):
    pass

class TournamentResponse(TournamentBase):
    id: int
    status: TournamentStatus
    created_at: datetime
    
    class Config:
        from_attributes = True

class TournamentDetailResponse(TournamentResponse):
    enrolled_players_count: int

class EnrollmentResponse(BaseModel):
    id: int
    tournament_id: int
    user_id: int
    enrolled_at: datetime

    class Config:
        from_attributes = True
