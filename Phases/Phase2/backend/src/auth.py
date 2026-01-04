"""Authentication utilities - JWT verification for Better Auth tokens."""

import os
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

# Configuration - shared secret with Better Auth
BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
if not BETTER_AUTH_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable is required")
ALGORITHM = "HS256"

# Bearer token security
security = HTTPBearer()


def decode_better_auth_token(token: str) -> Optional[str]:
    """Decode a Better Auth JWT token and return user_id (string UUID)."""
    try:
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=[ALGORITHM])
        # Better Auth uses 'sub' for user ID
        user_id = payload.get("sub")
        return user_id
    except JWTError as e:
        print(f"JWT decode error: {e}")
        return None


def verify_user_token(
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Verify JWT token and ensure user_id in URL matches token."""
    token = credentials.credentials
    token_user_id = decode_better_auth_token(token)

    if token_user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify the user_id in the URL matches the token
    if token_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch - access denied",
        )

    return token_user_id
