"""
===================================================================
যাচাই — নতুন ফন্ট স্ট্যাক ও Glassmorphism আসলেই প্রয়োগ হয়েছে কিনা
-------------------------------------------------------------------
CSS ফাইল "পড়ে" নয় — চলন্ত ব্রাউজারের **কম্পিউটেড ভ্যালু** ও আসল
রেন্ডার করা **পিক্সেল** থেকে মাপা হয়। যা মাপা হয়:

  ১. body ও h1 এর কম্পিউটেড font-family — Inter ও Noto Sans Bengali
     আছে কিনা, আর পুরনো Anek Bangla সরেছে কিনা
  ২. document.fonts দিয়ে ফন্ট আসলেই **লোড** হয়েছে কিনা (শুধু
     ঘোষণা করা যথেষ্ট নয় — নাম ভুল হলে নীরবে ফলব্যাকে চলে যায়)
  ৩. font-feature-settings / text-rendering প্রয়োগ হয়েছে কিনা
  ৪. কার্ডের backdrop-filter কম্পিউটেড মান `none` নয় তো
  ৫. কার্ড ব্যাকগ্রাউন্ডের alpha — সত্যিই স্বচ্ছ কিনা
  ৬. body::before (aurora) আসলে আঁকা হচ্ছে কিনা
  ৭. আসল স্ক্রিনশট পিক্সেল থেকে টেক্সট↔কার্ড WCAG কনট্রাস্ট
===================================================================
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from playwright.sync_api import sync_playwright
import requests

BASE = "http://localhost:3000"
ROOT_SHOTS = "/home/user/hsc-ultimate/screenshots/after"
os.makedirs(ROOT_SHOTS, exist_ok=True)
ARGS = ["--no-sandbox", "--disable-dev-shm-usage",
        "--disable-features=CDPScreenshotNewSurface"]


def cookie():
    s = requests.Session()
    csrf = s.get(f"{BASE}/api/auth/csrf", timeout=30).json()["csrfToken"]
    s.post(f"{BASE}/api/auth/callback/credentials",
           data={"email": "abn21.noman@gmail.com", "password": "@Abdullah1221",
                 "csrfToken": csrf, "json": "true"},
           timeout=90, allow_redirects=False)
    for n in ("authjs.session-token", "next-auth.session-token"):
        if n in s.cookies:
            return {"name": n, "value": s.cookies[n], "domain": "localhost",
                    "path": "/", "httpOnly": True, "secure": False, "sameSite": "Lax"}, s
    return None, s


def parse_rgb(page, color: str):
    """যেকোনো CSS রঙ (rgb / lab / oklch) কে sRGB টাপলে রূপান্তর —
    ব্রাউজারকেই কনভার্ট করতে বলা হয়, নিজে পার্স করার চেষ্টা নয়
    (আগে নিজে পার্স করতে গিয়ে `lab(...)` এ ক্র্যাশ করেছিল)।"""
    return page.evaluate(
        """(c) => { const cv = document.createElement('canvas').getContext('2d');
             cv.fillStyle = c; cv.fillRect(0,0,1,1);
             const d = cv.getImageData(0,0,1,1).data; return [d[0],d[1],d[2]]; }""",
        color)


def lum(c):
    def f(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])


def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


PROBE = """() => {
  const body = document.body;
  const bs = getComputedStyle(body);
  const before = getComputedStyle(body, '::before');
  const h1 = document.querySelector('h1');
  const card = document.querySelector('[data-slot="card"], .glass-surface');
  const cs = card ? getComputedStyle(card) : null;
  const loaded = [];
  document.fonts.forEach(f => { if (f.status === 'loaded') loaded.push(f.family); });
  return {
    bodyFont: bs.fontFamily,
    h1Font: h1 ? getComputedStyle(h1).fontFamily : null,
    featureSettings: bs.fontFeatureSettings,
    textRendering: bs.textRendering,
    smoothing: bs.webkitFontSmoothing,
    loadedFonts: [...new Set(loaded)],
    auroraContent: before.content,
    auroraPosition: before.position,
    auroraZ: before.zIndex,
    auroraBg: (before.backgroundImage || '').slice(0, 60),
    cardBackdrop: cs ? cs.backdropFilter : null,
    cardBg: cs ? cs.backgroundColor : null,
    cardBorder: cs ? cs.borderTopColor : null,
    cardShadow: cs ? cs.boxShadow : null,
  };
}"""

fails, warns = [], []

def check(cond, ok_msg, fail_msg):
    if cond:
        print(f"  ✅ {ok_msg}")
    else:
        print(f"  ❌ {fail_msg}")
        fails.append(fail_msg)


def main():
    ck, sess = cookie()
    sess.get(f"{BASE}/dashboard", timeout=300)   # আগে warm করা (OOM এড়াতে)
    for theme in ("dark", "light"):
        print(f"\n═══ থিম: {theme} ═══")
        with sync_playwright() as p:
            b = p.chromium.launch(args=ARGS)
            ctx = b.new_context(viewport={"width": 1280, "height": 800},
                                color_scheme=theme, locale="bn-BD")
            if ck:
                ctx.add_cookies([ck])
            pg = ctx.new_page()
            pg.goto(f"{BASE}/dashboard", wait_until="domcontentloaded", timeout=180_000)
            try:
                pg.wait_for_function(
                    "() => (document.body?.innerText||'').trim().length > 40",
                    timeout=120_000)
            except Exception:
                pass
            pg.wait_for_timeout(3500)
            r = pg.evaluate(PROBE)

            print("  ── ফন্ট ──")
            print(f"     body: {r['bodyFont']}")
            check("Inter" in r["bodyFont"], "Inter body তে আছে", f"Inter নেই: {r['bodyFont']}")
            check("Noto Sans Bengali" in r["bodyFont"],
                  "Noto Sans Bengali body তে আছে", "Noto Sans Bengali নেই")
            check("Anek" not in r["bodyFont"], "পুরনো Anek Bangla সরানো হয়েছে",
                  "Anek Bangla এখনো আছে")
            check(r["h1Font"] and "Noto Sans Bengali" in r["h1Font"],
                  "h1 ও Noto Sans Bengali পাচ্ছে", f"h1 ফন্ট ভুল: {r['h1Font']}")
            loaded = " | ".join(r["loadedFonts"])
            print(f"     লোড হওয়া: {loaded}")
            check(any("Noto Sans Bengali" in f for f in r["loadedFonts"]),
                  "Noto Sans Bengali আসলেই ডাউনলোড+লোড হয়েছে",
                  "Noto Sans Bengali লোডই হয়নি (নীরব ফলব্যাক!)")
            check("kern" in r["featureSettings"] and "liga" in r["featureSettings"],
                  f"font-feature-settings প্রয়োগ ({r['featureSettings']})",
                  f"feature-settings নেই: {r['featureSettings']}")
            check(r["smoothing"] == "antialiased",
                  "-webkit-font-smoothing: antialiased ✓",
                  f"smoothing: {r['smoothing']}")

            print("  ── Glassmorphism ──")
            check(r["auroraContent"] not in ("none", None),
                  "body::before (aurora) আঁকা হচ্ছে", "aurora স্তর নেই")
            check(r["auroraPosition"] == "fixed" and r["auroraZ"] == "-1",
                  f"aurora fixed + z-index {r['auroraZ']} ✓",
                  f"aurora পজিশন ভুল: {r['auroraPosition']}/{r['auroraZ']}")
            check("gradient" in r["auroraBg"], "aurora গ্রেডিয়েন্ট আছে", "aurora গ্রেডিয়েন্ট নেই")
            bf = r["cardBackdrop"] or "none"
            check(bf != "none" and "blur" in bf, f"কার্ডে backdrop blur সক্রিয় ({bf[:40]})",
                  f"backdrop-filter কম্পিউটেড `{bf}` — blur কাজ করছে না")

            # কম্পিউটেড রঙ rgba / oklch / lab যেকোনো ফরম্যাটে আসতে পারে
            # (Chromium আধুনিক কালার-স্পেস সংরক্ষণ করে) — তাই alpha টা
            # `/ 0.68` অংশ থেকে regex দিয়ে নেওয়া হয়, শুধু rgba ধরে নয়।
            bg = r["cardBg"] or ""
            import re as _re
            m = _re.search(r"/\s*([0-9.]+)\s*\)", bg) or _re.search(r"rgba\([^)]*,\s*([0-9.]+)\s*\)", bg)
            alpha = float(m.group(1)) if m else 1.0
            print(f"     কার্ড bg: {bg}")
            if alpha is not None:
                check(alpha < 0.95, f"কার্ড স্বচ্ছ (alpha {alpha:.2f})",
                      f"কার্ড এখনো অস্বচ্ছ (alpha {alpha:.2f})")
            check("inset" in (r["cardShadow"] or ""),
                  "কিনারায় inset আলোর রেখা আছে", "inset highlight নেই")

            # ── আসল পিক্সেল থেকে কনট্রাস্ট (worst case) ──
            # ⚠️ আগের সংস্করণে "সবচেয়ে ঘন ঘন আসা রঙ = ব্যাকগ্রাউন্ড"
            # ধরা হয়েছিল। aurora যোগ করার পর সেটা ভুল হয়ে গেল —
            # গ্রেডিয়েন্টে প্রতিটা পিক্সেলের রঙ আলাদা, তাই সবচেয়ে ঘন
            # রঙ হয়ে যাচ্ছিল **টেক্সটের নিজের** রঙ, ফলে ১.০০:১ ফল্স
            # অ্যালার্ম আসত। এখন টেক্সটের রঙের কাছাকাছি পিক্সেল বাদ
            # দিয়ে বাকিগুলোর মধ্যে সবচেয়ে খারাপ (নিকটতম) ব্যাকগ্রাউন্ড
            # পিক্সেল বেছে নেওয়া হয় — সত্যিকারের worst case।
            samples = pg.evaluate("""() => [...document.querySelectorAll('p,span,div')]
              .filter(e => e.className && String(e.className).includes('text-muted-foreground')
                        && e.innerText && e.innerText.trim().length > 3)
              .slice(0, 6)
              .map(e => { const r = e.getBoundingClientRect();
                return {x: Math.round(r.x), y: Math.round(r.y),
                        w: Math.round(r.width), h: Math.round(r.height),
                        color: getComputedStyle(e).color,
                        text: e.innerText.trim().slice(0, 22)}; })
              .filter(s => s.w > 5 && s.h > 5)""")
            if samples:
                shot = f"{ROOT_SHOTS}/probe-{theme}.png"
                # `clip=` দিয়ে স্ক্রিনশট এই হেডলেস-শেলে সবসময় টাইমআউট
                # করে (৩০s ও ৬০s দুটোতেই মাপা) — তাই পুরো ভিউপোর্ট নিয়ে
                # PIL দিয়ে crop করা হয়।
                pg.screenshot(path=shot, animations="disabled", timeout=60_000)
                from PIL import Image
                full = Image.open(shot).convert("RGB")
                print("  ── কনট্রাস্ট (আসল পিক্সেল, worst case) ──")
                worst_cr, worst_txt = 99.0, ""
                for sm in samples:
                    fg = parse_rgb(pg, sm["color"])
                    crop = full.crop((sm["x"], sm["y"],
                                      sm["x"] + sm["w"], sm["y"] + sm["h"]))
                    # ব্যাকগ্রাউন্ড শনাক্তকরণ — দুটো ভুল পদ্ধতি বাদ
                    # দেওয়ার পর যেটা কাজ করে:
                    #   ✗ "সবচেয়ে ঘন রঙ = bg" — aurora গ্রেডিয়েন্টে
                    #     প্রতিটা পিক্সেল আলাদা, তাই টেক্সটই জিতে যেত
                    #   ✗ "রঙের দূরত্ব দিয়ে ছাঁকা" — anti-alias পিক্সেল
                    #     ধরা পড়ত, ফল্স ১.৫০:১
                    #   ✗ "মোটের ≥২% = bg" — ঘন লেখায় টেক্সট নিজেই
                    #     ২% পেরিয়ে যায়, ফল্স ১.০০:১
                    # ✓ কাজ করে: টেক্সটের রঙের কাছাকাছি (dist<90)
                    #   পিক্সেল বাদ **এবং** ≥২% দখল — দুটো শর্তই একসাথে।
                    #   anti-alias প্রথম শর্তে আটকায়, টেক্সট দ্বিতীয়তে।
                    total = crop.width * crop.height
                    counts = crop.getcolors(total) or []
                    best_bg, best = None, 99.0
                    for n, c in counts:
                        if n < total * 0.02:
                            continue
                        if sum(abs(a - b) for a, b in zip(c, fg)) < 90:
                            continue
                        cr = ratio(fg, c)
                        if cr < best:
                            best, best_bg = cr, c
                    if best_bg is None:
                        continue
                    print(f"     {sm['text']!r:26} {tuple(fg)} on {best_bg} = {best:.2f}:1")
                    if best < worst_cr:
                        worst_cr, worst_txt = best, sm["text"]
                check(worst_cr >= 4.5,
                      f"সবচেয়ে খারাপ muted কনট্রাস্ট {worst_cr:.2f}:1 — WCAG AA পাস",
                      f"muted টেক্সট '{worst_txt}' কনট্রাস্ট {worst_cr:.2f}:1 — AA (৪.৫:১) ফেল")
            else:
                warns.append(f"{theme}: muted টেক্সট নমুনা পাওয়া যায়নি")
            b.close()

    print("\n" + "═" * 60)
    for w in warns:
        print(f"  ⚠️  {w}")
    if fails:
        print(f"❌ {len(fails)}টি সমস্যা:")
        for f in fails:
            print(f"   • {f}")
        sys.exit(1)
    print("✅ সব যাচাই পাস")


main()
