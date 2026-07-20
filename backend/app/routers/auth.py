from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
from app.crud.user import create_user, get_user_by_gamertag, get_user_by_email
from app.core.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_gamertag(db, gamertag=user.gamertag):
        raise HTTPException(status_code=400, detail="El Gamertag ya está en uso.")
    
    if get_user_by_email(db, email=user.email):
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")
    
    db_user = create_user(db, user=user)
    # Mapeo manual para UserResponse que espera un role_name
    return {
        "id": db_user.id,
        "gamertag": db_user.gamertag,
        "email": db_user.email,
        "role_name": db_user.role.name,
        "created_at": db_user.created_at
    }

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_gamertag(db, gamertag=user_credentials.gamertag)
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.gamertag, "role": user.role.name}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
