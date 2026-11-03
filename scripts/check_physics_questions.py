#!/usr/bin/env python3
"""Check the last-page assignment coverage and optional local PDF references."""

import argparse
import json
from itertools import combinations_with_replacement
import math
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--source-dir", type=Path)
args = parser.parse_args()
data = json.loads(subprocess.check_output([
    os.environ.get("NODE_BINARY", "node"), "-e",
    'global.window={};require("./physics_questions.js");require("./physics_guides.js");console.log(JSON.stringify({questions:window.PHYSICS_ADVANCED_QUESTION_DATA,guide:window.SECOND_SEMESTER_STUDY_GUIDES["physics-advanced"]}));',
], cwd=ROOT))
questions = data["questions"]
guide = data["guide"]
expected = {
    4: {"page": 17, "answers": ["熱平衡", "マクスウェル分布", "大きい"], "terms": ["縮退圧", "パウリの排他律", "エネルギー準位"]},
    5: {"page": 18, "answers": ["液体窒素", "超伝導", "レーザー冷却"], "terms": ["状態数", "エントロピー", "確率"]},
    6: {"page": 18, "answers": ["磁気モーメント", "常磁性体", "準安定状態"], "terms": ["地磁気", "強磁性", "準安定状態"]},
}
assert len(questions) == len({q["id"] for q in questions}) == 12
assert len({q["prompt"] for q in questions}) == 12
source_pages = {}
if args.source_dir:
    from pypdf import PdfReader
    for lecture, spec in expected.items():
        pdf = PdfReader(args.source_dir / f"物理の世界と先端技術_{lecture:02}.pdf")
        assert len(pdf.pages) == spec["page"], lecture
        source_pages[lecture] = [page.extract_text() for page in pdf.pages]

for lecture, spec in expected.items():
    items = [q for q in questions if q["lecture"] == lecture]
    assert len(items) == 4 and [q["number"] for q in items] == [1, 2, 3, 4]
    assert [q["answer"] for q in items[:3]] == spec["answers"]
    assert items[3]["requiredTerms"] == spec["terms"]
    for q in items:
        assert q["category"] == "physics-advanced" and q["semester"] == "second"
        assert q["assignmentPage"] == spec["page"]
        assert q["prompt"] and q["explanation"] and q["source"]
        assert q["pages"] and all(1 <= p < spec["page"] for p in q["pages"])
        assert f"p.{spec['page']}（講義内課題）" in q["slideReference"]
        assert "解説の根拠" in q["slideReference"]
        assert not any(word in q["prompt"] for word in ["CITポータル", "解散", "クラスプロファイル"])
        if q["type"] == "single":
            assert len(q["choices"]) == len(set(q["choices"])) == 3
            assert q["answer"] in q["choices"] and not q["requiredTerms"]
        else:
            assert q["type"] == "free" and not q["choices"]
            assert all(term in q["answer"] and term in q["prompt"] for term in spec["terms"])
            assert "自己採点" in q["explanation"]
        if source_pages:
            assignment = source_pages[lecture][-1]
            assert all(choice in assignment for choice in q["choices"])
            assert all(term in assignment for term in q["requiredTerms"])

tabs = guide["tabs"]
assert len(tabs) == len({tab["id"] for tab in tabs}) == 6
assert set(guide["questionTabIds"]) == {q["id"] for q in questions}
topics = {4: ("equilibrium", "degeneracy"), 5: ("cooling", "entropy"), 6: ("magnetism", "paleomagnetism")}
for q in questions:
    assert guide["questionTabIds"][q["id"]] == topics[q["lecture"]][q["type"] == "free"], q["id"]
for tab in tabs:
    assert all(tab[key] for key in ["label", "lead", "sources", "related", "examTip"])
    assert len(tab["sections"]) >= 4 and any(section.get("steps") for section in tab["sections"])
    for ref in tab["references"]:
        assert all(1 <= page <= expected[ref["lecture"]]["page"] for page in ref["pages"])
    for section in tab["sections"]:
        assert section["title"] and (section.get("points") or section.get("steps"))

assert len(guide["workedExamples"]) == 4
for example in guide["workedExamples"]:
    assert example["tabId"] in {tab["id"] for tab in tabs}
    if example["kind"] == "gas-ratio":
        a, b = example["before"], example["after"]
        result = (b["n"] / a["n"]) * (b["temperature"] / a["temperature"]) * (a["volume"] / b["volume"])
        assert math.isclose(result, example["expected"])
    elif example["kind"] == "state-counts":
        states = list(combinations_with_replacement(example["levels"], example["particles"]))
        assert [sum(sum(s) == total for s in states) for total in example["totals"]] == example["expected"]
        assert [list(s) for s in states if sum(s) == 6] == example["expectedSix"]
    elif example["kind"] == "entropy-change":
        ratio = math.prod(example["after"]) / math.prod(example["before"])
        assert math.isclose(ratio, example["expectedRatio"])
        assert math.isclose(math.log(ratio), example["expectedDeltaOverKb"])
    else:
        assert example["kind"] == "kelvin-celsius"
        assert math.isclose(example["kelvin"] - 273.15, example["expected"])

lines = ["# 物理の世界と先端技術の講義内課題", "", "後期の独立セット。第4〜6回PDFの最終ページにある穴埋め3か所と文章作成1問を対象とする。穴埋めを1か所ずつに分け、各回4問、全12問（選択9問・記述3問）とした。末尾以外の小問や独自の予想問題は追加していない。", "", "選択肢は原課題の各空欄の3語を保持。文章作成は原課題の指定語句を保持し、模範解答は講義本文に基づいて作成した例として自己採点にする。完全一致による不正解判定はしない。講義への提出や解散などの指示は問題に含めない。", "", "## 対応表", "", "| 問題ID | 課題 | 課題ページ | 解説の根拠ページ |", "| --- | --- | --- | --- |"]
for q in questions:
    lines.append(f'| {q["id"]} | 第{q["lecture"]}回 {q["assignmentPart"]} | {q["assignmentPage"]} | {", ".join(map(str, q["pages"]))} |')
lines.extend(["", "## 基礎からの詳しい解説", "", "解答後のボタンから6テーマを開く。全12問を関連テーマへ対応づけ、初期表示する。問題文、正解、ID、進捗の保存キーは変更しない。", "", "| テーマ | 初期表示する問題 | 参照資料 |", "| --- | --- | --- |"])
for tab in tabs:
    ids = [q["id"] for q in questions if guide["questionTabIds"][q["id"]] == tab["id"]]
    assert ids, tab["id"]
    lines.append(f'| {tab["label"]} | {", ".join(ids)} | {tab["sources"]} |')
lines.extend(["", "講義の状態数W=2,4,5は、区別しない3粒子を0〜4Eの準位へ重複を許して入れる模型として全列挙で検証した。状態数10→16に対するΔS/k_B=ln(1.6)、77 K→−196.15℃、一定のn,Vで300 K→600 Kの圧力比2も独立に計算した。これらは解説例であり、追加の問題ではない。", "", "## 解答の確認", "", "- PDF最終ページ3枚をレンダリングして原文、空欄番号、選択肢、指定語句を目視確認した。根拠ページは本文も確認した。", "- 第4回：熱平衡、マクスウェル分布、大きい。白色矮星は電子の縮退圧で支える。資料の模式図の『1準位1粒子』と、厳密な同一量子状態の排他を区別して解説した。", "- 第5回：液体窒素、超伝導、レーザー冷却。不可逆過程の説明では孤立系全体と巨視的な確率を扱い、局所的な冷却との矛盾や、戻る確率が厳密にゼロだという誤解を避けた。", "- 第6回：磁気モーメント、常磁性体、準安定状態。自由エネルギーの最小化の条件、局所的な谷と障壁、ヒステリシスとの区別を説明した。地磁気逆転が厳密に一定周期という説明は加えていない。", "- 新しい計算問題は追加していない。問題文と正解を公開するために、PDF本体、提出先への操作、不要な外部リンクの読み込みは必要ない。", "", "## 補助に確認した公開資料", "", "- https://imagine.gsfc.nasa.gov/science/objects/dwarfs2.html", "- https://www.astro.sunysb.edu/fwalter/AST101/degeneracy.html", "- https://web.stanford.edu/~peastman/statmech/statisticaldescription.html", "- https://pubs.usgs.gov/gip/dynamic/developing.html", "- https://www.usgs.gov/faqs/it-true-earths-magnetic-field-occasionally-reverses-its-polarity", "- https://www.nist.gov/pml/owm/si-units-temperature", "- https://www.nist.gov/image/dopplercoolingjpg", "- https://sest.gr.jp/ufaq/q5/", ""])
(ROOT / "docs/physics-assignment-coverage.md").write_text("\n".join(lines), encoding="utf-8")
print("PASS: 12 physics questions, 6 detailed-guide tabs and routes, 4 worked examples, original choices, required terms, references" + (", and 3 source PDFs." if source_pages else "."))
