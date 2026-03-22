#!/bin/bash
# 准备 EdgeOne Pages 部署文件

OUTPUT_DIR="./deploy"
SOURCE_DIR="."

echo "清理旧的部署目录..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

echo "复制部署文件..."
cp -r "$SOURCE_DIR/index.html" "$OUTPUT_DIR/"
cp -r "$SOURCE_DIR/css" "$OUTPUT_DIR/"
cp -r "$SOURCE_DIR/js" "$OUTPUT_DIR/"
cp -r "$SOURCE_DIR/APCSA" "$OUTPUT_DIR/"
cp -r "$SOURCE_DIR/APCSP" "$OUTPUT_DIR/"
cp -r "$SOURCE_DIR/APPhysicsC" "$OUTPUT_DIR/"

echo ""
echo "✅ 部署文件已准备好！"
echo ""
echo "部署目录: $OUTPUT_DIR"
echo "部署大小: $(du -sh "$OUTPUT_DIR" | cut -f1)"
echo ""
echo "请将 deploy/ 文件夹上传到 EdgeOne Pages"
