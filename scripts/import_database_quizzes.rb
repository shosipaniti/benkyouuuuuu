#!/usr/bin/env ruby
# frozen_string_literal: true

require "base64"
require "json"
require "nokogiri"
require "open3"

ROOT = File.expand_path("..", __dir__)
EXPLANATIONS = [
  [
    "通常の変数はプログラム終了などで失われるため、長期間使うデータはファイルやデータベースへ保存して永続化します。",
    "DBMSは同時実行を制御し、複数のプログラムによる更新の衝突やデータの不整合を防ぐ仕組みを提供します。",
    "データ中心アプローチでは、複数のプログラムで共有するデータを先に設計し、それを利用する処理を設計します。",
    "関係データベースではデータを表（関係）として表し、行をタプル、列を属性として扱います。",
    "外部キーは他の関係のキーを参照する属性で、表どうしの対応と参照整合性を保ちます。",
    "主キーは各行を一意に識別するために選ぶキーで、重複とNULLを許しません。複数列を組み合わせる場合もあります。",
    "SQLは関係データベースの表の定義やデータの検索・追加・更新・削除に使われます。",
    "この小テストの表では、学番・携帯電話番号・メールアドレスが行を一意に識別する項目です。実際の設計では、今のデータだけでなく今後も一意でNULLがないことを確認してキーを選びます。",
    "関係rでは学番が各学生を一意に識別します。氏名や所属などは複数の学生で同じ値になることがあります。",
    "WHEREのANDは両方の条件を満たす行だけを残します。nameが徳川家康でdepartment_idが3の行のidは18001です。",
    "r.id=s.idで同じ学生の行を結合し、s.grade=3かつs.team='C'を満たす行を選ぶと清少納言になります。",
    "同じidで複数科目の成績があり、同じ科目にも複数学生がいます。idとsubjectの組み合わせなら各成績を一意に識別できます。",
    "score<80は80点未満の行だけを選びます。該当するidは202001・202004・202005で、80点の行は含みません。"
  ],
  [
    "SELECTは検索、INSERTは行の追加、DELETEは行の削除、CREATE TABLEは表の作成、CREATE VIEWはビューの定義です。",
    "salary>=10000とstart_year<2010の両方を満たすのは山田と田中です。鈴木は給与条件を満たしますが入社年が2015なので除外します。",
    "DISTINCTは指定した列の組み合わせの重複を除きます。(5,1)、(5,2)、(7,3)、(7,2)の4組が残ります。",
    "売場のmanager_idは責任者本人のemployees.idを参照します。e.manager_idと結ぶと、その責任者を上司に持つ別の社員まで含むため不適切です。",
    "この設問では、売場のmanager_idと社員のmanager_idが同じならその売場に所属するとして結合し、e.salary<10000で絞ります。前問の『マネージャ本人を探す結合』とは条件が違います。",
    "概念設計は、業務や要件から実体・関連・属性を整理してER図に表す段階です。テーブルやキーへの変換は論理設計に当たります。",
    "分離性は独立した情報を別々に記録する原則です。非冗長性は重複や他の値から導出できる情報の重複保存を避けることを意味します。",
    "管理対象である学生と科目が実体、その間の履修が関連、実体の性質である氏名や単位数が属性です。",
    "店舗1つに注文が複数、顧客1人に注文が複数対応します。逆に注文1件は店舗1つ・顧客1人に対応するため、どちらも1対多です。",
    "GROSSとNETはOUT・IN・HDCPから計算できるため、基になる3値を保存すれば足ります。導出値も重複保存すると更新時に食い違うおそれがあります。",
    "授業の手順は、実体のテーブル化、多対多の中間テーブル作成、カラムと主キーの設定、外部キーの設定の順です。",
    "多対多の履修を中間テーブルに分け、学生と科目を参照するキーと、その組み合わせの属性である成績を記録します。",
    "同じ学生と科目の組が1回だけなので、student_idとcourse_idの複合主キーで一意にできます。成績は変わる値なのでキーに含めません。",
    "1対多では多側の科目テーブルに教員のキーを持たせます。courses.professor_idがprofessors.idを参照すれば担当教員を特定できます。",
    "自然キーは業務上もともとある識別子、人工キーは識別用に追加する連番などです。適切な自然キーがないときは人工キーを設けられます。"
  ]
].freeze

def clean(text)
  text.to_s.tr("\u00a0", " ").gsub(/[\t 　]+/, " ").gsub(/ *\n */, "\n").gsub(/\n{3,}/, "\n\n").strip
end

def node_text(node)
  return node.text if node.text?
  return "" if node.comment?
  return "\n" if node.name == "br"
  if node.name == "table"
    return "\n" + node.css("tr").map { |row| row.css("th, td").map { |cell| clean(cell.text) }.join(" | ") }.join("\n") + "\n"
  end
  text = node.children.map { |child| node_text(child) }.join
  %w[p div li ul h1].include?(node.name) ? "\n#{text}\n" : text
end

def archive_dict(node)
  case node.name
  when "dict"
    node.element_children.each_slice(2).to_h { |key, value| [key.text, archive_dict(value)] }
  when "array"
    node.element_children.map { |child| archive_dict(child) }
  when "data"
    Base64.decode64(node.text)
  else
    node.text
  end
end

abort "Usage: ruby scripts/import_database_quizzes.rb DB小テスト1.webarchive DB小テスト2.webarchive" unless ARGV.length == 2
questions = []
ARGV.each_with_index do |path, file_index|
  xml, status = Open3.capture2("plutil", "-convert", "xml1", "-o", "-", path)
  raise "Cannot read archive: #{path}" unless status.success?
  archive = archive_dict(Nokogiri::XML(xml).at_xpath("/plist/dict"))
  doc = Nokogiri::HTML(archive.fetch("WebMainResource").fetch("WebResourceData").force_encoding("UTF-8"))
  paper = doc.at_css(".querypaper")
  raise "Missing question paper" unless paper
  image_paths = paper.css("img.articleimage").map.with_index do |image, index|
    resource = archive.fetch("WebSubresources").find { |item| item["WebResourceURL"].include?(image["src"]) }
    raise "Missing image: #{image['src']}" unless resource && resource["WebResourceMIMEType"] == "image/png"
    relative = "assets/database-quiz#{file_index + 1}-table#{index + 1}.png"
    File.binwrite(File.join(ROOT, relative), resource.fetch("WebResourceData"))
    relative
  end
  selections = paper.css("ol.queryselection, ol.powerselection")
  raise "Unexpected question count" unless selections.length == EXPLANATIONS[file_index].length
  answers = selections.map do |selection|
    chosen = selection.css("li").select { |li| li.at_css("input[checked]") }
    grade = selection.next_element&.at_css(".answer.correct")
    raise "Answer not confirmed correct: #{selection['id']}" if chosen.empty? || !grade
    {
      answer: chosen.map { |li| clean(li.at_css("label").text) }.join(" / "),
      choices: selection.css("li").map { |li| clean(li.at_css("label").text) },
      type: selection["class"].include?("powerselection") ? "multiple" : "single"
    }
  end
  clone = paper.dup
  clone.css("script, style, .pointform, .answer, .iadroppedfiles, h1").remove
  clone.css("ol.queryselection, ol.powerselection").each_with_index do |selection, index|
    selection.replace(Nokogiri::XML::Text.new("[[QUESTION:#{index}]]", clone.document))
  end
  parts = node_text(clone).split(/\[\[QUESTION:\d+\]\]/)
  answers.each_with_index do |answer, index|
    prompt = clean(parts[index]).sub(/\A以下の小問それぞれに対して[^\n]+\n*/, "").sub(/\A\(\d+\)\s*/, "")
    images = []
    if file_index.zero?
      images = case index + 1
               when 8 then [image_paths[0]]
               when 9, 10 then [image_paths[1]]
               when 11 then image_paths[1, 2]
               when 12, 13 then [image_paths[3]]
               else []
               end
      prompt = "図の関係rにおいて主キーとなりうる属性を選びなさい。" if index == 8
      prompt = "図のscores表で主キーとなりうる属性を全て答えなさい。" if index == 11
    end
    if answer[:type] == "multiple"
      prompt = prompt.gsub("すべて答えなさい", "全て答えなさい")
        .sub(/適切なものを選びなさい。/, "該当するものを全て答えなさい。")
    end
    raise "Empty prompt" if prompt.empty?
    questions << {
      id: "database-quiz#{file_index + 1}-#{format('%03d', index + 1)}",
      source: "データベース 小テスト#{file_index + 1}", category: "database-quiz", semester: "second",
      number: index + 1, prompt: prompt, **answer, images: images,
      explanation: EXPLANATIONS[file_index][index],
      slideReference: "DB小テスト#{file_index + 1}.webarchive（採点済み正解）"
    }
  end
end
payload = "window.DATABASE_QUESTION_DATA = #{JSON.pretty_generate(questions)};\n"
File.write(File.join(ROOT, "database_questions.js"), payload)
puts "Generated #{questions.length} questions with #{questions.sum { |q| q[:images].length }} image references."
