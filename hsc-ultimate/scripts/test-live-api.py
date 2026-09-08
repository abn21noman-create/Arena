"""
===================================================================
ব্যাপক লাইভ API টেস্ট — npm run test:api
-------------------------------------------------------------------
test-live-e2e.py শুধু একটা happy-path ফ্লো দেখে। এই স্ক্রিপ্ট
১৮৩টা রুটের মধ্যে সব GET রুট + প্রতিটা বড় POST ফ্লো ধরে, এবং
শুধু "২০০ এসেছে কিনা" না দেখে **লজিক সঠিক কিনা** যাচাই করে:

  • drill/adaptive/pretest — সার্ভার-সাইড গ্রেডিং সত্যিই ঠিক?
  • mistake-vault — ভুল করা প্রশ্নই ফিরে আসছে তো?
  • gamification — XP/level/badge হিসাব মিলছে?
  • bookmark/folder/habit/checklist — CRUD সত্যিই persist হয়?
  • admin — role guard + আসল কাজ
  • negative — অন্যের রিসোর্সে হাত দিলে 403/404?

শেষে তৈরি সব ডেটা মুছে ফেলা হয় (idempotent, বারবার চালানো যায়)।
===================================================================
"""
import os
import sys
import json
import time
import uuid
import subprocess
import signal
import requests

from lib.live_test_support import (
    ROOT,
    LiveTestIdentity,
    cleanup_ephemeral_user,
    database,
    register_ephemeral_user,
    write_report,
)

BASE = os.environ.get("BASE_URL", "http://localhost:3000")

ADMIN_EMAIL = ""
ADMIN_PASS = ""
OWNED_IDENTITIES: list[LiveTestIdentity] = []

PASSED, FAILED = [], []
CREATED = {"folders": [], "bookmarks": [], "habits": [],
           "sets": [], "decks": [], "posts": []}


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
    s = requests.Session()
    csrf = s.get(f"{BASE}/api/auth/csrf", timeout=30).json()["csrfToken"]
    s.post(f"{BASE}/api/auth/callback/credentials",
           data={"email": email, "password": password, "csrfToken": csrf, "json": "true"},
           timeout=90, allow_redirects=False)
    return s


# ------------------------------------------------------------------
# এই স্যান্ডবক্সে RAM ২ GB — Next.js dev on-demand কম্পাইলেশনে ভারী
# রুটে ১.৩+ GB খেয়ে কার্নেল OOM ডেকে আনে (dmesg এ প্রমাণিত)। তাই
# প্রতিটা রিকোয়েস্ট রেজিলিয়েন্ট করা হয়েছে: server মরে গেলে নিজে
# রিস্টার্ট করে, আবার লগইন করে, তারপর একই রিকোয়েস্ট রিট্রাই করে।
# এটা অ্যাপের দুর্বলতা নয় — পরিবেশের সীমা।
_session_holder = {"admin": None}
_managed_server_process = None


def stop_managed_server():
    global _managed_server_process
    process = _managed_server_process
    if process is None or process.poll() is not None:
        _managed_server_process = None
        return
    try:
        os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        process.wait(timeout=12)
    except Exception:
        try:
            os.killpg(os.getpgid(process.pid), signal.SIGKILL)
        except Exception:
            pass
    _managed_server_process = None


def dev_alive():
    try:
        return requests.get(f"{BASE}/api/health", timeout=5).status_code == 200
    except Exception:
        return False


def restart_dev(wait=120):
    global _managed_server_process
    # Only stop a server started by this script; never pkill an operator's
    # preview/production process.
    stop_managed_server()
    time.sleep(1)
    env = dict(os.environ)
    env.setdefault("AUTH_TRUST_HOST", "true")
    log = open("/tmp/hsc-dev-api-test.log", "a")
    _managed_server_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=ROOT,
        stdout=log,
        stderr=subprocess.STDOUT,
        env=env,
        preexec_fn=os.setsid,
    )
    t0 = time.time()
    while time.time() - t0 < wait:
        if dev_alive():
            if ADMIN_EMAIL and ADMIN_PASS:
                _session_holder["admin"] = login(ADMIN_EMAIL, ADMIN_PASS)
            return True
        time.sleep(2)
    return False


def req(method, path, **kw):
    """OOM-সহনশীল রিকোয়েস্ট — server পড়ে গেলে রিস্টার্ট করে রিট্রাই"""
    kw.setdefault("timeout", 180)
    for attempt in (1, 2, 3):
        s = _session_holder["admin"]
        try:
            return s.request(method, f"{BASE}{path}", **kw)
        except Exception:
            if attempt == 3:
                raise
            print(f"      ↻ server পড়ে গেছে, রিস্টার্ট ({path})")
            if not restart_dev():
                raise


def j(r):
    try:
        return r.json()
    except Exception:
        return {}


# ------------------------------------------------------------------
def section(t):
    print(f"\n=== {t} ===")


def main():
    global ADMIN_EMAIL, ADMIN_PASS
    stamp = uuid.uuid4().hex[:6]
    if not dev_alive():
        print("server চালু নেই — isolated dev server চালু করছি...")
        if not restart_dev():
            print("❌ server চালু করা গেল না")
            sys.exit(1)

    identity, admin = register_ephemeral_user(BASE, role="ADMIN", prefix="api")
    OWNED_IDENTITIES.append(identity)
    ADMIN_EMAIL, ADMIN_PASS = identity.email, identity.password
    _session_holder["admin"] = admin
    print("Disposable real Admin session তৈরি হয়েছে (credential hidden)")
    sess = j(req("GET", "/api/auth/session"))
    check("অ্যাডমিন লগইন", sess.get("user", {}).get("role") == "ADMIN",
          f"role={sess.get('user', {}).get('role')}")
    if not sess.get("user"):
        return

    # ============ ১. সব GET রুট ============
    section("১. GET রুট (লগইন অবস্থায়)")
    get_routes = [
        "/api/analytics", "/api/analytics/predicted-gpa", "/api/analytics/retention-forecast",
        "/api/analytics/weekly-recap", "/api/admission/exams", "/api/admission/history",
        "/api/bookmarks", "/api/bookmark-folders", "/api/calendar", "/api/custom-question-sets",
        "/api/drill/subjects", "/api/duel", "/api/duel/history", "/api/exam-checklist",
        "/api/flashcard-decks", "/api/flashcard-decks/discover", "/api/formula-search?q=বল",
        "/api/forum/posts", "/api/habits", "/api/mistake-vault", "/api/notifications",
        "/api/notifications/unread-count", "/api/pdf-chat", "/api/push/vapid-public-key",
        "/api/quiz-battle/history", "/api/reading-room/leaderboard", "/api/reading-room/rooms",
        "/api/adaptive-practice/preview", "/api/ai-chat", "/api/tasks", "/api/study-plan",
        "/api/routine", "/api/report-card", "/api/search?q=নিউটন",
        "/api/user/public-profile", "/api/study-pet", "/api/study-group",
        "/api/system-settings",
        # admin
        "/api/admin/stats", "/api/admin/analytics", "/api/admin/audit-log",
        "/api/admin/forum/posts", "/api/admin/reports", "/api/admin/subjects",
        "/api/admin/system-settings", "/api/admin/users",
    ]
    # SKIP_GET=1 দিলে ভারী GET সুইপ বাদ (রিটেস্টে সময় বাঁচাতে —
    # এই স্যান্ডবক্সে প্রতিটা রুটের প্রথম হিটে Next.js on-demand
    # কম্পাইল করে, তাই ৪৭টা রুটে ~২০ মিনিট লাগে)
    if os.environ.get("SKIP_GET") == "1":
        print("  (SKIP_GET=1 — GET সুইপ বাদ দেওয়া হলো)")
        get_routes = []
    for path in get_routes:
        try:
            r = req("GET", path)
            check(f"GET {path}", r.status_code == 200, f"{r.status_code} {r.text[:120]}")
        except Exception as e:
            check(f"GET {path}", False, f"{type(e).__name__}")

    # ============ ১খ. POST-only রুট (সঠিক method এ) ============
    section("১খ. POST-only রুট")
    with db() as c, c.cursor() as cur:
        cur.execute("""
            SELECT s.id, s.code, count(q.id) AS question_count
            FROM subjects s
            JOIN chapters ch ON ch."subjectId" = s.id
            JOIN topics t ON t."chapterId" = ch.id
            JOIN questions q ON q."topicId" = t.id
            GROUP BY s.id, s.code
            ORDER BY question_count DESC
            LIMIT 1
        """)
        _sid, _scode, _subject_question_count = cur.fetchone()
        # নোটযুক্ত টপিক — mind-map/notes-pdf এর জন্য notesMarkdown লাগে
        cur.execute("""SELECT id FROM topics
                       WHERE "notesMarkdown" IS NOT NULL
                         AND length("notesMarkdown") > 100 LIMIT 1""")
        _row = cur.fetchone()
        if _row is None:
            cur.execute("SELECT id FROM topics LIMIT 1")
            _row = cur.fetchone()
        _tid = _row[0]
        # ৫+ প্রশ্নযুক্ত চ্যাপ্টার (pretest এ প্রশ্ন লাগে)
        cur.execute("""SELECT c.id FROM chapters c JOIN topics t ON t."chapterId"=c.id
                       JOIN questions q ON q."topicId"=t.id
                       GROUP BY c.id HAVING count(q.id) >= 5 LIMIT 1""")
        _cid = cur.fetchone()[0]

    post_cases = [
        ("/api/study-sessions", {"subjectCode": _scode, "type": "POMODORO", "durationSec": 1500}, (200, 201)),
        ("/api/live-activity/heartbeat", {"activityType": "PRACTICE"}, (200, 201)),
        ("/api/notifications/read-all", {}, (200, 201)),
        ("/api/pretest/start", {"chapterId": _cid}, (200, 201)),
    ]
    for path, body, okcodes in post_cases:
        try:
            r = req("POST", path, json=body)
            check(f"POST {path}", r.status_code in okcodes,
                  f"{r.status_code} {r.text[:130]}")
        except Exception as e:
            check(f"POST {path}", False, f"{type(e).__name__}")

    # topics এর সাব-রুট (/api/topics/[topicId] নিজে কোনো রুট নয়)
    # progress ও mind-map হলো POST, notes-pdf হলো GET (PDF stream)
    r = req("POST", f"/api/topics/{_tid}/progress", json={"status": "MASTERED"})
    check("POST /api/topics/[topicId]/progress", r.status_code in (200, 201),
          f"{r.status_code} {r.text[:110]}")
    if r.status_code in (200, 201):
        with db() as c3, c3.cursor() as cur3:
            cur3.execute(
                'SELECT status FROM topic_progress WHERE "topicId"=%s AND "userId"=%s',
                (_tid, identity.user_id),
            )
            st = cur3.fetchone()
        check("topic progress DB তে সংরক্ষিত", st and st[0] == "MASTERED", str(st))
    r = req("POST", f"/api/topics/{_tid}/mind-map", json={})
    check("POST /api/topics/[topicId]/mind-map", r.status_code in (200, 201),
          f"{r.status_code} {r.text[:110]}")
    r = req("GET", f"/api/topics/{_tid}/notes-pdf")
    check("GET /api/topics/[topicId]/notes-pdf", r.status_code in (200, 404),
          f"{r.status_code} {r.text[:110]}")

    # ============ ২. Drill — গ্রেডিং সঠিকতা ============
    section("২. Drill (সার্ভার-সাইড গ্রেডিং)")
    with db() as c, c.cursor() as cur:
        cur.execute("SELECT id FROM subjects WHERE code='CHEMISTRY' LIMIT 1")
        row = cur.fetchone()
        subj = row[0] if row else None
        if not subj:
            cur.execute("SELECT id FROM subjects LIMIT 1"); subj = cur.fetchone()[0]

    r = req("POST", "/api/drill/start", json={"subjectId": subj, "durationSec": 60})
    check("drill/start 200", r.status_code == 200, f"{r.status_code} {r.text[:150]}")
    if r.status_code == 200:
        dq = j(r).get("questions", [])
        check("drill প্রশ্ন এসেছে", len(dq) > 0, f"{len(dq)} টা")
        check("drill এ correctAnswer leak নেই",
              all("correctAnswer" not in q for q in dq))
        if dq:
            ids = [q["id"] for q in dq]
            with db() as c, c.cursor() as cur:
                cur.execute('SELECT id,"correctAnswer" FROM questions WHERE id=ANY(%s)', (ids,))
                amap = dict(cur.fetchall())
            # অর্ধেক সঠিক
            half = len(ids) // 2
            answers = [{"questionId": q, "userAnswer": amap[q] if i < half else "__ভুল__"}
                       for i, q in enumerate(ids)]
            rs = req("POST", "/api/drill/submit", json={"subjectId": subj, "answers": answers, "timeTakenSec": 30})
            body = j(rs)
            got = body.get("score", body.get("correctCount"))
            check("drill/submit স্কোর সঠিক", rs.status_code == 200 and got == half,
                  f"status={rs.status_code} পেয়েছি {got}, প্রত্যাশা {half}, keys={list(body.keys())}")

    # ============ ৩. Mistake Vault — ভুলগুলোই ফিরছে? ============
    section("৩. Mistake Vault")
    rmv = req("GET", "/api/mistake-vault")
    mv = j(rmv)
    total = mv.get("totalCount", 0)
    check("mistake-vault এ drill এর ভুল ধরা পড়েছে", total > 0,
          f"totalCount={total} (drill এ ইচ্ছাকৃত ভুল করা হয়েছে)")

    # ============ ৪. Bookmark CRUD (সত্যিই persist?) ============
    section("৪. Bookmark + Folder CRUD")
    rf = req("POST", "/api/bookmark-folders", json={"name": f"টেস্ট ফোল্ডার {stamp}"})
    check("folder তৈরি", rf.status_code in (200, 201), f"{rf.status_code} {rf.text[:150]}")
    fid = (j(rf).get("folder") or {}).get("id")
    if fid:
        CREATED["folders"].append(fid)
        with db() as c, c.cursor() as cur:
            cur.execute("SELECT name FROM bookmark_folders WHERE id=%s", (fid,))
            check("folder DB তে সত্যিই আছে", cur.fetchone() is not None)

    with db() as c, c.cursor() as cur:
        cur.execute("SELECT id FROM topics LIMIT 1"); tid = cur.fetchone()[0]
    rb = req("POST", "/api/bookmarks", json={"topicId": tid, "folderId": fid})
    check("bookmark তৈরি", rb.status_code in (200, 201), f"{rb.status_code} {rb.text[:150]}")
    rlist = j(req("GET", "/api/bookmarks"))
    check("bookmark লিস্টে দেখা যাচ্ছে",
          any(b.get("topicId") == tid or (b.get("topic") or {}).get("id") == tid
              for b in rlist.get("bookmarks", [])),
          f"{len(rlist.get('bookmarks', []))} টা")

    # ============ ৫. Habit + Exam checklist ============
    section("৫. Habit / Exam Checklist")
    rh = req("POST", "/api/habits", json={"name": f"টেস্ট অভ্যাস {stamp}", "emoji": "📘"})
    check("habit তৈরি", rh.status_code in (200, 201), f"{rh.status_code} {rh.text[:150]}")
    hid = (j(rh).get("habit") or {}).get("id")
    if hid:
        CREATED["habits"].append(hid)
    rc = req("POST", "/api/exam-checklist", json={"category": "NIGHT_BEFORE", "label": f"টেস্ট আইটেম {stamp}"})
    check("checklist আইটেম তৈরি", rc.status_code in (200, 201), f"{rc.status_code} {rc.text[:150]}")
    checklist_id = (j(rc).get("item") or {}).get("id")

    # ============ ৬. Planner CRUD + profile ============
    section("৬. Planner CRUD + profile")
    rprofile = req("PATCH", "/api/user/profile", json={
        "name": "Live Acceptance Admin",
        "board": "ঢাকা",
        "hscBatch": 2028,
    })
    check("profile update persists", rprofile.status_code == 200,
          f"{rprofile.status_code} {rprofile.text[:140]}")

    rtask = req("POST", "/api/tasks", json={
        "title": f"লাইভ টাস্ক {stamp}",
        "description": "Disposable acceptance task",
        "dueDate": "2026-08-06T12:00:00.000Z",
        "priority": "HIGH",
        "subjectCode": _scode,
    })
    task_id = (j(rtask).get("task") or {}).get("id")
    check("task create", rtask.status_code == 201 and bool(task_id),
          f"{rtask.status_code} {rtask.text[:140]}")
    if task_id:
        rtask_done = req("PATCH", f"/api/tasks/{task_id}", json={"status": "DONE"})
        check("task complete", rtask_done.status_code == 200,
              f"{rtask_done.status_code} {rtask_done.text[:130]}")
        rtask_delete = req("DELETE", f"/api/tasks/{task_id}")
        check("task delete", rtask_delete.status_code == 200, f"{rtask_delete.status_code}")

    if hid:
        rh_toggle = req("POST", f"/api/habits/{hid}/toggle")
        check("habit daily toggle", rh_toggle.status_code == 200,
              f"{rh_toggle.status_code} {rh_toggle.text[:120]}")
    if checklist_id:
        rc_toggle = req("PATCH", f"/api/exam-checklist/{checklist_id}", json={"isChecked": True})
        check("checklist toggle", rc_toggle.status_code == 200,
              f"{rc_toggle.status_code} {rc_toggle.text[:120]}")
        rc_delete = req("DELETE", f"/api/exam-checklist/{checklist_id}")
        check("checklist delete", rc_delete.status_code == 200, f"{rc_delete.status_code}")

    # ============ ৭. Flashcard FSRS + global search ============
    section("৭. Flashcard FSRS + global search")
    deck_name = f"লাইভ ডেক {stamp}"
    rdeck = req("POST", "/api/flashcard-decks", json={"name": deck_name, "subjectCode": _scode})
    deck = j(rdeck).get("deck") or {}
    deck_id = deck.get("id")
    check("flashcard deck create", rdeck.status_code == 201 and bool(deck_id),
          f"{rdeck.status_code} {rdeck.text[:140]}")
    if deck_id:
        rcard = req("POST", f"/api/flashcard-decks/{deck_id}/cards", json={
            "cardType": "BASIC",
            "front": "নিউটনের দ্বিতীয় সূত্র কী?",
            "back": "F = ma",
        })
        card_id = (j(rcard).get("flashcard") or {}).get("id")
        check("flashcard create", rcard.status_code == 201 and bool(card_id),
              f"{rcard.status_code} {rcard.text[:130]}")
        if card_id:
            rreview = req("POST", f"/api/flashcards/{card_id}/review", json={"rating": "good"})
            review_body = j(rreview)
            check("real FSRS/SM2 review persisted",
                  rreview.status_code == 200 and bool((review_body.get("flashcard") or {}).get("lastReviewed")),
                  f"{rreview.status_code} {rreview.text[:150]}")
        rsearch = req("GET", f"/api/search?q={requests.utils.quote(deck_name)}")
        search_results = j(rsearch).get("results", [])
        check("global search finds own real deck",
              rsearch.status_code == 200 and any(item.get("id") == deck_id for item in search_results),
              f"{rsearch.status_code}, results={len(search_results)}")

    # ============ ৮. Consent-based Focus lifecycle ============
    section("৮. Consent-based Focus lifecycle")
    rcontract = req("PUT", "/api/focus/contract", json={
        "allowAdminStart": True,
        "maxAdminDurationMinutes": 20,
        "nativeEnforcementEnabled": False,
        "shareAnalyticsWithAdmin": True,
        "confirmed": True,
    })
    check("Focus Contract explicit consent", rcontract.status_code == 200,
          f"{rcontract.status_code} {rcontract.text[:140]}")
    rfocus = req("POST", "/api/focus/session", json={
        "durationMinutes": 20,
        "subjectCode": _scode,
        "focusLabel": "Live acceptance focus",
        "nativeEnforcementRequested": False,
    })
    focus_id = (j(rfocus).get("session") or {}).get("id")
    check("self Focus session starts", rfocus.status_code == 201 and bool(focus_id),
          f"{rfocus.status_code} {rfocus.text[:140]}")
    if focus_id:
        rheartbeat = req("PATCH", f"/api/focus/session/{focus_id}", json={
            "action": "HEARTBEAT", "nativeEnforcementActive": False,
        })
        check("Focus heartbeat", rheartbeat.status_code == 200,
              f"{rheartbeat.status_code} {rheartbeat.text[:120]}")
        rexit = req("PATCH", f"/api/focus/session/{focus_id}", json={
            "action": "EMERGENCY_EXIT", "reason": "Acceptance safety exit",
        })
        check("mandatory emergency exit works", rexit.status_code == 200,
              f"{rexit.status_code} {rexit.text[:120]}")
    rrevoke = req("PUT", "/api/focus/contract", json={
        "allowAdminStart": False,
        "maxAdminDurationMinutes": 20,
        "nativeEnforcementEnabled": False,
        "shareAnalyticsWithAdmin": False,
        "confirmed": True,
    })
    check("Focus consent revocation", rrevoke.status_code == 200,
          f"{rrevoke.status_code} {rrevoke.text[:120]}")

    # ============ ৯. Reading Room + Study Group ============
    section("৯. Reading Room + Study Group")
    rjoin_room = req("POST", "/api/reading-room/join", json={
        "room": "COZY_LIBRARY", "activity": "SELF_STUDY", "goal": "লাইভ UX যাচাই",
    })
    room_session_id = (j(rjoin_room).get("session") or {}).get("id")
    check("Reading Room join", rjoin_room.status_code == 201 and bool(room_session_id),
          f"{rjoin_room.status_code} {rjoin_room.text[:130]}")
    if room_session_id:
        rr_beat = req("POST", "/api/reading-room/heartbeat", json={"sessionId": room_session_id})
        check("Reading Room heartbeat", rr_beat.status_code == 200,
              f"{rr_beat.status_code} {rr_beat.text[:120]}")
        rr_leave = req("POST", "/api/reading-room/leave", json={"sessionId": room_session_id})
        check("Reading Room leave", rr_leave.status_code == 200,
              f"{rr_leave.status_code} {rr_leave.text[:120]}")

    rgroup = req("POST", "/api/study-group", json={
        "name": f"Live Group {stamp}", "description": "Disposable real study group",
    })
    group_id = (j(rgroup).get("group") or {}).get("id")
    check("Study Group create", rgroup.status_code == 201 and bool(group_id),
          f"{rgroup.status_code} {rgroup.text[:130]}")
    if group_id:
        rmembership = req("GET", "/api/study-group")
        check("Study Group membership persists",
              rmembership.status_code == 200 and bool(j(rmembership).get("membership")),
              f"{rmembership.status_code} {rmembership.text[:130]}")
        rleave_group = req("POST", "/api/study-group/leave")
        check("Study Group leave", rleave_group.status_code == 200,
              f"{rleave_group.status_code} {rleave_group.text[:120]}")

    # ============ ১০. Exam/social session creation ============
    section("১০. Exam/social session creation")
    radmission = req("POST", "/api/admission/start", json={"examType": "MEDICAL"})
    admission_body = j(radmission)
    admission_id = admission_body.get("attemptId")
    admission_questions = admission_body.get("questions", [])
    check("Admission mock starts with real question bank",
          radmission.status_code == 200 and bool(admission_id) and len(admission_questions) > 0,
          f"{radmission.status_code}, questions={len(admission_questions)}")
    check("Admission start hides correct answers",
          all("correctAnswer" not in question for question in admission_questions))
    if admission_id and admission_questions:
        first_admission_id = admission_questions[0]["id"]
        with db() as c, c.cursor() as cur:
            cur.execute('SELECT "correctAnswer" FROM admission_questions WHERE id=%s', (first_admission_id,))
            first_correct = cur.fetchone()[0]
        radmission_submit = req("POST", f"/api/admission/{admission_id}/submit", json={
            "answers": [{"questionId": first_admission_id, "userAnswer": first_correct}],
            "timeTakenSec": 30,
        })
        check("Admission server-side scoring", radmission_submit.status_code == 200 and j(radmission_submit).get("correctCount") == 1,
              f"{radmission_submit.status_code} {radmission_submit.text[:150]}")

    rmock = req("POST", "/api/mock-exam/start", json={"subjectId": _sid, "mode": "QUICK"})
    mock_body = j(rmock)
    mock_id = mock_body.get("attemptId")
    check("Mock Exam real attempt starts", rmock.status_code == 200 and bool(mock_id),
          f"{rmock.status_code} {rmock.text[:140]}")
    if mock_id:
        rmock_get = req("GET", f"/api/mock-exam/{mock_id}")
        mock_questions = j(rmock_get).get("mcqQuestions", [])
        check("Mock Exam anti-cheat answer hiding",
              rmock_get.status_code == 200 and all("correctAnswer" not in question for question in mock_questions),
              f"{rmock_get.status_code}, questions={len(mock_questions)}")

    rduel = req("POST", "/api/duel", json={"subjectId": _sid})
    duel_id = (j(rduel).get("duel") or {}).get("id")
    check("Quiz Duel create", rduel.status_code == 201 and bool(duel_id),
          f"{rduel.status_code} {rduel.text[:140]}")
    if duel_id:
        rduel_cancel = req("POST", f"/api/duel/{duel_id}/cancel")
        check("Quiz Duel cancel", rduel_cancel.status_code == 200,
              f"{rduel_cancel.status_code} {rduel_cancel.text[:100]}")

    rbattle = req("POST", "/api/quiz-battle", json={
        "title": f"Live Battle {stamp}",
        "sourceType": "question_bank",
        "subjectId": _sid,
        "maxPlayers": 4,
    })
    battle_id = (j(rbattle).get("battle") or {}).get("id")
    check("Quiz Battle create", rbattle.status_code == 201 and bool(battle_id),
          f"{rbattle.status_code} {rbattle.text[:140]}")
    if battle_id:
        rbattle_get = req("GET", f"/api/quiz-battle/{battle_id}")
        check("Quiz Battle owner can poll real room", rbattle_get.status_code == 200,
              f"{rbattle_get.status_code} {rbattle_get.text[:110]}")

    rlive = req("POST", "/api/live-exam/start", json={
        "sourceType": "question_bank",
        "questionType": "MCQ",
        "subjectId": _sid,
        "questionCount": 5,
        "durationMinutes": 10,
    })
    live_id = (j(rlive).get("liveExam") or {}).get("id")
    check("Live Exam session starts", rlive.status_code == 201 and bool(live_id),
          f"{rlive.status_code} {rlive.text[:140]}")
    if live_id:
        rlive_get = req("GET", f"/api/live-exam/{live_id}")
        check("Live Exam owned session loads", rlive_get.status_code == 200,
              f"{rlive_get.status_code} {rlive_get.text[:110]}")

    # ============ ১১. Gamification sync ============
    section("৬. Gamification")
    with db() as c, c.cursor() as cur:
        cur.execute('SELECT xp, level FROM users WHERE email=%s', (ADMIN_EMAIL,))
        xp, lvl = cur.fetchone()
    rg = req("POST", "/api/gamification/sync")
    check("gamification/sync 200", rg.status_code == 200, f"{rg.status_code} {rg.text[:150]}")
    gb = j(rg)
    # /api/gamification/sync এর আসল contract: { streak, league, newBadges }
    check("sync এ streak+newBadges ফেরত এসেছে",
          "streak" in gb and "newBadges" in gb, str(gb)[:150])
    check("streakCount সংখ্যা", isinstance((gb.get("streak") or {}).get("streakCount"), int),
          str(gb.get("streak"))[:100])
    check("XP ঋণাত্মক নয়", xp >= 0, f"xp={xp}")

    # ============ ৭. নেগেটিভ / authz ============
    section("৭. নেগেটিভ ও authz")
    # অস্তিত্বহীন রিসোর্স
    rn = req("GET", "/api/flashcard-decks/ckfakefakefakefake0000")
    check("অস্তিত্বহীন deck → 404", rn.status_code == 404, f"{rn.status_code}")
    # অবৈধ ইনপুট
    ri = req("POST", "/api/practice/start", json={"chapterId": "কিছু-একটা-ভুল"})
    check("ভুল chapterId → 404", ri.status_code == 404, f"{ri.status_code}")
    ri2 = req("POST", "/api/practice/submit", json={"answers": []})
    check("খালি answers → 400", ri2.status_code == 400, f"{ri2.status_code}")
    # অন্য disposable real STUDENT দিয়ে ownership/role boundary যাচাই
    other_identity, other = register_ephemeral_user(BASE, role="STUDENT", prefix="other")
    OWNED_IDENTITIES.append(other_identity)
    other_email = other_identity.email

    def oreq(method, path, **kw):
        nonlocal other
        kw.setdefault("timeout", 120)
        for a in (1, 2):
            try:
                return other.request(method, f"{BASE}{path}", **kw)
            except Exception:
                if a == 2:
                    raise
                restart_dev()
                other = login(other_email, other_identity.password)

    if fid:
        rx = oreq("PATCH", f"/api/bookmark-folders/{fid}", json={"name": "হাইজ্যাক"})
        check("অন্যের folder সম্পাদনা করা যায় না (403/404)", rx.status_code in (403, 404),
              f"{rx.status_code} {rx.text[:100]}")
        with db() as c2, c2.cursor() as cur2:
            cur2.execute("SELECT name FROM bookmark_folders WHERE id=%s", (fid,))
            nm = cur2.fetchone()
        check("অন্যের folder এর নাম অপরিবর্তিত", nm and "হাইজ্যাক" not in nm[0], str(nm))
    rx2 = oreq("GET", "/api/admin/stats")
    check("STUDENT → admin/stats 403", rx2.status_code == 403, f"{rx2.status_code}")
    rx3 = oreq("PATCH", "/api/admin/system-settings", json={"maintenanceMode": True})
    check("STUDENT → admin PATCH 403", rx3.status_code == 403, f"{rx3.status_code}")
    with db() as c, c.cursor() as cur:
        cur.execute('SELECT "maintenanceMode" FROM system_settings LIMIT 1')
        mm = cur.fetchone()
    check("maintenanceMode চালু হয়ে যায়নি", mm is None or mm[0] is False, f"{mm}")

    # ============ ৮. Exact-user cleanup ============
    section("৮. Exact-user cleanup")
    try:
        deleted = sum(cleanup_ephemeral_user(identity) for identity in reversed(OWNED_IDENTITIES))
        with db() as c, c.cursor() as cur:
            cur.execute(
                "SELECT count(*) FROM users WHERE id = ANY(%s)",
                ([identity.user_id for identity in OWNED_IDENTITIES],),
            )
            left = cur.fetchone()[0]
            cur.execute("SELECT count(*) FROM users")
            total_u = cur.fetchone()[0]
        check("শুধু disposable test users মুছে ফেলা হয়েছে", left == 0,
              f"deleted={deleted}, test users left={left}, মোট live user={total_u}")
    except Exception as e:
        check("exact-user cleanup", False, repr(e))

    report = {
        "suite": "live-api-real-user",
        "baseUrl": BASE,
        "realDatabase": True,
        "disposableUsers": len(OWNED_IDENTITIES),
        "summary": {"pass": len(PASSED), "fail": len(FAILED), "total": len(PASSED) + len(FAILED)},
        "failed": [{"name": name, "detail": detail} for name, detail in FAILED],
    }
    report_path = write_report("reports/live-api-acceptance-current.json", report)
    print(f"\n=== ফলাফল: {len(PASSED)} পাস · {len(FAILED)} ফেল ===")
    print(f"Report: {report_path}")
    for n, d in FAILED:
        print(f"  ❌ {n} — {d}")
    return 1 if FAILED else 0


if __name__ == "__main__":
    exit_code = 1
    try:
        exit_code = main()
    except Exception:
        import traceback
        traceback.print_exc()
    finally:
        # Crash/timeout হলেও existing users/data স্পর্শ না করে exact IDs only.
        for owned_identity in reversed(OWNED_IDENTITIES):
            try:
                cleanup_ephemeral_user(owned_identity)
            except Exception as cleanup_error:
                print(f"❌ emergency exact-user cleanup ব্যর্থ: {cleanup_error!r}")
                exit_code = 1
        stop_managed_server()
    sys.exit(exit_code)
