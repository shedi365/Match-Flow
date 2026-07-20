import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Configuración de base de datos leída desde las variables de entorno de Docker (definida en docker-compose)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/matchflow")

# Engine síncrono para las operaciones (psycopg2-binary es síncrono, suficiente para este PRD local)
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia para FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
