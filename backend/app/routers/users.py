from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserResponse, UserUpdateGamertag, UserUpdatePassword, Token
from app.crud.user import get_user_by_gamertag, update_user_gamertag, update_user_password
from app.core.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.put("/me/gamertag", response_model=Token)
def change_gamertag(gamertag_data: UserUpdateGamertag, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Comprobar que el nuevo gamertag no esté en uso
    if get_user_by_gamertag(db, gamertag=gamertag_data.new_gamertag):
        raise HTTPException(status_code=400, detail="El Gamertag ya está en uso.")
    
    update_user_gamertag(db, current_user, gamertag_data.new_gamertag)

    # Generar nuevo token ya que el subject (gamertag) ha cambiado
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.gamertag, "role": current_user.role.name}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.put("/me/password", response_model=UserResponse)
def change_password(password_data: UserUpdatePassword, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verificar contraseña actual
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta.")
    
    updated_user = update_user_password(db, current_user, password_data.new_password)
    
    return {
        "id": updated_user.id,
        "gamertag": updated_user.gamertag,
        "email": updated_user.email,
        "role_name": updated_user.role.name,
        "created_at": updated_user.created_at
    }
