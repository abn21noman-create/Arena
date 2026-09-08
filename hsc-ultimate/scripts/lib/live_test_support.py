"""Shared, safety-guarded helpers for real HTTP + PostgreSQL acceptance tests.

Every automatically provisioned account uses an exact random email under the
reserved local test suffix and is deleted by exact equality. No wildcard user
cleanup, existing-user XP reset, or shared academic-content mutation is allowed.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import json
import os
import time
import uuid

import psycopg2
import requests
from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[2]
CONFIG = {
    **dotenv_values(ROOT / ".env"),
    **dotenv_values(ROOT / ".env.local"),
}
DB_URL = CONFIG.get("DIRECT_URL") or CONFIG.get("DATABASE_URL")
TEST_EMAIL_SUFFIX = "@hsc-e2e-test.local"
POLICY_FIELDS = {
    "policyAccepted": True,
    "ageAssuranceConfirmed": True,
    "privacyVersion": "2026.08.05",
    "termsVersion": "2026.08.05",
    "ageAssuranceVersion": "2026.08.05",
}


@dataclass(frozen=True)
class LiveTestIdentity:
    user_id: str
    email: str
    password: str
    role: str
    owned: bool = True


def database():
    if not DB_URL:
        raise RuntimeError("DATABASE_URL/DIRECT_URL নেই")
    return psycopg2.connect(DB_URL)


def login(base_url: str, email: str, password: str) -> requests.Session:
    session = requests.Session()
    csrf_response = session.get(f"{base_url}/api/auth/csrf", timeout=30)
    csrf_response.raise_for_status()
    csrf = csrf_response.json()["csrfToken"]
    session.post(
        f"{base_url}/api/auth/callback/credentials",
        data={
            "email": email,
            "password": password,
            "csrfToken": csrf,
            "json": "true",
        },
        timeout=60,
        allow_redirects=False,
    )
    auth_response = session.get(f"{base_url}/api/auth/session", timeout=30)
    user = auth_response.json().get("user") if auth_response.ok else None
    if not user:
        raise RuntimeError("Disposable live-test account login ব্যর্থ")
    return session


def register_ephemeral_user(
    base_url: str,
    *,
    role: str = "STUDENT",
    prefix: str = "acceptance",
) -> tuple[LiveTestIdentity, requests.Session]:
    if role not in {"STUDENT", "ADMIN"}:
        raise ValueError("role must be STUDENT or ADMIN")
    token = uuid.uuid4().hex[:12]
    safe_prefix = "".join(ch for ch in prefix.lower() if ch.isalnum() or ch == "-")[:24] or "acceptance"
    email = f"{safe_prefix}-{token}{TEST_EMAIL_SUFFIX}"
    password = f"HscLive#{token}A8"
    response = requests.post(
        f"{base_url}/api/auth/register",
        json={
            "name": "Live Acceptance শিক্ষার্থী" if role == "STUDENT" else "Live Acceptance Admin",
            "email": email,
            "password": password,
            **POLICY_FIELDS,
        },
        timeout=60,
    )
    if response.status_code != 201:
        raise RuntimeError(f"Disposable registration ব্যর্থ: HTTP {response.status_code}")
    body = response.json()
    user_id = body["user"]["id"]

    if role == "ADMIN":
        # Test setup only: promotion happens before the first login. The actual
        # session/admin guards are still exercised through normal Auth.js HTTP.
        with database() as connection, connection.cursor() as cursor:
            cursor.execute(
                'UPDATE users SET role=\'ADMIN\' WHERE id=%s AND email=%s',
                (user_id, email),
            )
            if cursor.rowcount != 1:
                raise RuntimeError("Disposable Admin promotion ব্যর্থ")

    identity = LiveTestIdentity(
        user_id=user_id,
        email=email,
        password=password,
        role=role,
        owned=True,
    )
    return identity, login(base_url, email, password)


def use_or_create_identity(
    base_url: str,
    *,
    role: str = "STUDENT",
    prefix: str = "acceptance",
) -> tuple[LiveTestIdentity, requests.Session]:
    email = os.environ.get("TEST_ADMIN_EMAIL" if role == "ADMIN" else "TEST_USER_EMAIL", "").strip()
    password = os.environ.get("TEST_ADMIN_PASS" if role == "ADMIN" else "TEST_USER_PASS", "")
    if email and password:
        session = login(base_url, email, password)
        body = session.get(f"{base_url}/api/auth/session", timeout=30).json()
        user = body.get("user") or {}
        if role == "ADMIN" and user.get("role") != "ADMIN":
            raise RuntimeError("Provided TEST_ADMIN account is not ADMIN")
        return (
            LiveTestIdentity(
                user_id=str(user.get("id") or ""),
                email=email,
                password=password,
                role=str(user.get("role") or role),
                owned=False,
            ),
            session,
        )
    return register_ephemeral_user(base_url, role=role, prefix=prefix)


def cleanup_ephemeral_user(identity: LiveTestIdentity | None) -> int:
    if not identity or not identity.owned:
        return 0
    email = identity.email
    if not email.endswith(TEST_EMAIL_SUFFIX):
        raise RuntimeError("Unsafe test cleanup blocked: email suffix mismatch")
    if not any(email.startswith(prefix) for prefix in (
        "acceptance-", "pages-", "mobile-", "shots-", "api-", "e2e-", "other-"
    )):
        raise RuntimeError("Unsafe test cleanup blocked: email prefix mismatch")
    with database() as connection, connection.cursor() as cursor:
        # XP events are emitted by the SYSTEM actor with the user ID as target;
        # Focus/privacy events use the user as actor. Remove only those exact
        # disposable-user audit rows before deleting the user itself.
        cursor.execute(
            """DELETE FROM audit_logs
               WHERE "actorId"=%s OR ("actorId"='SYSTEM' AND "targetId"=%s)""",
            (identity.user_id, identity.user_id),
        )
        cursor.execute("DELETE FROM users WHERE id=%s AND email=%s", (identity.user_id, email))
        return cursor.rowcount


def get_playwright_cookie(session: requests.Session) -> dict | None:
    for name in (
        "authjs.session-token",
        "__Secure-authjs.session-token",
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
    ):
        if name in session.cookies:
            return {
                "name": name,
                "value": session.cookies[name],
                "domain": "localhost",
                "path": "/",
                "httpOnly": True,
                "secure": False,
                "sameSite": "Lax",
            }
    return None


def write_report(relative_path: str, payload: dict) -> Path:
    report_path = ROOT / relative_path
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report_path


def wait_until_ready(base_url: str, timeout: int = 120) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            if requests.get(f"{base_url}/api/health", timeout=5).status_code == 200:
                return True
        except requests.RequestException:
            pass
        time.sleep(2)
    return False
