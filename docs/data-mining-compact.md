# データマイニング 要点30問

第1〜6回から各5問。第1〜5回は予想問題167問から25問を抜粋し、第6回は講義資料に基づく基本5問を補った。全範囲を網羅する版ではなく、短い周回用のセット。既存セットは残す。

正解と解説、図、検証情報は抜粋元と一致する。別IDで進捗と編集を分離する。詳しい解説とスライドまとめは既存科目と共有し、第6回はスライドまとめへ対応させる。

抜粋元の数値解答はcheck_data_mining_predictions.pyでPythonとRにより検証する。新規第6回の数値3問は、この検査でRと数式の両方を使って再計算する。第6回の用語と選択問題は講義PDF p.26, 27, 33〜35, 44〜46, 55とR公式仕様を照合した。

- https://stat.ethz.ch/R-manual/R-devel/library/stats/html/summary.lm.html
- https://stat.ethz.ch/R-manual/R-devel/library/stats/html/model.matrix.html

| ID | 講義 | テーマ | 形式 | 元の問題 | PDFページ |
| --- | --- | --- | --- | --- | --- |
| data-mining-compact-01-005 | 第1回 | 行列の添字 | matching | data-mining-pred-01-005 | 34, 43, 44 |
| data-mining-compact-01-007 | 第1回 | 統計量の区別 | matching | data-mining-pred-01-007 | 35, 38, 39, 40 |
| data-mining-compact-01-009 | 第1回 | nで割る分散 | text | data-mining-pred-01-009 | 38 |
| data-mining-compact-01-015 | 第1回 | 相関の強さの順位 | single | data-mining-pred-01-015 | 35, 36, 37 |
| data-mining-compact-01-019 | 第1回 | 交絡変数 | single | data-mining-pred-01-019 | 50, 53 |
| data-mining-compact-02-004 | 第2回 | PPMの4象限 | matching | data-mining-pred-02-004 | 15, 16, 17, 18, 19 |
| data-mining-compact-02-012 | 第2回 | 上方管理限界 | text | data-mining-pred-02-012 | 26, 48 |
| data-mining-compact-02-015 | 第2回 | 限界内の異常傾向 | multiple | data-mining-pred-02-015 | 28, 29 |
| data-mining-compact-02-021 | 第2回 | ABCのランク判定 | matching | data-mining-pred-02-021 | 33, 37 |
| data-mining-compact-02-025 | 第2回 | 外れ値に頑健な代表値 | single | data-mining-pred-02-025 | 45, 46, 47 |
| data-mining-compact-03-003 | 第3回 | 標準得点の計算 | text | data-mining-pred-03-003 | 6, 8, 9 |
| data-mining-compact-03-011 | 第3回 | ユークリッド距離 | text | data-mining-pred-03-011 | 26 |
| data-mining-compact-03-015 | 第3回 | 樹形図のクラスタ数 | matching | data-mining-pred-03-015 | 32 |
| data-mining-compact-03-023 | 第3回 | ウォード法の増加量 | text | data-mining-pred-03-023 | 36 |
| data-mining-compact-03-026 | 第3回 | k-meansの割当て | single | data-mining-pred-03-026 | 26, 37 |
| data-mining-compact-04-001 | 第4回 | 主成分分析の目的 | single | data-mining-pred-04-001 | 16, 17, 18, 19, 24, 25 |
| data-mining-compact-04-006 | 第4回 | 負荷量と得点 | matching | data-mining-pred-04-006 | 44, 45, 60 |
| data-mining-compact-04-011 | 第4回 | 標準偏差から寄与率 | text | data-mining-pred-04-011 | 44, 56, 61 |
| data-mining-compact-04-012 | 第4回 | 採用する主成分数 | text | data-mining-pred-04-012 | 46, 57 |
| data-mining-compact-04-016 | 第4回 | PCAの出力とRコード | matching | data-mining-pred-04-016 | 44, 60 |
| data-mining-compact-05-001 | 第5回 | 分布・比較・構成比 | matching | data-mining-pred-05-001 | 5, 6, 16 |
| data-mining-compact-05-009 | 第5回 | Rの正規乱数 | single | data-mining-pred-05-009 | 13, 30 |
| data-mining-compact-05-020 | 第5回 | 条件付き割合 | text | data-mining-pred-05-020 | 38, 48 |
| data-mining-compact-05-023 | 第5回 | モザイクの読取り | single | data-mining-pred-05-023 | 38 |
| data-mining-compact-05-024 | 第5回 | 対応分析の対象 | single | data-mining-pred-05-024 | 40, 41, 42 |
| data-mining-compact-06-001 | 第6回 | 回帰の用語 | matching | 講義に基づく新規 | 26, 27, 35 |
| data-mining-compact-06-002 | 第6回 | 重回帰の予測値 | text | 講義に基づく新規 | 14, 27, 35 |
| data-mining-compact-06-003 | 第6回 | 決定係数の計算 | text | 講義に基づく新規 | 32, 33 |
| data-mining-compact-06-004 | 第6回 | ダミー変数の個数 | text | 講義に基づく新規 | 44, 45, 46 |
| data-mining-compact-06-005 | 第6回 | 回帰モデルの評価 | single | 講義に基づく新規 | 33, 34, 55 |
