from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, tournaments, matches

from app.database import SessionLocal
from app.models.role import Role

def seed_roles():
    db = SessionLocal()
    try:
        if not db.query(Role).first():
            db.add_all([
                Role(name="ADMIN", description="Administrador del sistema"),
                Role(name="PLAYER", description="Jugador regular")
            ])
            db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lógica de inicio (Seed roles)
    seed_roles()
    yield

app = FastAPI(
    title="MatchFlow API",
    description="API para el sistema de torneos MatchFlow",
    version="1.0.0",
    lifespan=lifespan
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción se debería especificar el dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tournaments.router)
app.include_router(matches.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a MatchFlow API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
