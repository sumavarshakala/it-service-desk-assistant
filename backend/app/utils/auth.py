import logging
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.connection import get_db, settings
from app.models import User, UserRole

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    # JWT spec: 'sub' must be a string
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    logger.debug("[AUTH] Token created for sub=%s", to_encode.get("sub"))
    return token


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        sub = payload.get("sub")
        logger.debug("[AUTH] Decoded token sub=%r (type=%s)", sub, type(sub).__name__)
        if sub is None:
            logger.warning("[AUTH] Token missing 'sub' claim")
            raise credentials_exception
        # sub is stored as str (JWT spec); convert back to int for DB lookup
        user_id = int(sub)
    except (JWTError, ValueError, TypeError) as exc:
        logger.warning("[AUTH] Token decode failed: %s", exc)
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    logger.debug("[AUTH] DB lookup user_id=%d -> found=%s", user_id, user is not None)
    if user is None:
        raise credentials_exception
    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


def log_activity(db: Session, user_id: int, action: str, ticket_id: Optional[int] = None):
    from app.models import ActivityLog
    log = ActivityLog(user_id=user_id, action=action, ticket_id=ticket_id)
    db.add(log)
    db.commit()
