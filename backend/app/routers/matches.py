from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.match import MatchResponse, MatchReport, MatchVerify
from app.models.match import Match, MatchStatus
from app.models.user import User
from app.core.deps import get_current_user, get_current_admin_user
from app.services.bracket_generator import advance_winner_in_bracket

router = APIRouter(
    prefix="/matches",
    tags=["Matches"]
)

@router.post("/{match_id}/start", response_model=MatchResponse)
def start_match(
    match_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
        
    # Validar que el usuario sea uno de los jugadores o un admin
    is_admin = current_user.role.name == "ADMIN"
    is_player = current_user.id in [match.player1_id, match.player2_id]
    
    if not (is_admin or is_player):
        raise HTTPException(status_code=403, detail="No tienes permiso para iniciar este partido")
        
    if match.status != MatchStatus.PENDING:
        raise HTTPException(status_code=400, detail="El partido no está en estado PENDIENTE")
        
    match.status = MatchStatus.IN_PROGRESS
    db.commit()
    db.refresh(match)
    return match

@router.post("/{match_id}/report", response_model=MatchResponse)
def report_match_result(
    match_id: int,
    report: MatchReport,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
        
    is_p1 = current_user.id == match.player1_id
    is_p2 = current_user.id == match.player2_id
    
    if not (is_p1 or is_p2):
        raise HTTPException(status_code=403, detail="No eres parte de este partido")
        
    if match.status != MatchStatus.IN_PROGRESS and match.status != MatchStatus.AWAITING_VALIDATION:
        raise HTTPException(status_code=400, detail="No puedes reportar en este estado")
        
    if is_p1:
        match.p1_has_reported = True
        match.p1_evidence_url = report.evidence_url
        if not match.p2_has_reported:
            match.score_p1 = report.score_p1
            match.score_p2 = report.score_p2
            match.penalties_p1 = report.penalties_p1
            match.penalties_p2 = report.penalties_p2
    elif is_p2:
        match.p2_has_reported = True
        match.p2_evidence_url = report.evidence_url
        if not match.p1_has_reported:
            match.score_p1 = report.score_p1
            match.score_p2 = report.score_p2
            match.penalties_p1 = report.penalties_p1
            match.penalties_p2 = report.penalties_p2

    match.status = MatchStatus.AWAITING_VALIDATION
    db.commit()
    db.refresh(match)
    return match

@router.post("/{match_id}/verify", response_model=MatchResponse)
def verify_match_result(
    match_id: int,
    verification: MatchVerify,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
        
    if match.status == MatchStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Este partido ya fue completado")
        
    match.score_p1 = verification.score_p1
    match.score_p2 = verification.score_p2
    match.penalties_p1 = verification.penalties_p1
    match.penalties_p2 = verification.penalties_p2
    match.winner_id = verification.winner_id
    match.status = MatchStatus.COMPLETED
    
    db.commit()
    
    # Avanzar al ganador
    advance_winner_in_bracket(db, match)
    db.refresh(match)
    
    return match
