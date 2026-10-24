#!/usr/bin/env python3
"""Validate guide coverage, source pages, and executable SQL/R worked examples."""

from collections import Counter
import json
import math
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess

ROOT = Path(__file__).resolve().parents[1]
data = json.loads(subprocess.check_output([
    os.environ.get("NODE_BINARY", "node"), "-e",
    'global.window={};require("./database_prediction_questions.js");require("./data_mining_prediction_questions.js");require("./second_semester_guides.js");console.log(JSON.stringify({guides:window.SECOND_SEMESTER_STUDY_GUIDES,db:window.DATABASE_PREDICTED_QUESTION_DATA,dm:window.DATA_MINING_PREDICTED_QUESTION_DATA,fixtures:window.DATABASE_PREDICTION_FIXTURES}));',
], cwd=ROOT))
page_counts = {"database-prediction": {1: 71, 2: 56, 3: 85, 4: 56, 5: 72}, "data-mining-prediction": {1: 68, 2: 51, 3: 42, 4: 63, 5: 49}}
questions = {"database-prediction": data["db"], "data-mining-prediction": data["dm"]}
r_cases = []
sql_cases = 0
coverage = []
for category, guide in data["guides"].items():
    tabs = guide["tabs"]
    assert len(tabs) == (9 if category == "database-prediction" else 8)
    ids = [tab["id"] for tab in tabs]
    assert len(ids) == len(set(ids))
    assert len(guide["questionTabIds"]) == len(questions[category])
    for q in questions[category]:
        assert guide["questionTabIds"][q["id"]] in ids, q["id"]
    counts = Counter(guide["questionTabIds"].values())
    for tab in tabs:
        assert all(tab[field] for field in ["id", "label", "sources", "lead", "sections", "examTip"])
        assert counts[tab["id"]] > 0
        assert len(tab["sections"]) >= 3 and any(s.get("steps") for s in tab["sections"])
        for reference in tab["references"]:
            assert reference["pages"]
            assert all(1 <= page <= page_counts[category][reference["lecture"]] for page in reference["pages"])
        for section in tab["sections"]:
            assert section["title"] and (section.get("points") or section.get("steps"))
            case = section.get("verification")
            if not case:
                continue
            code = section["code"]
            if case["engine"] == "r":
                r_cases.append((tab["id"], code, case["expected"]))
                continue
            assert case["engine"] == "sqlite", case
            with sqlite3.connect(":memory:") as connection:
                for name, table in data["fixtures"].get(case.get("fixture"), {}).items():
                    columns = ",".join(f'"{column}"' for column in table["columns"])
                    connection.execute(f'CREATE TABLE "{name}" ({columns})')
                    placeholders = ",".join("?" for _ in table["columns"])
                    connection.executemany(f'INSERT INTO "{name}" VALUES ({placeholders})', table["rows"])
                if case.get("setup"):
                    connection.executescript(case["setup"])
                rows = connection.execute(code).fetchall()
                assert sorted(rows) == sorted(map(tuple, case["expectedRows"])), (tab["id"], rows)
                sql_cases += 1
        coverage.append((category, tab["label"], counts[tab["id"]], tab["sources"]))

rs = os.environ.get("RSCRIPT_BINARY", shutil.which("Rscript"))
assert rs, "Rscript is required for the guide examples"
commands = [f'cat("CASE{i}\\t");cat(paste(as.character(local({{{code}}})),collapse="|"));cat("\\n")' for i, (_, code, _) in enumerate(r_cases)]
output = subprocess.check_output([rs, "--vanilla", "-e", "\n".join(commands)], text=True).strip().splitlines()
assert len(output) == len(r_cases), output
for i, ((name, _, expected), line) in enumerate(zip(r_cases, output)):
    key, text = line.split("\t", 1)
    assert key == f"CASE{i}", line
    values = list(map(float, text.split("|")))
    assert len(values) == len(expected), (name, values, expected)
    assert all(math.isclose(a, b, rel_tol=1e-8, abs_tol=1e-8) for a, b in zip(values, expected)), (name, values, expected)

# These routes distinguish similar wording but different underlying operations.
expected_routes = {
    "database-prediction": {"曲の作曲者を検索": "cd", "同じ上司番号での結合": "join", "注文の外部キー": "design", "COUNTの違い": "aggregate", "販売リストの4種の結合": "outer", "課題のSとTの結合": "algebra", "SQLiteの起動": "sqlite", "副問い合わせ": "select", "文字列結合": "select", "店舗5の売場の商品": "join", "商の意味": "algebra", "空のDBを開いたときの確認": "sqlite"},
    "data-mining-prediction": {"標準偏差から寄与率": "pca", "実習得点のR標準偏差": "statistics", "4次元の5点の重心": "distance", "ウォード法と重心間距離": "clustering", "クラスタリングとの併用": "pca", "管理図の異常日の特定": "control", "条件付き割合": "cross", "度数の計算": "charts", "モザイクプロット": "cross", "ロット平均の計算": "control"},
}
for category, cases in expected_routes.items():
    for topic, expected in cases.items():
        q = next(q for q in questions[category] if q["topic"] == topic)
        assert data["guides"][category]["questionTabIds"][q["id"]] == expected, topic

lines = ["# 後期予想問題の詳しい解説", "", "データベース183問とデータマイニング167問、計350問から詳しい解説を開ける。問題に対応するテーマを初期表示し、他のテーマへも移動できる。問題文と正解は変更しない。", "", "講義の第1〜5回と演習を基礎に、用語の区別、手順を追った例、SQLやRコード、間違えやすい条件を収録した。参照ページはPDF先頭を1とした番号。", "", f"## 計算例の検証\n\nSQL {sql_cases}例をSQLite、R {len(r_cases)}例を実Rで実行した。実行に必要な練習データは既存問題のfixtureまたは各例の検証用setupから作る。コードをアプリの閲覧時に実行する機能ではない。", "", "SQLiteのNULL、結合、集計の仕様とRの分散、k-means、主成分分析の出力も公式資料を補助に確認した。", "", "- https://www.sqlite.org/lang_select.html", "- https://stat.ethz.ch/R-manual/R-devel/library/stats/html/cor.html", "- https://stat.ethz.ch/R-manual/R-devel/library/stats/html/kmeans.html", "- https://stat.ethz.ch/R-manual/R-devel/library/stats/html/princomp.html", "", "## テーマと出典", "", "| 科目 | テーマ | 最初に表示する問題数 | 講義資料 |", "| --- | --- | --- | --- |"]
lines.extend(f'| {"データベース" if category == "database-prediction" else "データマイニング"} | {label} | {count} | {source} |' for category, label, count, source in coverage)
(ROOT / "docs/second-semester-guides.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"PASS: {sum(len(q) for q in questions.values())} questions routed to 17 guide tabs; {sql_cases} SQL and {len(r_cases)} R worked examples; source pages and topic boundaries.")
