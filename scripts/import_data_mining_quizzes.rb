#!/usr/bin/env ruby
# frozen_string_literal: true

require "base64"
require "json"
require "nokogiri"
require "open3"

ROOT = File.expand_path("..", __dir__)
EXPLANATIONS = [
  [
    "2つの変数に直接の因果関係がなくても、共通の交絡変数の影響で相関が現れることを疑似相関といいます。相関だけで因果関係は判断できません。",
    "パレート図は項目を大きい順の棒グラフにし、累積構成比を折れ線で重ねた図です。寄与の大きい項目を把握できます。",
    "少数ずつしか売れない商品でも、多種類を扱って売上を積み上げる考え方がロングテール戦略です。",
    "ABC分析は売上などの寄与が大きい順に商品を分類し、重要度に応じて管理の重点を変える方法です。",
    "共分散は2変数それぞれの平均からの偏差の積を平均した値です。同方向に動く傾向なら正、逆方向なら負になります。",
    "分散は平均からの偏差を2乗して平均した値で、データの散らばりを表します。この式の分母はnであり、不偏分散のn-1とは異なります。",
    "市場成長率と市場占有率がともに高い製品群は花形です。成長への投資が必要な一方、市場で強い地位を持ちます。",
    "市場成長率は高いが市場占有率が低い製品群は問題児です。成長市場でシェアを伸ばすための投資判断が必要です。",
    "管理図は中心線と管理限界線を使い、工程の変動や異常の兆候を時系列で確認する図です。",
    "中心線は与えられた全体の平均μを使うのでCL=μ=3.0です。ここでは抜き出された14個のデータから平均を計算し直しません。",
    "3シグマ法の上方管理限界はUCL=μ+3σです。3.0+3×0.1=3.3となります。",
    "3シグマ法の下方管理限界はLCL=μ-3σです。3.0-3×0.1=2.7となります。",
    "この設問では管理限界[2.7,3.3]の外にある値を選びます。2.6は下限未満、3.4は上限超過なので該当します。"
  ],
  [
    "類似度や距離に基づいて似たデータを同じグループにまとめる方法がクラスタリングです。正解ラベルを与える識別とは異なります。",
    "主成分分析は、元の変数を組み合わせて分散の大きい方向を求め、少数の主成分でデータを表す次元削減の方法です。",
    "ウォード法は、クラスタ内の平方和の増加が小さい組を段階的に結合する階層クラスタリングです。k平均法は非階層型です。",
    "モザイクプロットはクロス集計の度数や比率を長方形の面積で表し、カテゴリ間の構成を比較する図です。",
    "対応分析はカテゴリのクロス集計表から行・列の関係を少数の軸で表す方法です。質的データの関係を可視化できます。",
    "並べ替えると元は5,6,6,6,7,8,8で中央値は6です。50を加えると中央2値は6と7なので中央値は6.5となり、変化は0.5です。外れ値は平均や分散・標準偏差・最大値をより大きく変化させます。",
    "中心線と管理限界線で工程の異常を監視する図は管理図です。",
    "平均からの偏差の積を平均する式なので、2変数が一緒に変動する傾向を表す共分散です。",
    "市場成長率も市場占有率も高い製品群は、プロダクトポートフォリオの花形に当たります。",
    "交絡変数が両方の変数に影響して生じる、直接の因果関係を伴わない相関は疑似相関です。",
    "重心は各座標の平均です。(x,y,z)=((0+3+6)/3,(3+3+3)/3,(0+0+6)/3)=(3,3,2)なのでz=2です。",
    "ユークリッド距離が近い中心へ割り当てます。Clust1・Clust2への距離の2乗はAが1・50、Bが10・29、Cが73・2です。よってAとBはClust1、CはClust2です。大小比較では平方根を計算する必要はありません。",
    "階層型はクラスタを段階的に結合するなどして階層構造を作ります。ウォード法では結合によるクラスタ内平方和の増加を基準にします。",
    "k平均法はクラスタ数kと初期中心を設定し、近い中心への割り当てと各クラスタの平均による中心更新を繰り返します。",
    "通常のウォード法は各データから結合を始めるため、k平均法のような初期中心の設定を要しません。k平均法は最初の中心によって最終結果が変わることがあります。",
    "初期中心が変わると最初の割り当てが変わり、その後の平均による中心更新も変わります。結果として異なる局所的な解に収束することがあります。",
    "ウォード法は階層的な結合、k平均法は中心への割り当てと中心更新を行います。k平均法には初期中心による結果の違いがあります。"
  ]
].freeze

CONTROL_CONTEXT = "全体の平均μ=3.0、標準偏差σ=0.1が既知である。次の抜き出したデータについて3シグマ法のX管理図を考える。\nデータ: 3.1, 3.0, 3.2, 2.9, 3.0, 2.6, 2.8, 3.2, 3.4, 3.0, 3.1, 2.8, 3.0, 3.1"
PROMPTS = {
  [0, 5] => "n個の2変数データ(xᵢ, yᵢ)について、(1/n)Σᵢ₌₁ⁿ(xᵢ-x̄)(yᵢ-ȳ) によって求められる統計量の名称を選びなさい。x̄とȳはそれぞれの平均である。",
  [0, 6] => "n個のデータxᵢについて、(1/n)Σᵢ₌₁ⁿ(xᵢ-x̄)² によって求められる統計量の名称を選びなさい。x̄は平均である。",
  [0, 10] => "#{CONTROL_CONTEXT}\n\n管理図の中心線CLの式として適切なものを1つ選びなさい。",
  [0, 11] => "#{CONTROL_CONTEXT}\n\n管理図の上方管理限界線UCLの式として適切なものを1つ選びなさい。",
  [0, 12] => "#{CONTROL_CONTEXT}\n\n管理図の下方管理限界線LCLの式として適切なものを1つ選びなさい。",
  [0, 13] => "#{CONTROL_CONTEXT}\n\n管理限界の外にあるため異常値と判断できる値を全て答えなさい。",
  [1, 8] => "n個の2変数データ(xᵢ, yᵢ)について、(1/n)Σᵢ₌₁ⁿ(xᵢ-x̄)(yᵢ-ȳ) によって求められる統計量の名称を選びなさい。x̄とȳはそれぞれの平均である。",
  [1, 11] => "A=(0,3,0)、B=(3,3,0)、C=(6,3,6)の重心の座標(x,y,z)を求めたとき、zの値を整数で答えなさい。",
  [1, 12] => "データA=(0,3,0)、B=(3,3,0)、C=(6,3,6)がある。k平均法の中心点がClust1=(0,4,0)、Clust2=(5,3,5)のとき、各データをユークリッド距離が近い中心のクラスターに対応させなさい。"
}.freeze
DUPLICATES = { 7 => 9, 8 => 5, 9 => 7, 10 => 1 }.freeze

def clean(text)
  text.to_s.tr("\u00a0", " ").gsub(/[\t 　]+/, " ").gsub(/ *\n */, "\n").gsub(/\n{3,}/, "\n\n").strip
end

def text_of(node)
  return node.text if node.text?
  return "" if node.comment?
  return "\n" if node.name == "br"
  text = node.children.map { |child| text_of(child) }.join
  %w[p div h1 h2 h3].include?(node.name) ? "\n#{text}\n" : text
end

def question_id(file_index, number)
  "data-mining-quiz#{file_index + 1}-#{format('%03d', number)}"
end

def grade_correct?(root)
  root.at_css(".answer.correct") || root.css(".answer.percent").any? { |grade| grade.text.strip == "100%正解" }
end

abort "Usage: ruby scripts/import_data_mining_quizzes.rb DM小テスト1.webarchive DM小テスト2.webarchive" unless ARGV.length == 2
questions = []
ARGV.each_with_index do |path, file_index|
  xml, status = Open3.capture2("plutil", "-convert", "xml1", "-o", "-", path)
  raise "Cannot read archive: #{path}" unless status.success?
  data = Nokogiri::XML(xml).at_xpath("//key[text()='WebMainResource']/following-sibling::dict[1]/key[text()='WebResourceData']/following-sibling::data[1]")
  raise "Missing main resource" unless data
  paper = Nokogiri::HTML(Base64.decode64(data.text).force_encoding("UTF-8")).at_css(".querypaper")
  raise "Missing question paper" unless paper
  raise "Unexpected image: review before import" unless paper.css("img.articleimage").empty?

  # Keep one accessible representation of each formula, without MathJax's duplicated SVG/script text.
  paper.css(".embedded-mathjax").each do |math|
    formula = math.at_css("math")&.text || math.at_css("script")&.text
    raise "Missing formula" unless formula
    math.replace(Nokogiri::XML::Text.new(formula, paper.document))
  end
  roots = paper.css("ol.queryselection, ol.powerselection, input.queryinput, div.matching-frame")
  raise "Unexpected question count" unless roots.length == EXPLANATIONS[file_index].length
  answers = roots.map do |root|
    if root["class"].to_s.include?("matching-frame")
      raise "Unconfirmed matching answer" unless grade_correct?(root)
      labels = root.css("ol.matching-list > li").map { |li| clean(li.text) }
      choices = root.css("ol.matchingselection > li").map { |li| clean(li.text) }
      values = root.css("select").map do |select|
        # manaba shuffles option values; the visible selected letter refers to the displayed choice order.
        letter = select.at_css("option[selected]")&.text&.strip
        raise "Missing selected letter" unless letter&.match?(/\A[a-z]\z/)
        choices.fetch(letter.ord - "a".ord)
      end
      raise "Unmatched labels" unless labels.length == values.length
      { type: "matching", answer: labels.zip(values).map { |label, value| "#{label} = #{value}" }.join(" / "), choices: choices.map.with_index { |choice, i| "#{('a'.ord + i).chr}: #{choice}" } }
    elsif root.name == "input"
      raise "Unconfirmed input answer" unless grade_correct?(root.next_element)
      { type: "text", answer: clean(root["value"]), choices: [] }
    else
      raise "Unconfirmed selected answer" unless root.next_element && grade_correct?(root.next_element)
      chosen = root.css("li").select { |li| li.at_css("input[checked]") }
      raise "Missing selected answer" if chosen.empty?
      { type: root["class"].include?("powerselection") ? "multiple" : "single", answer: chosen.map { |li| clean(li.at_css("label").text) }.join(" / "), choices: root.css("li").map { |li| clean(li.at_css("label").text) } }
    end
  end
  roots.each_with_index { |root, index| root.replace(Nokogiri::XML::Text.new("[[QUESTION:#{index}]]", paper.document)) }
  paper.css("script, style, .pointform, .answer, h1, h2, h3").remove
  parts = text_of(paper).split(/\[\[QUESTION:\d+\]\]/)
  answers.each_with_index do |answer, index|
    number = index + 1
    id = question_id(file_index, number)
    if file_index == 1 && DUPLICATES.key?(number)
      existing = questions.find { |q| q[:id] == question_id(0, DUPLICATES.fetch(number)) }
      raise "Duplicate answers disagree" unless existing && existing[:answer] == answer[:answer]
      existing[:sourceQuestionIds] << id
      existing[:slideReference] += "、DM小テスト2.webarchive（採点済み正解）"
      next
    end
    prompt = PROMPTS.fetch([file_index, number]) { clean(parts[index]).sub(/\A[（(][０-９\d]+[）)]\s*/, "").sub(/\A問[１２３]\s*/, "") }
    raise "Empty prompt or answer" if prompt.empty? || answer[:answer].empty?
    questions << { id: id, source: "データマイニング 小テスト#{file_index + 1}", category: "data-mining-quiz", semester: "second", number: number, prompt: prompt, **answer, images: [], explanation: EXPLANATIONS[file_index][index], slideReference: "DM小テスト#{file_index + 1}.webarchive（採点済み正解）", sourceQuestionIds: [id] }
  end
end
raise "Unexpected merged count" unless questions.length == 26 && questions.sum { |q| q[:sourceQuestionIds].length } == 30
File.write(File.join(ROOT, "data_mining_questions.js"), "window.DATA_MINING_QUESTION_DATA = #{JSON.pretty_generate(questions)};\n")
puts "Generated #{questions.length} questions from 30 original questions (4 duplicates merged)."
