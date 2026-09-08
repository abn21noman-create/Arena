"""Real-browser mobile UX acceptance test (390×844 by default).

The suite uses a disposable real Admin session against the configured PostgreSQL
database. It checks representative high-traffic pages, fixed navigation,
interactive target size, route titles, the grouped/searchable More sheet and
the application-level real-data search dialog. The exact disposable user is
removed in a finally block.
"""
from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
import time

import requests
from playwright.sync_api import sync_playwright

from lib.live_test_support import (
    ROOT,
    cleanup_ephemeral_user,
    get_playwright_cookie,
    register_ephemeral_user,
    write_report,
)

BASE = os.environ.get("BASE_URL", "http://localhost:3000")
WIDTH = int(os.environ.get("W", "390"))
HEIGHT = int(os.environ.get("H", "844"))
MIN_NAV_GAP = 8
MIN_TAP = 24  # WCAG 2.5.8 minimum
PAGES = ["/dashboard", "/learn", "/practice", "/planner", "/focus", "/settings"]
EXPECTED_TITLES = {
    "/dashboard": "ড্যাশবোর্ড | HSC Ultimate",
    "/learn": "পড়াশোনা | HSC Ultimate",
    "/practice": "MCQ অনুশীলন | HSC Ultimate",
    "/planner": "প্ল্যানার | HSC Ultimate",
    "/focus": "Strict Focus | HSC Ultimate",
    "/settings": "সেটিংস | HSC Ultimate",
}
LAUNCH_ARGS = [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-features=CDPScreenshotNewSurface",
]

PASSED: list[str] = []
FAILED: list[tuple[str, str]] = []
_managed_server: subprocess.Popen | None = None


def check(name: str, condition: bool, detail: str = "") -> None:
    if condition:
        PASSED.append(name)
        print(f"  ✅ {name}" + (f" — {detail}" if detail else ""))
    else:
        FAILED.append((name, detail))
        print(f"  ❌ {name} — {detail}")


def server_alive() -> bool:
    try:
        return requests.get(f"{BASE}/api/health", timeout=5).status_code == 200
    except requests.RequestException:
        return False


def start_managed_server(wait: int = 120) -> bool:
    global _managed_server
    log = open("/tmp/hsc-mobile-ux-server.log", "a")
    server_env = dict(os.environ)
    server_env.setdefault("AUTH_TRUST_HOST", "true")
    _managed_server = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=ROOT,
        stdout=log,
        stderr=subprocess.STDOUT,
        env=server_env,
        preexec_fn=os.setsid,
    )
    deadline = time.time() + wait
    while time.time() < deadline:
        if server_alive():
            return True
        if _managed_server.poll() is not None:
            return False
        time.sleep(2)
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


MEASURE_JS = """
() => {
  const vw = document.documentElement.clientWidth;
  const output = {
    overflow: {
      doc: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      client: vw,
    },
    wide: [],
    smallTaps: [],
    nav: null,
    covered: [],
  };

  document.querySelectorAll('*').forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.left < -500) return;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return;
    let clipped = false;
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      const parentStyle = getComputedStyle(parent);
      if (parentStyle.overflowX === 'hidden' || parentStyle.overflowX === 'clip') {
        clipped = true;
        break;
      }
    }
    if (!clipped && rect.right > vw + 1) {
      output.wide.push({
        tag: element.tagName,
        right: Math.round(rect.right),
        text: (element.innerText || '').trim().slice(0, 35),
      });
    }
  });

  document.querySelectorAll('a,button,[role="button"],input,select,textarea').forEach((element) => {
    const style = getComputedStyle(element);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.pointerEvents === 'none' ||
      element.getAttribute('aria-hidden') === 'true'
    ) return;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // A native checkbox/radio may be visually tiny while its wrapping label is
    // the actual clickable target. Validate the effective label target instead
    // of reporting that accessible pattern as a false positive.
    if (element.tagName === 'INPUT' && ['checkbox', 'radio'].includes(element.type)) {
      const label = element.closest('label');
      const labelRect = label?.getBoundingClientRect();
      if (labelRect && labelRect.width >= %(min_tap)d && labelRect.height >= %(min_tap)d) return;
    }
    if (rect.width < %(min_tap)d || rect.height < %(min_tap)d) {
      output.smallTaps.push({
        tag: element.tagName,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        label: (element.getAttribute('aria-label') || element.innerText || '').trim().slice(0, 35),
      });
    }
  });

  const nav = [...document.querySelectorAll('nav')]
    .find((element) => getComputedStyle(element).position === 'fixed');
  if (nav) {
    const navRect = nav.getBoundingClientRect();
    output.nav = { top: Math.round(navRect.top), height: Math.round(navRect.height) };
    const root = document.getElementById('main-content') || document.body;
    root.querySelectorAll('*').forEach((element) => {
      if (element.children.length > 0) return;
      const text = (element.innerText || '').trim();
      if (!text) return;
      const rect = element.getBoundingClientRect();
      if (rect.height > 0 && rect.bottom > navRect.top + 2 && rect.top < navRect.bottom - 2) {
        output.covered.push(text.slice(0, 40));
      }
    });
  }

  output.wide = output.wide.slice(0, 8);
  output.smallTaps = output.smallTaps.slice(0, 8);
  output.covered = output.covered.slice(0, 8);
  return output;
}
""" % {"min_tap": MIN_TAP}


def measure_page(path: str, cookie: dict) -> dict:
    with sync_playwright() as playwright:
        executable_path = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE") or None
        browser = playwright.chromium.launch(args=LAUNCH_ARGS, executable_path=executable_path)
        context = browser.new_context(
            viewport={"width": WIDTH, "height": HEIGHT},
            color_scheme="dark",
            locale="bn-BD",
            is_mobile=True,
            has_touch=True,
        )
        context.add_cookies([cookie])
        page = context.new_page()
        page_errors: list[str] = []
        page.on("pageerror", lambda error: page_errors.append(str(error)[:180]))
        try:
            page.goto(f"{BASE}{path}", wait_until="domcontentloaded", timeout=180_000)
            page.wait_for_function(
                "() => (document.body?.innerText || '').trim().length > 40",
                timeout=90_000,
            )
            try:
                page.wait_for_load_state("networkidle", timeout=20_000)
            except Exception:
                pass
            page.wait_for_function(
                "() => [...document.querySelectorAll('nav')]"
                ".some((nav) => getComputedStyle(nav).position === 'fixed')",
                timeout=45_000,
            )
            expected_title = EXPECTED_TITLES[path]
            try:
                page.wait_for_function(
                    "(expected) => document.title === expected",
                    arg=expected_title,
                    timeout=5_000,
                )
            except Exception:
                pass
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(800)
            result = page.evaluate(MEASURE_JS)
            result["title"] = page.title()
            result["pageErrors"] = page_errors

            if path == "/dashboard":
                page.get_by_role("button", name="আরও মেনু খোলো").click()
                sheet = page.get_by_role("dialog")
                sheet.wait_for(state="visible", timeout=15_000)
                module_search = page.get_by_label("মডিউল খুঁজুন")
                module_search.fill("ফোকাস")
                page.wait_for_timeout(250)
                focus_links = sheet.locator('a[href="/focus"]').count()
                sheet_metrics = sheet.evaluate(
                    """(element) => ({
                      clientWidth: element.clientWidth,
                      scrollWidth: element.scrollWidth,
                      clientHeight: element.clientHeight,
                      scrollHeight: element.scrollHeight
                    })"""
                )
                result["moreMenu"] = {
                    "visible": sheet.is_visible(),
                    "focusMatches": focus_links,
                    "metrics": sheet_metrics,
                }

                # The compact global-search action closes the sheet first, then
                # opens the single app-level command palette.
                page.get_by_label("Academic কনটেন্ট খোঁজো").click()
                page.get_by_role("combobox", name="সব কনটেন্টে সার্চ").wait_for(
                    state="visible", timeout=15_000
                )
                result["globalSearchVisible"] = True
            return result
        finally:
            browser.close()


def main() -> int:
    identity = None
    only = os.environ.get("ONLY")
    pages = [path for path in PAGES if not only or path in set(only.split(","))]
    try:
        if not server_alive() and not start_managed_server():
            print("❌ server চালু করা যায়নি")
            return 1

        identity, http_session = register_ephemeral_user(BASE, role="ADMIN", prefix="mobile")
        cookie = get_playwright_cookie(http_session)
        if not cookie:
            print("❌ Auth.js session cookie পাওয়া যায়নি")
            return 1
        print(f"Real mobile session ready · viewport {WIDTH}×{HEIGHT} · credentials hidden\n")

        page_results = {}
        for path in pages:
            print(f"=== {path} ===")
            try:
                result = measure_page(path, cookie)
                page_results[path] = result
            except Exception as error:
                check(f"{path} real browser render", False, str(error).splitlines()[0][:160])
                continue

            overflow = result["overflow"]
            check(
                f"{path} mobile viewport",
                overflow["client"] == WIDTH,
                f"clientWidth={overflow['client']}",
            )
            check(
                f"{path} horizontal overflow নেই",
                overflow["doc"] <= WIDTH and overflow["body"] <= WIDTH and not result["wide"],
                json.dumps({"overflow": overflow, "wide": result["wide"]}, ensure_ascii=False)[:220],
            )
            check(
                f"{path} bottom navigation visible",
                bool(result["nav"]),
                str(result["nav"]),
            )
            check(
                f"{path} content bottom-nav এ ঢাকা নয়",
                not result["covered"],
                json.dumps(result["covered"], ensure_ascii=False),
            )
            check(
                f"{path} interactive targets ≥{MIN_TAP}px",
                not result["smallTaps"],
                json.dumps(result["smallTaps"], ensure_ascii=False)[:220],
            )
            check(
                f"{path} contextual browser title",
                result["title"] == EXPECTED_TITLES[path],
                f"got={result['title']!r}, expected={EXPECTED_TITLES[path]!r}",
            )
            check(
                f"{path} unhandled browser error নেই",
                not result["pageErrors"],
                json.dumps(result["pageErrors"], ensure_ascii=False),
            )

            if path == "/dashboard":
                menu = result.get("moreMenu") or {}
                metrics = menu.get("metrics") or {}
                check("More menu real dialog visible", bool(menu.get("visible")))
                check("More menu module filter works", menu.get("focusMatches", 0) >= 1,
                      f"matches={menu.get('focusMatches')}")
                check(
                    "More menu horizontal overflow নেই",
                    metrics.get("scrollWidth", 1) <= metrics.get("clientWidth", 0),
                    str(metrics),
                )
                check("Mobile global content search opens", bool(result.get("globalSearchVisible")))

        report_path = write_report(
            "reports/mobile-ux-acceptance-current.json",
            {
                "suite": "mobile-ui-ux-real-browser",
                "baseUrl": BASE,
                "viewport": {"width": WIDTH, "height": HEIGHT},
                "realDatabase": True,
                "pages": pages,
                "summary": {
                    "pass": len(PASSED),
                    "fail": len(FAILED),
                    "total": len(PASSED) + len(FAILED),
                },
                "failed": [{"name": name, "detail": detail} for name, detail in FAILED],
                "results": page_results,
            },
        )
        print(f"\n=== {len(PASSED)} pass · {len(FAILED)} fail ===")
        print(f"Report: {report_path}")
        return 1 if FAILED else 0
    finally:
        if identity is not None:
            try:
                print(f"Exact disposable mobile user cleanup: {cleanup_ephemeral_user(identity)}")
            except Exception as error:
                print(f"❌ mobile user cleanup: {error!r}")
        stop_managed_server()


if __name__ == "__main__":
    sys.exit(main())
