from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional

from app.core.config import settings
from app.database.connection import get_db
from app.database.models import User, Student
from app.schemas.schemas import Token, LoginRequest, UserOut

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    user = db.query(User).filter(User.email == email).first()
    return user

from app.services.indian_academic_context import get_indian_student_name

@router.post("/select-student/{student_id}", response_model=Token)
def select_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student #{student_id} not found")

    student_name = student.name or get_indian_student_name(student.id)
    student_email = f"student_{student_id}@ps52.edu"

    # Also update the student user record in DB if it exists
    user = db.query(User).filter(User.email == "student@ps52.edu").first()
    if user:
        user.name = student_name
        user.student_id = student.id
        db.commit()

    token_data = {
        "sub": student_email,
        "role": "Student",
        "name": student_name,
        "student_id": student.id,
        "faculty_id": None
    }
    access_token = create_access_token(data=token_data)
    return Token(
        access_token=access_token,
        token_type="bearer",
        role="Student",
        name=student_name,
        email=student_email,
        student_id=student.id,
        faculty_id=None
    )

@router.post("/login", response_model=Token)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    # Look up user
    user = db.query(User).filter(User.email == creds.email.strip().lower()).first()

    # Pre-configured demo accounts fallback or password verification
    valid = False
    if user:
        if creds.password in ["admin123", "faculty123", "student123", "password"] or pwd_context.verify(creds.password, user.hashed_password):
            valid = True
    else:
        # Fallback dynamic creation for demo if needed
        if creds.email == "admin@ps52.edu":
            user = User(email=creds.email, hashed_password=pwd_context.hash("admin123"), role="Admin", name="Dr. K. Ramanathan (Dean - Academic Affairs)")
            db.add(user); db.commit()
            valid = True
        elif creds.email == "faculty@ps52.edu":
            user = User(email=creds.email, hashed_password=pwd_context.hash("faculty123"), role="Faculty", name="Dr. S. Rangarajan (Associate Professor)", faculty_id=1)
            db.add(user); db.commit()
            valid = True
        elif creds.email == "student@ps52.edu":
            first_student = db.query(Student).first()
            s_name = first_student.name if first_student else "Student"
            s_id = first_student.id if first_student else 1
            user = User(email=creds.email, hashed_password=pwd_context.hash("student123"), role="Student", name=s_name, student_id=s_id)
            db.add(user); db.commit()
            valid = True

    if not user or not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please use demo credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # If student, sync name from the corresponding Student row in DB
    if user.role == "Student" or creds.role == "Student":
        sid = user.student_id or 1
        st = db.query(Student).filter(Student.id == sid).first()
        if st:
            user.name = st.name
            db.commit()

    # Allow role override during demo selection if requested
    active_role = creds.role if creds.role in ["Admin", "Faculty", "Student"] else user.role

    token_data = {
        "sub": user.email,
        "role": active_role,
        "name": user.name,
        "student_id": user.student_id or 1,
        "faculty_id": user.faculty_id or 1
    }
    access_token = create_access_token(data=token_data)

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=active_role,
        name=user.name,
        email=user.email,
        student_id=user.student_id or 1,
        faculty_id=user.faculty_id or 1
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user: Optional[User] = Depends(get_current_user)):
    if not current_user:
        return UserOut(id=1, email="admin@ps52.edu", name="Dr. Eleanor Vance", role="Admin")
    return current_user

