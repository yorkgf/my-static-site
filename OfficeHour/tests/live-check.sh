#!/bin/bash
# 上线后自检：确认学生页真的在读后端数据（而不是退回内嵌快照）
# 用法： bash OfficeHour/tests/live-check.sh https://1300190563-xxxx.ap-shanghai.tencentscf.com
#       不带参数则测本地 http://127.0.0.1:9202
set -uo pipefail
cd "$(dirname "$0")/../.."
API="${1:-http://127.0.0.1:9202}"
PORT=9204

echo "目标后端：$API"
curl -sf "$API/api/health" >/dev/null || { echo "❌ $API/api/health 不通，先确认函数已部署、环境变量已配"; exit 1; }
COUNT=$(curl -sf "$API/api/officehours" | python3 -c "import json,sys;print(json.load(sys.stdin).get('count',0))" 2>/dev/null)
echo "API 返回 $COUNT 条排班"
[ "${COUNT:-0}" -gt 0 ] || { echo "❌ API 通了但返回 0 条 —— 多半是 OH_TERM 配错学期，或还没导入数据"; echo "   导入： node OfficeHour/api/scripts/seed.mjs --apply"; exit 1; }

python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1

OUT=$(mktemp -d)
timeout 120 google-chrome --headless=new --disable-gpu --no-sandbox \
  --user-data-dir="$OUT" --virtual-time-budget=20000 \
  --dump-dom "http://127.0.0.1:$PORT/OfficeHour/tests/officehour.live.html?api=$API" 2>/dev/null \
  | python3 -c "
import sys,re,html
d=sys.stdin.read()
m=re.search(r'<pre id=\"out\">(.*?)</pre>',d,re.S)
t=re.search(r'<title>(.*?)</title>',d)
print(html.unescape(m.group(1)).strip() if m else '(页面未执行完，可能被拦截)')
print('RESULT='+(t.group(1) if t else '?'))"
rm -rf "$OUT"
