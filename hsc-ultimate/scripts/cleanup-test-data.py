"""Safety-guarded cleanup for orphaned disposable live-test accounts.

Default mode is read-only. Apply mode only deletes exact IDs discovered under
the reserved test suffix/prefix set; it never resets XP or deletes records for
an existing real user. User-owned child rows disappear through database foreign
keys, while academic content is counted before/after and must remain unchanged.

Usage:
  npm run clean:test-data
  ALLOW_TEST_DATA_CLEANUP=DISPOSABLE_USERS_ONLY npm run clean:test-data -- --apply
  npm run clean:test-data -- --email pages-...@hsc-e2e-test.local --apply
"""
from __future__ import annotations

import argparse
import os
import sys

from lib.live_test_support import TEST_EMAIL_SUFFIX, database

SAFE_PREFIXES = (
    "acceptance-",
    "pages-",
    "mobile-",
    "shots-",
    "api-",
    "e2e-",
    "other-",
)
ACADEMIC_TABLES = (
    "subjects",
    "chapters",
    "topics",
    "questions",
    "admission_questions",
    "cq_questions",
    "badges",
)
ACKNOWLEDGEMENT = "DISPOSABLE_USERS_ONLY"


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Delete matching disposable users")
    parser.add_argument("--email", help="Clean one exact disposable email only")
    return parser.parse_args()


def is_safe_email(email: str) -> bool:
    normalized = email.strip().lower()
    return normalized.endswith(TEST_EMAIL_SUFFIX) and normalized.startswith(SAFE_PREFIXES)


def content_counts(cursor):
    result = {}
    for table in ACADEMIC_TABLES:
        cursor.execute(f"SELECT count(*) FROM {table}")
        result[table] = cursor.fetchone()[0]
    return result


def main() -> int:
    args = parse_args()
    if args.email and not is_safe_email(args.email):
        print("❌ Unsafe email blocked; only reserved disposable test identities are allowed")
        return 2

    with database() as connection, connection.cursor() as cursor:
        if args.email:
            cursor.execute(
                "SELECT id, email, \"createdAt\" FROM users WHERE email=%s",
                (args.email.strip().lower(),),
            )
        else:
            cursor.execute(
                "SELECT id, email, \"createdAt\" FROM users WHERE email LIKE %s ORDER BY \"createdAt\"",
                (f"%{TEST_EMAIL_SUFFIX}",),
            )
        rows = [row for row in cursor.fetchall() if is_safe_email(row[1])]
        before = content_counts(cursor)

    print(f"Disposable orphan candidates: {len(rows)}")
    for _, email, created_at in rows:
        print(f"  • {email} · {created_at.isoformat()}")

    if not args.apply:
        print("Read-only dry run; কোনো data পরিবর্তন হয়নি।")
        return 0
    if os.environ.get("ALLOW_TEST_DATA_CLEANUP") != ACKNOWLEDGEMENT:
        print(f"❌ Apply blocked. Set ALLOW_TEST_DATA_CLEANUP={ACKNOWLEDGEMENT}")
        return 2

    ids = [row[0] for row in rows]
    deleted = 0
    with database() as connection, connection.cursor() as cursor:
        for user_id, email, _ in rows:
            # Exact id+email pair prevents a stale discovery from deleting a
            # different row even in the unlikely event of identifier reuse.
            cursor.execute("DELETE FROM users WHERE id=%s AND email=%s", (user_id, email))
            deleted += cursor.rowcount
        after = content_counts(cursor)
        if before != after:
            connection.rollback()
            print("❌ Academic content count changed; cleanup transaction rolled back")
            return 1

    print(f"✅ Exact disposable users deleted: {deleted}")
    print("✅ Academic content counts unchanged")
    return 0


if __name__ == "__main__":
    sys.exit(main())
