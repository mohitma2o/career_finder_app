from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- CONFIGURATION ---
SECRET_KEY = "super-secret-key-for-jwt" # In production, use env variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week
ADMIN_EMAIL = "mohitmattoo05@gmail.com"
SUPER_ADMIN_USER = "mohit"
SUPER_ADMIN_PASS = "mohit2045"

# Google Client ID (User will need to provide this in .env)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_google_token(token: str):
    try:
        # If no client ID provided, we might be in dev mode or mock mode
        # For now, we assume validation is done by the caller or we try to verify if ID exists
        if not GOOGLE_CLIENT_ID:
            # Fallback for dev: Trust the token info if we can't verify (NOT SECURE FOR PROD)
            # This is just so the app works during setup
            return None
            
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        return idinfo
    except Exception as e:
        print(f"Google Token Verification Error: {e}")
        return None

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # --- MOCK & DEV BYPASS ---
    if token == "dev-admin-token":
        return {"sub": ADMIN_EMAIL, "role": "super_admin", "id": 1}
    if token == "dev-user-token":
        return {"sub": "user@example.com", "role": "user", "id": 2}
    if token == "mock-token-super":
        return {"sub": "mohit", "role": "super_admin", "id": "1"}
    if token.startswith("mock-token-"):
        return {"sub": "mock_user", "role": "user", "id": token.replace("mock-token-", "")}

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

def get_optional_current_user(token: str = Depends(oauth2_scheme_optional)):
    if not token:
        return None
    try:
        # Reuse the logic from get_current_user but without raising exceptions
        if token == "dev-admin-token": return {"sub": ADMIN_EMAIL, "role": "super_admin", "id": 1}
        if token == "dev-user-token": return {"sub": "user@example.com", "role": "user", "id": 2}
        if token == "mock-token-super": return {"sub": "mohit", "role": "super_admin", "id": "1"}
        if token.startswith("mock-token-"): return {"sub": "mock_user", "role": "user", "id": token.replace("mock-token-", "")}

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        return None

def is_admin(user = Depends(get_current_user)):
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return True

def is_super_admin(user = Depends(get_current_user)):
    if user.get("role") != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin access required"
        )
    return True
