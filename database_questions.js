window.DATABASE_QUESTION_DATA = [
  {
    "id": "database-quiz1-001",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 1,
    "prompt": "通常のプログラム内で使用する変数と、データベースに保存するデータの性質に関する説明として、最も適切なものを選びなさい。",
    "answer": "プログラム内の変数は揮発性があり、内容が失われるため長期間利用する情報は永続化する必要がある",
    "choices": [
      "データベースに保存したデータは、プログラムの実行中だけ利用できる",
      "永続化とは、変数の値をプログラム実行中にメモリ上へ保持することである",
      "プログラム内の変数は揮発性があり、内容が失われるため長期間利用する情報は永続化する必要がある",
      "プログラム内の変数は永続性があり、プログラム終了後に自動的に保持されて内容が失われることがない"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "通常の変数はプログラム終了などで失われるため、長期間使うデータはファイルやデータベースへ保存して永続化します。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz1-002",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 2,
    "prompt": "データを永続化する方法として、通常のファイルを直接読み書きする方法と、データベースを利用する方法がある。データベースを利用する利点として、最も適切なものを選びなさい。",
    "answer": "複数のプログラムが同時にデータを利用する場合に、データ破損のリスクを抑えられる",
    "choices": [
      "データ量や読み書きの頻度が増えても、性能低下がまったく起こらなくなる",
      "複数のプログラムが同時にデータを利用する場合に、データ破損のリスクを抑えられる",
      "データを保存するためのプログラムが不要になる",
      "プログラマは、データを読み書きする処理を一切考えなくてよくなる"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "DBMSは同時実行を制御し、複数のプログラムによる更新の衝突やデータの不整合を防ぐ仕組みを提供します。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz1-003",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 3,
    "prompt": "データ中心アプローチ（Data Oriented Approach）に関する説明として、最も適切なものを選びなさい。",
    "answer": "まずデータベースを設計し、そのデータベースを利用するプログラムを設計する",
    "choices": [
      "データベースはプログラムの一部として扱い、プログラムの変更に合わせて個別に管理する",
      "まず各プログラムを設計し、そのプログラムごとに必要なデータベースを設計する",
      "データ中心アプローチでは、データをファイルごとに分散して保存し、各プログラムが利用する",
      "まずデータベースを設計し、そのデータベースを利用するプログラムを設計する"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "データ中心アプローチでは、複数のプログラムで共有するデータを先に設計し、それを利用する処理を設計します。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz1-004",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 4,
    "prompt": "データを表の形式で表現したデータベース(DB)を何というか？",
    "answer": "関係データベース",
    "choices": [
      "ネットワーク型データベース",
      "関係データベース",
      "階層型データベース",
      "表データベース"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "関係データベースではデータを表（関係）として表し、行をタプル、列を属性として扱います。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz1-005",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 5,
    "prompt": "空値を除いて他の関係の主キーになる属性値をとる属性を何というか？",
    "answer": "外部キー",
    "choices": [
      "スーパーキー",
      "リレーションキー",
      "関数従属",
      "外部キー",
      "正規形",
      "一意関係",
      "内部キー"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "外部キーは他の関係のキーを参照する属性で、表どうしの対応と参照整合性を保ちます。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz1-006",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 6,
    "prompt": "関係データベースにおいて，重複なく行を一意に識別するための列を何というか？",
    "answer": "主キー",
    "choices": [
      "主キー",
      "表",
      "列",
      "選択",
      "射影",
      "タプル",
      "外部キー",
      "挿入"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "主キーは各行を一意に識別するために選ぶキーで、重複とNULLを許しません。複数列を組み合わせる場合もあります。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz1-007",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 7,
    "prompt": "関係データベースの管理システムにおいて最も広く利用されている言語はどれか．",
    "answer": "SQL",
    "choices": [
      "Java",
      "C++",
      "MATLAB",
      "SQL",
      "Python",
      "R",
      "PHP"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "SQLは関係データベースの表の定義やデータの検索・追加・更新・削除に使われます。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz1-008",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 8,
    "prompt": "以下の表から主キーとなりうる項目（列）を全て答えなさい．",
    "answer": "学番 / 携帯電話番号 / メールアドレス",
    "choices": [
      "学番",
      "性別",
      "学科",
      "出身地",
      "携帯電話番号",
      "氏名",
      "学年",
      "血液型",
      "メールアドレス"
    ],
    "type": "multiple",
    "images": [
      "assets/database-quiz1-table1.png"
    ],
    "explanation": "この小テストの表では、学番・携帯電話番号・メールアドレスが行を一意に識別する項目です。実際の設計では、今のデータだけでなく今後も一意でNULLがないことを確認してキーを選びます。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz1-009",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 9,
    "prompt": "図の関係rにおいて主キーとなりうる属性を選びなさい。",
    "answer": "学番",
    "choices": [
      "所属",
      "学番",
      "氏名",
      "学年",
      "学科名",
      "性別",
      "学科コード"
    ],
    "type": "single",
    "images": [
      "assets/database-quiz1-table2.png"
    ],
    "explanation": "関係rでは学番が各学生を一意に識別します。氏名や所属などは複数の学生で同じ値になることがあります。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz1-010",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 10,
    "prompt": "以下のSQL文の出力結果として適切なものをひとつ選びなさい。\n\nSELECT id\nFROM r\nWHERE name='徳川家康' AND department_id=3;",
    "answer": "18001",
    "choices": [
      "18006",
      "18002",
      "18007",
      "18005",
      "18001",
      "18003",
      "18004"
    ],
    "type": "single",
    "images": [
      "assets/database-quiz1-table2.png"
    ],
    "explanation": "WHEREのANDは両方の条件を満たす行だけを残します。nameが徳川家康でdepartment_idが3の行のidは18001です。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz1-011",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 11,
    "prompt": "以下のSQL文の出力結果として適切なものをひとつ選びなさい。\n\nSELECT r.name\nFROM r\nJOIN s ON r.id = s.id\nWHERE s.grade = 3 AND s.team = 'C';",
    "answer": "清少納言",
    "choices": [
      "豊臣秀吉",
      "紫式部",
      "源頼朝",
      "清少納言",
      "織田信長",
      "徳川家康"
    ],
    "type": "single",
    "images": [
      "assets/database-quiz1-table2.png",
      "assets/database-quiz1-table3.png"
    ],
    "explanation": "r.id=s.idで同じ学生の行を結合し、s.grade=3かつs.team='C'を満たす行を選ぶと清少納言になります。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz1-012",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 12,
    "prompt": "図のscores表で主キーとなりうる属性を全て答えなさい。",
    "answer": "idとsubjectの組み合わせ",
    "choices": [
      "id",
      "name",
      "idとnameの組み合わせ",
      "subject",
      "idとsubjectの組み合わせ",
      "score"
    ],
    "type": "multiple",
    "images": [
      "assets/database-quiz1-table4.png"
    ],
    "explanation": "同じidで複数科目の成績があり、同じ科目にも複数学生がいます。idとsubjectの組み合わせなら各成績を一意に識別できます。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz1-013",
    "source": "データベース 小テスト1",
    "category": "database-quiz",
    "semester": "second",
    "number": 13,
    "prompt": "以下のSQL文の出力結果として該当するものを全て答えなさい。\n\nSELECT id\nFROM scores\nWHERE score < 80;",
    "answer": "202001 / 202004 / 202005",
    "choices": [
      "202006",
      "202002",
      "202001",
      "202004",
      "202007",
      "202005",
      "202003"
    ],
    "type": "multiple",
    "images": [
      "assets/database-quiz1-table4.png"
    ],
    "explanation": "score<80は80点未満の行だけを選びます。該当するidは202001・202004・202005で、80点の行は含みません。",
    "slideReference": "DB小テスト1.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-001",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 1,
    "prompt": "SQLの各文の役割について、正しい説明を1つ選びなさい。",
    "answer": "SELECT文は、テーブルからデータを検索するために使用する。",
    "choices": [
      "SELECT文は、テーブルからデータを検索するために使用する。",
      "CREATE TABLE文は、既存のテーブルに新しいレコードを追加するために使用する。",
      "DELETE文は、テーブルの構造を定義するために使用する。",
      "INSERT文は、テーブルから条件に一致するレコードを削除するために使用する。",
      "CREATE VIEW文は、テーブル内のレコードを並べ替えるために使用する。"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "SELECTは検索、INSERTは行の追加、DELETEは行の削除、CREATE TABLEは表の作成、CREATE VIEWはビューの定義です。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-002",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 2,
    "prompt": "以下のような社員テーブルemployeesがある。以下のSQL文を実行したとき、出力される社員名の組み合わせとして正しいものを1つ選びなさい。\n\nemployees\n\nid | name | salary | start_year\n1 | 山田 | 12000 | 2005\n2 | 佐藤 | 9000 | 1998\n3 | 鈴木 | 15000 | 2015\n4 | 田中 | 10000 | 2000\n5 | 高橋 | 8000 | 2010\nSELECT name FROM employees\nWHERE salary >= 10000\nAND start_year < 2010;",
    "answer": "山田、田中",
    "choices": [
      "山田、佐藤、田中",
      "佐藤、高橋",
      "山田、鈴木、田中",
      "鈴木、高橋",
      "山田、田中"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "salary>=10000とstart_year<2010の両方を満たすのは山田と田中です。鈴木は給与条件を満たしますが入社年が2015なので除外します。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-003",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 3,
    "prompt": "以下のような売場テーブルdepartmentsがある。以下のSQL文を実行したとき、出力されるレコードの行数として正しいものを1つ選びなさい。\n\ndepartments\n\nid | name | store_id | floor\n1 | 食品 | 5 | 1\n2 | 書籍 | 5 | 2\n3 | 衣料品 | 5 | 2\n4 | 家具 | 7 | 3\n5 | 雑貨 | 7 | 3\n6 | 玩具 | 7 | 2\nSELECT DISTINCT store_id, floor\nFROM departments;",
    "answer": "4行",
    "choices": [
      "4行",
      "1行",
      "7行",
      "6行",
      "8行",
      "3行",
      "0行",
      "5行",
      "2行",
      "9行"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "DISTINCTは指定した列の組み合わせの重複を除きます。(5,1)、(5,2)、(7,3)、(7,2)の4組が残ります。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-004",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 4,
    "prompt": "以下の2つのテーブル、売場テーブルdepartmentsと社員テーブルemployeesがある。どちらも主キーがidである。売場テーブルのmanager_idは売場の責任者を意味し、社員テーブルの主キーを参照する外部キーである。社員テーブルのmanager_idは社員の上司を意味し、同じ社員テーブルの主キーを参照する外部キーである。各売場のマネージャ本人の氏名と売場名を対応させて出力するSQL文として、正しいものを1つ選びなさい。\n\ndepartments\n\nid | name | manager_id\n10 | 食品 | 101\n20 | 書籍 | 102\n30 | 衣料品 | 103\n\nemployees\n\nid | name | manager_id\n101 | 山田 | 101\n102 | 佐藤 | 102\n103 | 鈴木 | 103\n104 | 田中 | 101\n105 | 高橋 | 102",
    "answer": "SELECT d.name, e.name FROM departments d JOIN employees e ON d.manager_id = e.id;",
    "choices": [
      "SELECT d.name, e.name FROM departments d CROSS JOIN employees e;",
      "SELECT d.name, e.name FROM departments d JOIN employees e ON d.manager_id = e.manager_id;",
      "SELECT d.name, e.name FROM departments d JOIN employees e ON d.id = e.manager_id;",
      "SELECT d.name, e.name FROM departments d JOIN employees e ON d.manager_id = e.id;",
      "SELECT d.name, e.name FROM departments d JOIN employees e ON d.id = e.id;"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "売場のmanager_idは責任者本人のemployees.idを参照します。e.manager_idと結ぶと、その責任者を上司に持つ別の社員まで含むため不適切です。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-005",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 5,
    "prompt": "以下の2つのテーブルがある。給与が10000未満の社員が所属する売場について、売場名とその社員の氏名を出力するSQL文として、正しいものを1つ選びなさい。\n\ndepartments：売場の情報を記録するテーブル。id（売場ID）、name（売場名）、manager_id（マネージャの社員ID）を持つ。\n\nemployees：社員の情報を記録するテーブル。id（社員ID）、name（社員名）、salary（給与）、manager_id（上司の社員ID）を持つ。",
    "answer": "SELECT d.name, e.name FROM departments d JOIN employees e ON d.manager_id = e.manager_id WHERE e.salary < 10000;",
    "choices": [
      "SELECT d.name, e.name FROM departments d JOIN employees e ON d.manager_id = e.manager_id WHERE e.salary > 10000;",
      "SELECT d.name, e.name FROM departments d JOIN employees e ON d.manager_id = e.manager_id WHERE d.salary < 10000;",
      "SELECT d.name, e.name FROM departments d JOIN employees e ON d.manager_id = e.manager_id WHERE e.salary < 10000;",
      "SELECT d.name, e.name FROM departments d JOIN employees e ON d.id = e.manager_id WHERE e.salary < 10000;",
      "SELECT d.name, e.name FROM departments d JOIN employees e ON d.manager_id = e.id WHERE e.salary < 10000;"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "この設問では、売場のmanager_idと社員のmanager_idが同じならその売場に所属するとして結合し、e.salary<10000で絞ります。前問の『マネージャ本人を探す結合』とは条件が違います。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-006",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 6,
    "prompt": "データベースの概念設計について、最も適切な説明を1つ選びなさい。",
    "answer": "データベースの対象となる業務や要件を理解し、実体・関連・属性を整理してER図を作成する。",
    "choices": [
      "ER図に基づいて、各テーブルの主キーや外部キーを定義する。",
      "データベースの対象となる業務や要件を理解し、実体・関連・属性を整理してER図を作成する。",
      "既存のテーブルを正規化し、関数従属性に基づいて分解する。",
      "SQLのCREATE TABLE文を使って、実際にデータベース内にテーブルを作成する。",
      "データベースの処理性能を高めるため、インデックスの種類や配置を決定する。"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "概念設計は、業務や要件から実体・関連・属性を整理してER図に表す段階です。テーブルやキーへの変換は論理設計に当たります。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-007",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 7,
    "prompt": "データベース設計の原則について、最も適切な説明を1つ選びなさい。",
    "answer": "分離性とは、独立した情報を別々に記録することである。",
    "choices": [
      "統合性とは、すべての情報を1つのテーブルにまとめて記録することである。",
      "非冗長性とは、データベースの記憶容量を最小限に抑えることを主な目的とする原則である。",
      "充足性とは、必要な情報をできるだけ少数のテーブルにまとめることである。",
      "非冗長性と統合性は相反する原則であるため、どちらか一方を優先しなければならない。",
      "分離性とは、独立した情報を別々に記録することである。"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "分離性は独立した情報を別々に記録する原則です。非冗長性は重複や他の値から導出できる情報の重複保存を避けることを意味します。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-008",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 8,
    "prompt": "大学の履修管理システムの概念設計を考える。学生は複数の科目を履修でき、1つの科目を複数の学生が履修できる。また、学生には氏名と学籍番号、科目には科目名と単位数がある。\n\nこのとき、実体（entity）、関連（relationship）、属性（attribute）の区別として、最も適切なものを1つ選びなさい。",
    "answer": "「学生」と「科目」は実体、「履修」は関連、「氏名」と「単位数」は属性である。",
    "choices": [
      "「学生」と「科目」は実体、「履修」は属性、「氏名」と「単位数」は関連である。",
      "「学生」「科目」「履修」「氏名」「単位数」はすべて実体である。",
      "「学生」と「科目」は実体、「履修」は関連、「氏名」と「単位数」は属性である。",
      "「学生」と「科目」は関連、「履修」は実体、「氏名」と「単位数」は属性である。",
      "「学生」は実体、「科目」は属性、「履修」は関連、「氏名」と「単位数」は実体である。"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "管理対象である学生と科目が実体、その間の履修が関連、実体の性質である氏名や単位数が属性です。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-009",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 9,
    "prompt": "店舗、注文、顧客について、以下の条件が与えられている。このとき、店舗と注文、顧客と注文の関連の多重度について、正しい説明を1つ選びなさい。\n\n1つの店舗は複数の注文を受け付ける。\n\n1つの注文は1つの店舗が受け付ける。\n\n1つの注文は1人の顧客が発注する。\n\n1人の顧客は複数の注文をする。",
    "answer": "店舗と注文は1対多、顧客と注文は1対多である。",
    "choices": [
      "店舗と注文は1対多、顧客と注文は多対多である。",
      "店舗と注文は多対多、顧客と注文は1対多である。",
      "店舗と注文は1対1、顧客と注文は1対1である。",
      "店舗と注文は1対多、顧客と注文は1対多である。",
      "店舗と注文は多対多、顧客と注文は多対多である。"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "店舗1つに注文が複数、顧客1人に注文が複数対応します。逆に注文1件は店舗1つ・顧客1人に対応するため、どちらも1対多です。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-010",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 10,
    "prompt": "ゴルフコンペの成績を管理するデータベースを設計する。各参加者について、OUT（前半のスコア）、IN（後半のスコア）、HDCP（そのコンペで使用したハンディキャップ）を記録する。\n\nGROSSとNETは以下の式で計算される。\n\nGROSS = OUT + IN\n\nNET = GROSS − HDCP\n\nこのとき、データベース設計の非冗長性の原則に照らして、最も適切な方法を1つ選びなさい。",
    "answer": "OUT、IN、HDCPを記録し、GROSSとNETは検索時に計算する。",
    "choices": [
      "OUT、IN、HDCP、GROSSを記録し、NETだけを検索時に計算する。",
      "OUT、IN、HDCPを記録し、GROSSとNETは検索時に計算する。",
      "OUT、IN、GROSS、NETを記録し、HDCPは記録しない。",
      "OUT、IN、HDCP、GROSS、NETをすべて記録する。検索時の計算を減らすことが最も重要だからである。",
      "GROSSとNETだけを記録する。OUTとINは合計値から求められるため不要だからである。"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "GROSSとNETはOUT・IN・HDCPから計算できるため、基になる3値を保存すれば足ります。導出値も重複保存すると更新時に食い違うおそれがあります。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-011",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 11,
    "prompt": "ER図に基づいて関係データベースの論理設計を行うときの手順として、最も適切なものを1つ選びなさい。",
    "answer": "実体に対応するテーブルの作成 → 多対多関連に対応する中間テーブルの作成 → カラムと主キーの設定 → 外部キーの設定",
    "choices": [
      "実体に対応するテーブルの作成 → 外部キーの設定 → カラムと主キーの設定 → 多対多関連に対応する中間テーブルの作成",
      "外部キーの設定 → 多対多関連に対応する中間テーブルの作成 → カラムと主キーの設定 → 実体に対応するテーブルの作成",
      "カラムと主キーの設定 → 実体に対応するテーブルの作成 → 外部キーの設定 → 多対多関連に対応する中間テーブルの作成",
      "多対多関連に対応する中間テーブルの作成 → 外部キーの設定 → 実体に対応するテーブルの作成 → カラムと主キーの設定",
      "実体に対応するテーブルの作成 → 多対多関連に対応する中間テーブルの作成 → カラムと主キーの設定 → 外部キーの設定"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "授業の手順は、実体のテーブル化、多対多の中間テーブル作成、カラムと主キーの設定、外部キーの設定の順です。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-012",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 12,
    "prompt": "学生と科目の間には「履修」という多対多の関連がある。学生には学籍番号と氏名、科目には科目番号と科目名があり、履修には成績という属性がある。\n\nこのER図を関係データベースのテーブルに変換する方法として、最も適切なものを1つ選びなさい。",
    "answer": "学生テーブル、科目テーブル、履修テーブルの3つを作成し、履修テーブルに学籍番号、科目番号、成績を記録する。",
    "choices": [
      "学生テーブルと科目テーブルの2つを作成し、学生テーブルに履修する科目番号と成績を記録する。",
      "学生テーブルと科目テーブルを1つにまとめ、学生の氏名、科目名、成績をすべて同じテーブルに記録する。",
      "学生テーブル、科目テーブル、成績テーブルの3つを作成し、成績テーブルには学籍番号と成績だけを記録する。",
      "学生テーブル、科目テーブル、履修テーブルの3つを作成し、履修テーブルに学籍番号、科目番号、成績を記録する。",
      "学生テーブルと科目テーブルの2つを作成し、科目テーブルに履修する学生の学籍番号と成績を記録する。"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "多対多の履修を中間テーブルに分け、学生と科目を参照するキーと、その組み合わせの属性である成績を記録します。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-013",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 13,
    "prompt": "学生テーブル students と科目テーブル courses があり、それぞれ id を主キーとする。\n\n学生が履修する科目を管理するため、次の中間テーブル take を作成する。\n\ntake(student_id, course_id, grade)\n\nここで、student_id は学生テーブルの id を、course_id は科目テーブルの id を参照する。また、同じ学生が同じ科目を履修する記録は1つだけとする。\n\n授業で説明した論理設計の方法に従う場合、take の主キーとして最も適切なものを1つ選びなさい。",
    "answer": "student_id と course_id の組み合わせ",
    "choices": [
      "student_id と course_id と grade の組み合わせ",
      "student_id のみ",
      "course_id のみ",
      "student_id と course_id の組み合わせ",
      "grade のみ"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "同じ学生と科目の組が1回だけなので、student_idとcourse_idの複合主キーで一意にできます。成績は変わる値なのでキーに含めません。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-014",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 14,
    "prompt": "教員と科目について、以下の要件がある。\n\n1人の教員は複数の科目を担当できる。\n\n1つの科目は必ず1人の教員が担当する。\n\n教員テーブル professors は id（教員番号）と name（教員名）を持つ。\n\n科目テーブル courses は id（科目番号）と name（科目名）を持つ。\n\nこのとき、外部キーの設定方法として最も適切なものを1つ選びなさい。",
    "answer": "courses に professor_id を追加し、professors.id を参照する外部キーとする。",
    "choices": [
      "professors と courses の両方に、互いの主キーを参照する外部キーを追加する。",
      "courses に professor_id を追加し、professors.id を参照する外部キーとする。",
      "professors と courses の間に中間テーブルを作成し、教員番号と科目番号を記録する必要がある。",
      "教員と科目は別々の実体なので、外部キーを設定する必要はない。",
      "professors に course_id を追加し、courses.id を参照する外部キーとする。"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "1対多では多側の科目テーブルに教員のキーを持たせます。courses.professor_idがprofessors.idを参照すれば担当教員を特定できます。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  },
  {
    "id": "database-quiz2-015",
    "source": "データベース 小テスト2",
    "category": "database-quiz",
    "semester": "second",
    "number": 15,
    "prompt": "関係データベースの論理設計における自然キー（ナチュラルキー）と人工キー（サロゲートキー）について、最も適切な説明を1つ選びなさい。",
    "answer": "主キーに適したカラムがもともと存在しない場合、一意な値を持つ人工キーを新たに設ける方法がある。",
    "choices": [
      "自然キーとは、データベース管理システムが自動的に生成する連番などの識別子である。",
      "主キーに適したカラムがもともと存在しない場合、一意な値を持つ人工キーを新たに設ける方法がある。",
      "自然キーが存在する場合でも、論理設計では必ず人工キーに置き換えなければならない。",
      "人工キーとは、学籍番号や社員番号など、業務上もともと存在する識別子である。",
      "自然キーは必ず複数のカラムから構成され、人工キーは必ず1つのカラムから構成される。"
    ],
    "type": "single",
    "images": [

    ],
    "explanation": "自然キーは業務上もともとある識別子、人工キーは識別用に追加する連番などです。適切な自然キーがないときは人工キーを設けられます。",
    "slideReference": "DB小テスト2.webarchive（採点済み正解）"
  }
];
