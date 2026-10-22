#!/usr/bin/env python3
"""Validate lecture coverage and recompute authored answers with Python and R."""

from collections import Counter
import json
import math
import os
from pathlib import Path
import shutil
import statistics
import subprocess

ROOT = Path(__file__).resolve().parents[1]
NODE = os.environ.get("NODE_BINARY", "node")
RSCRIPT = os.environ.get("RSCRIPT_BINARY", shutil.which("Rscript"))
questions = json.loads(subprocess.check_output([
    NODE, "-e",
    'global.window={};require("./data_mining_prediction_questions.js");console.log(JSON.stringify({questions:window.DATA_MINING_PREDICTED_QUESTION_DATA,exercises:window.DATA_MINING_PREDICTION_EXERCISE_COVERAGE}));',
], cwd=ROOT))
exercises = questions["exercises"]
questions = questions["questions"]
PAGE_COUNTS = {1: 68, 2: 51, 3: 42, 4: 63, 5: 49}
assert len(questions) == 167
assert len(questions) == len({q["id"] for q in questions})
assert len(questions) == len({q["prompt"] for q in questions})
assert all(sum(q["lecture"] == lecture for q in questions) >= 20 for lecture in PAGE_COUNTS)


def sse(values):
    return sum((x - statistics.mean(values)) ** 2 for x in values)


def calculate(case):
    operation = case["op"]
    x = case.get("x")
    y = case.get("y")
    if operation == "mean":
        return statistics.mean(x)
    if operation == "median":
        return statistics.median(x)
    if operation == "variance":
        return sse(x) / (len(x) - case["ddof"])
    if operation == "sqrt":
        return math.sqrt(x)
    if operation in {"covariance", "correlation"}:
        cross = sum((a - statistics.mean(x)) * (b - statistics.mean(y)) for a, b in zip(x, y))
        return cross / len(x) if operation == "covariance" else cross / math.sqrt(sse(x) * sse(y))
    if operation == "ratio":
        return x / y * case.get("scale", 1)
    if operation == "control":
        return case["mean"] + case["sign"] * 3 * case["sd"]
    if operation in {"z", "t"}:
        z = (x - case["mean"]) / case["sd"]
        return z if operation == "z" else 50 + 10 * z
    if operation == "distance":
        return math.dist(x, y)
    if operation == "subtract":
        return x - y
    if operation == "sse":
        return sse(x)
    if operation == "ward":
        return sse(x + y) - sse(x) - sse(y)
    if operation == "dot":
        return sum(a * b for a, b in zip(x, y))
    if operation == "contribution":
        return x[case["index"]] / sum(x) * case.get("scale", 1)
    if operation == "sum":
        return sum(x)
    if operation == "components":
        return next(i for i in range(1, len(x) + 1) if sum(x[:i]) >= case["threshold"])
    raise AssertionError(operation)


python_count = 0
r_cases = []
for q in questions:
    label = q["id"]
    assert q["category"] == "data-mining-prediction" and q["semester"] == "second", label
    assert all(q[field] for field in ["prompt", "answer", "topic", "explanation", "slideReference"]), label
    assert q["pages"] and all(1 <= p <= PAGE_COUNTS[q["lecture"]] for p in q["pages"]), label
    assert q["type"] in {"single", "multiple", "matching", "text", "free"}, label
    assert len(set(q["choices"])) == len(q["choices"]), label
    if q["type"] == "single":
        assert q["answer"] in q["choices"], label
    elif q["type"] == "multiple":
        assert all(a in q["choices"] for a in q["answer"].split(" / ")), label
    elif q["type"] == "matching":
        values = [c.split(": ", 1)[1] for c in q["choices"]]
        for pair in q["answer"].split(" / "):
            key, value = pair.split(" = ", 1)
            assert "=" not in key and value in values, (label, pair)
    for image in q["images"]:
        assert (ROOT / image).is_file(), (label, image)
    case = q.get("verification")
    if q["type"] == "text":
        assert case, (label, "Numeric question lacks independent verification")
        assert q["answerFormat"] == "number", label
    if not case:
        continue
    if "op" in case:
        result = calculate(case)
        if "digits" in case:
            result = round(result, case["digits"])
        assert math.isclose(result, float(q["answer"]), rel_tol=1e-9, abs_tol=1e-9), (label, result, q["answer"])
        python_count += 1
    if "r" in case:
        r_cases.append((q, case))

# Execute code in real R rather than attempting to emulate its indexing or defaults.
assert RSCRIPT, "Rscript is required to verify R execution-result questions"
commands = []
for i, (q, case) in enumerate(r_cases):
    commands.append(f'cat("CASE{i}\\t");cat(local({{{case["r"]}}}));cat("\\n")')
result = subprocess.check_output([RSCRIPT, "--vanilla", "-e", "\n".join(commands)], text=True)
lines = result.strip().splitlines()
assert len(lines) == len(r_cases), result
for i, ((q, case), line) in enumerate(zip(r_cases, lines)):
    key, value = line.split("\t", 1)
    assert key == f"CASE{i}", line
    if case.get("string"):
        assert value == q["answer"], (q["id"], value, q["answer"])
    else:
        numeric = float(value)
        if "digits" in case:
            numeric = round(numeric, case["digits"])
        assert math.isclose(numeric, float(q["answer"]), rel_tol=1e-6, abs_tol=1e-6), (q["id"], value, q["answer"])

by_id = {q["id"]: q for q in questions}
assert len(exercises) == 25
assert len({(row["lecture"], row["task"]) for row in exercises}) == 25
for row in exercises:
    assert row["questionIds"], row
    for key in row["questionIds"]:
        q = by_id[key]
        assert q["lecture"] == row["lecture"] and row["task"] in q["exerciseTasks"], row
        assert q["exerciseReference"] in q["slideReference"], key
for lecture, original_count in {1: 22, 2: 27, 3: 30, 4: 24, 5: 29}.items():
    assert all(f"data-mining-pred-{lecture:02}-{number:03}" in by_id for number in range(1, original_count + 1))

# Audit embedded figures and non-text numerical choices independently.
merges = [("C", "E"), ("A", "B"), ("D", "CE"), ("DCE", "AB"), ("F", "DCEAB")]
clusters = {name: {name} for name in "FDCEAB"}
partitions = []
for left, right in merges:
    combined = clusters.pop(left) | clusters.pop(right)
    clusters[left + right] = combined
    partitions.append([set(c) for c in clusters.values()])
assert sorted(map(len, partitions[1])) == [1, 1, 2, 2]
assert {frozenset(c) for c in partitions[2]} == {frozenset("F"), frozenset("DCE"), frozenset("AB")}
assert len(partitions[3]) == 2
assert [sum(row) for row in [[70, 180], [30, 120]]] == [250, 150]
assert 70 / 250 == 0.28 and 30 / 400 == 0.075
assert [sum(x) / 3 for x in [[20.301, 20.302, 20.300], [20.300, 20.302, 20.298], [20.299, 20.298, 20.300], [20.303, 20.305, 20.304], [20.299, 20.300, 20.301]]][3] > 20.303

coverage = {
    1: "定義、決定木・説明変数／目的変数、行列・R、平均・分散・不偏分散・標準偏差・共分散・相関、散布図、交絡・疑似相関・因果、相関行列（重要事項p.57、課題p.55〜56）",
    2: "折れ線・棒グラフ、PPM全4象限と推移・比率計算、管理図・管理限界・偏り・種類・ロット平均、パレート・ABC・ロングテール・市場集中、外れ値・中央値（重要事項p.51、課題p.20〜22・48〜50）",
    3: "箱ひげ図、標準化・偏差値、学習3種、距離・最近傍・重心、樹形図、階層型の処理・特徴・統合基準、ウォード平方和、k-meansの割当て・更新・初期値依存性・R指定（重要事項p.42、課題p.27〜28・40〜41）",
    4: "作図・ラベル・色分け、PCAの目的・直交軸・次元縮約、得点・係数、寄与率・累積寄与率・採用数・標準偏差からの計算、R出力、クラスタとの併用・軸解釈（重要事項p.63、課題p.26〜27・59〜62）",
    5: "ヒストグラム・度数・相対度数、正規分布・正規乱数、円グラフの作図と誤解、カテゴリ・リッカート・ローデータ、集計・列指定・R、モザイク・割合の分母、対応分析・行プロフィール・図の解釈、複数回答（重要事項p.49、課題p.30〜32・45〜48）",
}
doc = ["# データマイニング予想問題の範囲対応", "", f"第1〜5回から計{len(questions)}問。データマイニング小テストとは別の後期セット。用語選択、対応付け、図の読取り、数値計算、Rの実行結果、短文記述という知識工学の過去問の形式を参考にした予想であり、出題を保証しない。", "", "## 出題範囲と注意", "", "各回の重要事項・学習内容・例題・演習の技能を対象にする。ガイダンスの規則、インストール手順、外部配布CSVの全レコード暗記は対象外。CSVのない演習は、問題文に数値を示す自足した練習へ置き換えた。繰り返し説明されたスライドはテーマ単位で統合した。", "", "ページ番号はPDF先頭を1とした番号。記述は同義の解答を認めるため模範解答と照合して自己採点する。数値問題には単位・丸め・分散の分母・管理対象を明記。ウォード法の平方和の増加量と公式はp.36の定義を具体化した補足練習。", "", "### 原資料を読んだ際の注意", "", "- 第2回p.48は10日間という本文に対し表は9日分。欠けた日を補わず、掲載された日で出題した。", "- 第2回p.49のσは個々の値かロット平均かで管理限界が異なるため、曖昧な管理限界の数値を正解として固定しない。", "- 第3回p.7とp.6・9で英語の平均に表記差があるため、数値問題では平均65を明示した。", "- 第4回p.6の本文の『typeで点の形』はコードのpchと混同しやすい。問題では点の形をpch、点や線の描画方法をtypeとして区別した。", "- 第5回p.40の対応分析は導入の要約として扱い、単なる無重みPCAと完全に同じ実装だとは出題しない。カテゴリ間の距離だけから因果を断定しない。", "", "## 画像出典", "", "- assets/ref-dm-pred-dendrogram.png: 第3回PDF p.32の樹形図部分を直接切り出し。矢印・枝・破線・個体ラベルを保持。", "- assets/ref-dm-pred-mosaic.png: 第5回PDF p.38の度数表と図を直接切り出し。度数と合計を保持。", "", "## 補助確認したR公式資料", "", "- https://stat.ethz.ch/R-manual/R-devel/library/stats/html/hclust.html", "- https://stat.ethz.ch/R-manual/R-devel/library/stats/html/princomp.html", "- https://stat.ethz.ch/R-manual/R-devel/library/base/html/table.html", "", f"## 検証結果\n\nPythonによる数値再計算{python_count}件、実Rによる実行結果{len(r_cases)}件。両方に含まれる問題もある。図の枝・面積比、正答の選択肢内存在、ID・問題文重複、ページ範囲を検証。", ""]
for lecture in PAGE_COUNTS:
    items = [q for q in questions if q["lecture"] == lecture]
    doc.extend([f"## 第{lecture}回（{len(items)}問）", "", coverage[lecture], "", "| 問題ID | テーマ | PDFページ | 形式 |", "| --- | --- | --- | --- |"])
    doc.extend(f'| {q["id"]} | {q["topic"]} | {", ".join(map(str, q["pages"]))} | {q["type"]} |' for q in items)
    doc.append("")
doc.extend(["## 演習課題提出シートとの対応", "", "第1〜5回の提出シートにある全25課題を確認し、既存の132問に35問を追加した。重なる技能は再収録せず、各課題の関連問題へ参照を付けた。提出シートの記入済み解答は公式解答として扱わない。元データがない集計結果は問題文の所与の値として読み取る問題にし、因果の断定や実行ごとに変わるクラスタ番号の丸暗記は出題しない。", "", "- 第1回の元得点列・気温CSVは未添付。提出シートの平均・標準偏差・相関を所与の出力として明示し、その解釈・丸め・仮説を問う。", "- 第2回の飲料生産量、第3回の得点と5点の座標は入力値から再計算。第2回のロット平均のσは対象を明示。", "- 第3〜4回のEatOut.csv・okashi.csvは未添付のため、全データでのクラスタ割当てを保証した正解として転記しない。クラスタ読取り・方法比較・Rコードを既存問題で扱い、PCAは提示した標準偏差から分散と寄与率を再計算する。", "- 第4回課題6の『都市名』はお菓子データでは個体名（お菓子名）として扱う。", "- 第5回のクロス集計の行和・列和・条件付き割合を再計算。元の個票がないため、QA2は同形式の練習データと明示して扱う。", "- 数値入力は0.840と0.84のような等価な表記を認める。丸め条件を満たさない近似値や単位付きの回答は自動で正解にしない。", "", "### 追加画像", "", "- assets/ref-dm-exercise2-ppm.png: 第2回提出シートword/media/image3.pngのグラフを直接抽出。", "- assets/ref-dm-exercise4-scatter.png: 第4回提出シートword/media/image3.pngのグラフを直接抽出。", "- 提出シート本体、個人名、学籍番号、ファイルのメタデータは公開しない。", "", "| 回 | 課題 | 対応する問題ID |", "| --- | --- | --- |"])
doc.extend(f'| {row["lecture"]} | {row["task"]} | {", ".join(row["questionIds"])} |' for row in exercises)
(ROOT / "docs/data-mining-prediction-coverage.md").write_text("\n".join(doc), encoding="utf-8")
print(f"PASS: {len(questions)} questions; Python {python_count} calculations; R {len(r_cases)} cases; figures, choices, pages, uniqueness. Lectures: {dict(sorted(Counter(q['lecture'] for q in questions).items()))}")
