#!/usr/bin/env bash
# 首页 slide 系统回归测试：加页 / 加圆点 / 新页面入口后，确认导航仍然对得上、
# 并且新页在手机上没被 100vh 裁掉。
#   bash tests/run-index.sh
set -uo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/.." && pwd)
PORT=${PORT:-9150}
CHROME=${CHROME:-/usr/bin/google-chrome}

command -v "$CHROME" >/dev/null 2>&1 || { echo "❌ 需要 Chrome（可用 CHROME=… 指定）"; exit 1; }

cd "$ROOT" || exit 1          # 静态服务必须以站点根为目录，否则 ../index.html 找不到
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT

ready=0
for _ in $(seq 1 60); do
  curl -sf "http://127.0.0.1:$PORT/index.html" >/dev/null 2>&1 && { ready=1; break; }
  sleep 0.25
done
[ "$ready" = 1 ] || { echo "❌ 静态服务起不来（端口 $PORT 被占？）"; exit 1; }

echo "▸ Chrome 跑首页用例 …"
PROF=$(mktemp -d)
DOM=$(timeout 150 "$CHROME" --headless=new --disable-gpu --no-sandbox \
      --user-data-dir="$PROF" --virtual-time-budget=60000 --dump-dom \
      "http://127.0.0.1:$PORT/tests/index.slides.harness.html" 2>/dev/null)
rm -rf "$PROF"

REPORT=$(printf '%s' "$DOM" | python3 -c \
  'import sys,re,html; t=sys.stdin.read(); m=re.search(r"<pre id=\"harness\">(.*?)</pre>", t, re.S); print(html.unescape(m.group(1)) if m else "")')

if [ -z "$REPORT" ]; then
  echo "❌ 没拿到测试报告（Chrome 超时，或首页脚本被拦）"
  exit 1
fi

printf '%s\n' "$REPORT"
echo "────────────────────────────────"
if printf '%s' "$REPORT" | grep -q 'ALL PASS'; then
  echo "✅ 首页导航与新页面入口正常"
  exit 0
fi
echo "❌ 有用例失败"
exit 1
