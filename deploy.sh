#!/bin/bash
# 准备 EdgeOne Pages 部署文件
set -uo pipefail

OUTPUT_DIR="./deploy"
SOURCE_DIR="."

echo "清理旧的部署目录..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

echo "复制根页面（所有 *.html）..."
shopt -s nullglob
root_html=( "$SOURCE_DIR"/*.html )
if [ ${#root_html[@]} -eq 0 ]; then
  echo "❌ 没找到任何根页面"
  exit 1
fi
for f in "${root_html[@]}"; do
  cp "$f" "$OUTPUT_DIR/"
  echo "   + $(basename "$f")"
done

echo "复制全局资源..."
cp -r "$SOURCE_DIR/css" "$OUTPUT_DIR/"
cp -r "$SOURCE_DIR/js" "$OUTPUT_DIR/"

echo "复制课程目录..."
for d in APCSA APCSP APCyber APPhysicsC APPhysics1 APBusiness APStat; do
  if [ -d "$SOURCE_DIR/$d" ]; then
    cp -r "$SOURCE_DIR/$d" "$OUTPUT_DIR/"
    echo "   + $d/"
  else
    echo "   ⚠️  缺少课程目录: $d"
  fi
done

# ── 链接完整性检查 ────────────────────────────────────────────
# 页面里的本地链接必须真的在部署包里，防止「新增了页面却忘了部署」。
echo ""
echo "检查本地链接是否都在部署包里..."
BROKEN=$(mktemp)
find "$OUTPUT_DIR" -name '*.html' -print0 | while IFS= read -r -d '' f; do
  base=$(dirname "$f")
  grep -oE '(href|src)="[^"]+"' "$f" 2>/dev/null \
    | sed -E 's/^(href|src)="//; s/"$//; s/%20/ /g' \
    | grep -vE '^(https?:|mailto:|data:|javascript:|//|#)' | sort -u | while read -r link; do
        target="${link%%[?#]*}"
        [ -z "$target" ] && continue
        # 普通文件 / 目录 / Quartz clean URL（无扩展名）三种形式任一存在即算通
        if [ -e "$base/$target" ] || [ -e "$base/$target.html" ] || [ -e "$base/$target/index.html" ]; then
          continue
        fi
        echo "${f#"$OUTPUT_DIR/"} → $target" >> "$BROKEN"
      done
done

sort -u "$BROKEN" -o "$BROKEN"
if [ -s "$BROKEN" ]; then
  echo "⚠️  $(wc -l < "$BROKEN") 个链接在 deploy/ 里找不到目标文件："
  sed 's/^/   ❌ /' "$BROKEN"
else
  echo "✅ 所有本地链接均可达"
fi
rm -f "$BROKEN"

echo ""
echo "✅ 部署文件已准备好！"
echo ""
echo "部署目录: $OUTPUT_DIR"
echo "部署大小: $(du -sh "$OUTPUT_DIR" | cut -f1)"
echo ""
echo "请将 deploy/ 文件夹上传到 EdgeOne Pages"
