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
    'global.window={};require("./database_prediction_questions.js");console.log(JSON.stringify({questions:window.DATABASE_PREDICTED_QUESTION_DATA,fixtures:window.DATABASE_PREDICTION_FIXTURES,exercises:window.DATABASE_PREDICTION_EXERCISE_COVERAGE}));',
], cwd=ROOT))
questions = data["questions"]
fixtures = data["fixtures"]
exercises = data["exercises"]


def connect(fixture=None):
    connection = sqlite3.connect(":memory:")
    for name, table in fixtures.get(fixture, {}).items():
        columns = ",".join(f'"{column}"' for column in table["columns"])
        connection.execute(f'CREATE TABLE "{name}" ({columns})')
        placeholders = ",".join("?" for _ in table["columns"])
        connection.executemany(f'INSERT INTO "{name}" VALUES ({placeholders})', table["rows"])
    return connection


assert len(questions) == len({q["id"] for q in questions})
assert len(questions) == 205
assert len(questions) == len({q["prompt"] for q in questions})
page_counts = {1: 71, 2: 56, 3: 85, 4: 56, 5: 72}
sql_checked = 0
for question in questions:
    label = question["id"]
    assert question["category"] == "database-prediction" and question["semester"] == "second", label
    assert question["prompt"] and question["answer"] and question["explanation"] and question["topic"], label
    if question["lecture"] == 6:
        assert question["pages"] == [] and question["exerciseTasks"], label
        assert "演習課題提出シート" in question["slideReference"] and "p." not in question["slideReference"], label
    else:
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
    if case.get("setup"):
        connection.executescript(case["setup"])
    mode = case["mode"]
    if mode in {"fd", "fd-key"}:
        table = fixtures[case["fixture"]][case["table"]]
        def closure(attributes):
            result = set(attributes)
            while True:
                previous = set(result)
                for fd in case["dependencies"]:
                    if set(fd["left"]) <= result:
                        result.update(fd["right"])
                if previous == result:
                    return result
        # A sample can refute an FD, but cannot establish it as a business rule.
        for fd in case["dependencies"]:
            values = {}
            for row in table["rows"]:
                left = tuple(row[table["columns"].index(c)] for c in fd["left"])
                right = tuple(row[table["columns"].index(c)] for c in fd["right"])
                assert left not in values or values[left] == right, (label, fd)
                values[left] = right
        if mode == "fd-key":
            assert closure(case["key"]) == set(table["columns"]), label
            assert all(closure([c for c in case["key"] if c != removed]) != set(table["columns"]) for removed in case["key"]), label
        else:
            assert {check["choice"] for check in case["checks"]} == set(choices), label
            implied = [check["choice"] for check in case["checks"] if set(check["right"]) <= closure(check["left"])]
            assert implied == question["answer"].split(" / "), label
    elif mode == "lossless":
        original = fixtures[case["fixture"]][case["originalTable"]]
        assert sorted(connection.execute(case["query"]).fetchall()) == sorted(map(tuple, original["rows"])), label
        parts = [fixtures[case["fixture"]][name] for name in case["parts"]]
        assert set.intersection(*(set(t["columns"]) for t in parts)) == set(case["determinant"]), label
        assert set.union(*(set(t["columns"]) for t in parts)) == set(original["columns"]), label
        product = parts[1]
        assert len({tuple(row[product["columns"].index(c)] for c in case["determinant"]) for row in product["rows"]}) == len(product["rows"]), label
    elif mode in {"mutation", "mutation-choice"}:
        if mode == "mutation":
            connection.executescript(question["answer"])
            assert sorted(connection.execute(case["query"]).fetchall()) == sorted(map(tuple, case["expectedRows"])), label
        else:
            winners = []
            for choice in choices:
                with connect(case["fixture"]) as candidate:
                    candidate.executescript(choice)
                    if sorted(candidate.execute(case["query"]).fetchall()) == sorted(map(tuple, case["expectedRows"])):
                        winners.append(choice)
            assert winners == [question["answer"]], label
    elif mode == "written":
        rows = connection.execute(question["answer"]).fetchall()
        assert sorted(rows) == sorted(map(tuple, case["expectedRows"])), (label, rows)
    elif mode == "matching":
        answers = dict(pair.split(" = ", 1) for pair in question["answer"].split(" / "))
        for check in case["checks"]:
            rows = connection.execute(check["query"]).fetchall()
            result = f"{len(rows)}行" if check["mode"] == "rowCount" else str(rows[0][0])
            assert result == answers[check["label"]], (label, check, rows)
    elif mode == "largest-choice":
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
        assert result == case.get("expectedValue", question["answer"]), (label, result, question["answer"])
    connection.close()
    sql_checked += 1

# Verify the model SQL used in the written-answer tasks as well.
written_sql = [q for q in questions if q["type"] == "free" and q["answer"].startswith("SELECT") and not q.get("verification")]
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

by_id = {q["id"]: q for q in questions}
assert len(exercises) == len({(row["lecture"], row["task"]) for row in exercises}) == 29
for row in exercises:
    assert row["questionIds"], row
    for key in row["questionIds"]:
        q = by_id[key]
        assert q["lecture"] == row["lecture"] and row["task"] in q["exerciseTasks"], row
        assert q["exerciseReference"] in q["slideReference"], key
for lecture, count in {1: 27, 2: 31, 3: 30, 4: 17, 5: 48}.items():
    assert all(f"database-pred-{lecture:02}-{n:03}" in by_id for n in range(1, count + 1))

assert len([q for q in questions if q["lecture"] == 6]) == 22
with connect("exerciseExamCorrected") as connection:
    assert connection.execute("SELECT AVG(score) FROM exam_results WHERE faculty='X学部'").fetchone()[0] == 80.5
    assert connection.execute("SELECT MAX(score) FROM exam_results WHERE id>=1236").fetchone()[0] == 93
    assert connection.execute("SELECT AVG(score) FROM exam_results WHERE faculty='X学部' AND grade=2").fetchone()[0] == 90.5

lines = ["# データベース予想問題の範囲対応", "", "第1〜5回の学習内容・重要事項・例題・演習と、第6回の演習を対象とする。第6回スライドは未提供のため、架空のページ番号を付けず、演習シートの課題番号を出典にする。ガイダンスの出席・成績規則や、OSのインストール手順は出題範囲に含めない。資料中の同じ例の段階的な説明は、テーマ単位で統合した。", "", "知識工学の過去問から参照した形式：用語選択、穴埋め対応、順序・分類、数値や実行結果、短文記述。内容と解答根拠はデータベースの資料に基づく。", "", "SQLは問題文中に示したデータで検証する。講義のsample.db全件の値を暗記させる問題ではない。記述は同義の正解を認めるため自己採点とする。", ""]
for lecture in range(1, 7):
    items = [q for q in questions if q["lecture"] == lecture]
    lines.extend([f"## 第{lecture}回（{len(items)}問）", "", "| 問題ID | テーマ | 参照ページ | 形式 |", "| --- | --- | --- | --- |"])
    for q in items:
        source = ", ".join(map(str, q["pages"])) if q["pages"] else q["exerciseReference"]
        lines.append(f'| {q["id"]} | {q["topic"]} | {source} | {q["type"]} |')
    lines.append("")
lines.extend(["## 演習課題提出シートとの対応", "", "第1〜5回の全22課題（第5回の時間のある人向け課題8・9も含む）を確認した。既存153問を保持し、具体例30問を追加して計183問にした。重複する出題は関連問題への課題参照で統合した。", "", "### 出題と検証の方針", "", "- 記入済み解答を公式解答とはみなさず、問題の入力値・SQLをSQLiteで検証する。", "- 第2回のcities/products、第5回の商品集合・直積・R/S/T・外部結合・注文表は、提出シートと講義スライドの入力を照合した。数値の違う別の例を混ぜない。", "- sample.dbやcd_jacket.dbの全データは未添付。社員・売場・CDの実行結果問題は、講義と同じスキーマの練習用データを問題文にすべて示し、そのデータでの正解を求める。sample.db全件の正解とは称しない。", "- 第1回課題2に混入したiris・ニューラルネットの文は財布の設問と無関係なので出題に取り込まない。", "- 第3回・第4回の列名のlylicist_id/composter_id/salalyやdepartment表、全角・曲がった引用符は、定義のlyricist_id/composer_id/salary/departmentsと半角引用符を使う。元の提出シートや既存問題の答えは書き換えない。", "- 第4回の『売場の住所』はstores.addressを意味することをスキーマで明記する。入社時年齢は年の差で判定する講義上の近似であり、誕生日による満年齢と区別する。", "- 第5回課題7の左・右・完全外部結合では未対応行をNULLで補い、一致する商品の複数販売を勝手に重複除去しない。課題9のJOINだけではPCの2件の注文を合計しない。", "- 提出シート本体、個人名・学籍番号、メタデータは公開しない。参照は授業回と課題番号で示す。", "", "| 回 | 課題 | 対応する問題ID |", "| --- | --- | --- |"])
lines.extend(f'| {row["lecture"]} | {row["task"]} | {", ".join(row["questionIds"])} |' for row in exercises)
lines.extend(["", "## 第6回演習の追加", "", "既存183問のIDと解答は保持し、第6回の全7課題から22問を追加して計205問にした。既存の一般的なドットコマンドや集計関数の定義をそのまま重ねず、第6回のファイル、データ、更新の手順に沿った問題を作成した。", "", "- 課題1は表示オプションと表作成、挿入、内容確認を区別する。SQLite起動時の版番号は環境依存なので出題しない。", "- 課題2〜4は、初期状態、合否判定後、X学部への加点後、id=1238の修正後を区別し、UPDATEをSQLiteで実行して全行の値を検証した。文字列には標準的な半角シングルクォートを使う。", "- 課題4の最終集計はX学部平均80.5、id>=1236の最高点93、X学部かつ2年生の平均90.5。", "- 課題5・6では業務条件を明示し、主キーとFDを属性閉包で検証する。記入欄にある基本FDだけを、論理的に導ける全FDと称さない。少数のサンプルで偶然値が一意でも業務上のFDは証明できない。", "- 課題7の分解は共通の商品コードを両側へ残し、商品3行、明細4行。結合後の全タプルが元の表と一致することも検証した。", "- 第6回スライドは未提供。第6回の出典は演習課題番号であり、架空のスライド番号は記していない。提出者の氏名・学番、提出指示、ファイル本体は公開しない。", "", "補助に確認した公式資料：", "- https://www.sqlite.org/lang_update.html", "- https://www.db-book.com/slides-dir/PDF-dir/ch7.pdf", ""])
(ROOT / "docs/database-prediction-coverage.md").write_text("\n".join(lines), encoding="utf-8")
print(f"PASS: {len(questions)} questions, {sql_checked} SQL/FD answer cases, {len(written_sql)} written SQL examples, source pages, exercise references, answer choices and constraints (SQLite {sqlite3.sqlite_version}).")
