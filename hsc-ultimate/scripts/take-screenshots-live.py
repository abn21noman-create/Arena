"""
===================================================================
লাইভ স্ক্রিনশট — npm run shots
-------------------------------------------------------------------
এতদিন থিম যাচাই হচ্ছিল শুধু HTML/CSS **পড়ে**; আসলে কেমন দেখায় তা
দেখা যেত না ("চাক্ষুষ QA বাকি" — তিনটি সেশনে বলা হয়েছে)।

এই স্ক্রিপ্ট সেই গ্যাপ পূরণ করে। এই স্যান্ডবক্সে ব্রাউজার ছিল না;
নিচের ধাপে সেটা সমাধান করা হয়েছে (root ছাড়াই):

  1. `pip install playwright` + `playwright install chromium`
  2. Chromium এর ৯টা সিস্টেম লাইব্রেরি অনুপস্থিত ছিল
     (libnspr4, libnss3, libatk, libasound...) → `apt-get download`
     দিয়ে .deb নামিয়ে `dpkg-deb -x` করে `~/libs/root` এ extract,
     তারপর `LD_LIBRARY_PATH` দিয়ে লোড
  3. বাংলা ফন্ট ছিল না (গ্লিফ ▯▯▯ দেখাত) → fonts-beng-extra ও
     fonts-lohit-beng-bengali একইভাবে নামিয়ে `~/.local/share/fonts` এ
  4. স্ক্রিনশট capture ব্যর্থ হচ্ছিল → `--disable-features=
     CDPScreenshotNewSurface` ফ্ল্যাগে সমাধান

চালানোর আগে (প্রতি নতুন সেশনে):
    export LD_LIBRARY_PATH=/home/user/libs/root/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH

⚠️ RAM ২ GB — তাই প্রতিটি পেজের জন্য আলাদা ব্রাউজার ইনস্ট্যান্স খুলে
বন্ধ করা হয়, এবং dev server পড়ে গেলে স্বয়ংক্রিয়ভাবে রিস্টার্ট হয়।
===================================================================
"""
import os
import subprocess
import signal
import sys
import time

import requests
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
ROOT = "/home/user/hsc-ultimate"
OUT = os.environ.get("SHOT_DIR", f"{ROOT}/screenshots")

ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "")
ADMIN_PASS = os.environ.get("TEST_ADMIN_PASS", "")

LAUNCH_ARGS = [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    # এই ফ্ল্যাগ ছাড়া হেডলেস-শেলে "Unable to capture screenshot" আসে
    "--disable-features=CDPScreenshotNewSurface",
]

# (নাম, পাথ, লগইন লাগবে?, পুরো পেজ?)
_managed_server = None

PAGES = [
    ("01-landing-dark", "/", False, False),
    ("02-login", "/login", False, False),
    ("03-dashboard", "/dashboard", True, False),
    ("04-practice", "/practice", True, False),
    ("05-learn", "/learn", True, False),
    ("06-leaderboard", "/leaderboard", True, False),
    ("07-analytics", "/analytics", True, False),
    ("08-settings", "/settings", True, False),
]


def dev_alive() -> bool:
    try:
        return requests.get(f"{BASE}/api/health", timeout=5).status_code == 200
    except Exception:
        return False


def stop_managed_server() -> None:
    global _managed_server
    if _managed_server is None or _managed_server.poll() is not None:
        _managed_server = None
        return
    try:
        os.killpg(os.getpgid(_managed_server.pid), signal.SIGTERM)
        _managed_server.wait(timeout=12)
    except Exception:
        try:
            os.killpg(os.getpgid(_managed_server.pid), signal.SIGKILL)
        except Exception:
            pass
    _managed_server = None


def restart_dev(wait: int = 120) -> bool:
    global _managed_server
    stop_managed_server()
    time.sleep(1)
    env = dict(os.environ)
    env.setdefault("AUTH_TRUST_HOST", "true")
    log = open("/tmp/hsc-dev-shots.log", "a")
    _managed_server = subprocess.Popen(
        ["npm", "run", "dev"], cwd=ROOT, stdout=log, stderr=subprocess.STDOUT,
        env=env, preexec_fn=os.setsid,
    )
    t0 = time.time()
    while time.time() - t0 < wait:
        if dev_alive():
            return True
        time.sleep(2)
    return False


def get_session_cookie(return_session: bool = False):
    """NextAuth credentials দিয়ে লগইন করে সেশন কুকি আনা"""
    s = requests.Session()
    csrf = s.get(f"{BASE}/api/auth/csrf", timeout=30).json()["csrfToken"]
    s.post(
        f"{BASE}/api/auth/callback/credentials",
        data={"email": ADMIN_EMAIL, "password": ADMIN_PASS, "csrfToken": csrf, "json": "true"},
        timeout=90, allow_redirects=False,
    )
    # NextAuth v5 (Auth.js) কুকির নাম `authjs.session-token`; v4 এ ছিল
    # `next-auth.session-token`। শুধু v4 নাম খুঁজে প্রথমে কুকি পাইনি,
    # ফলে লগইন-প্রয়োজনীয় পেজে /login এর স্ক্রিনশট উঠছিল।
    for name in (
        "authjs.session-token",
        "__Secure-authjs.session-token",
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
    ):
        if name in s.cookies:
            ck = {
                "name": name, "value": s.cookies[name],
                "domain": "localhost", "path": "/",
                "httpOnly": True, "secure": False, "sameSite": "Lax",
            }
            return (ck, s) if return_session else ck
    return (None, s) if return_session else None


def warm_page(path: str, cookie_jar: requests.Session | None) -> bool:
    """ব্রাউজার খোলার **আগে** সাধারণ HTTP দিয়ে পেজটা একবার হিট করে
    Next.js এর on-demand কম্পাইল সেরে ফেলা।

    কেন দরকার: dev মোডে প্রথম হিটে পেজ কম্পাইল হয়, যা ২ GB RAM এ
    ~১ GB পর্যন্ত খায়। Chromium একইসাথে চললে দুটোর যোগফলে কার্নেল
    OOM-killer আসে। আগে কম্পাইল সেরে নিলে ব্রাউজার খোলার সময়
    পেজটা ক্যাশ থেকে সাথে সাথেই আসে।
    """
    try:
        sess = cookie_jar or requests
        r = sess.get(f"{BASE}{path}", timeout=300)
        return r.status_code == 200
    except Exception:
        return False


def shoot(name: str, path: str, cookie: dict | None, full: bool,
          theme: str, width: int, height: int) -> str:
    """একটি পেজের স্ক্রিনশট — প্রতিবার নতুন ব্রাউজার (মেমরি সাশ্রয়ে)"""
    outfile = f"{OUT}/{name}-{theme}.png"
    with sync_playwright() as p:
        browser = p.chromium.launch(
            args=LAUNCH_ARGS,
            executable_path=os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE") or None,
        )
        # মোবাইল ভিউপোর্টে `is_mobile`/`has_touch` না দিলে অনেক
        # responsive UI ডেস্কটপ ব্রাঞ্চে পড়ে যায় (hover-only মেনু,
        # bottom-nav লুকানো ইত্যাদি) — ফলে ভুল ছবি উঠত। প্রস্থ ৫০০ এর
        # কম হলে সেটাকে ফোন ধরা হয় (Tailwind এর `sm` breakpoint ৬৪০,
        # তাই ৫০০ নিরাপদ সীমা)।
        is_mobile = width < 500
        ctx = browser.new_context(
            viewport={"width": width, "height": height},
            device_scale_factor=1,
            color_scheme=theme,           # 'dark' বা 'light'
            locale="bn-BD",
            is_mobile=is_mobile,
            has_touch=is_mobile,
        )
        if cookie:
            ctx.add_cookies([cookie])
        page = ctx.new_page()
        try:
            page.goto(f"{BASE}{path}", wait_until="domcontentloaded", timeout=180_000)
            # নেটওয়ার্ক থামা পর্যন্ত অপেক্ষা (ব্যর্থ হলেও চালিয়ে যাই)
            try:
                page.wait_for_load_state("networkidle", timeout=25_000)
            except Exception:
                pass

            # ⚠️ dev মোডে Next.js পেজ on-demand কম্পাইল করে; কম্পাইল
            # শেষ হওয়ার আগেই স্ক্রিনশট নিলে **সম্পূর্ণ সাদা ছবি** ওঠে
            # (একবার এই ফাঁদে পড়েছিলাম — ৪ KB ফাঁকা PNG)। তাই DOM এ
            # অর্থপূর্ণ টেক্সট আসা পর্যন্ত অপেক্ষা করা হয়।
            try:
                page.wait_for_function(
                    "() => (document.body?.innerText || '').trim().length > 40",
                    timeout=120_000,
                )
            except Exception:
                pass

            # অ্যানিমেশন/ফন্ট স্থির হতে দেওয়া
            page.wait_for_timeout(3000)
            page.screenshot(path=outfile, full_page=full)

            # ফাঁকা-ছবি গার্ড: টেক্সট না থাকলে ব্যর্থ ধরা হয়, যাতে
            # "সফল" রিপোর্ট করে ফাঁকা ছবি রেখে না যাই
            text_len = page.evaluate("() => (document.body?.innerText || '').trim().length")
            if text_len < 20:
                raise RuntimeError(f"পেজে টেক্সট নেই ({text_len} অক্ষর) — সম্ভবত ফাঁকা রেন্ডার")
        finally:
            browser.close()
    return outfile


def main():
    if not ADMIN_EMAIL or not ADMIN_PASS:
        print("❌ TEST_ADMIN_EMAIL এবং TEST_ADMIN_PASS environment variables আবশ্যক")
        sys.exit(2)
    os.makedirs(OUT, exist_ok=True)

    only = os.environ.get("ONLY")
    themes = os.environ.get("THEMES", "dark,light").split(",")
    width = int(os.environ.get("W", "1280"))
    height = int(os.environ.get("H", "800"))

    pages = PAGES
    if only:
        want = set(only.split(","))
        pages = [p for p in PAGES if p[0] in want or p[1] in want]

    if not dev_alive():
        print("dev server চালু নেই — চালু করা হচ্ছে...")
        if not restart_dev():
            print("❌ dev server চালু করা গেল না")
            sys.exit(1)

    cookie, http_sess = get_session_cookie(return_session=True)
    print(f"সেশন কুকি: {'পাওয়া গেছে' if cookie else 'পাওয়া যায়নি'}")
    print(f"ভিউপোর্ট: {width}×{height} · থিম: {', '.join(themes)}\n")

    ok, fail = 0, 0
    for name, path, need_login, full in pages:
        for theme in themes:
            use_cookie = cookie if need_login else None
            # ব্রাউজার খোলার আগে কম্পাইল সেরে নেওয়া (OOM এড়াতে)
            warm_page(path, http_sess if need_login else None)
            for attempt in (1, 2):
                try:
                    f = shoot(name, path, use_cookie, full, theme, width, height)
                    size = os.path.getsize(f)
                    print(f"  ✅ {name}-{theme}  ({size:,} বাইট)")
                    ok += 1
                    break
                except Exception as e:
                    msg = str(e).splitlines()[0][:80]
                    if attempt == 1:
                        print(f"  ⚠️  {name}-{theme} — {msg} · আবার চেষ্টা...")
                        if not dev_alive():
                            restart_dev()
                        cookie, http_sess = get_session_cookie(return_session=True)
                        use_cookie = cookie if need_login else None
                        warm_page(path, http_sess if need_login else None)
                    else:
                        print(f"  ❌ {name}-{theme} — {msg}")
                        fail += 1

    print(f"\n=== {ok} সফল · {fail} ব্যর্থ · ফোল্ডার: {OUT} ===")
    sys.exit(1 if fail else 0)


if __name__ == "__main__":
    try:
        main()
    finally:
        stop_managed_server()
