from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import SECRET_KEY, ALGORITHM
from app.crud.user import get_user_by_gamertag

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        gamertag: str = payload.get("sub")
        if gamertag is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = get_user_by_gamertag(db, gamertag=gamertag)
    if user is None:
        raise credentials_exception
    return user

def get_current_admin_user(current_user = Depends(get_current_user)):
    if current_user.role.name != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario no tiene suficientes privilegios"
        )
    return current_user
