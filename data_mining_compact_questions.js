(() => {
  const selected = {
    1: [5, 7, 9, 15, 19],
    2: [4, 12, 15, 21, 25],
    3: [3, 11, 15, 23, 26],
    4: [1, 6, 11, 12, 16],
    5: [1, 9, 20, 23, 24]
  };
  const titles = { 1: "相関と基礎統計", 2: "経営分析と管理図", 3: "標準化とクラスタリング", 4: "主成分分析", 5: "分布とクロス集計", 6: "回帰分析" };
  const category = "data-mining-compact";
  const source = (lecture) => `要点 第${lecture}回 ${titles[lecture]}`;
  const originals = new Map((window.DATA_MINING_PREDICTED_QUESTION_DATA || []).map((q) => [q.id, q]));
  const questions = Object.entries(selected).flatMap(([lecture, numbers]) => numbers.map((number, index) => {
    const id = `data-mining-pred-${String(lecture).padStart(2, "0")}-${String(number).padStart(3, "0")}`;
    const original = originals.get(id);
    if (!original) throw new Error(`Missing compact-set source question: ${id}`);
    return {
      ...JSON.parse(JSON.stringify(original)),
      id: id.replace("data-mining-pred-", "data-mining-compact-"),
      sourceQuestionId: id,
      category,
      source: source(lecture),
      number: index + 1
    };
  }));
  function add(number, topic, pages, prompt, answer, type, choices, explanation, extra = {}) {
    questions.push({
      id: `data-mining-compact-06-${String(number).padStart(3, "0")}`,
      category, semester: "second", lecture: 6, number, topic, pages,
      source: source(6), prompt, answer, type, choices, explanation,
      slideReference: `データマイニング 第6回 p.${pages.join(", ")}（PDFのページ番号）`,
      images: [], ...extra
    });
  }
  add(1, "回帰の用語", [26, 27, 35],
    "気温と湿度から電力需要を予測する重回帰モデルについて、各項目を役割に対応させなさい。",
    "気温と湿度 = 説明変数 / 電力需要 = 目的変数 / 他の説明変数を固定したときの予測値の変化を表す係数 = 偏回帰係数",
    "matching", ["a: 説明変数", "b: 目的変数", "c: 偏回帰係数"],
    "予測に使う入力が説明変数、予測対象が目的変数です。重回帰の係数は他の説明変数を一定とした条件付きの関係を表し、因果関係を自動的に証明するものではありません。");
  add(2, "重回帰の予測値", [14, 27, 35],
    "練習用の回帰式を ŷ=2x₁+3x₂+10 とする。x₁=4、x₂=2のときの予測値を数値で答えなさい。",
    "24", "text", [],
    "各説明変数へ値を代入します。2×4=8、3×2=6、切片は10なので、8+6+10=24です。係数を掛ける項と、最後に足す切片を分けて追います。",
    { answerFormat: "number", verification: { r: "sum(c(2,3)*c(4,2))+10" } });
  add(3, "決定係数の計算", [32, 33],
    "実測値が(2,4,6)、モデルの予測値が(3,4,5)だった。R²=1−残差平方和÷全平方和を使って決定係数を求めなさい。全平方和は実測値と実測値の平均との差の二乗和とする。",
    "0.75", "text", [],
    "実測値の平均は4。全平方和は(2−4)²+(4−4)²+(6−4)²=8です。残差平方和は(2−3)²+(4−4)²+(6−5)²=2。したがってR²=1−2/8=0.75です。これは正解した件数の割合ではありません。",
    { answerFormat: "number", verification: { r: "y<-c(2,4,6);pred<-c(3,4,5);1-sum((y-pred)^2)/sum((y-mean(y))^2)" } });
  add(4, "ダミー変数の個数", [44, 45, 46],
    "所属学部が4種類ある。切片を含む回帰モデルで、1学部を基準とする通常のダミー変数を使う。所属学部を表すダミー変数は何個用意するか。数値で答えなさい。",
    "3", "text", [],
    "k水準ならk−1個なので4−1=3個です。基準の学部は3個とも0で表せます。切片と4学部全てのダミーを同時に入れると、ダミーの合計が常に1となり、列が線形従属になります。",
    { answerFormat: "number", verification: { r: 'ncol(model.matrix(~g,data.frame(g=factor(c("A","B","C","D"))),contrasts.arg=list(g="contr.treatment")))-1' } });
  add(5, "回帰モデルの評価", [33, 34, 55],
    "夏のデータで電力需要を予測するモデルを作った。モデルの評価方法として適切なものを選びなさい。",
    "自由度調整済み決定係数も確認し、学習に使っていない季節やデータで予測誤差を確かめる",
    "single", [
      "自由度調整済み決定係数も確認し、学習に使っていない季節やデータで予測誤差を確かめる",
      "説明変数を増やせば自由度調整済み決定係数も必ず上がる",
      "夏の学習データの決定係数が高ければ冬の予測精度も保証される",
      "決定係数0.8は予測値が完全一致したデータが80%という意味である"
    ],
    "切片を含む最小二乗の重回帰で、同じ学習データに説明変数を追加すると、通常のR²は下がりませんが、自由度調整済みR²は下がることがあります。学習データへの当てはまりと未知データでの性能は別です。冬にも使うなら、その季節のデータも用意して検証します。");
  window.DATA_MINING_COMPACT_QUESTION_DATA = questions;
})();
