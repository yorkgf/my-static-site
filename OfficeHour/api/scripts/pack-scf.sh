#!/bin/bash
# 打包 Office Hour 云函数（腾讯云 SCF Web 函数）
# 用法：bash OfficeHour/api/scripts/pack-scf.sh
# 生成 officehour-scf.zip，到 SCF 控制台「函数代码 → 上传 zip」上传即可。
set -euo pipefail
cd "$(dirname "$0")/.."
HERE=$(pwd)

# 依赖与 server/（词云与小组 API）完全一致，离线时可复用它的 node_modules
DONOR="${OH_DONOR_NODE_MODULES:-$HERE/../../../server/node_modules}"

have_all() {
  local dir="$1"
  for p in express cors mongodb jsonwebtoken bcryptjs helmet dotenv express-rate-limit; do
    [ -d "$dir/$p" ] || return 1
  done
  return 0
}

# ── 1. 确保有真实可用的依赖目录 ────────────────────────────────
SRC_NM=""
if [ -L node_modules ]; then
  # 本地开发常用软链，打包必须实体化，否则 zip 里只有一个链接、SCF 起不来
  real=$(readlink -f node_modules)
  if have_all "$real"; then
    echo "检测到 node_modules 是软链 → 实体化：$real"
    SRC_NM="$real"
  else
    echo "❌ node_modules 软链指向的目标不完整：$real"
    exit 1
  fi
elif [ -d node_modules ] && have_all node_modules; then
  echo "✓ 依赖已就绪"
else
  echo "安装生产依赖…"
  if npm install --production 2>/dev/null && have_all node_modules; then
    echo "  ✓ npm 安装完成"
  elif [ -d "$DONOR" ] && have_all "$DONOR"; then
    echo "  ⚠️ npm 不可用（离线/无源），复用已有依赖：$DONOR"
    SRC_NM="$DONOR"
  else
    echo "❌ 既不能 npm install，也找不到可复用的 node_modules"
    echo "   可用 OH_DONOR_NODE_MODULES=/path/to/node_modules 指定"
    exit 1
  fi
fi

# ── 2. 在临时目录里组装，保证 node_modules 一定是真实文件 ──────
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT
echo "组装打包目录…"
mkdir -p "$STAGE/pkg"
cp -R scf_bootstrap src package.json "$STAGE/pkg/"
chmod +x "$STAGE/pkg/scf_bootstrap"

if [ -n "$SRC_NM" ]; then
  cp -RL "$SRC_NM" "$STAGE/pkg/node_modules"
else
  cp -RL node_modules "$STAGE/pkg/node_modules"
fi
rm -rf "$STAGE/pkg/node_modules/.cache"

# ── 3. 压缩 ───────────────────────────────────────────────────
echo "打包…"
rm -f officehour-scf.zip
( cd "$STAGE/pkg" && zip -qr "$HERE/officehour-scf.zip" . -x '*.md' '*.map' '*.test.js' )

# ── 4. 自检：关键文件必须在包里 ───────────────────────────────
missing=""
for need in scf_bootstrap package.json src/index.js src/app.js src/routes/officehours.js \
            node_modules/express/package.json node_modules/mongodb/package.json \
            node_modules/jsonwebtoken/package.json node_modules/bcryptjs/package.json; do
  unzip -l officehour-scf.zip "$need" >/dev/null 2>&1 || missing="$missing $need"
done
# 软链打包的典型症状：包很小且没有依赖文件
entries=$(unzip -l officehour-scf.zip 2>/dev/null | tail -1 | awk '{print $2}')

echo ""
if [ -n "$missing" ]; then
  echo "❌ 打包自检失败，zip 里缺少：$missing"
  exit 1
fi
echo "✅ 打包完成：$HERE/officehour-scf.zip ($(du -h officehour-scf.zip | cut -f1), ${entries:-?} 个文件)"
echo ""
echo "上传后在 SCF「函数配置 → 环境变量」里设置："
echo "   MONGO_URI   mongodb://<轻量服务器IP>:27017"
echo "   DB_NAME     GHA"
echo "   JWT_SECRET  <与 FADsys 配成同一个值可实现免登录 SSO>"
echo "   OH_TERM     26-27"
echo "   （可选）ADMIN_GROUPS=S,A   JWT_SECRET_OLD=<轮换期旧密钥>"
