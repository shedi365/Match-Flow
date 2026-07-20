import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.core.deps import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.role import Role
from app.models.tournament import Tournament
from app.models.match import Match

# Setup In-Memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///file:testdb?mode=memory&cache=shared"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False, "uri": True})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

def override_get_current_admin_user():
    return User(id=1, gamertag="AdminUser", role_id=1, role=Role(id=1, name="ADMIN"))

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_admin_user] = override_get_current_admin_user

try:
    client = TestClient(app)
except ImportError:
    import sys
    print("TestClient requires httpx. Please run 'pip install httpx'")
    sys.exit(1)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_health_check():
    """Test 1: Verifica que la API esté viva"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_register_user():
    """Test 2: Verifica la creación de usuarios (Gamertag único)"""
    db = TestingSessionLocal()
    db.add(Role(name="PLAYER", description="Jugador"))
    db.commit()
    db.close()

    response = client.post("/auth/register", json={
        "gamertag": "TestGamer",
        "password": "supersecretpassword",
        "email": "testgamer@example.com"
    })
    assert response.status_code == 201
    assert "gamertag" in response.json()
    assert response.json()["gamertag"] == "TestGamer"

def test_create_tournament_as_admin():
    """Test 3: Verifica que un Admin puede crear un torneo"""
    response = client.post("/tournaments/", json={
        "name": "Torneo de Prueba",
        "description": "Un torneo para unit tests",
        "max_players": 8
    })
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Torneo de Prueba"
    assert data["max_players"] == 8
    assert data["status"] == "REGISTRATION"
