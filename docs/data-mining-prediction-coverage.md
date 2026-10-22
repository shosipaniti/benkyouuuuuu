# データマイニング予想問題の範囲対応

第1〜5回から計132問。データマイニング小テストとは別の後期セット。用語選択、対応付け、図の読取り、数値計算、Rの実行結果、短文記述という知識工学の過去問の形式を参考にした予想であり、出題を保証しない。

## 出題範囲と注意

各回の重要事項・学習内容・例題・演習の技能を対象にする。ガイダンスの規則、インストール手順、外部配布CSVの全レコード暗記は対象外。CSVのない演習は、問題文に数値を示す自足した練習へ置き換えた。繰り返し説明されたスライドはテーマ単位で統合した。

ページ番号はPDF先頭を1とした番号。記述は同義の解答を認めるため模範解答と照合して自己採点する。数値問題には単位・丸め・分散の分母・管理対象を明記。ウォード法の平方和の増加量と公式はp.36の定義を具体化した補足練習。

### 原資料を読んだ際の注意

- 第2回p.48は10日間という本文に対し表は9日分。欠けた日を補わず、掲載された日で出題した。
- 第2回p.49のσは個々の値かロット平均かで管理限界が異なるため、曖昧な管理限界の数値を正解として固定しない。
- 第3回p.7とp.6・9で英語の平均に表記差があるため、数値問題では平均65を明示した。
- 第4回p.6の本文の『typeで点の形』はコードのpchと混同しやすい。問題では点の形をpch、点や線の描画方法をtypeとして区別した。
- 第5回p.40の対応分析は導入の要約として扱い、単なる無重みPCAと完全に同じ実装だとは出題しない。カテゴリ間の距離だけから因果を断定しない。

## 画像出典

- assets/ref-dm-pred-dendrogram.png: 第3回PDF p.32の樹形図部分を直接切り出し。矢印・枝・破線・個体ラベルを保持。
- assets/ref-dm-pred-mosaic.png: 第5回PDF p.38の度数表と図を直接切り出し。度数と合計を保持。

## 補助確認したR公式資料

- https://stat.ethz.ch/R-manual/R-devel/library/stats/html/hclust.html
- https://stat.ethz.ch/R-manual/R-devel/library/stats/html/princomp.html
- https://stat.ethz.ch/R-manual/R-devel/library/base/html/table.html

## 検証結果

Pythonによる数値再計算34件、実Rによる実行結果14件。両方に含まれる問題もある。図の枝・面積比、正答の選択肢内存在、ID・問題文重複、ページ範囲を検証。

## 第1回（22問）

定義、決定木・説明変数／目的変数、行列・R、平均・分散・不偏分散・標準偏差・共分散・相関、散布図、交絡・疑似相関・因果、相関行列（重要事項p.57、課題p.55〜56）

| 問題ID | テーマ | PDFページ | 形式 |
| --- | --- | --- | --- |
| data-mining-pred-01-001 | データマイニングの定義 | 10 | single |
| data-mining-pred-01-002 | 説明変数と目的変数 | 11, 12 | matching |
| data-mining-pred-01-003 | 決定木 | 7, 11, 12 | single |
| data-mining-pred-01-004 | 決定木の読取り | 7, 11 | single |
| data-mining-pred-01-005 | 行列の添字 | 34, 43, 44 | matching |
| data-mining-pred-01-006 | Rの行列計算 | 43, 44, 55 | text |
| data-mining-pred-01-007 | 統計量の区別 | 35, 38, 39, 40 | matching |
| data-mining-pred-01-008 | 平均 | 38, 55 | text |
| data-mining-pred-01-009 | nで割る分散 | 38 | text |
| data-mining-pred-01-010 | 不偏分散とR | 38, 55 | text |
| data-mining-pred-01-011 | 標準偏差 | 38 | text |
| data-mining-pred-01-012 | 共分散の計算 | 39 | text |
| data-mining-pred-01-013 | 相関係数の計算 | 35, 40 | text |
| data-mining-pred-01-014 | 相関係数の解釈 | 35, 36, 37 | matching |
| data-mining-pred-01-015 | 相関の強さの順位 | 35, 36, 37 | single |
| data-mining-pred-01-016 | 相関の値域 | 35 | single |
| data-mining-pred-01-017 | 共分散と単位 | 39, 40 | single |
| data-mining-pred-01-018 | Rによる分析と作図 | 42, 45, 46 | matching |
| data-mining-pred-01-019 | 交絡変数 | 50, 53 | single |
| data-mining-pred-01-020 | 疑似相関 | 48, 49, 50, 53, 54 | single |
| data-mining-pred-01-021 | 相関と因果の説明 | 47, 48, 49, 50, 54, 56 | free |
| data-mining-pred-01-022 | 相関行列 | 56 | single |

## 第2回（27問）

折れ線・棒グラフ、PPM全4象限と推移・比率計算、管理図・管理限界・偏り・種類・ロット平均、パレート・ABC・ロングテール・市場集中、外れ値・中央値（重要事項p.51、課題p.20〜22・48〜50）

| 問題ID | テーマ | PDFページ | 形式 |
| --- | --- | --- | --- |
| data-mining-pred-02-001 | グラフの選択 | 9, 11, 12 | matching |
| data-mining-pred-02-002 | Rの作図コード | 9, 10, 11, 12, 13 | matching |
| data-mining-pred-02-003 | PPMの軸 | 14, 15 | single |
| data-mining-pred-02-004 | PPMの4象限 | 15, 16, 17, 18, 19 | matching |
| data-mining-pred-02-005 | PPMの推移 | 16, 18 | single |
| data-mining-pred-02-006 | PPMの資金投入 | 16, 17, 18, 19 | single |
| data-mining-pred-02-007 | 成長比率の計算 | 21, 22 | text |
| data-mining-pred-02-008 | 占有率の計算 | 21 | text |
| data-mining-pred-02-009 | 数値からPPMを判定 | 14, 15, 21, 22 | single |
| data-mining-pred-02-010 | 管理図の目的 | 24, 31 | single |
| data-mining-pred-02-011 | 管理限界の式 | 25, 26, 27 | matching |
| data-mining-pred-02-012 | 上方管理限界 | 26, 48 | text |
| data-mining-pred-02-013 | 下方管理限界 | 26, 48 | text |
| data-mining-pred-02-014 | 管理図の異常日の特定 | 27, 48 | multiple |
| data-mining-pred-02-015 | 限界内の異常傾向 | 28, 29 | multiple |
| data-mining-pred-02-016 | 管理図の種類 | 30 | matching |
| data-mining-pred-02-017 | ロット平均の計算 | 49 | text |
| data-mining-pred-02-018 | ロット平均とσの注意 | 26, 30, 49 | single |
| data-mining-pred-02-019 | パレート図 | 33, 34, 35 | single |
| data-mining-pred-02-020 | 累積構成比 | 34, 35, 37 | text |
| data-mining-pred-02-021 | ABCのランク判定 | 33, 37 | matching |
| data-mining-pred-02-022 | 市場の集中度 | 40, 41 | single |
| data-mining-pred-02-023 | ロングテール戦略 | 36, 38, 39 | single |
| data-mining-pred-02-024 | 外れ値と異常値 | 42, 43, 46 | single |
| data-mining-pred-02-025 | 外れ値に頑健な代表値 | 45, 46, 47 | single |
| data-mining-pred-02-026 | 外れ値追加後の中央値 | 45, 46 | text |
| data-mining-pred-02-027 | 平均だけで比較しない | 45, 46, 47 | free |

## 第3回（30問）

箱ひげ図、標準化・偏差値、学習3種、距離・最近傍・重心、樹形図、階層型の処理・特徴・統合基準、ウォード平方和、k-meansの割当て・更新・初期値依存性・R指定（重要事項p.42、課題p.27〜28・40〜41）

| 問題ID | テーマ | PDFページ | 形式 |
| --- | --- | --- | --- |
| data-mining-pred-03-001 | 箱ひげ図 | 4 | single |
| data-mining-pred-03-002 | 標準化の式 | 8, 9 | single |
| data-mining-pred-03-003 | 標準得点の計算 | 6, 8, 9 | text |
| data-mining-pred-03-004 | 偏差値の計算 | 10 | text |
| data-mining-pred-03-005 | 標準化後の性質 | 8, 12, 13, 27 | matching |
| data-mining-pred-03-006 | 標準化する理由 | 11, 12, 13, 33 | free |
| data-mining-pred-03-007 | 学習の種類 | 16, 17, 18, 21 | matching |
| data-mining-pred-03-008 | 教師なし学習の選択 | 17, 18 | multiple |
| data-mining-pred-03-009 | クラスタリングの定義 | 22, 23 | single |
| data-mining-pred-03-010 | 階層の有無 | 24, 35, 37, 38 | matching |
| data-mining-pred-03-011 | ユークリッド距離 | 26 | text |
| data-mining-pred-03-012 | 最近傍の判定 | 26, 28 | single |
| data-mining-pred-03-013 | 重心の座標 | 28, 36, 37 | text |
| data-mining-pred-03-014 | デンドログラム | 30, 31, 32 | single |
| data-mining-pred-03-015 | 樹形図のクラスタ数 | 32 | matching |
| data-mining-pred-03-016 | 樹形図のグループ | 32 | single |
| data-mining-pred-03-017 | 階層型の手順 | 31 | single |
| data-mining-pred-03-018 | 階層型の統合回数 | 31 | text |
| data-mining-pred-03-019 | 階層型の特徴 | 34, 38 | multiple |
| data-mining-pred-03-020 | 階層型の統合基準 | 35, 36 | matching |
| data-mining-pred-03-021 | クラスタ内平方和 | 36 | text |
| data-mining-pred-03-022 | ウォード法の最初の統合 | 26, 31, 36 | single |
| data-mining-pred-03-023 | ウォード法の増加量 | 36 | text |
| data-mining-pred-03-024 | ウォード法と重心間距離 | 36 | single |
| data-mining-pred-03-025 | k-meansの更新 | 37 | single |
| data-mining-pred-03-026 | k-meansの割当て | 26, 37 | single |
| data-mining-pred-03-027 | k-meansの中心更新 | 37 | text |
| data-mining-pred-03-028 | Rのクラスタ抽出 | 37 | text |
| data-mining-pred-03-029 | 階層型と非階層型の比較 | 34, 37, 38, 41 | free |
| data-mining-pred-03-030 | Rでウォード法を指定 | 40 | single |

## 第4回（24問）

作図・ラベル・色分け、PCAの目的・直交軸・次元縮約、得点・係数、寄与率・累積寄与率・採用数・標準偏差からの計算、R出力、クラスタとの併用・軸解釈（重要事項p.63、課題p.26〜27・59〜62）

| 問題ID | テーマ | PDFページ | 形式 |
| --- | --- | --- | --- |
| data-mining-pred-04-001 | 主成分分析の目的 | 16, 17, 18, 19, 24, 25 | single |
| data-mining-pred-04-002 | 次元縮約の利点 | 23, 24, 25, 40 | matching |
| data-mining-pred-04-003 | 主成分の順序 | 35, 36, 37, 38, 39, 42 | single |
| data-mining-pred-04-004 | 合成変数 | 30, 32, 34, 42 | single |
| data-mining-pred-04-005 | 主成分得点の計算 | 34, 42, 45 | text |
| data-mining-pred-04-006 | 負荷量と得点 | 44, 45, 60 | matching |
| data-mining-pred-04-007 | 寄与率 | 46, 47, 53, 54, 56 | single |
| data-mining-pred-04-008 | 2主成分の寄与率 | 53, 54 | text |
| data-mining-pred-04-009 | 3主成分の寄与率 | 55, 56 | text |
| data-mining-pred-04-010 | 累積寄与率 | 46, 48, 57 | text |
| data-mining-pred-04-011 | 標準偏差から寄与率 | 44, 56, 61 | text |
| data-mining-pred-04-012 | 採用する主成分数 | 46, 57 | text |
| data-mining-pred-04-013 | 捨てる情報の割合 | 40, 43, 46 | text |
| data-mining-pred-04-014 | 次元とサンプル数 | 41, 58 | single |
| data-mining-pred-04-015 | Rで主成分分析 | 44 | single |
| data-mining-pred-04-016 | PCAの出力とRコード | 44, 60 | matching |
| data-mining-pred-04-017 | 寄与率のRコード | 44, 56, 61 | single |
| data-mining-pred-04-018 | 得点の散布図 | 6, 44, 60 | single |
| data-mining-pred-04-019 | 散布図の引数 | 6, 7, 8, 9 | matching |
| data-mining-pred-04-020 | Rの条件抽出 | 27 | text |
| data-mining-pred-04-021 | 軸の意味の解釈 | 16, 17, 18, 45 | single |
| data-mining-pred-04-022 | クラスタリングとの併用 | 59, 60, 62 | single |
| data-mining-pred-04-023 | PCAの説明 | 35, 36, 40, 43, 46 | free |
| data-mining-pred-04-024 | 寄与率と正解率の区別 | 46, 48 | single |

## 第5回（29問）

ヒストグラム・度数・相対度数、正規分布・正規乱数、円グラフの作図と誤解、カテゴリ・リッカート・ローデータ、集計・列指定・R、モザイク・割合の分母、対応分析・行プロフィール・図の解釈、複数回答（重要事項p.49、課題p.30〜32・45〜48）

| 問題ID | テーマ | PDFページ | 形式 |
| --- | --- | --- | --- |
| data-mining-pred-05-001 | 分布・比較・構成比 | 5, 6, 16 | matching |
| data-mining-pred-05-002 | 度数の計算 | 7, 8, 9 | text |
| data-mining-pred-05-003 | 相対度数 | 9 | text |
| data-mining-pred-05-004 | ヒストグラムと棒グラフ | 6 | single |
| data-mining-pred-05-005 | 正規分布のパラメータ | 10, 11 | matching |
| data-mining-pred-05-006 | 標準正規分布 | 11 | single |
| data-mining-pred-05-007 | 正規分布の式 | 10 | single |
| data-mining-pred-05-008 | 分布形状の比較 | 10, 11 | single |
| data-mining-pred-05-009 | Rの正規乱数 | 13, 30 | single |
| data-mining-pred-05-010 | 乱数の標本変動 | 14, 15, 30 | single |
| data-mining-pred-05-011 | 円グラフの角度 | 16 | text |
| data-mining-pred-05-012 | 円グラフの注意 | 19, 20, 21, 22 | multiple |
| data-mining-pred-05-013 | データの種類 | 24, 25, 36 | matching |
| data-mining-pred-05-014 | リッカート尺度 | 25 | single |
| data-mining-pred-05-015 | 列名での抽出 | 27, 28 | matching |
| data-mining-pred-05-016 | 集計・可視化のR関数 | 29, 32, 37, 39, 42, 45 | matching |
| data-mining-pred-05-017 | クロス集計の意味 | 34, 35, 37 | single |
| data-mining-pred-05-018 | 生データからクロス集計 | 35, 37, 48 | text |
| data-mining-pred-05-019 | 周辺度数 | 35, 37, 38 | text |
| data-mining-pred-05-020 | 条件付き割合 | 38, 48 | text |
| data-mining-pred-05-021 | 全体に占めるセルの割合 | 38 | text |
| data-mining-pred-05-022 | モザイクプロット | 38, 39 | single |
| data-mining-pred-05-023 | モザイクの読取り | 38 | single |
| data-mining-pred-05-024 | 対応分析の対象 | 40, 41, 42 | single |
| data-mining-pred-05-025 | 行プロフィール | 40, 48 | text |
| data-mining-pred-05-026 | 構成比で比べる理由 | 40, 48 | single |
| data-mining-pred-05-027 | 対応分析の解釈 | 41, 42, 46 | single |
| data-mining-pred-05-028 | モザイクと対応分析 | 38, 40, 41, 46, 47 | free |
| data-mining-pred-05-029 | 複数回答の扱い | 43, 44 | single |
