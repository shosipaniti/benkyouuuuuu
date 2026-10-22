#!/usr/bin/env python3
"""Verify authored SQL answers with SQLite and validate the question dataset."""

import json
import os
from pathlib import Path
import sqlite3
import subprocess

ROOT = Path(__file__).resolve().parents[1]
NODE = os.environ.get("NODE_BINARY", "node")
data = json.loads(subprocess.check_output([
    NODE, "-e",
    'global.window={};require("./database_prediction_questions.js");console.log(JSON.stringify({questions:window.DATABASE_PREDICTED_QUESTION_DATA,fixtures:window.DATABASE_PREDICTION_FIXTURES}));',
], cwd=ROOT))
questions = data["questions"]
fixtures = data["fixtures"]


def connect(fixture=None):
    connection = sqlite3.connect(":memory:")
    for name, table in fixtures.get(fixture, {}).items():
        columns = ",".join(f'"{column}"' for column in table["columns"])
        connection.execute(f'CREATE TABLE "{name}" ({columns})')
        placeholders = ",".join("?" for _ in table["columns"])
        connection.executemany(f'INSERT INTO "{name}" VALUES ({placeholders})', table["rows"])
    return connection


assert len(questions) == len({q["id"] for q in questions})
assert len(questions) >= 140
page_counts = {1: 71, 2: 56, 3: 85, 4: 56, 5: 72}
sql_checked = 0
for question in questions:
    label = question["id"]
    assert question["category"] == "database-prediction" and question["semester"] == "second", label
    assert question["prompt"] and question["answer"] and question["explanation"] and question["topic"], label
    assert question["pages"] and all(1 <= page <= page_counts[question["lecture"]] for page in question["pages"]), label
    choices = question["choices"]
    assert len(choices) == len(set(choices)), label
    if question["type"] == "single":
        assert question["answer"] in choices, label
    elif question["type"] == "multiple":
        assert all(value in choices for value in question["answer"].split(" / ")), label
    elif question["type"] == "matching":
        options = [choice.split(": ", 1)[1] for choice in choices]
        for pair in question["answer"].split(" / "):
            assert "=" not in pair.split(" = ", 1)[0], label
            assert pair.split(" = ", 1)[1] in options, label
    for image in question["images"]:
        assert (ROOT / image).is_file(), (label, image)
    case = question.get("verification")
    if not case:
        continue
    connection = connect(case.get("fixture"))
    mode = case["mode"]
    if mode == "largest-choice":
        values = [(choice, connection.execute(choice).fetchone()[0]) for choice in choices]
        maximum = max(value for _, value in values)
        winners = [choice for choice, value in values if value == maximum]
        assert winners == [question["answer"]], (label, values)
    else:
        rows = connection.execute(case["query"]).fetchall()
        if mode == "scalar":
            result = str(rows[0][0])
        elif mode == "rowCount":
            result = f"{len(rows)}行"
        elif mode == "column":
            result = "・".join(str(row[0]) for row in rows)
        else:
            raise AssertionError((label, mode))
        assert result == question["answer"], (label, result, question["answer"])
    connection.close()
    sql_checked += 1

# Verify the model SQL used in the written-answer tasks as well.
written_sql = [q for q in questions if q["type"] == "free" and q["answer"].startswith("SELECT")]
expected_written = [
    [("山田",), ("高橋",), ("山本",)],
    [("書籍", "山田"), ("玩具", "山本")],
]
assert len(written_sql) == len(expected_written)
for question, expected in zip(written_sql, expected_written):
    with connect("staff") as connection:
        assert sorted(connection.execute(question["answer"]).fetchall()) == sorted(expected), question["id"]

# Confirm that the constraint explanation uses non-generated, explicitly NOT NULL keys.
with sqlite3.connect(":memory:") as connection:
    connection.execute("PRAGMA foreign_keys=ON")
    connection.executescript("CREATE TABLE parent(id TEXT PRIMARY KEY NOT NULL); CREATE TABLE child(id TEXT PRIMARY KEY NOT NULL,parent_id TEXT REFERENCES parent(id)); INSERT INTO parent VALUES('p1'); INSERT INTO child VALUES('c1','p1');")
    for statement in ["INSERT INTO parent VALUES('p1')", "INSERT INTO parent VALUES(NULL)", "INSERT INTO child VALUES('c2','missing')", "DELETE FROM parent WHERE id='p1'"]:
        try:
            connection.execute(statement)
        except sqlite3.IntegrityError:
            continue
        raise AssertionError(statement)

lines = ["# データベース予想問題の範囲対応", "", "第1〜5回の学習内容・重要事項・例題・演習を対象とする。ガイダンスの出席・成績規則や、OSのインストール手順は出題範囲に含めない。資料中の同じ例の段階的な説明は、テーマ単位で統合した。", "", "知識工学の過去問から参照した形式：用語選択、穴埋め対応、順序・分類、数値や実行結果、短文記述。内容と解答根拠はデータベースの資料に基づく。", "", "SQLは問題文中に示したデータで検証する。講義のsample.db全件の値を暗記させる問題ではない。記述は同義の正解を認めるため自己採点とする。", ""]
for lecture in range(1, 6):
    items = [q for q in questions if q["lecture"] == lecture]
    lines.extend([f"## 第{lecture}回（{len(items)}問）", "", "| 問題ID | テーマ | 参照ページ | 形式 |", "| --- | --- | --- | --- |"])
    for q in items:
        lines.append(f'| {q["id"]} | {q["topic"]} | {", ".join(map(str, q["pages"]))} | {q["type"]} |')
    lines.append("")
(ROOT / "docs/database-prediction-coverage.md").write_text("\n".join(lines), encoding="utf-8")
print(f"PASS: {len(questions)} questions, {sql_checked} SQL answer cases, {len(written_sql)} written SQL examples, source pages, answer choices and constraints (SQLite {sqlite3.sqlite_version}).")
