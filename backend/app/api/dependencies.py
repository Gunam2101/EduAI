from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import Optional, List

from app.core.config import settings
from app.database.connection import get_db
from app.database.models import User

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            return None
    except JWTError:
        return None

    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Construct User from token payload for dynamic student sessions
        user = User(
            id=payload.get("student_id", 1),
            email=email,
            name=payload.get("name", "Student"),
            role=payload.get("role", "Student"),
            student_id=payload.get("student_id", 1),
            faculty_id=payload.get("faculty_id")
        )
    else:
        token_role = payload.get("role")
        token_student_id = payload.get("student_id")
        token_name = payload.get("name")
        token_faculty_id = payload.get("faculty_id")
        if token_role:
            user.role = token_role
        if token_student_id:
            user.student_id = token_student_id
        if token_name:
            user.name = token_name
        if token_faculty_id:
            user.faculty_id = token_faculty_id
    return user

def require_authenticated_user(
    current_user: Optional[User] = Depends(get_current_user)
) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return current_user

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(require_authenticated_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Requires one of roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

def enforce_student_isolation(target_student_id: int, current_user: Optional[User]):
    """
    Enforces student isolation:
    - Admins and Faculty can access any student.
    - If current_user has role 'Student', their student_id must match target_student_id.
    - If IDs do not match, raises 403 Forbidden.
    """
    if not current_user:
        return
    if current_user.role in ["Admin", "Faculty"]:
        return
    if current_user.role == "Student":
        if current_user.student_id is not None and current_user.student_id != target_student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Student #{current_user.student_id} is not permitted to access student #{target_student_id} records."
            )
