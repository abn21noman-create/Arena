"""
===================================================================
লাইভ পেজ স্মোক-টেস্ট — সব ৮০টা রুট আসল লগইন সেশন দিয়ে রেন্ডার
-------------------------------------------------------------------
কেন আলাদা স্ক্রিপ্ট: এই স্যান্ডবক্সে RAM ২ GB, আর Next.js dev এ
on-demand কম্পাইলেশন ভারী পেজে ১.৩+ GB খেয়ে কার্নেল OOM ডেকে আনে
(dmesg এ প্রমাণিত)। তাই এখানে:
  • প্রতিটা রুট আলাদা করে হিট করা হয়
  • server মরে গেলে স্বয়ংক্রিয়ভাবে রিস্টার্ট করে বাকি রুট চালানো হয়
  • প্রতি N রুট পর প্রোঅ্যাকটিভ রিস্টার্ট (মেমরি জমা ঠেকাতে)
  • HTML এ Next.js error overlay / "Application error" আছে কিনা দেখা হয়

dynamic রুটে ([id]) DB থেকে আসল ID বসানো হয়, নইলে skip।
===================================================================
"""
import os
import re
import sys
import time
import json
import uuid
import signal
import subprocess
import requests

from lib.live_test_support import (
    ROOT,
    cleanup_ephemeral_user,
    database,
    register_ephemeral_user,
    write_report,
)

BASE = os.environ.get("BASE_URL", "http://localhost:3000")

RESTART_EVERY = int(os.environ.get("RESTART_EVERY", "12"))
PAGE_TIMEOUT = int(os.environ.get("PAGE_TIMEOUT", "150"))

ADMIN_EMAIL = ""
ADMIN_PASS = ""

results = {}   # route -> (status, note)
_proc = None


def db():
    return database()


def server_alive():
    try:
        return requests.get(f"{BASE}/api/health", timeout=5).status_code == 200
    except requests.RequestException:
        return False


def kill_dev():
    global _proc
    # Never kill a server/process this test did not start.
    if _proc is not None and _proc.poll() is None:
        try:
            os.killpg(os.getpgid(_proc.pid), signal.SIGTERM)
            _proc.wait(timeout=12)
        except Exception:
            try:
                os.killpg(os.getpgid(_proc.pid), signal.SIGKILL)
            except Exception:
                pass
    _proc = None


def start_dev(wait=90):
    global _proc
    kill_dev()
    env = dict(os.environ)
    env.setdefault("AUTH_TRUST_HOST", "true")
    log = open("/tmp/dev-pages.log", "a")
    _proc = subprocess.Popen(
        ["npm", "run", "dev"], cwd=ROOT, stdout=log, stderr=subprocess.STDOUT, env=env,
        preexec_fn=os.setsid,
    )
    t0 = time.time()
    while time.time() - t0 < wait:
        try:
            r = requests.get(f"{BASE}/api/auth/csrf", timeout=5)
            if r.status_code == 200:
                return True
        except Exception:
            pass
        time.sleep(2)
    return False


def login(email, password):
    s = requests.Session()
    csrf = s.get(f"{BASE}/api/auth/csrf", timeout=30).json()["csrfToken"]
    s.post(f"{BASE}/api/auth/callback/credentials",
           data={"email": email, "password": password, "csrfToken": csrf, "json": "true"},
           timeout=90, allow_redirects=False)
    return s


def make_minimal_pdf() -> bytes:
    """Generate a tiny standards-valid one-page PDF without test dependencies."""
    stream = b"BT /F1 12 Tf 72 720 Td (HSC Ultimate live acceptance) Tj ET"
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length %d >>\\nstream\\n%s\\nendstream" % (len(stream), stream),
    ]
    output = bytearray(b"%PDF-1.4\\n")
    offsets = [0]
    for index, payload in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\\n".encode())
        output.extend(payload)
        output.extend(b"\\nendobj\\n")
    xref_offset = len(output)
    output.extend(f"xref\\n0 {len(objects) + 1}\\n".encode())
    output.extend(b"0000000000 65535 f \\n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \\n".encode())
    output.extend(
        f"trailer\\n<< /Size {len(objects) + 1} /Root 1 0 R >>\\nstartxref\\n{xref_offset}\\n%%EOF\\n".encode()
    )
    return bytes(output)


def require_json(response, label, expected=(200, 201)):
    if response.status_code not in expected:
        raise RuntimeError(f"{label} provisioning failed: HTTP {response.status_code} {response.text[:160]}")
    return response.json()


def provision_owned_routes(session, user_id):
    """Create disposable, user-owned records through real APIs where possible."""
    stamp = uuid.uuid4().hex[:8]
    with db() as connection, connection.cursor() as cursor:
        cursor.execute("""
            SELECT s.id, s.code
            FROM subjects s
            JOIN chapters c ON c."subjectId" = s.id
            JOIN topics t ON t."chapterId" = c.id
            JOIN questions q ON q."topicId" = t.id
            GROUP BY s.id, s.code
            HAVING count(q.id) >= 10
            ORDER BY count(q.id) DESC
            LIMIT 1
        """)
        subject_id, subject_code = cursor.fetchone()
        cursor.execute("""
            SELECT c.id
            FROM chapters c
            JOIN topics t ON t."chapterId" = c.id
            JOIN questions q ON q."topicId" = t.id
            WHERE c."subjectId"=%s
            GROUP BY c.id
            HAVING count(q.id) >= 5
            ORDER BY count(q.id) DESC
            LIMIT 1
        """, (subject_id,))
        chapter_id = cursor.fetchone()[0]
        cursor.execute('SELECT id FROM topics WHERE "chapterId"=%s ORDER BY "order" LIMIT 1', (chapter_id,))
        topic_id = cursor.fetchone()[0]
        cursor.execute('SELECT id FROM cq_questions LIMIT 1')
        cq_question_id = cursor.fetchone()[0]

    deck = require_json(
        session.post(f"{BASE}/api/flashcard-decks", json={
            "name": f"Page fixture deck {stamp}", "subjectCode": subject_code,
        }, timeout=90),
        "flashcard deck",
        (201,),
    )["deck"]
    require_json(
        session.post(f"{BASE}/api/flashcard-decks/{deck['id']}/cards", json={
            "cardType": "BASIC", "front": "Page fixture front", "back": "Page fixture back",
        }, timeout=90),
        "flashcard",
        (201,),
    )

    practice_start = require_json(
        session.post(f"{BASE}/api/practice/start", json={"chapterId": chapter_id}, timeout=120),
        "practice start",
    )
    practice_question = practice_start["questions"][0]
    with db() as connection, connection.cursor() as cursor:
        cursor.execute('SELECT "correctAnswer" FROM questions WHERE id=%s', (practice_question["id"],))
        correct_answer = cursor.fetchone()[0]
    practice_submit = require_json(
        session.post(f"{BASE}/api/practice/submit", json={
            "subjectId": subject_id,
            "chapterId": chapter_id,
            "timeTakenSec": 10,
            "answers": [{"questionId": practice_question["id"], "userAnswer": correct_answer}],
        }, timeout=120),
        "practice submit",
    )

    admission = require_json(
        session.post(f"{BASE}/api/admission/start", json={"examType": "MEDICAL"}, timeout=180),
        "admission start",
    )
    admission_answers = []
    if admission.get("questions"):
        first_id = admission["questions"][0]["id"]
        with db() as connection, connection.cursor() as cursor:
            cursor.execute('SELECT "correctAnswer" FROM admission_questions WHERE id=%s', (first_id,))
            admission_correct = cursor.fetchone()[0]
        admission_answers = [{"questionId": first_id, "userAnswer": admission_correct}]
    require_json(
        session.post(f"{BASE}/api/admission/{admission['attemptId']}/submit", json={
            "answers": admission_answers, "timeTakenSec": 10,
        }, timeout=120),
        "admission submit",
    )

    mock_attempt = require_json(
        session.post(f"{BASE}/api/mock-exam/start", json={
            "subjectId": subject_id, "mode": "QUICK",
        }, timeout=120),
        "mock exam start",
    )
    duel = require_json(
        session.post(f"{BASE}/api/duel", json={"subjectId": subject_id}, timeout=120),
        "duel create",
        (201,),
    )["duel"]
    battle = require_json(
        session.post(f"{BASE}/api/quiz-battle", json={
            "title": f"Page fixture battle {stamp}",
            "sourceType": "question_bank",
            "subjectId": subject_id,
            "maxPlayers": 4,
        }, timeout=120),
        "battle create",
        (201,),
    )["battle"]
    live_exam = require_json(
        session.post(f"{BASE}/api/live-exam/start", json={
            "sourceType": "question_bank",
            "questionType": "MCQ",
            "subjectId": subject_id,
            "questionCount": 5,
            "durationMinutes": 10,
        }, timeout=120),
        "live exam start",
        (201,),
    )["liveExam"]

    forum = require_json(
        session.post(f"{BASE}/api/forum/posts", json={
            "title": f"নিউটনের দ্বিতীয় সূত্র বুঝতে সাহায্য চাই {stamp}",
            "content": "বল, ভর ও ত্বরণের সম্পর্কটি একটি দৈনন্দিন উদাহরণ দিয়ে বুঝিয়ে দিলে উপকার হবে।",
            "category": "QUESTION",
            "subjectCode": subject_code,
        }, timeout=180),
        "forum post",
        (201,),
    )["post"]

    pdf = require_json(
        session.post(
            f"{BASE}/api/pdf-chat",
            data={"title": f"Page fixture PDF {stamp}"},
            files={"file": (f"page-fixture-{stamp}.pdf", make_minimal_pdf(), "application/pdf")},
            timeout=180,
        ),
        "PDF upload",
        (201,),
    )["document"]

    cq_attempt_id = f"page-cq-{uuid.uuid4().hex}"
    slug = f"page-fixture-{stamp}"
    with db() as connection, connection.cursor() as cursor:
        cursor.execute(
            """INSERT INTO cq_attempts
               (id, "userId", "cqQuestionId", "answerA", "answerB", "answerC", "answerD",
                "scoreA", "scoreB", "scoreC", "scoreD", "totalScore", feedback, "createdAt")
               VALUES (%s,%s,%s,%s,%s,%s,%s,1,1,2,3,7,%s,now())""",
            (cq_attempt_id, user_id, cq_question_id, "ক উত্তর", "খ উত্তর", "গ উত্তর", "ঘ উত্তর",
             "Disposable page-render evaluation fixture"),
        )
        cursor.execute(
            'UPDATE users SET "publicProfileEnabled"=true, "profileSlug"=%s WHERE id=%s',
            (slug, user_id),
        )

    ids = {
        "subjectId": subject_id,
        "chapterId": chapter_id,
        "topicId": topic_id,
        "postId": forum["id"],
        "deckId": deck["id"],
        "attemptId": practice_submit["attemptId"],
        "documentId": pdf["id"],
        "sessionId": live_exam["id"],
        "battleId": battle["id"],
        "duelId": duel["id"],
        "slug": slug,
    }
    overrides = {
        "/practice/result/[attemptId]": ("attemptId", practice_submit["attemptId"]),
        "/cq-practice/result/[attemptId]": ("attemptId", cq_attempt_id),
        "/mock-exam/attempt/[attemptId]": ("attemptId", mock_attempt["attemptId"]),
        "/mock-exam/result/[attemptId]": ("attemptId", mock_attempt["attemptId"]),
        "/admission/run/[attemptId]": ("attemptId", admission["attemptId"]),
        "/admission/result/[attemptId]": ("attemptId", admission["attemptId"]),
    }
    return ids, overrides


def collect_routes():
    out = subprocess.run(
        r"""find app -name page.tsx | sed 's|^app||;s|/page\.tsx$||'""",
        shell=True, cwd=ROOT, capture_output=True, text=True).stdout
    routes = set()
    for line in out.splitlines():
        p = re.sub(r"/\([^/]*\)", "", line.strip())
        routes.add(p if p else "/")
    return sorted(routes)


def route_ids(route, ids, overrides):
    override = overrides.get(route)
    if not override:
        return ids
    key, value = override
    return {**ids, key: value}


def fill(route, ids):
    """[param] গুলো বসানো; না পারলে None"""
    def rep(m):
        name = m.group(1)
        return ids.get(name, "\x00")
    out = re.sub(r"\[(?:\.\.\.)?(\w+)\]", rep, route)
    return None if "\x00" in out else out


ERROR_MARKERS = [
    "Application error: a server-side exception",
    "This page could not be found",
    "__next_error__",
    "Internal Server Error",
]


def main():
    global ADMIN_EMAIL, ADMIN_PASS
    identity = None
    exit_code = 1
    try:
        routes = collect_routes()
        only = os.environ.get("ONLY")
        if only:
            want = set(only.split(","))
            routes = [route for route in routes if route in want]

        if not server_alive():
            print("server চালু নেই — isolated dev server চালু হচ্ছে...")
            if not start_dev():
                raise RuntimeError("dev server চালু হয়নি")

        identity, session = register_ephemeral_user(BASE, role="ADMIN", prefix="pages")
        ADMIN_EMAIL, ADMIN_PASS = identity.email, identity.password
        ids, route_overrides = provision_owned_routes(session, identity.user_id)
        print(f"=== পেজ স্মোক-টেস্ট: {len(routes)} রুট ===")
        print(f"resolved real DB params: {list(ids.keys())}")
        print("Disposable Admin session: ready (credential hidden)\n")

        since_restart = 0
        for route in routes:
            url_path = fill(route, route_ids(route, ids, route_overrides))
            if url_path is None:
                results[route] = ("SKIP", "এই disposable user-এর owned dynamic data নেই")
                print(f"  ⏭️  {route} — owned dynamic data নেই")
                continue

            for attempt in (1, 2):
                try:
                    response = session.get(
                        f"{BASE}{url_path}",
                        timeout=PAGE_TIMEOUT,
                        allow_redirects=False,
                    )
                    body = response.text if response.status_code == 200 else ""
                    bad = next((marker for marker in ERROR_MARKERS if marker in body), None)
                    if response.status_code in (200, 302, 307, 308) and not bad:
                        results[route] = ("OK", str(response.status_code))
                        print(f"  ✅ {route} → {response.status_code}")
                    else:
                        results[route] = ("FAIL", f"{response.status_code} {bad or ''}".strip())
                        print(f"  ❌ {route} → {response.status_code} {bad or ''}")
                    since_restart += 1
                    break
                except Exception as error:
                    if attempt == 1:
                        print(f"  ⚠️  {route} — {type(error).__name__}; retry...")
                        if not server_alive() and not start_dev():
                            results[route] = ("FAIL", "server retry ব্যর্থ")
                            break
                        session = login(ADMIN_EMAIL, ADMIN_PASS)
                        since_restart = 0
                    else:
                        results[route] = ("FAIL", f"{type(error).__name__} (দুইবার)")
                        print(f"  ❌ {route} — {type(error).__name__} (দুইবার)")

            # Dev-mode memory protection only; never replace an externally
            # managed production server.
            if _proc is not None and since_restart >= RESTART_EVERY:
                print("      ↻ isolated dev server proactive restart")
                if start_dev():
                    session = login(ADMIN_EMAIL, ADMIN_PASS)
                since_restart = 0

        ok = [route for route, (status, _) in results.items() if status == "OK"]
        fail = [(route, note) for route, (status, note) in results.items() if status == "FAIL"]
        skip = [route for route, (status, _) in results.items() if status == "SKIP"]
        report_path = write_report(
            "reports/live-page-smoke-current.json",
            {
                "suite": "all-page-live-http-smoke",
                "baseUrl": BASE,
                "realDatabase": True,
                "disposableAdmin": True,
                "summary": {
                    "total": len(routes),
                    "ok": len(ok),
                    "fail": len(fail),
                    "skipNoOwnedData": len(skip),
                },
                "results": {key: list(value) for key, value in results.items()},
            },
        )
        print(f"\n=== ফলাফল: {len(ok)} OK · {len(fail)} FAIL · {len(skip)} DATA-SKIP (মোট {len(routes)}) ===")
        print(f"Report: {report_path}")
        for route, note in fail:
            print(f"  ❌ {route} — {note}")
        exit_code = 1 if fail else 0
    except Exception as error:
        import traceback
        traceback.print_exc()
        print(f"❌ page smoke infrastructure: {error!r}")
        exit_code = 1
    finally:
        try:
            if identity is not None:
                deleted = cleanup_ephemeral_user(identity)
                print(f"Exact disposable page user cleanup: {deleted}")
        finally:
            kill_dev()
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
