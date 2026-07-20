from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import auth, tournaments, matches
import os

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
    # Crear directorio para subida de medios si no existe
    os.makedirs("/app/media", exist_ok=True)
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

# Montar directorio estático
app.mount("/media", StaticFiles(directory="/app/media"), name="media")

@app.get("/")
def read_root():
    return {"message": "Bienvenido a MatchFlow API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
