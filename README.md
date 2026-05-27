# 学習クイズ 一問一答

小テスト問題と予想問題を一問一答で復習できるPWAです。問題データを共通JSON形式にそろえれば、他の科目にも使えます。

- 選択・入力後に「判定する」で正誤判定
- 対応問題・複数選択・入力問題に対応
- 小テスト問題と予想問題を区分してフィルター
- `questions.js` と `predicted_questions.js` の共通データ形式を読み込み
- ホーム画面追加とオフライン利用に対応

GitHub Pagesで公開すると、スマホのSafariからホーム画面に追加できます。

## Data Check

公開前に問題データの形式を確認します。

```sh
node tools/validate-question-data.mjs
```

## Documentation

- [汎用学習クイズサイト 要件定義書](docs/study-quiz-site-requirements.md)
