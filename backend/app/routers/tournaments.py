from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.tournament import TournamentCreate, TournamentResponse, TournamentDetailResponse, EnrollmentResponse
from app.schemas.match import MatchResponse
from app.crud.tournament import (
    create_tournament, get_tournaments, get_tournament, 
    enroll_user, get_enrollments, get_tournament_matches
)
from app.services.bracket_generator import generate_bracket
from app.core.deps import get_current_user, get_current_admin_user
from app.models.user import User

router = APIRouter(
    prefix="/tournaments",
    tags=["Tournaments"]
)

@router.post("/", response_model=TournamentResponse, status_code=status.HTTP_201_CREATED)
def create_new_tournament(
    tournament: TournamentCreate, 
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    return create_tournament(db, tournament)

@router.get("/", response_model=List[TournamentDetailResponse])
def list_tournaments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tournaments = get_tournaments(db, skip=skip, limit=limit)
    # Agregar count de players
    results = []
    for t in tournaments:
        count = len(get_enrollments(db, t.id))
        t_dict = {
            "id": t.id,
            "name": t.name,
            "status": t.status,
            "created_at": t.created_at,
            "enrolled_players_count": count
        }
        results.append(t_dict)
    return results

@router.post("/{tournament_id}/enroll", response_model=EnrollmentResponse)
def enroll_in_tournament(
    tournament_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tournament = get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    if tournament.status.value != "OPEN":
        raise HTTPException(status_code=400, detail="El torneo no está abierto para inscripciones")
        
    return enroll_user(db, tournament_id=tournament_id, user_id=current_user.id)

@router.post("/{tournament_id}/generate-bracket", response_model=List[MatchResponse])
def generate_tournament_bracket(
    tournament_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    tournament = get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    if tournament.status.value != "OPEN":
        raise HTTPException(status_code=400, detail="El torneo ya no está en fase de inscripción")
        
    try:
        matches = generate_bracket(db, tournament_id)
        return matches
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{tournament_id}/matches", response_model=List[MatchResponse])
def list_tournament_matches(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    return get_tournament_matches(db, tournament_id)
