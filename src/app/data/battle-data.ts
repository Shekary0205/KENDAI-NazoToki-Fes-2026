export interface BattleQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  /** チェックリスト形式（複数選択）の場合に使用 */
  type?: "single" | "checkbox";
  /** 複数正解のインデックス（type: "checkbox" 時に使用） */
  correctIndices?: number[];
  /** 正解後に表示する解説 */
  explanation?: string;
  /** 解説に表示する画像パス */
  explanationImage?: string;
}

export interface BattleData {
  departmentId: string;
  enemyName: string;
  enemyImage: string;
  /** 画像のY方向シフト */
  enemyImageOffsetY?: string;
  enemyMaxHp: number;
  playerMaxHp: number;
  damageToEnemy: number;
  damageToPlayer: number;
  questions: BattleQuestion[];
  /** true の場合、問題プールからランダムに出題し、一度出た問題は繰り返さない */
  randomOrder?: boolean;
}

export const battleData: BattleData[] = [
  {
    departmentId: "health-welfare",
    enemyName: "1号館の王",
    enemyImage: "/images/1goukan-king.png",
    enemyImageOffsetY: "35%",
    enemyMaxHp: 100,
    playerMaxHp: 100,
    damageToEnemy: 10,
    damageToPlayer: 20,
    randomOrder: true,
    questions: [
      {
        question: "平成16年に名称変更される前の医療情報学科の名前は？",
        options: ["医療情報学科", "医療福祉情報学科", "情報福祉学科", "医療工学科"],
        correctIndex: 1,
        explanation: "医療情報学科は平成16年に現在の名称へ変更されるまで『医療福祉情報学科』という名前でした。医療・福祉・情報の3つの領域を横断して学ぶ特色ある学科として設立された歴史があります。"
      },
      {
        question: "平成21年に名称変更される前の社会福祉学科の名前は？",
        options: ["保健福祉学科", "総合福祉学科", "健康福祉学科", "福祉総合学科"],
        correctIndex: 0,
        explanation: "社会福祉学科は平成21年に現在の名称へ変更されるまで『保健福祉学科』という名前でした。学科の広報活動の充実と学生の教育的効果を目的として、同年に学生団体『もりプロ』も発足しました。"
      },
      {
        question: "本学の禁煙化活動のテーマはどれ？",
        options: ["禁煙は愛", "健康第一", "スモークフリー健大", "クリーンキャンパス"],
        correctIndex: 0,
        explanation: "本学の禁煙化活動のテーマは『禁煙は愛』。自分自身と周囲の人々の健康を守るための愛情ある選択であるという想いが込められています。"
      },
      {
        question: "タバコは？",
        options: ["嗜好品", "有害", "文化", "娯楽"],
        correctIndex: 1,
        explanation: "タバコは有害。喫煙は肺がんをはじめとするさまざまな疾患の原因となり、副流煙は周囲の人の健康にも悪影響を及ぼします。本学は学生・教職員の健康を守るため禁煙化活動に取り組んでいます。"
      },
      {
        question: "入学式で壇上発表を行なった学生団体をすべて選べ",
        options: [
          "学友会執行部",
          "藤龍祭実行委員会",
          "体育祭実行委員会",
          "KPAL",
          "広報研究会",
          "もりプロ"
        ],
        type: "checkbox",
        correctIndices: [0, 1, 2, 3],
        explanation: "入学式では『学友会執行部』『藤龍祭実行委員会』『体育祭実行委員会』『KPAL』の4団体が壇上発表を行い、新入生に各団体の活動内容を紹介しました。"
      },
      {
        question: "高崎健康福祉大学の本部がある号館はどこ？",
        options: ["1号館", "2号館", "3号館", "5号館"],
        correctIndex: 0,
        explanation: "高崎健康福祉大学の本部（大学事務局）は1号館に設置されています。謎解きフェスの景品受付も1号館エントランスです。"
      },
      {
        question: "3号館第一体育館上にあるトレーニングジムの名称は？",
        options: ["トレーニングルーム", "フィットネスルーム", "筋トレルーム", "ヘルスケアジム"],
        correctIndex: 1,
        explanation: "3号館第一体育館上にあるトレーニングジムは『フィットネスルーム』。学生が自由に利用でき、健康づくりや部活動のトレーニングに活用されています。"
      },
      {
        question: "3号館3階フィットネスルームを運営している部活動の名称は？",
        options: ["フィットネス部", "筋トレ部", "トレーニング部", "健康増進部"],
        correctIndex: 1,
        explanation: "3号館3階のフィットネスルームは、学生団体『筋トレ部』が中心となって運営しています。利用ルールの整備や器具の管理などを学生自ら行っています。"
      },
      {
        question: "本学の強化指定部をすべて選べ",
        options: [
          "スケート部",
          "水泳（飛び込み）",
          "準硬式野球部",
          "男子剣道部",
          "女子剣道部",
          "バドミントン部"
        ],
        type: "checkbox",
        correctIndices: [0, 1, 2, 3, 4, 5],
        explanation: "本学の強化指定部は、スケート部・水泳（飛び込み）・準硬式野球部・男子剣道部・女子剣道部・バドミントン部の6部。全国大会出場レベルの実績を持ち、大学から特別な強化支援を受けています。"
      },
      {
        question: "入学式でパフォーマンスを行なった和太鼓集団の名称は？",
        options: ["和太鼓集団 舞", "健大太鼓", "紫龍太鼓", "鼓動"],
        correctIndex: 0,
        explanation: "入学式では和太鼓集団『舞』が迫力あるパフォーマンスを披露し、新入生の門出を祝いました。"
      },
      {
        question: "2号館図書館(本館)の蔵書数はいくつ？",
        options: ["51387冊", "71387冊", "81387冊", "91387冊"],
        correctIndex: 2,
        explanation: "2号館図書館（本館）の蔵書数は81387冊。医療・福祉・栄養・情報などの専門書籍が豊富に揃っており、学生の学習や研究を支える本学の知の拠点です。"
      },
      {
        question: "本学に図書館はいくつある？",
        options: ["1つ", "2つ", "3つ", "4つ"],
        correctIndex: 2,
        explanation: "本学には図書館が全部で3つあります。本館に加えて専門分野の分館があり、学生は目的に応じて使い分けることができます。"
      },
      {
        question: "1号館第一PC室には何台のパソコンが設置されている？",
        options: ["80台", "100台", "120台", "150台"],
        correctIndex: 2,
        explanation: "1号館第一PC室には120台のパソコンが設置されています。授業や自習、資格試験の学習などに幅広く活用されています。"
      },
      {
        question: "本学学生が利用できる女子寮「紫寮」の読み方は？",
        options: ["むらさきりょう", "しりょう", "ゆかりりょう", "しゆうりょう"],
        correctIndex: 2,
        explanation: "本学の女子寮『紫寮』は『ゆかりりょう』と読みます。『紫』は本学のスクールカラーを象徴する色でもあります。"
      },
      {
        question: "KPALとは何の略？",
        options: [
          "健大プロアクティブリーダーズ",
          "健康福祉アクティブリーダー",
          "高崎プロジェクトアシストリーダー",
          "健大パーフェクトリーダー"
        ],
        correctIndex: 0,
        explanation: "KPALは『Kendai ProActive Leaders（健大プロアクティブリーダーズ）』の略。本学のリーダー団体として入学式・オープンキャンパス・各種イベントの企画運営に携わっています。"
      },
      {
        question: "KPALマスコットキャラクターのエリマキトカゲの名称は？",
        options: ["エリーちゃん", "えりまきくん", "マキマキ", "カゲッピ"],
        correctIndex: 0,
        explanation: "KPALのマスコットキャラクターはエリマキトカゲの『エリーちゃん』。KPALの活動を親しみやすく伝える顔として活躍しています。"
      },
      {
        question: "藤龍祭のマスコットキャラクターの名称は？",
        options: ["りゅうりゅうくん", "ふじくん", "たつのすけ", "とうりゅうくん"],
        correctIndex: 0,
        explanation: "藤龍祭のマスコットキャラクターは『りゅうりゅうくん』。大学祭を華やかに盛り上げる親しみやすいキャラクターです。"
      },
      {
        question: "「全会員の責任ある自治活動により、会員相互の親睦と学業の研鑽並びに心身の向上をはかり、学風の高揚に努めることを目的とする」高崎健康福祉大学の学生による自治会の名称を答えろ",
        options: ["学友会執行部", "学生自治会", "学友会", "学生会"],
        correctIndex: 0,
        explanation: "高崎健康福祉大学の学生自治会は『学友会執行部』。全会員の責任ある自治活動により、会員相互の親睦・学業の研鑽・心身の向上を図り、学風の高揚に努めることを目的として活動しています。"
      },
      {
        question: "健康福祉学部の学部長は何学科の先生？",
        options: ["社会福祉学科", "医療情報学科", "健康栄養学科", "保健医療学科"],
        correctIndex: 2,
        explanation: "現在の健康福祉学部長は『健康栄養学科』の先生が務めています。学部を横断して学生の学びをサポートしています。"
      },
      {
        question: "生活上の困難を抱える人々に対し、相談援助や社会資源の活用を通じて自立や解決を支援する専門職はどれ？",
        options: ["ソーシャルワーカー", "ケアマネジャー", "ヘルパー", "カウンセラー"],
        correctIndex: 0,
        explanation: "ソーシャルワーカーは、生活上の困難を抱える人々に対し、相談援助や社会資源の活用を通じて自立や解決を支援する専門職です。社会福祉士・精神保健福祉士などの国家資格を持って働くのが一般的です。"
      },
      {
        question: "ソーシャルワーカーを目指すことができる学科はどれ？",
        options: ["社会福祉学科", "保健医療学科", "健康栄養学科", "医療情報学科"],
        correctIndex: 0,
        explanation: "ソーシャルワーカーを目指せるのは『社会福祉学科』。社会福祉士・精神保健福祉士・介護福祉士などの国家試験受験資格を取得でき、福祉・医療・行政の現場で活躍する専門職を養成します。"
      },
      {
        question: "介護福祉士を目指すことができる学科はどれ？",
        options: ["保健医療学科", "社会福祉学科", "健康栄養学科", "医療情報学科"],
        correctIndex: 1,
        explanation: "介護福祉士を目指せるのは社会福祉学科の介護コース。1年次から段階的に実習が組まれており、社会福祉士と介護福祉士の2つの国家試験受験資格を同時に目指すことができます。"
      },
      {
        question: "診療情報管理士を目指すことができる学科はどれ？",
        options: ["医療情報学科", "保健医療学科", "社会福祉学科", "健康栄養学科"],
        correctIndex: 0,
        explanation: "診療情報管理士を目指せるのは医療情報学科。医療コースでは診療情報管理士と医療事務管理士の2つの資格取得を目指せます。"
      },
      {
        question: "管理栄養士を目指すことができる学科はどれ？",
        options: ["健康栄養学科", "保健医療学科", "社会福祉学科", "医療情報学科"],
        correctIndex: 0,
        explanation: "管理栄養士を目指せるのは健康栄養学科。卒業と同時に栄養士免許を取得でき、管理栄養士の国家試験受験資格も得られます。"
      },
      {
        question: "サプリメントアドバイザーを目指すことができる学科はどれ？",
        options: ["健康栄養学科", "保健医療学科", "医療情報学科", "社会福祉学科"],
        correctIndex: 0,
        explanation: "NR・サプリメントアドバイザーを目指せるのは健康栄養学科。栄養学の深い知識を背景に、消費者へ科学的根拠に基づいたサプリメント情報を提供できる専門家を養成します。"
      },
      {
        question: "精神保健福祉士を目指すことができる学科はどれ？",
        options: ["社会福祉学科", "保健医療学科", "健康栄養学科", "医療情報学科"],
        correctIndex: 0,
        explanation: "精神保健福祉士を目指せるのは社会福祉学科の社会福祉コース。社会福祉士に加えて精神保健福祉士の国家試験受験資格を取得できます。"
      },
      {
        question: "社会福祉学科の学生が目指すことができる「MSW」はなんの略？",
        options: ["医療ソーシャルワーカー", "Master of Social Work", "Main Social Welfare", "Medical Support Worker"],
        correctIndex: 0,
        explanation: "MSWは『Medical Social Worker（医療ソーシャルワーカー）』の略。病院などの医療機関で患者やその家族の相談を受け、退院後の生活支援や地域連携を担う専門職です。"
      },
      {
        question: "入試にて、SS特待生を選抜するための本学特有の入試制度はどれ？",
        options: ["健大特待入試", "健大スカラシップ選抜", "スーパー特待選抜", "SS奨学入試"],
        correctIndex: 1,
        explanation: "SS特待生を選抜する本学特有の入試制度は『健大スカラシップ選抜』。優秀な学生には学費減免などの大きな特典が与えられます。"
      },
      {
        question: "本学のオープンキャンパスの運営を行なっている部活動の名称は？",
        options: ["広報研究会", "オープンキャンパス委員会", "高大連携部", "PR部"],
        correctIndex: 0,
        explanation: "本学のオープンキャンパス運営は学生団体『広報研究会』が中心となって行っています。キャンパスツアーや学科紹介、参加者との交流を通じて高校生に本学の魅力を伝えています。"
      },
      {
        question: "本学のマスコットキャラクターの名称は？",
        options: ["健大くん", "ふくしくん", "自利利他くん", "けんだいちゃん"],
        correctIndex: 2,
        explanation: "本学のマスコットキャラクターは『自利利他くん』。『自利利他』とは仏教用語で『自分のためだけでなく他者の幸せにも貢献する』という意味で、本学の教育理念を体現するキャラクターです。"
      },
      {
        question: "本学大学祭が藤龍祭へ名称変更される前の名前はどれ？",
        options: ["紫祭", "健大祭", "福祉祭", "藤祭"],
        correctIndex: 0,
        explanation: "本学大学祭は現在の『藤龍祭』に名称変更される前は『紫祭（ゆかりさい）』と呼ばれていました。本学のスクールカラーである紫色にちなんだ名称です。"
      }
    ]
  },
  {
    departmentId: "health-medical",
    enemyName: "白衣の戦士",
    enemyImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    enemyMaxHp: 100,
    playerMaxHp: 100,
    damageToEnemy: 20,
    damageToPlayer: 25,
    questions: [
      {
        question: "看護師の象徴とされる帽子の由来は？",
        options: ["ナイチンゲール", "赤十字", "修道女", "軍隊"],
        correctIndex: 2
      },
      {
        question: "医療で使われる「バイタルサイン」に含まれないものは？",
        options: ["体温", "脈拍", "血圧", "体重"],
        correctIndex: 3
      },
      {
        question: "救急車の電話番号は？",
        options: ["110", "119", "117", "118"],
        correctIndex: 1
      },
      {
        question: "医療で「カルテ」と呼ばれるものの正式名称は？",
        options: ["診察記録", "診療録", "患者記録", "医療記録"],
        correctIndex: 1
      },
      {
        question: "日本で看護師の免許を管理している省庁は？",
        options: ["文部科学省", "厚生労働省", "総務省", "内閣府"],
        correctIndex: 1
      }
    ]
  },
  {
    departmentId: "pharmacy",
    enemyName: "麻薬取締豪鬼",
    enemyImage: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
    enemyMaxHp: 100,
    playerMaxHp: 100,
    damageToEnemy: 10,
    damageToPlayer: 20,
    randomOrder: true,
    questions: [
      {
        question: "本学薬学部で取得できる資格をすべて選べ",
        options: [
          "薬剤師",
          "麻薬取締官",
          "医薬部外品・化粧品・医療用具製造所責任技術者",
          "食品衛生管理者",
          "食品衛生監視員",
          "環境衛生指導員",
          "登録販売者",
          "MR"
        ],
        type: "checkbox",
        correctIndices: [0, 1, 2, 3, 4, 5],
        explanation: "本学薬学部では、薬剤師・麻薬取締官・医薬部外品等製造所責任技術者・食品衛生管理者・食品衛生監視員・環境衛生指導員の6つの資格取得を目指すことができます。"
      },
      {
        question: "薬学部の研究室配属は何年生進級時に行われる？",
        options: ["3年生", "4年生", "5年生", "6年生"],
        correctIndex: 2,
        explanation: "薬学部の研究室配属は5年生進級時に行われます。研究室に所属して卒業研究に取り組みながら、病院・薬局での実務実習にも参加します。"
      },
      {
        question: "毎年春に開催される海外研修の研修先病院「ホーチミン医科薬科大学」はどこの国？",
        options: ["タイ", "ベトナム", "カンボジア", "フィリピン"],
        correctIndex: 1,
        explanation: "毎年春に開催される海外研修では、ベトナムのホーチミン医科薬科大学で研修を行います。現地の医療・薬学事情を学び、国際的な視野を広げる貴重な機会です。"
      },
      {
        question: "毎年夏に開催される夏のオーストラリア研修では、どの大学で研修を行う？",
        options: ["メルボルン大学", "シドニー大学", "クイーンズランド大学", "モナッシュ大学"],
        correctIndex: 1,
        explanation: "毎年夏にはオーストラリアのシドニー大学で研修が行われます。世界トップレベルの薬学教育を体験し、英語でのコミュニケーション能力も養います。"
      },
      {
        question: "薬学部薬学科の学生が実務実習を開始する前に技能及び態度が一定の基準に到達しているかを客観的に評価するための実技試験は？",
        options: ["OSCE（オスキー）", "CBT", "USMLE", "国家試験模試"],
        correctIndex: 0,
        explanation: "OSCE（Objective Structured Clinical Examination：客観的臨床能力試験）は、実務実習前に学生の調剤技能や患者対応などの実技能力を客観的に評価する試験です。合格することで実習に参加できます。"
      },
      {
        question: "知識、態度が一定の基準に達しているかを、コンピューターを使って客観的に評価する試験は？",
        options: ["CBT", "OSCE", "TOEIC", "国家試験"],
        correctIndex: 0,
        explanation: "CBT（Computer Based Testing）は、コンピューターを使って薬学に関する知識・態度が一定基準に達しているかを客観的に評価する試験です。OSCEとともに実務実習の前に合格が必要です。"
      },
      {
        question: "薬剤師国家試験を受験できるのは何年制の大学？",
        options: ["4年制", "5年制", "6年制", "大学院修了"],
        correctIndex: 2,
        explanation: "薬剤師国家試験の受験資格は6年制の薬学部を卒業（見込み含む）することで得られます。4年制薬学部では受験資格が得られません。"
      },
      {
        question: "薬学部で年に2回、春と秋に、卒業生や保険薬局、病院の薬剤師さん等を対象に行われるセミナーの名称は？",
        options: ["生涯学習セミナー", "卒後研修会", "薬剤師リカレント講座", "ファーマシー勉強会"],
        correctIndex: 0,
        explanation: "生涯学習セミナーは年2回（春・秋）開催され、卒業生や保険薬局・病院の薬剤師を対象に最新の薬学知識をアップデートする場を提供しています。"
      },
      {
        question: "保健統計、疫学、感染症の予防、生活習慣病、食品の安全性、身の回りの化学物質、大気・水・室内の環境と健康の関係について幅広く学ぶ学問は？",
        options: ["公衆衛生学", "環境科学", "予防医学", "疫学"],
        correctIndex: 0,
        explanation: "公衆衛生学は、保健統計・疫学・感染症予防・生活習慣病・食品安全性・環境と健康の関係など、社会全体の健康を守るための学問です。薬剤師として地域の健康に貢献するために不可欠な知識を学びます。"
      },
      {
        question: "免疫系の異常によっておこるアレルギーなどの疾患や、免疫学を応用した検査や薬についても学習する学問は？",
        options: ["免疫学", "病理学", "薬理学", "微生物学"],
        correctIndex: 0,
        explanation: "免疫学は、免疫系の仕組みやアレルギー・自己免疫疾患などの異常、そして免疫学を応用した検査法や治療薬について学ぶ学問です。"
      },
      {
        question: "各疾患の病態を理解した上で、治療に使用される医薬品の基本的な知識および実際の使い方について学習する学問は？",
        options: ["薬物療法学", "薬理学", "臨床薬学", "病態生理学"],
        correctIndex: 0,
        explanation: "薬物療法学は、各疾患の病態を理解した上で、治療に使用される医薬品の基本的な知識と実際の使用法を学ぶ実践的な学問です。"
      },
      {
        question: "薬剤がどのようにつくられ、病気の治療にどのように使われるのかという知識を習得することを目的とする科目は？",
        options: ["薬剤学", "製剤学", "薬物動態学", "調剤学"],
        correctIndex: 0,
        explanation: "薬剤学は、薬がどのように製造され、体内でどのように作用し、どのように治療に使われるかを総合的に学ぶ科目です。"
      },
      {
        question: "薬学部、学部長の名前は？",
        options: ["松岡功 教授", "田中健一 教授", "佐藤明 教授", "山本太郎 教授"],
        correctIndex: 0,
        explanation: "薬学部の学部長は松岡功教授です。薬学教育の発展と学生の育成に尽力されています。"
      },
      {
        question: "動物実験室に飼育されている動物を４種類すべて選べ",
        options: ["マウス", "ラット", "モルモット", "ウサギ", "ハムスター", "サル"],
        type: "checkbox",
        correctIndices: [0, 1, 2, 3],
        explanation: "動物実験室ではマウス・ラット・モルモット・ウサギの4種類が飼育されています。薬の効果や安全性を確認するための基礎研究に活用されています。"
      },
      {
        question: "化合物の分離精製を行う液体クロマトグラフと化合物の分子量を測定する質量分析計を結合した複合装置が設置された部屋の名称は？",
        options: ["LC-MS測定室", "NMR測定室", "HPLC分析室", "質量分析室"],
        correctIndex: 0,
        explanation: "LC-MS測定室には、液体クロマトグラフ（LC）と質量分析計（MS）を組み合わせた高性能な複合装置が設置されており、化合物の分離・同定・定量分析に使用されます。"
      },
      {
        question: "薬学棟に設置された、細胞や組織内の微細構造を空間的・時間的に精密に解析することができる顕微鏡システムは？",
        options: ["共焦点レーザースキャン顕微鏡システム", "電子顕微鏡", "蛍光顕微鏡", "位相差顕微鏡"],
        correctIndex: 0,
        explanation: "共焦点レーザースキャン顕微鏡システムは、レーザー光を用いて細胞や組織内の微細構造を3次元的かつ高解像度で観察できる最先端の顕微鏡です。"
      },
      {
        question: "薬学棟に設置された、細胞表面に発現する抗原等のマーカーを基に細胞の性質を解析する装置は？",
        options: ["フローサイトメトリー解析装置", "PCR装置", "ウェスタンブロット装置", "マイクロプレートリーダー"],
        correctIndex: 0,
        explanation: "フローサイトメトリー解析装置は、細胞を一つずつ流しながらレーザー光を当て、細胞表面の抗原等のマーカーを基に細胞の性質や種類を高速で解析する装置です。"
      }
    ]
  },
  {
    departmentId: "child-education",
    enemyName: "教育の番人",
    enemyImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop",
    enemyMaxHp: 100,
    playerMaxHp: 100,
    damageToEnemy: 20,
    damageToPlayer: 25,
    questions: [
      {
        question: "日本の義務教育の年数は？",
        options: ["6年", "9年", "10年", "12年"],
        correctIndex: 1
      },
      {
        question: "保育士の資格を管理する法律は？",
        options: ["教育基本法", "学校教育法", "児童福祉法", "保育法"],
        correctIndex: 2
      },
      {
        question: "ピアノの鍵盤は全部で何鍵？",
        options: ["76鍵", "88鍵", "100鍵", "108鍵"],
        correctIndex: 1
      },
      {
        question: "日本で最初の幼稚園が開設されたのは何時代？",
        options: ["江戸時代", "明治時代", "大正時代", "昭和時代"],
        correctIndex: 1
      },
      {
        question: "「モンテッソーリ教育」の創始者の出身国は？",
        options: ["フランス", "ドイツ", "イタリア", "イギリス"],
        correctIndex: 2
      }
    ]
  },
  {
    departmentId: "agriculture",
    enemyName: "大地の守り神",
    enemyImage: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop",
    enemyMaxHp: 100,
    playerMaxHp: 100,
    damageToEnemy: 20,
    damageToPlayer: 25,
    questions: [
      {
        question: "日本の農業従事者の平均年齢はおよそ何歳？",
        options: ["50歳", "60歳", "68歳", "75歳"],
        correctIndex: 2
      },
      {
        question: "日本で最も生産量が多い野菜は？",
        options: ["キャベツ", "大根", "玉ねぎ", "トマト"],
        correctIndex: 1
      },
      {
        question: "「有機農業」で使用が禁止されているものは？",
        options: ["堆肥", "化学肥料", "種", "水"],
        correctIndex: 1
      },
      {
        question: "稲作で「田植え」が行われる時期は？",
        options: ["3月〜4月", "5月〜6月", "7月〜8月", "9月〜10月"],
        correctIndex: 1
      },
      {
        question: "群馬県の農業生産額が全国1位の作物は？",
        options: ["こんにゃく芋", "りんご", "米", "キャベツ"],
        correctIndex: 0
      }
    ]
  },
  {
    departmentId: "psychology",
    enemyName: "心の探求者",
    enemyImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    enemyMaxHp: 100,
    playerMaxHp: 100,
    damageToEnemy: 20,
    damageToPlayer: 25,
    questions: [
      {
        question: "心理学の父と呼ばれる人物は？",
        options: ["フロイト", "ユング", "ヴント", "スキナー"],
        correctIndex: 2
      },
      {
        question: "「無意識」の概念を提唱した心理学者は？",
        options: ["フロイト", "ユング", "アドラー", "エリクソン"],
        correctIndex: 0
      },
      {
        question: "人間の記憶を「短期記憶」と「長期記憶」に分類したのは？",
        options: ["パブロフ", "アトキンソン", "スキナー", "バンデューラ"],
        correctIndex: 1
      },
      {
        question: "「マズローの欲求階層説」の最上位にある欲求は？",
        options: ["承認欲求", "自己実現欲求", "所属欲求", "安全欲求"],
        correctIndex: 1
      },
      {
        question: "公認心理師の国家資格が日本で創設されたのは何年？",
        options: ["2015年", "2017年", "2019年", "2021年"],
        correctIndex: 1
      }
    ]
  }
];

export const getBattleDataByDepartmentId = (departmentId: string): BattleData | undefined => {
  return battleData.find(battle => battle.departmentId === departmentId);
};
