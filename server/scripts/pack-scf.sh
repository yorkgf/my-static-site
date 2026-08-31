#!/bin/bash
# 打包 SCF Web 函数部署 zip
# 用法：bash scripts/pack-scf.sh
# 生成的 apbusiness-scf.zip 在 server/ 目录下，到 SCF 控制台「函数代码 → 上传 zip」上传
set -e
cd "$(dirname "$0")/.."

echo "安装生产依赖…"
npm install --production

chmod +x scf_bootstrap

echo "清理测试缓存（冒烟测试下载的 mongod 二进制不打包）…"
rm -rf node_modules/.cache

echo "打包…"
rm -f apbusiness-scf.zip
zip -r apbusiness-scf.zip scf_bootstrap src node_modules package.json \
  -x 'node_modules/.cache/*' '*.md' '*.map' >/dev/null

echo ""
echo "✅ 打包完成：$(pwd)/apbusiness-scf.zip ($(du -h apbusiness-scf.zip | cut -f1))"
echo "   上传到 SCF 控制台后，在「函数配置 → 环境变量」里设置 MONGO_URI / JWT_SECRET / TEACHER_PASSWORD。"
