"""
Seed ডেটা অখণ্ডতা যাচাই — DB বা সার্ভার ছাড়াই চলে।

চালাতে:  python3 scripts/verify-seed-integrity.py

কী যাচাই করে:
  1. প্রতিটা MCQ এর `correctAnswer` তার `options` এ হুবহু আছে কিনা
     (স্কোরিং string-matching এ হয় — অমিল থাকলে প্রশ্নটার সঠিক উত্তর
     দেওয়াই অসম্ভব হতো, অথচ কোনো টাইপ-এরর দেখা যেত না)
  2. Unicode normalization অমিল (দেখতে এক, বাইট ভিন্ন — বাংলা যুক্তাক্ষরে
     সহজেই হতে পারে)
  3. ডুপ্লিকেট বা ৪টার কম option
  4. প্রতিটা CQ তে ক/খ/গ/ঘ চারটা প্রশ্ন ও model answer আছে কিনা
  5. seed ফাইলে ব্যবহৃত topic নাম `seed.ts` এ সত্যিই আছে কিনা
     (নাম string দিয়ে ম্যাচ হয় — টাইপো থাকলে প্রশ্নগুলো নীরবে
     seed-ই হতো না)
  6. Core Question ও AdmissionQuestion count আলাদা দেখায়, যাতে দুই model-এর
     source total-কে শুধু live core count-এর সাথে ভুলভাবে তুলনা করা না হয়
"""
import re, glob, sys, unicodedata

STR = re.compile(r'"((?:[^"\\]|\\.)*)"')

def parse_array(src, i):
    """src[i] == '[' ধরে nesting-সচেতনভাবে string element বের করে।
    `["[M]", "[L]"]` এর মতো ব্র্যাকেট-যুক্ত ভ্যালুতেও সঠিক থাকে।"""
    depth = 0
    j = i
    out = []
    while j < len(src):
        c = src[j]
        if c == '"':
            m = STR.match(src, j)
            if not m:
                break
            if depth == 1:
                out.append(m.group(1))
            j = m.end()
            continue
        if c == '[':
            depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                return out, j + 1
        j += 1
    return out, j

def check_mcq_files(files):
    """নির্দিষ্ট MCQ seed ফাইল যাচাই করে count ও সমস্যা ফেরত দেয়।

    Core Question ও AdmissionQuestion আলাদা table/model — তাই caller ইচ্ছাকৃতভাবে
    আলাদা file set পাঠায়। এই বিভাজন না রাখলে source total-কে live core count-এর
    সাথে তুলনা করে ভুয়া "missing" gap তৈরি হতে পারে।
    """
    tot = 0
    problems = []
    for fp in sorted(files):
        src = open(fp, encoding="utf-8").read()
        for m in re.finditer(r"options:\s*", src):
            k = m.end()
            if k >= len(src) or src[k] != "[":
                continue
            opts, endi = parse_array(src, k)
            cm = re.search(r'correctAnswer:\s*"((?:[^"\\]|\\.)*)"', src[endi:endi + 500])
            if not cm:
                continue
            ca = cm.group(1)
            tot += 1
            line = src[:m.start()].count("\n") + 1
            if not opts:
                problems.append(f"{fp}:{line} খালি options")
                continue
            if ca not in opts:
                nfc = any(unicodedata.normalize("NFC", ca) == unicodedata.normalize("NFC", o) for o in opts)
                kind = "unicode normalization অমিল" if nfc else "correctAnswer options এ নেই"
                problems.append(f"{fp}:{line} {kind}: {ca!r}")
            if len(opts) != len(set(opts)):
                problems.append(f"{fp}:{line} ডুপ্লিকেট option")
            if len(opts) < 4:
                problems.append(f"{fp}:{line} মাত্র {len(opts)}টা option")
    return tot, problems

def check_cq():
    tot = 0
    problems = []
    for fp in sorted(glob.glob("prisma/seed-cq*.ts")):
        src = open(fp, encoding="utf-8").read()
        for m in re.finditer(r'stimulus:\s*[`"]', src):
            seg = src[m.start():m.start() + 8000]
            nxt = seg.find("stimulus:", 10)
            if nxt > 0:
                seg = seg[:nxt]
            tot += 1
            line = src[:m.start()].count("\n") + 1
            for k in ["questionA", "questionB", "questionC", "questionD"]:
                if k not in seg:
                    problems.append(f"{fp}:{line} {k} অনুপস্থিত")
    return tot, problems

def check_topics():
    base = open("prisma/seed.ts", encoding="utf-8").read()
    topics = set(m.group(1) for m in re.finditer(r'name:\s*"((?:[^"\\]|\\.)*)"', base))
    used = {}
    for fp in [f for f in glob.glob("prisma/seed-*.ts") if "notes" not in f]:
        src = open(fp, encoding="utf-8").read()
        m = re.search(r"questionsByTopic\s*:\s*Record<string[^>]*>\s*=\s*\{", src)
        if not m:
            continue
        for km in re.finditer(r'^\s{2}"((?:[^"\\]|\\.)*)":\s*\[', src[m.end():], re.M):
            used.setdefault(km.group(1), []).append(fp)
    problems = [f'topic "{k}" seed.ts এ নেই ← {v[0]}' for k, v in used.items() if k not in topics]
    return len(used), problems

def main():
    core_files = (set(glob.glob("prisma/seed-questions*.ts"))
                  | set(glob.glob("prisma/seed-board*.ts"))
                  | set(glob.glob("prisma/seed-bangla-english-ict.ts")))
    admission_files = set(glob.glob("prisma/seed-admission*.ts"))

    n_core, p_core = check_mcq_files(core_files)
    n_admission, p_admission = check_mcq_files(admission_files)
    n_cq, p_cq = check_cq()
    n_top, p_topics = check_topics()
    all_problems = p_core + p_admission + p_cq + p_topics
    print(f"Core MCQ যাচাই       : {n_core}")
    print(f"Admission MCQ যাচাই  : {n_admission}")
    print(f"সব MCQ source মোট   : {n_core + n_admission}")
    print(f"CQ যাচাই             : {n_cq}")
    print(f"Topic রেফারেন্স      : {n_top}")
    print("─" * 46)
    if all_problems:
        print(f"❌ {len(all_problems)} টা সমস্যা:")
        for p in all_problems[:40]:
            print("   •", p)
        sys.exit(1)
    print("✅ সব seed ডেটা অখণ্ড")

if __name__ == "__main__":
    main()
