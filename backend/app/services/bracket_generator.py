import random
from sqlalchemy.orm import Session
from app.models.tournament import TournamentStatus
from app.models.match import Match, MatchStatus
from app.crud.tournament import get_enrollments, update_tournament_status

def generate_bracket(db: Session, tournament_id: int):
    enrollments = get_enrollments(db, tournament_id)
    if len(enrollments) < 2:
        raise ValueError("Se necesitan al menos 2 jugadores para generar el bracket.")

    # Mezclar jugadores aleatoriamente
    players = [e.user_id for e in enrollments]
    random.shuffle(players)

    n_players = len(players)
    
    # Calcular siguiente potencia de 2
    p = 1
    while p < n_players:
        p *= 2
        
    byes = p - n_players
    total_matches_r1 = p // 2

    matches = []
    
    # Generar Ronda 1
    player_index = 0
    match_number = 1
    
    for i in range(byes):
        player = players[player_index]
        match = Match(
            tournament_id=tournament_id,
            round_number=1,
            match_number=match_number,
            player1_id=player,
            player2_id=None,
            winner_id=player,
            status=MatchStatus.COMPLETED
        )
        matches.append(match)
        player_index += 1
        match_number += 1
        
    while player_index < n_players:
        p1 = players[player_index]
        p2 = players[player_index + 1]
        match = Match(
            tournament_id=tournament_id,
            round_number=1,
            match_number=match_number,
            player1_id=p1,
            player2_id=p2,
            winner_id=None,
            status=MatchStatus.PENDING
        )
        matches.append(match)
        player_index += 2
        match_number += 1
        
    # Generar Rondas subsiguientes
    current_round = 2
    matches_in_current_round = total_matches_r1 // 2
    
    while matches_in_current_round >= 1:
        for m in range(1, matches_in_current_round + 1):
            match = Match(
                tournament_id=tournament_id,
                round_number=current_round,
                match_number=m,
                player1_id=None,
                player2_id=None,
                winner_id=None,
                status=MatchStatus.PENDING
            )
            matches.append(match)
        current_round += 1
        matches_in_current_round //= 2
        
    # Crear todos los partidos en la base de datos
    db.add_all(matches)
    db.commit()
    
    # Avanzar los byes a la ronda 2
    # Recargar los partidos para obtener los IDs si fuera necesario, pero podemos basarnos en match_number
    # Ya que los byes ya tienen winner_id, los avanzamos
    for m in matches:
        if m.round_number == 1 and m.status == MatchStatus.COMPLETED:
            advance_winner_in_bracket(db, m)
            
    # Actualizar estado del torneo
    update_tournament_status(db, tournament_id, TournamentStatus.IN_PROGRESS)
    
    return matches

def advance_winner_in_bracket(db: Session, match: Match):
    if not match.winner_id:
        return
        
    next_round = match.round_number + 1
    next_match_number = (match.match_number + 1) // 2
    
    next_match = db.query(Match).filter(
        Match.tournament_id == match.tournament_id,
        Match.round_number == next_round,
        Match.match_number == next_match_number
    ).first()
    
    if next_match:
        is_player1 = (match.match_number % 2 != 0)
        if is_player1:
            next_match.player1_id = match.winner_id
        else:
            next_match.player2_id = match.winner_id
        db.commit()
    else:
        # Si no hay siguiente partido, significa que era la final
        update_tournament_status(db, match.tournament_id, TournamentStatus.COMPLETED)
