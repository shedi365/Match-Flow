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
    
    # Asignar Byes (Pases directos)
    # Los primeros 'byes' jugadores no juegan la ronda 1 (juegan solos y avanzan)
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
        
    # Asignar emparejamientos reales
    # Los jugadores restantes se emparejan 2 a 2
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
        
    # Crear todos los partidos en la base de datos
    db.add_all(matches)
    db.commit()
    
    # Actualizar estado del torneo
    update_tournament_status(db, tournament_id, TournamentStatus.IN_PROGRESS)
    
    return matches
