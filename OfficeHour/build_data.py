#!/usr/bin/env python3
"""
从 OfficeHour/总课表.xlsx 重新生成 officehour.html 里内嵌的数据块。

改了 Excel（换老师、换教室、加节次）之后，在项目根执行：

    python3 OfficeHour/build_data.py

只替换 officehour.html 中 DATA-BEGIN / DATA-END 之间的内容，
页面样式和交互逻辑不受影响。

Excel 结构约定
--------------
  A 列是节次标签，形如   第10节\n18:30-19:20
  B..F 列是 周一..周五，每格若干行，形如
      自习/周一 G10-1晚自习第一节 (26-27)/李楚翘@文体 114
  （节次以 A 列的「第N节」为准，格子里的「第一节」只是晚自习内部序号）
"""
import json
import re
import sys
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
XLSX = HERE / "总课表.xlsx"
PAGE = HERE.parent / "officehour.html"

DAY_COLS = {1: "周一", 2: "周二", 3: "周三", 4: "周四", 5: "周五"}
DAYS = list(DAY_COLS.values())

ROW_RE = re.compile(r"第\s*(\d+)\s*节.*?(\d{1,2}:\d{2})\s*[-–—~至]+\s*(\d{1,2}:\d{2})", re.S)
LINE_RE = re.compile(
    r"^自习\s*/\s*(?P<day>周[一二三四五六日])\s*(?P<cls>\S+)\s*晚自习第[一二三四五六七八九十\d]+节"
    r"(?:\s*\((?P<term>[^)]*)\))?\s*/\s*(?P<teacher>[^@]+?)\s*@\s*(?P<room>.+?)\s*$"
)

# 姓名 -> (全拼, 声母缩写)，供学生用拼音搜索。新增老师必须补上，否则构建报错。
PINYIN = {
    "李楚翘": ("lichuqiao", "lcq"), "宋雯雯": ("songwenwen", "sww"), "简汐洳": ("jianxiru", "jxr"),
    "张诗文": ("zhangshiwen", "zsw"), "赵睿佳": ("zhaoruijia", "zrj"), "郭林": ("guolin", "gl"),
    "高峰": ("gaofeng", "gf"), "晏海花": ("yanhaihua", "yhh"), "刘展佑": ("liuzhanyou", "lzy"),
    "邵春晖": ("shaochunhui", "sch"), "李梅诺": ("limeinuo", "lmn"), "朱专": ("zhuzhuan", "zz"),
    "凌峰杰": ("lingfengjie", "lfj"), "刘丹": ("liudan", "ld"), "卢琦": ("luqi", "lq"),
    "刘禹函": ("liuyuhan", "lyh"), "陈逸飞": ("chenyifei", "cyf"), "石鑫玥": ("shixinyue", "sxy"),
    "赵丁霓": ("zhaodingni", "zdn"), "石琪": ("shiqi", "sq"),
}


TIMES = {}   # 节次号 -> "18:30–19:20"


def parse():
    try:
        import pandas as pd
    except ImportError:
        sys.exit("需要 pandas + openpyxl：pip install pandas openpyxl")
    if not XLSX.exists():
        sys.exit(f"找不到源文件：{XLSX}")

    df = pd.read_excel(XLSX, header=None)
    records, terms, bad = [], set(), []
    for ridx in range(df.shape[0]):
        row = df.iloc[ridx]
        label = row[0]
        if not isinstance(label, str):
            continue
        rm = ROW_RE.search(label)
        if not rm:
            continue
        period, start, end = int(rm.group(1)), rm.group(2), rm.group(3)
        TIMES[period] = f"{start}–{end}"

        for cidx, day in DAY_COLS.items():
            raw = row[cidx]
            if not isinstance(raw, str):
                continue
            for line in raw.split("\n"):
                line = line.strip()
                if not line:
                    continue
                m = LINE_RE.match(line)
                if not m:
                    bad.append(line)
                    continue
                if m.group("term"):
                    terms.add(m.group("term").strip())
                records.append({
                    "day": day, "p": period, "cls": m.group("cls"),
                    "teacher": m.group("teacher").strip(), "room": m.group("room").strip(),
                })

    if bad:
        print(f"⚠️  {len(bad)} 行没匹配上（Excel 格式变了？）：", file=sys.stderr)
        for b in bad[:8]:
            print("   ", repr(b), file=sys.stderr)
    if not records:
        sys.exit("❌ 一条都没解析出来，请检查 Excel 格式")
    return records, terms


def integrity_check(records):
    warn = []
    seen = {}
    for r in records:
        seen.setdefault((r["day"], r["p"], r["teacher"]), []).append(r["cls"])
    for (day, p, t), classes in seen.items():
        if len(classes) > 1:
            warn.append(f"{day} 第{p}节 {t} 同时被排进 {'、'.join(classes)}")
    # 故意不检查“同一时段多个班共用一个教室”——这不算冲突：值班地点常常是老师
    # 办公室，多位老师同时段在一个间里答疑互不影响。真正要报的只有上面那条。
    missing = {r["teacher"] for r in records} - set(PINYIN)
    if missing:
        warn.append("缺拼音条目：" + "、".join(sorted(missing)))
    return warn


def build_js(records, terms):
    q = lambda s: json.dumps(s, ensure_ascii=False)
    periods = sorted({r["p"] for r in records})
    classes = sorted({r["cls"] for r in records})
    names = sorted({r["teacher"] for r in records}, key=lambda n: PINYIN.get(n, ("~~", ""))[0])
    missing = [n for n in names if n not in PINYIN]
    if missing:
        sys.exit("❌ 请在 build_data.py 的 PINYIN 里补上这些老师：" + "、".join(missing))

    rows = sorted(records, key=lambda r: (DAYS.index(r["day"]), r["p"], classes.index(r["cls"])))
    term = " / ".join(sorted(terms)) if terms else ""

    period_rows = ",\n".join(
        "      { p: %d, label: %s, time: %s }" % (p, q("第%d节" % p), q(TIMES[p]))
        for p in periods
    )
    out = [
        "/* DATA-BEGIN —— 由 OfficeHour/build_data.py 自动生成，请勿手改" + ("（学期 %s）" % term if term else "") + " */",
        "// 学期初快照：后端可用时页面会被 /api/officehours 的实时数据覆盖，这份只作兜底。",
        "// slots 每行：[星期, 节次, 班级, 老师, 教室]",
        "const SNAPSHOT = {",
        '    generatedAt: %s,' % q(datetime.now().astimezone().strftime("%Y-%m-%d %H:%M")),
        '    term: %s,' % q(term),
        "    slots: [",
        ",\n".join("      [" + ", ".join(q(x) for x in (r["day"], r["p"], r["cls"], r["teacher"], r["room"])) + "]"
                   for r in rows),
        "    ],",
        "    // py = 全拼, ini = 首字母",
        "    teachers: [",
        ",\n".join("      { name: %s, py: %s, ini: %s }" % (q(n), q(PINYIN[n][0]), q(PINYIN[n][1])) for n in names),
        "    ],",
        "    // 节次与时间（取自 Excel 的节次行标签）",
        "    periods: [",
        period_rows,
        "    ],",
        "};",
        "/* DATA-END */",
    ]
    return "\n".join(out)


def build_json(records, terms):
    """产出 OfficeHour/data.json —— 入库脚本 seed.mjs 的唯一数据源。"""
    periods = sorted({r["p"] for r in records})
    return {
        "schema": 1,
        "term": " / ".join(sorted(terms)) if terms else "",
        "source": XLSX.name,
        "generatedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
        "days": [d for d in DAYS if any(r["day"] == d for r in records)],
        "periods": [{"p": p, "label": "第%d节" % p, "time": TIMES.get(p, "")} for p in periods],
        "slots": [
            {
                "day": r["day"],
                "period": r["p"],
                "cls": r["cls"],
                "teacherName": r["teacher"],
                "room": r["room"],
            }
            for r in sorted(records, key=lambda r: (DAYS.index(r["day"]), r["p"], r["cls"]))
        ],
    }


def main():
    global TIMES
    records, terms = parse()
    for w in integrity_check(records):
        print("⚠️  ", w, file=sys.stderr)
    js = build_js(records, terms)

    html = PAGE.read_text(encoding="utf-8")
    pat = re.compile(r"/\* DATA-BEGIN .*? DATA-END \*/", re.S)
    if pat.search(html):
        html = pat.sub(lambda _: js, html, count=1)
    elif "__DATA__" in html:
        html = html.replace("__DATA__", js)
    else:
        sys.exit(f"❌ {PAGE.name} 里找不到 DATA-BEGIN/END 标记或 __DATA__ 占位符")

    PAGE.write_text(html, encoding="utf-8")

    # 同步导出 JSON，供后端入库/导入接口使用
    import tempfile
    payload = build_json(records, terms)
    out = HERE / "data.json"
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=HERE, delete=False) as tf:
        json.dump(payload, tf, ensure_ascii=False, indent=1)
        tmp = tf.name
    Path(tmp).replace(out)

    print(f"✅ 已更新 {PAGE.name}")
    print(f"✅ 已导出 {out.name}（{len(payload['slots'])} 条，seed.mjs 的输入）")
    print(f"   {len(records)} 条排班 · 节次 {sorted(TIMES)} · {len({r['teacher'] for r in records})} 位老师 · "
          f"{len({r['cls'] for r in records})} 个班级 · 学期 {terms}")


if __name__ == "__main__":
    main()
