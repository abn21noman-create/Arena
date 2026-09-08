"""Live Strict Focus E2E: consent, Admin force-start, limits, emergency exit, cleanup."""
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone
import requests
import psycopg2
from dotenv import dotenv_values

BASE = os.environ.get("BASE_URL", "http://localhost:3000")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = {**dotenv_values(f"{ROOT}/.env"), **dotenv_values(f"{ROOT}/.env.local")}
DB_URL = cfg.get("DIRECT_URL") or cfg.get("DATABASE_URL")
PASSED, FAILED = [], []
POLICY_FIELDS = {
    "policyAccepted": True,
    "ageAssuranceConfirmed": True,
    "privacyVersion": "2026.08.05",
    "termsVersion": "2026.08.05",
    "ageAssuranceVersion": "2026.08.05",
}


def check(name, condition, detail=""):
    (PASSED if condition else FAILED).append(name if condition else (name, detail))
    print(f"  {'✅' if condition else '❌'} {name}" + (f" — {detail}" if detail else ""))


def db():
    return psycopg2.connect(DB_URL)


def register(email, password, name):
    response = requests.post(
        f"{BASE}/api/auth/register",
        json={"name": name, "email": email, "password": password, **POLICY_FIELDS},
        timeout=60,
    )
    return response


def login(email, password):
    session = requests.Session()
    csrf = session.get(f"{BASE}/api/auth/csrf", timeout=30).json()["csrfToken"]
    response = session.post(
        f"{BASE}/api/auth/callback/credentials",
        data={"email": email, "password": password, "csrfToken": csrf, "json": "true"},
        allow_redirects=False,
        timeout=60,
    )
    return session, response


def main():
    stamp = uuid.uuid4().hex[:8]
    admin_email = f"focus-admin-{stamp}@hsc-e2e-test.local"
    user_email = f"focus-user-{stamp}@hsc-e2e-test.local"
    password = "FocusTest#2028"

    print(f"\n=== Strict Focus live E2E — {BASE} ===")
    try:
        admin_reg = register(admin_email, password, "Focus Test Admin")
        user_reg = register(user_email, password, "Focus Test User")
        check("দুইটি test account তৈরি", admin_reg.status_code == 201 and user_reg.status_code == 201)
        if admin_reg.status_code != 201 or user_reg.status_code != 201:
            return
        admin_id = admin_reg.json()["user"]["id"]
        user_id = user_reg.json()["user"]["id"]

        with db() as conn, conn.cursor() as cursor:
            cursor.execute('UPDATE users SET role=\'ADMIN\' WHERE id=%s', (admin_id,))
            conn.commit()

        admin, _ = login(admin_email, password)
        user, _ = login(user_email, password)
        check("Admin session active", admin.get(f"{BASE}/api/admin/focus", timeout=60).status_code == 200)
        check("User /focus page render", user.get(f"{BASE}/focus", timeout=120).status_code == 200)
        check("User /focus/analytics page render", user.get(f"{BASE}/focus/analytics", timeout=120).status_code == 200)
        check("Admin /admin/focus page render", admin.get(f"{BASE}/admin/focus", timeout=120).status_code == 200)
        check("Admin /admin/focus/analytics page render", admin.get(f"{BASE}/admin/focus/analytics", timeout=120).status_code == 200)

        contract = user.put(
            f"{BASE}/api/focus/contract",
            json={
                "allowAdminStart": True,
                "maxAdminDurationMinutes": 60,
                "nativeEnforcementEnabled": False,
                "shareAnalyticsWithAdmin": True,
                "confirmed": True,
            },
            timeout=60,
        )
        check("User Focus Contract consent", contract.status_code == 200, contract.text[:160])

        scheduled_time = (datetime.now(timezone.utc) + timedelta(minutes=3)).isoformat()
        schedule_response = admin.post(
            f"{BASE}/api/admin/focus/schedules",
            json={
                "userId": user_id,
                "durationMinutes": 20,
                "subjectCode": "ICT",
                "focusLabel": "E2E Scheduled Focus",
                "scheduledFor": scheduled_time,
                "repeat": "NONE",
            },
            timeout=60,
        )
        check("Admin future Focus schedule create", schedule_response.status_code == 201, schedule_response.text[:180])
        if schedule_response.status_code != 201:
            return
        schedule_id = schedule_response.json()["schedule"]["id"]
        upcoming = user.get(f"{BASE}/api/focus/schedules", timeout=60)
        check("User upcoming schedule দেখে", upcoming.status_code == 200 and any(row["id"] == schedule_id for row in upcoming.json()["schedules"]))
        with db() as conn, conn.cursor() as cursor:
            cursor.execute('SELECT "reminderSentAt" FROM focus_schedules WHERE id=%s', (schedule_id,))
            reminder_sent = cursor.fetchone()[0]
            cursor.execute('UPDATE focus_schedules SET "nextRunAt"=NOW()-INTERVAL \'1 minute\' WHERE id=%s', (schedule_id,))
            conn.commit()
        check("5-minute upcoming reminder claimed", reminder_sent is not None)
        scheduled_state = user.get(f"{BASE}/api/focus/session", timeout=90)
        check("Due schedule lazy processor start", scheduled_state.status_code == 200 and scheduled_state.json().get("activeSession", {}).get("focusScheduleId") == schedule_id)
        scheduled_session_id = scheduled_state.json().get("activeSession", {}).get("id")
        if scheduled_session_id:
            scheduled_exit = user.patch(
                f"{BASE}/api/focus/session/{scheduled_session_id}",
                json={"action": "EMERGENCY_EXIT", "reason": "E2E scheduled cleanup"},
                timeout=60,
            )
            check("Scheduled session emergency cleanup", scheduled_exit.status_code == 200)

        recurring_response = admin.post(
            f"{BASE}/api/admin/focus/schedules",
            json={
                "userId": user_id,
                "durationMinutes": 25,
                "focusLabel": "E2E Daily Focus",
                "scheduledFor": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
                "repeat": "DAILY",
            },
            timeout=60,
        )
        check("Daily recurring schedule create", recurring_response.status_code == 201)
        if recurring_response.status_code == 201:
            recurring_id = recurring_response.json()["schedule"]["id"]
            user_cancel = user.delete(f"{BASE}/api/focus/schedules/{recurring_id}", timeout=60)
            check("User নিজের future schedule cancel", user_cancel.status_code == 200 and user_cancel.json()["schedule"]["status"] == "CANCELLED")

        start = admin.post(
            f"{BASE}/api/admin/focus",
            json={
                "userId": user_id,
                "durationMinutes": 45,
                "subjectCode": "PHYSICS",
                "focusLabel": "E2E Vector Focus",
                "nativeEnforcementRequested": False,
            },
            timeout=90,
        )
        check("Admin force-start 45 মিনিট", start.status_code == 201, start.text[:180])
        if start.status_code != 201:
            return
        session_id = start.json()["session"]["id"]
        check("FCM optional fallback নিরাপদ", start.json().get("nativePush", {}).get("configured") is False)

        state = user.get(f"{BASE}/api/focus/session", timeout=60).json()
        check("Target user ACTIVE session দেখে", state.get("activeSession", {}).get("id") == session_id)
        check("Session source ADMIN", state.get("activeSession", {}).get("source") == "ADMIN")

        duplicate = admin.post(
            f"{BASE}/api/admin/focus",
            json={"userId": user_id, "durationMinutes": 20, "nativeEnforcementRequested": False},
            timeout=60,
        )
        check("এক user-এর duplicate active session blocked", duplicate.status_code == 409)

        early_complete = user.patch(
            f"{BASE}/api/focus/session/{session_id}",
            json={"action": "COMPLETE"},
            timeout=60,
        )
        check("Timer শেষের আগে normal complete blocked", early_complete.status_code == 409)

        emergency = user.patch(
            f"{BASE}/api/focus/session/{session_id}",
            json={"action": "EMERGENCY_EXIT", "reason": "E2E জরুরি নিরাপত্তা পরীক্ষা"},
            timeout=60,
        )
        check("Emergency exit সবসময় কাজ করে", emergency.status_code == 200)
        check("Emergency status persisted", emergency.json().get("session", {}).get("status") == "EMERGENCY_EXIT")

        own_analytics = user.get(f"{BASE}/api/focus/analytics?range=7", timeout=60)
        check("User Focus Analytics → 200", own_analytics.status_code == 200)
        if own_analytics.status_code == 200:
            own_data = own_analytics.json()["analytics"]
            check("Subject analytics PHYSICS", any(row["code"] == "PHYSICS" for row in own_data["subjectBreakdown"]))
            check("Emergency analytics count", own_data["emergencyExitCount"] >= 1)

        admin_analytics = admin.get(f"{BASE}/api/admin/focus/analytics?range=7", timeout=60)
        check("Consent-shared Admin Analytics → 200", admin_analytics.status_code == 200)
        if admin_analytics.status_code == 200:
            check("Admin report-এ opted-in user আছে", any(row["id"] == user_id for row in admin_analytics.json()["users"]))

        export = admin.get(f"{BASE}/api/admin/focus/analytics/export?range=7", timeout=60)
        check("Focus Analytics CSV export", export.status_code == 200 and user_email in export.text)

        over_limit = admin.post(
            f"{BASE}/api/admin/focus",
            json={"userId": user_id, "durationMinutes": 90, "nativeEnforcementRequested": False},
            timeout=60,
        )
        check("Contract-এর 60 মিনিট সীমা enforce", over_limit.status_code == 400)

        revoke_schedule_response = admin.post(
            f"{BASE}/api/admin/focus/schedules",
            json={
                "userId": user_id,
                "durationMinutes": 30,
                "focusLabel": "E2E Weekly Revoke",
                "scheduledFor": (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat(),
                "repeat": "WEEKLY",
            },
            timeout=60,
        )
        revoke_schedule_id = revoke_schedule_response.json().get("schedule", {}).get("id") if revoke_schedule_response.status_code == 201 else None
        check("Weekly schedule before revoke", revoke_schedule_id is not None)

        revoke = user.put(
            f"{BASE}/api/focus/contract",
            json={
                "allowAdminStart": False,
                "maxAdminDurationMinutes": 60,
                "nativeEnforcementEnabled": False,
                "shareAnalyticsWithAdmin": False,
                "confirmed": True,
            },
            timeout=60,
        )
        check("User consent revoke", revoke.status_code == 200)
        if revoke_schedule_id:
            with db() as conn, conn.cursor() as cursor:
                cursor.execute('SELECT status FROM focus_schedules WHERE id=%s', (revoke_schedule_id,))
                revoked_schedule_status = cursor.fetchone()[0]
            check("Contract revoke future schedule cancel", revoked_schedule_status == "CANCELLED")

        after_revoke = admin.post(
            f"{BASE}/api/admin/focus",
            json={"userId": user_id, "durationMinutes": 20, "nativeEnforcementRequested": False},
            timeout=60,
        )
        check("Revoke-এর পর Admin start blocked", after_revoke.status_code == 403)
        private_analytics = admin.get(f"{BASE}/api/admin/focus/analytics?range=7", timeout=60)
        check(
            "Analytics privacy revoke effective",
            private_analytics.status_code == 200 and not any(row["id"] == user_id for row in private_analytics.json()["users"]),
        )

        self_start = user.post(
            f"{BASE}/api/focus/session",
            json={
                "durationMinutes": 20,
                "subjectCode": "CHEMISTRY",
                "focusLabel": "E2E Self Focus",
                "nativeEnforcementRequested": False,
            },
            timeout=60,
        )
        check("Contract off থাকলেও Self Focus চলে", self_start.status_code == 201)
        if self_start.status_code == 201:
            self_id = self_start.json()["session"]["id"]
            user.patch(
                f"{BASE}/api/focus/session/{self_id}",
                json={"action": "EMERGENCY_EXIT", "reason": "E2E cleanup"},
                timeout=60,
            )

        with db() as conn, conn.cursor() as cursor:
            cursor.execute('SELECT count(*) FROM audit_logs WHERE action LIKE \'FOCUS_%%\' AND "actorId" IN (%s,%s)', (admin_id, user_id))
            audit_count = cursor.fetchone()[0]
        check("Focus actions audit log-এ আছে", audit_count >= 4, f"count={audit_count}")
    except Exception as error:
        import traceback
        traceback.print_exc()
        check("Unexpected exception", False, repr(error))
    finally:
        try:
            with db() as conn, conn.cursor() as cursor:
                cursor.execute(
                    'DELETE FROM audit_logs WHERE "actorId" IN '
                    '(SELECT id FROM users WHERE email LIKE %s)',
                    ("focus-%@hsc-e2e-test.local",),
                )
                cursor.execute("DELETE FROM users WHERE email LIKE %s", ("focus-%@hsc-e2e-test.local",))
                deleted = cursor.rowcount
                conn.commit()
            check("Test users cleanup", deleted >= 0, f"deleted={deleted}")
        except Exception as error:
            check("Test users cleanup", False, str(error))

        print(f"\n=== Focus E2E: {len(PASSED)} pass · {len(FAILED)} fail ===")
        for name, detail in FAILED:
            print(f"  ❌ {name} — {detail}")
        sys.exit(1 if FAILED else 0)


if __name__ == "__main__":
    main()
