#!/bin/bash
# 跑 officehour.html 的浏览器测试（功能 + 响应式布局审计）
# 用法： bash OfficeHour/tests/run.sh              只跑不依赖后端的用例
#       bash OfficeHour/tests/run.sh --with-e2e   额外跑真实浏览器端到端（会启临时库+本地 API）
set -uo pipefail

cd "$(dirname "$0")/../.." || exit 1
PORT="${PORT:-8811}"
CHROME=$(command -v google-chrome || command -v chromium || command -v chromium-browser)

if [ -z "${CHROME:-}" ]; then
  echo "❌ 没找到 chrome/chromium，无法跑浏览器测试"; exit 1
fi

python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1.5

fail=0

# 两页的设计令牌必须一字不差（admin 页自带一份副本，防止配色漂移）
echo "──────── 设计令牌一致性 ────────"
python3 - <<'PY'
import re, sys, pathlib
stu = pathlib.Path('officehour.html').read_text(encoding='utf-8')
ade = pathlib.Path('officehour-admin.html').read_text(encoding='utf-8')
def block(s):
    i = s.index('/* ═══ 设计令牌')
    j = s.index('        body {', i)
    return s[i:j].rstrip()
a, b = block(stu), block(ade)
if a == b:
    print("  ✓ 两页 token 完全一致 (%d 行)" % a.count(chr(10)))
    sys.exit(0)
print("  ✗ 两页 token 不一致！学生页应作为基准同步到 admin 页")
import difflib
for line in list(difflib.unified_diff(a.splitlines(), b.splitlines(), lineterm=''))[:12]:
    print("    " + line)
sys.exit(1)
PY
[ $? -ne 0 ] && fail=1

for t in officehour.functional officehour.layout officehour.contrast; do
  echo "──────── $t ────────"
  dom=$(mktemp)
  "$CHROME" --headless=new --disable-gpu --no-sandbox \
    --user-data-dir="$(mktemp -d)" --virtual-time-budget=20000 \
    --dump-dom "http://127.0.0.1:$PORT/OfficeHour/tests/$t.html" > "$dom" 2>/dev/null
  title=$(grep -oP '(?<=<title>)[^<]*' "$dom" | head -1)
  echo "结果: $title"
  # 非预期标题说明没跑完或报错了
  case "$title" in
    *"ALL PASS"*|*"CLEAN"*|*"AA-OK"*) ;;
    *) fail=1 ;;
  esac
  # 打印失败项
  python3 - "$dom" <<'PY'
import re, html, sys
d = open(sys.argv[1]).read()
m = re.search(r'<pre id="out">(.*?)</pre>', d, re.S)
if not m:
    print("(无输出，测试可能没跑起来)"); sys.exit(0)
o = html.unescape(m.group(1))
print("  ✓%d  ✗%d" % (o.count("✓"), o.count("✗")))
bad = [l for l in o.splitlines() if l.strip().startswith("✗") or "THROW" in l or "UNCAUGHT" in l]
for l in bad[:20]:
    print("  " + l.strip())
sys.exit(1 if bad else 0)
PY
  rc=$?
  [ $rc -ne 0 ] && fail=1
  rm -f "$dom"
done

echo ""
echo ""
if [ "${1:-}" = "--with-e2e" ]; then
  echo "──────── 浏览器端到端（需 .env 里的 MONGO_URI）────────"
  if node OfficeHour/tests/e2e.mjs | tail -6; then :; else fail=1; fi
  echo ""
fi

if [ $fail -eq 0 ]; then echo "✅ 全部测试通过"; else echo "❌ 有测试失败"; fi
exit $fail
