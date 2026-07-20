from app.database import Base
from app.models.user import User
from app.models.tournament import Tournament, TournamentEnrollment
from app.models.match import Match

# Se exponen los modelos aquí para que Alembic (env.py) pueda encontrarlos
