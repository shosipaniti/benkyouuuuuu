#!/usr/bin/env python3
"""Check the last-page assignment coverage and optional local PDF references."""

import argparse
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--source-dir", type=Path)
args = parser.parse_args()
questions = json.loads(subprocess.check_output([
    os.environ.get("NODE_BINARY", "node"), "-e",
    'global.window={};require("./physics_questions.js");console.log(JSON.stringify(window.PHYSICS_ADVANCED_QUESTION_DATA));',
], cwd=ROOT))
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

lines = ["# 物理の世界と先端技術の講義内課題", "", "後期の独立セット。第4〜6回PDFの最終ページにある穴埋め3か所と文章作成1問を対象とする。穴埋めを1か所ずつに分け、各回4問、全12問（選択9問・記述3問）とした。末尾以外の小問や独自の予想問題は追加していない。", "", "選択肢は原課題の各空欄の3語を保持。文章作成は原課題の指定語句を保持し、模範解答は講義本文に基づいて作成した例として自己採点にする。完全一致による不正解判定はしない。講義への提出や解散などの指示は問題に含めない。", "", "## 対応表", "", "| 問題ID | 課題 | 課題ページ | 解説の根拠ページ |", "| --- | --- | --- | --- |"]
for q in questions:
    lines.append(f'| {q["id"]} | 第{q["lecture"]}回 {q["assignmentPart"]} | {q["assignmentPage"]} | {", ".join(map(str, q["pages"]))} |')
lines.extend(["", "## 解答の確認", "", "- PDF最終ページ3枚をレンダリングして原文、空欄番号、選択肢、指定語句を目視確認した。根拠ページは本文も確認した。", "- 第4回：熱平衡、マクスウェル分布、大きい。白色矮星は電子の縮退圧で支える。資料の模式図の『1準位1粒子』と、厳密な同一量子状態の排他を区別して解説した。", "- 第5回：液体窒素、超伝導、レーザー冷却。不可逆過程の説明では孤立系全体と巨視的な確率を扱い、局所的な冷却との矛盾や、戻る確率が厳密にゼロだという誤解を避けた。", "- 第6回：磁気モーメント、常磁性体、準安定状態。地磁気の記録と移動の証拠をつなげる。地磁気逆転が厳密に一定周期という説明は加えていない。", "- 新しい計算問題は追加していない。問題文と正解を公開するために、PDF本体、提出先への操作、不要な外部リンクの読み込みは必要ない。", "", "## 補助に確認した公開資料", "", "- https://imagine.gsfc.nasa.gov/science/objects/dwarfs2.html", "- https://www.astro.sunysb.edu/fwalter/AST101/degeneracy.html", "- https://web.stanford.edu/~peastman/statmech/statisticaldescription.html", "- https://pubs.usgs.gov/gip/dynamic/developing.html", "- https://www.usgs.gov/faqs/it-true-earths-magnetic-field-occasionally-reverses-its-polarity", ""])
(ROOT / "docs/physics-assignment-coverage.md").write_text("\n".join(lines), encoding="utf-8")
print("PASS: 12 physics assignment questions (9 blanks + 3 written), original choices, required terms, references" + (", and 3 source PDFs." if source_pages else "."))
