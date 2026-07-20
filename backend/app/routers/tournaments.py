from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.tournament import TournamentCreate, TournamentResponse, TournamentDetailResponse, EnrollmentResponse, TournamentUpdate
from app.schemas.match import MatchResponse
from app.schemas.user import UserResponse
from app.crud.tournament import (
    create_tournament, get_tournaments, get_tournament, update_tournament,
    enroll_user, unenroll_user, get_enrollments, get_tournament_matches
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

@router.put("/{tournament_id}", response_model=TournamentResponse)
def update_existing_tournament(
    tournament_id: int,
    tournament_data: TournamentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    tournament = get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
        
    enrollments = get_enrollments(db, tournament_id)
    if tournament_data.max_players and tournament_data.max_players < len(enrollments):
        raise HTTPException(
            status_code=400, 
            detail=f"No puedes reducir el límite a {tournament_data.max_players} porque ya hay {len(enrollments)} jugadores inscritos."
        )
        
    return update_tournament(db, tournament_id, tournament_data)

@router.get("/", response_model=List[TournamentDetailResponse])
def list_tournaments(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tournaments = get_tournaments(db, skip=skip, limit=limit)
    
    results = []
    for t in tournaments:
        enrollments = get_enrollments(db, t.id)
        count = len(enrollments)
        # Verificar si current_user está en la lista de inscripciones
        is_enrolled = any(e.user_id == current_user.id for e in enrollments)
        
        t_dict = {
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "max_players": t.max_players,
            "status": t.status,
            "created_at": t.created_at,
            "enrolled_players_count": count,
            "is_enrolled": is_enrolled
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
    if tournament.status.value != "REGISTRATION":
        raise HTTPException(status_code=400, detail="El torneo no está abierto para inscripciones")
        
    enrollments = get_enrollments(db, tournament_id)
    if len(enrollments) >= tournament.max_players:
        raise HTTPException(status_code=400, detail="El torneo ha alcanzado su límite máximo de jugadores")
        
    return enroll_user(db, tournament_id=tournament_id, user_id=current_user.id)

@router.delete("/{tournament_id}/enroll", status_code=status.HTTP_204_NO_CONTENT)
def unenroll_from_tournament(
    tournament_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tournament = get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    if tournament.status.value != "REGISTRATION":
        raise HTTPException(status_code=400, detail="El torneo ya no está en fase de inscripción, no puedes abandonar")
        
    success = unenroll_user(db, tournament_id=tournament_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="No estás inscrito en este torneo")
    return None

@router.get("/{tournament_id}/participants", response_model=List[UserResponse])
def get_tournament_participants(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    tournament = get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
        
    enrollments = get_enrollments(db, tournament_id)
    participants = [e.user for e in enrollments]
    return participants

@router.post("/{tournament_id}/generate-bracket", response_model=List[MatchResponse])
def generate_tournament_bracket(
    tournament_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    tournament = get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    if tournament.status.value != "REGISTRATION":
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

@router.delete("/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tournament_endpoint(
    tournament_id: int, 
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    from app.crud.tournament import delete_tournament
    
    success = delete_tournament(db, tournament_id)
    if not success:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
        
    return None
