from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def get_user_by_gamertag(db: Session, gamertag: str):
    return db.query(User).filter(User.gamertag.ilike(gamertag)).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email.ilike(email)).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    
    # 1. Contar usuarios actuales
    users_count = db.query(User).count()
    
    # 2. Determinar el rol. Si es el primer usuario (0), es ADMIN, sino PLAYER
    role_name = "ADMIN" if users_count == 0 else "PLAYER"
    role = db.query(Role).filter(Role.name == role_name).first()
    
    if not role:
        # En caso extremo de que el Seed haya fallado (por ej. tests)
        role = Role(name=role_name)
        db.add(role)
        db.commit()
        db.refresh(role)

    db_user = User(
        gamertag=user.gamertag,
        email=user.email,
        hashed_password=hashed_password,
        role_id=role.id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
