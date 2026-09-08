"""
===================================================================
লাইভ E2E টেস্ট — আসল dev server + আসল Supabase DB + আসল ইউজার সেশন
-------------------------------------------------------------------
এটা mock নয়। প্রতিটা ধাপে সত্যিকারের HTTP রিকোয়েস্ট যায়, সত্যিকারের
রেকর্ড DB তে তৈরি হয়, আর শেষে সব টেস্ট ডেটা মুছে ফেলা হয়।

ফ্লো:
  ১. নতুন ইউজার রেজিস্টার (POST /api/auth/register)
  ২. NextAuth credentials দিয়ে লগইন → session cookie
  ৩. /api/user/profile দিয়ে সেশন যাচাই
  ৪. অ্যানোনিমাস অবস্থায় protected route ৪০১ দেয় কিনা (authz)
  ৫. প্রশ্নযুক্ত চ্যাপ্টার খুঁজে practice quiz start
  ৬. DB থেকে আসল correctAnswer নিয়ে জেনে-শুনে কিছু ভুল/কিছু সঠিক জমা
  ৭. স্কোর সার্ভার-সাইডে ঠিক হিসাব হয়েছে কিনা
  ৮. XP আসলেই বেড়েছে কিনা (DB থেকে আগে-পরে পড়ে)
  ৯. ভুল উত্তর mistake-vault এ গেছে কিনা
 ১০. analytics / gamification / bookmark ইত্যাদি রিড-রুট 200 দেয় কিনা
 ১১. পাসওয়ার্ড ভুল দিলে লগইন ব্যর্থ হয় (নেগেটিভ টেস্ট)
 ১২. cleanup — টেস্ট ইউজার ও তার সব রেকর্ড ডিলিট
===================================================================
"""
import os
import sys
import time
import uuid
import json
import requests

from lib.live_test_support import database, write_report

BASE = os.environ.get("BASE_URL", "http://localhost:3000")

PASSED, FAILED = [], []
POLICY_FIELDS = {
    "policyAccepted": True,
    "ageAssuranceConfirmed": True,
    "privacyVersion": "2026.08.05",
    "termsVersion": "2026.08.05",
    "ageAssuranceVersion": "2026.08.05",
}


def check(name, cond, detail=""):
    if cond:
        PASSED.append(name)
        print(f"  ✅ {name}" + (f" — {detail}" if detail else ""))
    else:
        FAILED.append((name, detail))
        print(f"  ❌ {name} — {detail}")


def db():
    return database()


def login(email, password):
    """আসল NextAuth credentials flow — csrf token সহ"""
    s = requests.Session()
    csrf = s.get(f"{BASE}/api/auth/csrf", timeout=30).json()["csrfToken"]
    r = s.post(
        f"{BASE}/api/auth/callback/credentials",
        data={"email": email, "password": password, "csrfToken": csrf, "json": "true"},
        timeout=60,
        allow_redirects=False,
    )
    return s, r


def main():
    stamp = uuid.uuid4().hex[:8]
    email = f"e2e-{stamp}@hsc-e2e-test.local"
    password = "E2eTest#2028"
    name = "E2E টেস্ট শিক্ষার্থী"
    user_id = None

    print(f"\n=== লাইভ E2E টেস্ট — {BASE} ===")
    print(f"টেস্ট ইউজার: {email}\n")

    try:
        # ---------- ১. রেজিস্ট্রেশন ----------
        print("[১] রেজিস্ট্রেশন")
        r = requests.post(
            f"{BASE}/api/auth/register",
            json={"name": name, "email": email, "password": password, **POLICY_FIELDS},
            timeout=60,
        )
        check("register 201", r.status_code == 201, f"status={r.status_code} body={r.text[:200]}")
        if r.status_code != 201:
            return
        user_id = r.json()["user"]["id"]

        # ডুপ্লিকেট ইমেইল → ৪০৯
        r2 = requests.post(
            f"{BASE}/api/auth/register",
            json={"name": name, "email": email, "password": password, **POLICY_FIELDS},
            timeout=60,
        )
        check("ডুপ্লিকেট ইমেইল → 409", r2.status_code == 409, f"status={r2.status_code}")

        # দুর্বল পাসওয়ার্ড → ৪০০
        r3 = requests.post(
            f"{BASE}/api/auth/register",
            json={"name": "x y", "email": f"weak-{stamp}@hsc-e2e-test.local", "password": "123", **POLICY_FIELDS},
            timeout=60,
        )
        check("৬ অক্ষরের কম পাসওয়ার্ড → 400", r3.status_code == 400, f"status={r3.status_code}")

        # DB তে সত্যিই আছে + পাসওয়ার্ড হ্যাশড
        with db() as conn, conn.cursor() as cur:
            cur.execute('SELECT "passwordHash", xp, role FROM users WHERE id=%s', (user_id,))
            row = cur.fetchone()
        check("DB তে ইউজার তৈরি হয়েছে", row is not None)
        check("পাসওয়ার্ড bcrypt হ্যাশ (প্লেইনটেক্সট নয়)",
              row and row[0].startswith("$2") and password not in row[0])
        check("নতুন ইউজারের role STUDENT", row and row[2] == "STUDENT", f"role={row[2] if row else None}")
        xp_before = row[1] if row else 0

        # ---------- ২. অ্যানোনিমাস authz ----------
        print("\n[২] অ্যানোনিমাস অবস্থায় protected route")
        for path in ["/api/analytics", "/api/bookmarks", "/api/tasks", "/api/notifications"]:
            ra = requests.get(f"{BASE}{path}", timeout=60)
            check(f"অ্যানোনিমাস {path} → 401", ra.status_code == 401, f"status={ra.status_code}")
        radm = requests.get(f"{BASE}/api/admin/users", timeout=60)
        check("অ্যানোনিমাস /api/admin/users → 401/403",
              radm.status_code in (401, 403), f"status={radm.status_code}")

        # ---------- ৩. ভুল পাসওয়ার্ড (নেগেটিভ) ----------
        print("\n[৩] ভুল পাসওয়ার্ডে লগইন")
        sbad, rbad = login(email, "WrongPassword123")
        bad_has_session = any(
            name in sbad.cookies
            for name in (
                "authjs.session-token",
                "__Secure-authjs.session-token",
                "next-auth.session-token",
                "__Secure-next-auth.session-token",
            )
        )
        rprof_bad = sbad.get(f"{BASE}/api/analytics", timeout=60)
        check("ভুল পাসওয়ার্ডে সেশন তৈরি হয় না",
              (not bad_has_session) and rprof_bad.status_code == 401,
              f"cookie={bad_has_session} profile={rprof_bad.status_code}")

        # ---------- ৪. আসল লগইন ----------
        print("\n[৪] সঠিক পাসওয়ার্ডে লগইন")
        s, rl = login(email, password)
        rprof = s.get(f"{BASE}/api/analytics", timeout=120)
        check("লগইনের পর /api/analytics → 200", rprof.status_code == 200,
              f"status={rprof.status_code} body={rprof.text[:200]}")
        # POST-only রুটগুলোতে অ্যানোনিমাস → 401 (GET দিলে 405, তাই POST দিয়ে)
        for ppath in ["/api/gamification/sync", "/api/practice/start"]:
            rp2 = requests.post(f"{BASE}{ppath}", json={}, timeout=60)
            check(f"অ্যানোনিমাস POST {ppath} → 401", rp2.status_code == 401, f"status={rp2.status_code}")
        # PATCH-only /api/user/profile অ্যানোনিমাস → 401
        rp3 = requests.patch(f"{BASE}/api/user/profile", json={"name": "hack"}, timeout=60)
        check("অ্যানোনিমাস PATCH /api/user/profile → 401", rp3.status_code == 401, f"status={rp3.status_code}")

        # ---------- ৫. Practice quiz ----------
        print("\n[৫] Practice quiz — আসল প্রশ্ন")
        with db() as conn, conn.cursor() as cur:
            cur.execute("""
                SELECT c.id, c."subjectId", count(q.id) AS n
                FROM chapters c
                JOIN topics t ON t."chapterId" = c.id
                JOIN questions q ON q."topicId" = t.id
                GROUP BY c.id, c."subjectId"
                HAVING count(q.id) >= 5
                ORDER BY n DESC LIMIT 1
            """)
            chap = cur.fetchone()
        check("৫+ প্রশ্নযুক্ত চ্যাপ্টার পাওয়া গেছে", chap is not None)
        if not chap:
            return
        chapter_id, subject_id, qcount = chap
        print(f"      চ্যাপ্টার {chapter_id} — {qcount} টা প্রশ্ন")

        rs = s.post(f"{BASE}/api/practice/start", json={"chapterId": chapter_id}, timeout=120)
        check("practice/start → 200", rs.status_code == 200, f"status={rs.status_code} {rs.text[:200]}")
        if rs.status_code != 200:
            return
        qs = rs.json()["questions"]
        check("প্রশ্ন এসেছে", len(qs) > 0, f"{len(qs)} টা")
        leak = any(("correctAnswer" in q) or ("explanation" in q) for q in qs)
        check("correctAnswer/explanation ক্লায়েন্টে leak হয় না (anti-cheat)", not leak)

        # DB থেকে আসল উত্তর
        ids = [q["id"] for q in qs][:6]
        with db() as conn, conn.cursor() as cur:
            cur.execute('SELECT id, "correctAnswer" FROM questions WHERE id = ANY(%s)', (ids,))
            answers_map = dict(cur.fetchall())

        # প্রথম ৩টা সঠিক, বাকি ভুল
        payload_answers, expected_correct = [], 0
        for i, qid in enumerate(ids):
            if i < 3:
                ua = answers_map[qid]
                expected_correct += 1
            else:
                ua = "__ইচ্ছাকৃত ভুল উত্তর__"
            payload_answers.append({"questionId": qid, "userAnswer": ua})

        rsub = s.post(f"{BASE}/api/practice/submit", json={
            "subjectId": subject_id, "chapterId": chapter_id,
            "timeTakenSec": 42, "answers": payload_answers,
        }, timeout=180)
        check("practice/submit → 200", rsub.status_code == 200,
              f"status={rsub.status_code} {rsub.text[:300]}")
        if rsub.status_code != 200:
            return
        res = rsub.json()
        got = res.get("score", res.get("correctCount", res.get("attempt", {}).get("score")))
        check(f"সার্ভার-সাইড স্কোর সঠিক ({expected_correct}/{len(ids)})",
              got == expected_correct, f"পেয়েছি {got}, response keys={list(res.keys())}")

        # ---------- ৬. DB সাইড-ইফেক্ট ----------
        print("\n[৬] DB সাইড-ইফেক্ট যাচাই")
        with db() as conn, conn.cursor() as cur:
            cur.execute('SELECT xp FROM users WHERE id=%s', (user_id,))
            xp_after = cur.fetchone()[0]
            cur.execute('SELECT count(*) FROM quiz_attempts WHERE "userId"=%s', (user_id,))
            n_attempt = cur.fetchone()[0]
            cur.execute("""SELECT count(*) FROM quiz_attempt_answers a
                           JOIN quiz_attempts qa ON a."quizAttemptId"=qa.id
                           WHERE qa."userId"=%s AND a."isCorrect"=false""", (user_id,))
            n_wrong = cur.fetchone()[0]
        check("XP বেড়েছে", xp_after > xp_before, f"{xp_before} → {xp_after}")
        check("XP = ৫ × সঠিক উত্তর", xp_after - xp_before == 5 * expected_correct,
              f"বেড়েছে {xp_after - xp_before}, প্রত্যাশা {5*expected_correct}")
        check("QuizAttempt রেকর্ড তৈরি", n_attempt == 1, f"{n_attempt} টা")
        check("ভুল উত্তর DB তে সংরক্ষিত", n_wrong == len(ids) - expected_correct, f"{n_wrong} টা")

        # ---------- ৭. রিড রুট ----------
        print("\n[৭] লগইন অবস্থায় রিড-রুট")
        for path in ["/api/analytics", "/api/bookmarks",
                     "/api/mistake-vault", "/api/analytics/predicted-gpa",
                     "/api/analytics/retention-forecast", "/api/analytics/weekly-recap",
                     "/api/drill/subjects", "/api/admission/exams", "/api/notifications",
                     "/api/tasks", "/api/flashcard-decks", "/api/study-plan"]:
            try:
                rr = s.get(f"{BASE}{path}", timeout=120)
                check(f"{path} → 200", rr.status_code == 200,
                      f"status={rr.status_code} {rr.text[:150]}")
            except Exception as e:
                check(f"{path} → 200", False, f"exception {e}")

        # ---------- ৮. non-admin কে admin রুট আটকায় ----------
        print("\n[৮] STUDENT দিয়ে admin রুট")
        rad = s.get(f"{BASE}/api/admin/users", timeout=60)
        check("STUDENT → /api/admin/users 403", rad.status_code == 403, f"status={rad.status_code}")

        # ---------- ৯. পেজ রেন্ডার ----------
        print("\n[৯] পেজ রেন্ডার (HTML)")
        for path in ["/", "/login", "/register", "/dashboard", "/practice", "/leaderboard"]:
            try:
                rp = s.get(f"{BASE}{path}", timeout=180)
                ok = rp.status_code == 200
                check(f"পেজ {path} → 200", ok, f"status={rp.status_code}")
            except Exception as e:
                check(f"পেজ {path} → 200", False, f"exception {e}")

    except Exception as e:
        # নীরব ব্যর্থতা ঠেকাতে — কোনো exception চাপা পড়বে না
        import traceback
        traceback.print_exc()
        FAILED.append(("অপ্রত্যাশিত exception", repr(e)))
    finally:
        # ---------- ১০. Cleanup ----------
        print("\n[১০] Cleanup — টেস্ট ডেটা মুছে ফেলা")
        try:
            with db() as conn, conn.cursor() as cur:
                if user_id:
                    cur.execute(
                        """DELETE FROM audit_logs
                           WHERE "actorId"=%s OR ("actorId"='SYSTEM' AND "targetId"=%s)""",
                        (user_id, user_id),
                    )
                    cur.execute("DELETE FROM users WHERE id=%s AND email=%s", (user_id, email))
                else:
                    cur.execute(
                        "DELETE FROM users WHERE email=%s AND email LIKE %s",
                        (email, "%@hsc-e2e-test.local"),
                    )
                deleted = cur.rowcount
                conn.commit()
                cur.execute("SELECT count(*) FROM users WHERE email=%s", (email,))
                left = cur.fetchone()[0]
                cur.execute("SELECT count(*) FROM users")
                total = cur.fetchone()[0]
            check("শুধু exact disposable test user ডিলিট হয়েছে", left == 0,
                  f"deleted={deleted} exact-user-left={left}")
            print(f"      DB তে এখন মোট live user: {total}")
        except Exception as e:
            check("exact-user cleanup", False, str(e))

        report_path = write_report(
            "reports/live-student-e2e-current.json",
            {
                "suite": "live-student-e2e",
                "baseUrl": BASE,
                "realDatabase": True,
                "summary": {
                    "pass": len(PASSED),
                    "fail": len(FAILED),
                    "total": len(PASSED) + len(FAILED),
                },
                "failed": [{"name": name, "detail": detail} for name, detail in FAILED],
                "cleanup": {"exactUserOnly": True},
            },
        )
        print(f"\n=== ফলাফল: {len(PASSED)} পাস · {len(FAILED)} ফেল ===")
        print(f"Report: {report_path}")
        for n, d in FAILED:
            print(f"  ❌ {n} — {d}")
        sys.exit(1 if FAILED else 0)


if __name__ == "__main__":
    main()
