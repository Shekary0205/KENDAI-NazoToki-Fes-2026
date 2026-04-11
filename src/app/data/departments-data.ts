export interface StageData {
  id: number;
  location: string;
  riddle: string;
  hint: string;
  answer: string;
  nextLocationHint: string;
  /** チェックリスト形式の場合 */
  type?: "text" | "checkbox";
  /** チェックリストの選択肢 */
  options?: string[];
  /** 正解の選択肢インデックス */
  correctIndices?: number[];
  /** 正解後の解説 */
  explanation?: string;
  /** 次の目的地の補足説明（タイトルと本文） */
  nextLocationDetail?: {
    title: string;
    body: string;
  };
  /** true の場合、次の目的地画面をスキップして直接次の問題へ進む */
  skipNextLocationScreen?: boolean;
}

export interface MidBattleQuestion {
  question: string;
  options: string[];
  type?: "single" | "checkbox";
  correctIndex?: number;
  correctIndices?: number[];
  explanation?: string;
}

export interface MidBattleData {
  /** このバトルを示すID */
  id: number;
  /** このステージIDをクリアした後に発生 */
  afterStageId: number;
  /** 勝利後に進むステージID（未指定の場合は afterStageId + 1） */
  nextStageId?: number;
  enemyName: string;
  enemyImage: string;
  enemyMaxHp: number;
  playerMaxHp: number;
  damageToEnemy: number;
  damageToPlayer: number;
  questions: MidBattleQuestion[];
  /** true の場合、問題プールからランダムに出題し、一度出た問題は繰り返さない */
  randomOrder?: boolean;
}

export interface DepartmentData {
  id: string;
  name: string;
  buildings: string;
  color: string;
  icon: string;
  stages: StageData[];
  midBattles?: MidBattleData[];
}

export const departments: DepartmentData[] = [
  {
    id: "health-welfare",
    name: "健康福祉学部",
    buildings: "1, 2, 3号館",
    color: "blue",
    icon: "💪",
    stages: [
      {
        id: 1,
        location: "1号館 エントランス",
        riddle: "1号館へようこそ。健康福祉学部の学科を３つ答えよう",
        hint: "医療・福祉・栄養に関する学科名を思い出してみよう",
        answer: "",
        nextLocationHint: "2階へ上がろう。壁に掲示されたイベント情報に注目！",
        type: "checkbox",
        options: ["医療情報学科", "理学療法学科", "社会福祉学科", "健康栄養学科", "健康福祉学科"],
        correctIndices: [0, 2, 3],
        explanation: "健康福祉学部は「医療情報学科」「社会福祉学科」「健康栄養学科」の3学科で構成されています。医療情報学科では医療×ITの専門人材を、社会福祉学科では社会福祉士や介護福祉士を、健康栄養学科では管理栄養士を養成しています。"
      },
      {
        id: 2,
        location: "1号館2階",
        riddle: "緑色の掲示板の謎を解け。",
        hint: "ポスターのタイトルの頭を読め",
        answer: "ようこそ健大",
        nextLocationHint: "右へ進み2号館学生ホール(食堂)へ"
      },
      {
        id: 3,
        location: "2号館 学生ホール(食堂)",
        riddle: "学生食堂の謎を解け",
        hint: "張り紙を探せ。",
        answer: "KPAL",
        nextLocationHint: "KPAL室入り口が示す場所に進め",
        explanation: "KPALとは本学のリーダー団体。本イベントの企画にもKPALが関与しています。",
        nextLocationDetail: {
          title: "KPAL室ってどこ？",
          body: "食堂を出て左へ進め。"
        }
      },
      {
        id: 4,
        location: "KPAL室入り口が示す場所",
        riddle: "示された場所を確認しろ",
        hint: "PC-????",
        answer: "医療DX",
        nextLocationHint: "エレベーターで3階まで進め",
        explanation: "医療DX（デジタルトランスフォーメーション）とは、電子カルテやオンライン診療、AI診断支援などデジタル技術を活用して医療の質と効率を高める取り組みです。本学の医療情報学科では、診療情報管理士や基本情報技術者などの資格取得を通じて、医療と情報の両方に精通した人材を育成しており、まさに医療DXを支える専門家を輩出しています。"
      },
      {
        id: 5,
        location: "1号館3階",
        riddle: "張り紙の問題に答えよう",
        hint: "階段の張り紙を確認してみよう",
        answer: "アリフィスとフォファル",
        nextLocationHint: "3階奥まで進め",
        explanation: "2月16日（月）、群馬県庁にて開催された「令和7年度やま・さと応縁隊成果発表会」において、本学科の学生が成果発表を行いました。\n\nやま・さと応縁隊とは\n「やま・さと応縁隊」は、群馬県農政課が県内の大学等に委託して実施する事業です。高齢化や人口減少などの課題を抱える中山間地域において、大学生が地域住民との交流やフィールドワークを通じて、地域の課題解決や魅力の発信方法を検討・提案します。単なる支援にとどまらず、地域に深く関わり、住民との「縁」を育むことで、地域に根付く独自の魅力を再発見し、地域の活性化につなげることを目的としています。"
      },
      {
        id: 6,
        location: "1号館3階",
        riddle: "張り紙の謎を解け",
        hint: "",
        answer: "社会福祉学科",
        nextLocationHint: "４階は社会福祉学科のフロア！４階に進もう",
        explanation: "高崎健康福祉大学の社会福祉学科は、人々の暮らしと尊厳を守る福祉専門職を育成する学科です。「社会福祉コース」と「介護福祉コース」の2コース制を採用しており、目指す進路に合わせて専門性を深められます。\n\n【取得を目指せる主な資格】\n・社会福祉士（国家試験受験資格）\n・精神保健福祉士（国家試験受験資格）\n・介護福祉士（国家試験受験資格）\n・高等学校教諭一種免許（福祉・公民）\n・司書・司書教諭\n\n【学びの特色】\n地域の福祉施設や医療機関、行政機関との連携による実習を重視し、「現場で活きる実践力」を養います。高齢者福祉、障がい者福祉、児童福祉、医療ソーシャルワークなど幅広い分野を体系的に学ぶことができ、卒業生は福祉施設・病院・行政・学校など多様なフィールドで活躍しています。"
      },
      {
        id: 7,
        location: "1号館4階",
        riddle: "張り紙の謎を解け",
        hint: "",
        answer: "車椅子",
        nextLocationHint: "廊下の掲示板を確認しろ"
      },
      {
        id: 8,
        location: "1号館4階",
        riddle: "張り紙の謎を解け",
        hint: "",
        answer: "介護士",
        nextLocationHint: "奥まで進め"
      }
    ],
    midBattles: [
      {
        id: 1,
        afterStageId: 5,
        nextStageId: 6,
        enemyName: "健康栄養の使者",
        enemyImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop",
        enemyMaxHp: 100,
        playerMaxHp: 100,
        damageToEnemy: 20,
        damageToPlayer: 20,
        randomOrder: true,
        questions: [
          {
            question: "健康栄養学科を卒業すると同時に取得できる資格は？",
            options: ["管理栄養士", "栄養士", "社会福祉士", "介護福祉士"],
            correctIndex: 1,
            explanation: "保育園・こども園・幼稚園、学校、薬局、スポーツ施設、社会福祉施設などで、様々なライフステージの人々に対して適切な食事計画を立案して食事提供を行ったり、栄養の指導を行ったりする資格です。本学科を卒業すると同時に都道府県知事より栄養士免許が与えられます。"
          },
          {
            question: "健康栄養学科にて、対応する科目を履修すると取得できる資格を全て選べ",
            options: [
              "管理栄養士",
              "医療事務管理士",
              "社会福祉士",
              "栄養教諭１種",
              "HACCP管理者",
              "フードスペシャリスト/専門フードスペシャリスト",
              "NR・サプリメントアドバイザー"
            ],
            type: "checkbox",
            correctIndices: [0, 3, 4, 5, 6],
            explanation: "【管理栄養士】\n傷病者や健康人に対して栄養指導、特定給食施設における給食管理や栄養管理を行う国家資格。本学科では国家試験受験資格が得られます。\n\n【栄養教諭１種】\n学校において児童・生徒の栄養指導や食育を行う教員免許。学校給食の管理と、食に関する指導を一体として行える専門家を養成します。\n\n【HACCP管理者】\n食品の製造・加工工程で発生する危害を予測・管理し、食品の安全性を確保するための国際的な衛生管理手法の専門家。食品関連企業での需要が高まっています。\n\n【フードスペシャリスト／専門フードスペシャリスト】\n食品の開発・流通・販売の現場で、食に関する高度な専門知識をもって消費者に的確な情報を提供する食の専門家です。\n\n【NR・サプリメントアドバイザー】\n一般消費者に対して、栄養成分やサプリメントに関する適切なアドバイスを行う専門家。日本臨床栄養協会が認定する資格です。\n\n※「医療事務管理士」は医療情報学科、「社会福祉士」は社会福祉学科で取得を目指す資格であり、健康栄養学科では取得できません。"
          },
          {
            question: "スーパーマーケット「とりせん」と本学科の高梨研究室で共同開発した第24弾栄養バランス弁当の名前は？",
            options: ["親子丼", "カレー", "ビビンバ", "ハンバーグ"],
            correctIndex: 2,
            explanation: "健康栄養学科 高梨研究室とスーパーマーケット「とりせん」は、2013年度から継続して栄養バランス弁当を共同開発しています。管理栄養士を目指す学生が、献立設計・栄養価計算・試作・試食評価までを担当し、1食あたりのエネルギー・塩分・野菜量などを配慮した「主食＋主菜＋副菜」がそろった健康的なお弁当を商品化してきました。\n\n第24弾となる今回は「ビビンバ」をテーマに開発。彩り豊かなナムルや具材を組み合わせ、栄養バランスと満足感を両立させた一品で、とりせん各店舗にて期間限定で販売されます。産学連携の取り組みを通じて、学生が実社会で活きる実践力を身につける貴重な機会となっています。"
          },
          {
            question: "健康食品やサプリメントの専門知識を証明する資格はどれ？",
            options: ["NR・サプリメントアドバイザー", "管理栄養士", "食品衛生管理者", "フードスペシャリスト"],
            correctIndex: 0,
            explanation: "個人の栄養状態や食事習慣を評価し、科学的根拠（エビデンス）に基づいた安全で適切な摂取方法をアドバイスします。薬剤師や管理栄養士などの医療関係者も取得する、サプリメント活用の専門家です。"
          },
          {
            question: "食に関する総合的な知識と技術を駆使して消費者に提案を行う力を証明する資格はどれ？",
            options: ["管理栄養士", "フードスペシャリスト", "HACCP管理者", "NR・サプリメントアドバイザー"],
            correctIndex: 1,
            explanation: "食の「おいしさ・楽しさ・おもてなし」を本質とし、食品の開発、流通、販売、外食などの分野で、食に関する総合的な知識と技術を駆使して消費者に提案を行う「食の専門職」です。公益社団法人日本フードスペシャリスト協会が認定する民間資格であり、大学や短大の指定学科で2〜4年間学び、認定試験に合格する必要があります。"
          },
          {
            question: "国・都道府県・地方行政機関等の公務員が食品衛生の仕事に就く際に必要な資格は？",
            options: ["食品衛生管理者", "食品衛生監視員", "HACCP管理者", "管理栄養士"],
            correctIndex: 1,
            explanation: "国・都道府県・地方行政機関等の公務員が食品衛生の仕事に就く際に必要な資格。\n本資格は任用資格であり、該当任用資格を取得後、当該職務に任用・任命されて初めて効力を発揮する資格のことを言います。"
          },
          {
            question: "乳製品、肉製品、添加物など、特に衛生上の考慮を必要とする食品の製造・加工を行う施設の食品衛生の維持・管理を行うことができる資格は？",
            options: ["食品衛生管理者", "食品衛生監視員", "HACCP管理者", "栄養教諭１種"],
            correctIndex: 0,
            explanation: "乳製品、肉製品、添加物など、特に衛生上の考慮を必要とする食品の製造・加工を行う施設の食品衛生の維持・管理を行います。本資格は任用資格であり、該当任用資格を取得後、当該職務に任用・任命されて初めて効力を発揮する資格のことを言います。"
          },
          {
            question: "様々なライフステージの人々に対して適切な食事計画を立案して食事提供を行ったり、栄養の指導を行ったりする資格は？",
            options: ["栄養士", "管理栄養士", "栄養教諭", "フードスペシャリスト"],
            correctIndex: 0,
            explanation: "保育園・こども園・幼稚園、学校、薬局、スポーツ施設、社会福祉施設などで、様々なライフステージの人々に対して適切な食事計画を立案して食事提供を行ったり、栄養の指導を行ったりする資格です。本学科を卒業すると同時に都道府県知事より栄養士免許が与えられます。"
          },
          {
            question: "イオンモール高崎で開催された「群馬県フェア2025」に出展した健康栄養学科のワークショップはどれ？",
            options: [
              "お野菜クイズ大会",
              "栄養学科プレゼンツ！ベジタブルクイズ",
              "フルーツ選手権",
              "ヘルシーフェスタ"
            ],
            correctIndex: 1,
            explanation: "2025年11月16日には、「栄養学科プレゼンツ！ベジタブルクイズ」と題したワークショップを実施しました。料理カードを用いて日頃の食事を振り返った後、野菜に関するクイズに挑戦してもらいました。当日はお子さんからご高齢の方まで幅広い年代の方にご参加いただき、62家族・計143人（男性34人、女性109人）がブースを訪れました。卒業生や在学生の保護者、本学と関わりのある方々にも多数お立ち寄りいただきました。"
          },
          {
            question: "例年開催されている、健康栄養学科に関心を持つ高校生に対して授業を行い、キャリア形成や本学科への進学意欲を促す高大連携事業の名前は？",
            options: [
              "高崎キャリア探究講座",
              "進路発見ゼミナール",
              "高崎健康福祉大学 広げる未来プロジェクト",
              "未来への架け橋プログラム"
            ],
            correctIndex: 2,
            explanation: "R7年度は7月29日（火）に「管理栄養士と栄養教諭について学ぼう」というタイトルで授業を実施し、①健康栄養学科が養成を目指す「管理栄養士」の職務や社会的意義について学び、②「管理栄養士」資格と関連の深い「栄養教諭」の職務や社会的意義について学びました。さらに③在学生たちとの交流の時間を設け、年齢の近い先輩たちから大学や学科での生活を学ぶ機会も設けました。\n\n②の時間では、「栄養教諭」が学校教育の中でどのような目標を立て、どのような視点から実際の食育を行うのか、学校給食を活用したワークを実践することで、体験的・探究的に学べるようにしました。\n\n今回の参加者は2名と少なかったですが、少人数を生かして、講義でもワークでも交流会でも、教員や在校生と、とても密度の濃い交流を通して学ぶことができました。"
          },
          {
            question: "高崎健康福祉大学附属幼稚園の園児とその保護者を対象とした調理イベントの名前は？",
            options: [
              "親子料理教室",
              "家族deクッキング",
              "ふれあいキッチン",
              "親子わくわくクッキング"
            ],
            correctIndex: 3,
            explanation: "2025年度には高崎市の小麦粉を使った「手打ちサラダうどん」、歴食認定されている嬬恋くろこを使用した「くろこ揚げ」、旬のブルーベリーを加えた「フルーツあんにん」の3品を親子で協力して調理しました。\n\n子どもたちは、生地をこねたり麺をのばしたりと、普段なかなかできない体験に目を輝かせていました。初めて食べるくろこ揚げや、ひんやりとした杏仁豆腐のデザートも大好評。保護者の方々からも「親子で協力して作る楽しさを実感できた」「郷土料理の魅力を知るよい機会になった」との声をいただきました。\n\n本プログラムは、健康栄養学科の教員と学生ボランティアによって運営されました。学生たちは調理のサポートや安全面の配慮を行いながら、参加者との交流も楽しんでいました。"
          },
          {
            question: "例年開催されている、健康栄養学科主催のレクリエーション大会の名前は？",
            options: [
              "健栄スポーツフェス",
              "健康栄養学科スポレク大会",
              "栄養学科レクリエーションDAY",
              "健栄体育祭"
            ],
            correctIndex: 1,
            explanation: "本イベントは、学生・教員・卒業生が一堂に会し、スポーツとレクリエーションを通じて交流を深める貴重な機会です。今年も活気あふれる一日となりました。\n\n【2025年度競技プログラム】\n10:00〜「台風の目」（体育館）、「いかゲーム」（103教室）\n10:45〜「綱引き」（体育館）\n11:20〜「玉入れ」（体育館）\n11:50〜「ドッジボール」（体育館）\n\n各競技では、学年の枠を超えた熱い戦いが繰り広げられ、歓声と笑顔があふれる場面が続きました。特に「綱引き」では白熱した勝負が展開され、応援にも熱が入る一幕が見られました。"
          }
        ]
      }
    ]
  },
  {
    id: "health-medical",
    name: "保健医療学部",
    buildings: "4, 5号館",
    color: "green",
    icon: "🏥",
    stages: [
      {
        id: 1,
        location: "4号館 エントランス",
        riddle: "医療の最前線を学ぶ場所。\n「保健」の「保」という漢字は\n何画で書ける？",
        hint: "「保」の画数を数えてみよう",
        answer: "9",
        nextLocationHint: "5号館の実習室へ。医療機器の展示に注目！"
      },
      {
        id: 2,
        location: "5号館 実習室前",
        riddle: "実習で使う「聴診器」。\nこの言葉に含まれる「耳」に関係する\n漢字はいくつある？",
        hint: "「聴」という字をよく見てみよう",
        answer: "2",
        nextLocationHint: "階段の壁の掲示物をチェック！"
      },
      {
        id: 3,
        location: "4号館 階段掲示板",
        riddle: "掲示されている「チーム医療」の文字数は？\n（ひらがなに直して数えよう）",
        hint: "「ちーむいりょう」",
        answer: "7",
        nextLocationHint: ""
      }
    ]
  },
  {
    id: "pharmacy",
    name: "薬学部",
    buildings: "7号館",
    color: "purple",
    icon: "💊",
    stages: [
      {
        id: 1,
        location: "7号館 エントランス",
        riddle: "薬の知識を深める場所。\n「薬学部」の「薬」という漢字から\n「艹（くさかんむり）」を取ると？",
        hint: "草冠の下の部分を見てみよう",
        answer: "楽",
        nextLocationHint: "研究室フロアへ。化学式の掲示に注目！"
      },
      {
        id: 2,
        location: "7号館 研究室フロア",
        riddle: "水の化学式「H2O」。\nこの中の数字を全て足すと？",
        hint: "2 + 0 = ?",
        answer: "2",
        nextLocationHint: "図書コーナーへ向かおう"
      },
      {
        id: 3,
        location: "7号館 図書コーナー",
        riddle: "本棚に並ぶ薬学の知識。\n「PHARMACY」のアルファベットは全部で何文字？",
        hint: "P-H-A-R-M-A-C-Y を数えよう",
        answer: "8",
        nextLocationHint: ""
      }
    ]
  },
  {
    id: "child-education",
    name: "人間発達学部/子ども教育学科",
    buildings: "8, 9号館",
    color: "yellow",
    icon: "🎓",
    stages: [
      {
        id: 1,
        location: "8号館 エントランス",
        riddle: "子どもたちの未来を育む場所。\n「教育」という言葉を英語にすると\n「EDUCATION」。最初の文字は？",
        hint: "EDUCATIONの1文字目",
        answer: "E",
        nextLocationHint: "9号館のピアノ練習室へ！"
      },
      {
        id: 2,
        location: "9号館 ピアノ練習室",
        riddle: "音楽を奏でる場所。\nドレミファソラシドは全部で何音？",
        hint: "ド・レ・ミ・ファ・ソ・ラ・シ・ド",
        answer: "8",
        nextLocationHint: "掲示板で保育実習の情報をチェック！"
      },
      {
        id: 3,
        location: "8号館 掲示板",
        riddle: "「子ども」という言葉に\n「々」は含まれているが、これは何という記号？",
        hint: "繰り返しを表す記号の名前",
        answer: "おどりじ",
        nextLocationHint: ""
      }
    ]
  },
  {
    id: "agriculture",
    name: "農学部",
    buildings: "10号館",
    color: "orange",
    icon: "🌾",
    stages: [
      {
        id: 1,
        location: "10号館 エントランス",
        riddle: "農業と食の未来を学ぶ。\n「農学」の「農」という漢字は\n何部首？",
        hint: "「のうにょう」という部首です",
        answer: "のうにょう",
        nextLocationHint: "実験農場の案内図を見に行こう！"
      },
      {
        id: 2,
        location: "10号館 農場案内図",
        riddle: "四季を表す言葉「春夏秋冬」。\n最初と最後の文字を組み合わせると？",
        hint: "「春」と「冬」を合わせる",
        answer: "春冬",
        nextLocationHint: "研究室の掲示物へ！"
      },
      {
        id: 3,
        location: "10号館 研究室前",
        riddle: "「AGRICULTURE（農業）」という単語に\n「CULTURE（文化）」という単語が隠れている。\n最初に取る必要がある文字は？",
        hint: "AGRICULTUREの最初の4文字",
        answer: "AGRI",
        nextLocationHint: ""
      }
    ]
  },
  {
    id: "psychology",
    name: "人間発達学部/心理学科",
    buildings: "未定号館",
    color: "pink",
    icon: "❤️",
    stages: [
      {
        id: 1,
        location: "心理学科棟 エントランス",
        riddle: "心の仕組みを探求する場所。\n「心理学」の「心」という漢字は何画？",
        hint: "「心」の画数を数えよう",
        answer: "4",
        nextLocationHint: "実験室へ向かおう！"
      },
      {
        id: 2,
        location: "心理学実験室",
        riddle: "「PSYCHOLOGY（心理学）」の\n母音（A,I,U,E,O）は何個含まれる？",
        hint: "P-S-Y-C-H-O-L-O-G-Y の中の母音を数える",
        answer: "2",
        nextLocationHint: "カウンセリングルーム前の掲示へ！"
      },
      {
        id: 3,
        location: "カウンセリングルーム前",
        riddle: "「心」という字を2つ並べると\n何という漢字になる？",
        hint: "心 + 心 = ?",
        answer: "患",
        nextLocationHint: ""
      }
    ]
  }
];

export const getDepartmentById = (id: string): DepartmentData | undefined => {
  return departments.find(dept => dept.id === id);
};

export const getTotalDepartments = () => departments.length;

// 答えを正規化する関数
export const normalizeAnswer = (answer: string): string => {
  return answer
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/[ァ-ン]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60))
    .replace(/\s+/g, '');
};

// クリア状態の管理
export const getClearedDepartments = (): string[] => {
  if (typeof window === 'undefined') return [];
  const cleared = localStorage.getItem('clearedDepartments');
  return cleared ? JSON.parse(cleared) : [];
};

export const markDepartmentAsCleared = (departmentId: string): void => {
  const cleared = getClearedDepartments();
  if (!cleared.includes(departmentId)) {
    cleared.push(departmentId);
    localStorage.setItem('clearedDepartments', JSON.stringify(cleared));
  }
};

export const isDepartmentCleared = (departmentId: string): boolean => {
  return getClearedDepartments().includes(departmentId);
};

export const isAllDepartmentsCleared = (): boolean => {
  return getClearedDepartments().length === getTotalDepartments();
};

export const resetProgress = (): void => {
  localStorage.removeItem('clearedDepartments');
};