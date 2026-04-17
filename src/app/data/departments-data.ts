import { recordClearedDepartmentToServer } from "../utils/supabase";

export interface ItemData {
  id: string;
  name: string;
  icon: string;  // emoji or image path
  description?: string;
}

export interface AccidentData {
  /** 画像パス */
  image?: string;
  /** タイトル（例: アクシデント発生！） */
  title: string;
  /** 本文メッセージ */
  message: string;
  /** 必要なアイテムID */
  requiredItemId: string;
  /** チュートリアルを表示する（初回のみ） */
  showTutorial?: boolean;
  /** アイテム使用後の成功メッセージ */
  successMessage?: string;
  /** アクシデント解決後に入手するアイテム */
  rewardItem?: ItemData;
  /** アクシデント解決後のアイテム入手時メッセージ */
  rewardMessage?: string;
}

export interface StageData {
  id: number;
  location: string;
  riddle: string;
  hint: string;
  answer: string;
  nextLocationHint: string;
  /** クリア時に入手するアイテム（単一） */
  itemReward?: ItemData;
  /** クリア時に入手するアイテム（複数） */
  itemRewards?: ItemData[];
  /** 正解後に発生するアクシデント */
  accident?: AccidentData;
  /** 問題タイプ */
  type?: "text" | "checkbox" | "select" | "multi-input";
  /** 選択肢（checkbox / select で使用） */
  options?: string[];
  /** 正解の選択肢インデックス（checkbox: 複数, select: correctIndex で指定） */
  correctIndices?: number[];
  /** select 形式の正解インデックス */
  correctIndex?: number;
  /** multi-input 形式: 各入力ボックスの受け入れ可能な答えリスト */
  multiAnswers?: string[][];
  /** multi-input 形式: 各入力ボックスのラベル */
  inputLabels?: string[];
  /** multi-input 順不同モード: このボックス数だけ表示し、どの入力も multiAnswers のいずれかと一致すればOK */
  unorderedAnswerCount?: number;
  /** テキスト入力の代替正解（正規化した結果がこのいずれかに一致すればOK） */
  alternateAnswers?: string[];
  /** 正解後の解説 */
  explanation?: string;
  /** 次の目的地の補足説明（タイトルと本文） */
  nextLocationDetail?: {
    title: string;
    body: string;
  };
  /** true の場合、次の目的地画面をスキップして直接次の問題へ進む */
  skipNextLocationScreen?: boolean;
  /** この謎解き中に再生するBGMトラック（未指定の場合は "field"） */
  bgm?: string;
  /** ヒントに付与するリンクURL */
  hintUrl?: string;
  /** 謎文の下に表示する画像パス */
  riddleImage?: string;
  /** アイテム入手時に作物の満腹度を回復するかどうか（農学部用） */
  recoversFullness?: boolean;
  /** 正解後に発生する育成アクション（農学部の栽培シミュレーター用） */
  cultivationAction?: CultivationAction;
}

/** 育成シミュレーターの1アクション定義 */
export interface CultivationAction {
  /** アクションのアイコン（絵文字） */
  icon: string;
  /** アクション名（例: "水をあげる"） */
  label: string;
  /** 表示するカードタイトル（例: "水やりの時間だ！"） */
  title: string;
  /** 説明文 */
  description: string;
  /** このアクションに必要な現在の育成段階（0〜4） */
  requiredGrowth: number;
  /** 実行後の育成段階 */
  nextGrowth: number;
  /** 成功時のメッセージ */
  successMessage: string;
}

export interface MidBattleQuestion {
  question: string;
  options: string[];
  type?: "single" | "checkbox";
  correctIndex?: number;
  correctIndices?: number[];
  explanation?: string;
  /** 解説に表示する画像パス */
  explanationImage?: string;
}

export interface MidBattleData {
  /** このバトルを示すID */
  id: number;
  /** このステージIDをクリアした後に発生 */
  afterStageId: number;
  /** 勝利後に進むステージID（未指定の場合は afterStageId + 1） */
  nextStageId?: number;
  /** 勝利時に入手するアイテム（単一） */
  rewardItem?: ItemData;
  /** 勝利時に入手するアイテム（複数） */
  rewardItems?: ItemData[];
  enemyName: string;
  enemyImage: string;
  /** 画像のY方向シフト (例: "30%" で下に30%、"-15%" で上に15%) */
  enemyImageOffsetY?: string;
  enemyMaxHp: number;
  playerMaxHp: number;
  damageToEnemy: number;
  damageToPlayer: number;
  questions: MidBattleQuestion[];
  /** true の場合、問題プールからランダムに出題し、一度出た問題は繰り返さない */
  randomOrder?: boolean;
  /** 勝利画面で「次の目的地」として表示する案内テキスト */
  nextLocationHint?: string;
  /** 戦闘中に再生するBGMトラック（未指定の場合は "battle"） */
  battleBgm?: string;
  /** 報酬アイテム入手時に作物の満腹度を回復するか */
  recoversFullness?: boolean;
  /** 作物バトルモード（ポケモン風対面バトル） */
  cropBattle?: boolean;
  /** 敵作物の名称 */
  enemyCropName?: string;
  /** 敵作物の画像パス */
  enemyCropImage?: string;
}

export interface KeywordRoute {
  id: number;
  label: string;
  description: string;
  correctKeyword: string;
  routeType: "stages" | "minigame";
  stages?: StageData[];
  /** 開始時に表示する確認メッセージ */
  confirmMessage?: string;
  /** ルート内に発生する戦闘の配列。各戦闘は afterStageId で発動タイミングを指定 */
  battles?: MidBattleData[];
}

export interface KeywordModeConfig {
  /** この学部がキーワード収集方式であることを示すフラグ */
  enabled: true;
  /** このステージをクリアするとキーワードハブが解禁される */
  afterStageId: number;
  /** 3つのキーワードルート */
  keywords: KeywordRoute[];
  /** 最終目的地メッセージ（全キーワード入力後） */
  completionMessage?: string;
}

/** 最終戦闘の設定（キーワード全回収後のラスボス戦用） */
export interface FinalBattleData {
  enemyName: string;
  enemyImage?: string;
  enemyImageOffsetY?: string;
  enemyMaxHp: number;
  playerMaxHp: number;
  damageToEnemy: number;
  damageToPlayer: number;
  /** 勝利に必要な正解数 */
  requiredCorrectCount: number;
  /** メインで出題する問題プール */
  questions: MidBattleQuestion[];
  /** 敗北時に復活するために必要なアイテムID（所持していれば何度でも使える） */
  reviveItemId?: string;
  /** 敵HPが0になった時にトドメを刺すのに必要なアイテムID */
  finishingItemId?: string;
  /** 戦闘BGMトラック */
  battleBgm?: string;
  /** 勝利後の案内メッセージ */
  victoryMessage?: string;
}

export interface DepartmentData {
  id: string;
  name: string;
  buildings: string;
  color: string;
  icon: string;
  stages: StageData[];
  midBattles?: MidBattleData[];
  /** この学部に入るためのパスワード */
  unlockPassword?: string;
  /** キーワード収集方式の設定 */
  keywordMode?: KeywordModeConfig;
  /** キーワード収集方式での最終戦闘 */
  finalBattle?: FinalBattleData;
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
        hint: "セブンティーンアイス",
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
        nextLocationHint: "エレベーター側の階段から4階まで進め",
        explanation: "医療DX（デジタルトランスフォーメーション）とは、電子カルテやオンライン診療、AI診断支援などデジタル技術を活用して医療の質と効率を高める取り組みです。本学の医療情報学科では、診療情報管理士や基本情報技術者などの資格取得を通じて、医療と情報の両方に精通した人材を育成しており、まさに医療DXを支える専門家を輩出しています。"
      },
      {
        id: 5,
        location: "1号館4階",
        riddle: "張り紙の問題に答えよう",
        hint: "階段の張り紙を確認してみよう",
        answer: "アリフィスとフォファル",
        nextLocationHint: "戦闘の予感...",
        explanation: "2月16日（月）、群馬県庁にて開催された「令和7年度やま・さと応縁隊成果発表会」において、本学科の学生が成果発表を行いました。\n\nやま・さと応縁隊とは\n「やま・さと応縁隊」は、群馬県農政課が県内の大学等に委託して実施する事業です。高齢化や人口減少などの課題を抱える中山間地域において、大学生が地域住民との交流やフィールドワークを通じて、地域の課題解決や魅力の発信方法を検討・提案します。単なる支援にとどまらず、地域に深く関わり、住民との「縁」を育むことで、地域に根付く独自の魅力を再発見し、地域の活性化につなげることを目的としています。"
      },
      {
        id: 6,
        location: "４階奥まで進め",
        riddle: "張り紙の謎を解け",
        hint: "",
        answer: "社会福祉学科",
        bgm: "cave",
        nextLocationHint: "５階は社会福祉学科のフロア！右手の階段から５階に進もう",
        explanation: "高崎健康福祉大学の社会福祉学科は、人々の暮らしと尊厳を守る福祉専門職を育成する学科です。「社会福祉コース」と「介護福祉コース」の2コース制を採用しており、目指す進路に合わせて専門性を深められます。\n\n【取得を目指せる主な資格】\n・社会福祉士（国家試験受験資格）\n・精神保健福祉士（国家試験受験資格）\n・介護福祉士（国家試験受験資格）\n・高等学校教諭一種免許（福祉・公民）\n・司書・司書教諭\n\n【学びの特色】\n地域の福祉施設や医療機関、行政機関との連携による実習を重視し、「現場で活きる実践力」を養います。高齢者福祉、障がい者福祉、児童福祉、医療ソーシャルワークなど幅広い分野を体系的に学ぶことができ、卒業生は福祉施設・病院・行政・学校など多様なフィールドで活躍しています。"
      },
      {
        id: 7,
        location: "1号館5階",
        riddle: "張り紙の謎を解け",
        hint: "たすけあいを意味する漢字",
        answer: "助",
        bgm: "cave",
        nextLocationHint: "廊下の掲示板を確認しろ"
      },
      {
        id: 8,
        location: "1号館5階",
        riddle: "張り紙の謎を解け",
        hint: "車椅子を数えるときの単位は「台」",
        answer: "台本",
        bgm: "cave",
        nextLocationHint: "奥まで進め"
      },
      {
        id: 9,
        location: "1号館5階",
        bgm: "cave",
        riddle: "張り紙の謎を解け",
        hint: "Instagramを見てみよう",
        answer: "社会福祉学科をもりあげようプロジェクト",
        hintUrl: "https://www.instagram.com/kendai_syafuku_moripuro?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
        nextLocationHint: "戦闘の予感...",
        explanation: "2009（平成21）年に学科名が改称されたことを機に、学科広報活動の充実、学生に対する教育的効果を目的として、15名程度の有志学生から「もりプロ」が発足しました。"
      },
      {
        id: 10,
        location: "1号館6階",
        riddle: "張り紙の謎を解け",
        hint: "６✖️６をさらにバラせ。最後にTICKETに当てはめろ",
        answer: "ICT",
        bgm: "mansion",
        nextLocationHint: "情報学習室へ向かえ"
      },
      {
        id: 11,
        location: "情報学習室",
        riddle: "部屋に隠された謎を解け",
        hint: "体の一部分を表す漢字",
        answer: "手",
        bgm: "mansion",
        nextLocationHint: "６階奥へ！"
      },
      {
        id: 12,
        location: "1号館6階",
        riddle: "張り紙の謎を解け",
        hint: "",
        answer: "ITパスポート",
        bgm: "mansion",
        nextLocationHint: "新たな試練が待ち受ける..."
      },
      {
        id: 13,
        location: "2号館 第一体育館前",
        riddle: "隠された謎を解け",
        hint: "",
        answer: "自利利他",
        bgm: "lastRoad",
        nextLocationHint: "最終試練に挑め！"
      }
    ],
    midBattles: [
      {
        id: 1,
        afterStageId: 5,
        nextStageId: 6,
        enemyName: "戦う栄養士",
        enemyImage: "/images/tatakau-eiyoushi.png",
        enemyImageOffsetY: "30%",
        nextLocationHint: "４階奥まで進め",
        battleBgm: "wildBattle",
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
            correctIndices: [0, 3, 5, 6],
            explanation: "【管理栄養士】\n傷病者や健康人に対して栄養指導、特定給食施設における給食管理や栄養管理を行う国家資格。本学科では国家試験受験資格が得られます。\n\n【栄養教諭１種】\n学校において児童・生徒の栄養指導や食育を行う教員免許。学校給食の管理と、食に関する指導を一体として行える専門家を養成します。\n\n【フードスペシャリスト／専門フードスペシャリスト】\n食品の開発・流通・販売の現場で、食に関する高度な専門知識をもって消費者に的確な情報を提供する食の専門家です。\n\n【NR・サプリメントアドバイザー】\n一般消費者に対して、栄養成分やサプリメントに関する適切なアドバイスを行う専門家。日本臨床栄養協会が認定する資格です。\n\n※「医療事務管理士」は医療情報学科、「社会福祉士」は社会福祉学科で取得を目指す資格です。「HACCP管理者」も健康栄養学科では取得できません。"
          },
          {
            question: "スーパーマーケット「とりせん」と本学科の高梨研究室で共同開発した第24弾栄養バランス弁当の名前は？",
            options: [
              "巻いて楽しい♪くるっとキンパ！",
              "まぜて美味しい♪ビビッとビビンバ！",
              "つつんで嬉しい♪ぱくっとサムギョプサル！",
              "のせて豪華♪どかんと石焼丼！"
            ],
            correctIndex: 1,
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
      },
      {
        id: 2,
        afterStageId: 9,
        enemyName: "脳筋ソーシャルワーカー",
        enemyImage: "/images/noukin-sw.png",
        enemyImageOffsetY: "15%",
        battleBgm: "trainerBattle",
        enemyMaxHp: 100,
        playerMaxHp: 100,
        damageToEnemy: 20,
        damageToPlayer: 20,
        randomOrder: true,
        nextLocationHint: "５階を制覇しました！\n６階は医療情報学科のフロアです。\n階段で向かいましょう。",
        questions: [
          {
            question: "社会福祉に関わる相談に対応し、助言、指導、援助を行う専門職に従事可能となる国家資格は？",
            options: ["社会福祉士", "介護福祉士", "精神保健福祉士", "公認心理師"],
            correctIndex: 0,
            explanation: "社会福祉士は、福祉分野の中核を担う国家資格です。福祉施設・病院・行政機関・学校などさまざまな現場で、生活に困りごとを抱える方々からの相談に応じ、必要な助言・指導・関係機関との連絡調整を行います。本学科では国家試験受験資格を取得できます。"
          },
          {
            question: "精神障害者の社会復帰に関する相談や自立支援に関する相談員として活躍する専門職に従事可能となる国家資格は？",
            options: ["社会福祉士", "精神保健福祉士", "介護福祉士", "臨床心理士"],
            correctIndex: 1,
            explanation: "精神保健福祉士は、精神障害者の社会復帰支援や日常生活・就労のサポートを行う国家資格です。精神科病院や地域の支援センター、行政機関などで、本人や家族からの相談に応じ、社会参加を後押しします。本学科の社会福祉コースで国家試験受験資格が得られます。"
          },
          {
            question: "日常生活に支障のある利用者の心身の状況に応じた介護を行う専門職に従事可能となる国家資格は？",
            options: ["介護福祉士", "社会福祉士", "精神保健福祉士", "ホームヘルパー"],
            correctIndex: 0,
            explanation: "介護福祉士は、高齢者や障がい者など日常生活に支援が必要な方に対して、専門的な身体介護や生活援助を行う国家資格です。介護現場ではリーダー的存在として後輩の指導やケアプラン作成にも関わります。本学科の介護福祉コースで国家試験受験資格が得られます。"
          },
          {
            question: "パラスポーツの進行にあたる指導者としての専門知識を証明する資格は？",
            options: ["初級パラスポーツ指導員", "スポーツリーダー", "レクリエーション・インストラクター", "アダプテッドスポーツ指導士"],
            correctIndex: 0,
            explanation: "初級パラスポーツ指導員は、日本パラスポーツ協会が認定する公認資格で、障がい者スポーツの現場で安全で楽しいスポーツ指導を行う指導者であることを証明します。福祉分野とスポーツを掛け合わせた実践力を身につけることができます。"
          },
          {
            question: "社会福祉学科を卒業後、職務についた後に取得可能となる資格を全て選べ",
            options: [
              "社会福祉主事",
              "児童指導員",
              "児童福祉司",
              "身体障害者福祉司",
              "知的障害者福祉司",
              "保育士",
              "公認心理師"
            ],
            type: "checkbox",
            correctIndices: [0, 1, 2, 3, 4],
            explanation: "社会福祉学科を卒業し、規定の職務に任用されることで取得できる「任用資格」が数多くあります。\n\n・社会福祉主事：福祉事務所などで相談援助を担う基礎資格\n・児童指導員：児童養護施設などで子どもの生活・育成に関わる\n・児童福祉司：児童相談所で子どもや家庭の支援を行う\n・身体障害者福祉司：身体障がい者更生相談所で専門相談を行う\n・知的障害者福祉司：知的障がい者更生相談所で専門相談を行う\n\nこれらは卒業後、実際に職務に就いて初めて効力が発揮される任用資格です。\n\n※「保育士」「公認心理師」はそれぞれ別の養成課程で取得を目指す資格であり、社会福祉学科の卒業要件では取得できません。"
          },
          {
            question: "介護福祉士を目指す学生が主に利用する本学の実習室をすべて選べ",
            options: [
              "介護実習室",
              "被覆室",
              "入浴実習室",
              "第２社会福祉実習室",
              "医療情報実習室",
              "栄養実習室"
            ],
            type: "checkbox",
            correctIndices: [0, 1, 2, 3],
            explanation: "社会福祉学科の介護コースには、現場さながらの設備を備えた専用の実習室が揃っています。\n\n・介護実習室：ベッド・車椅子・介助用具などを使った基礎介護の実習\n・被覆室：衣類の着脱や整容など身だしなみに関する介助の実習\n・入浴実習室：特殊浴槽やシャワーキャリーを用いた入浴介助の実習\n・第２社会福祉実習室：グループワークや事例検討に活用\n\nこれらの豊富な設備により、現場に出てすぐに活きる実践力を身につけられます。"
          },
          {
            question: "健大唯一、社会福祉学科だけの学生団体であるもりプロの正式名称は？",
            options: [
              "社会福祉学科を盛り上げようプロジェクト",
              "森のプロフェッショナル",
              "社会福祉モリモリプロジェクト",
              "もりあげプロジェクト"
            ],
            correctIndex: 0,
            explanation: "「もりプロ」の正式名称は『社会福祉学科を盛り上げようプロジェクト』です。もりプロは社会福祉学科のフレッシュマンキャンプやガイダンス、オープンキャンパスなどの運営をお手伝いしており、履修登録補助などのピアサポートも行う、学科を支える学生団体です。"
          },
          {
            question: "社会福祉学科専属の学生団体「もりプロ」のマスコットキャラクターの名前は？",
            options: ["もりにゃん", "すけっと", "ふくねこ", "ねこっぴ"],
            correctIndex: 1,
            explanation: "2009（平成21）年に学科名が改称されたことを機に、学科広報活動の充実、学生に対する教育的効果を目的として、15名程度の有志学生から「もりプロ」が発足しました。そして、学科のキャッチコピー＆ゆるキャラを決めることになり、コンテストを通して「すけっと」ができました！（作成したのは当時4年生の女子学生だったそうです）\n\n💭すけっとの由来は、福祉・介護の世界は常に人手不足であり「猫の手も借りたい」ということから猫がモチーフになっており、社会福祉学科の学生が、将来福祉業界の「助っ人」になってほしい、という願いが込められています🌟"
          },
          {
            question: "社会福祉学科のオープンキャンパスで実施されている、学生と高校生とのお話会イベントの名称は？",
            options: ["カタリバ", "トークラウンジ", "座談会", "ふくふくサロン"],
            correctIndex: 0,
            explanation: "カタリバの運営ももりプロが行なっており、例年オープンキャンパスで開催されています。現役大学生が高校生の質問や悩みに答え、学生生活や実習、国試などリアルな声を聞ける人気コーナーです！"
          },
          {
            question: "2025年度藤龍祭にて、社会福祉学科「もりプロ」が出店した屋台の名前は？",
            options: ["森のポテト", "もりフライ", "もりプロポテト", "すけっとポテト"],
            correctIndex: 2,
            explanation: "今年も昨年に続き、フライドポテトの出店『もりプロポテト』を行いました🍟\nお待ちいただく時間があったにもかかわらず、多くの方にご購入いただき、本当にありがとうございました。来場してくださった皆様にも、心より感謝申し上げます😊\n\n今回の売り上げは、もりプロの活動資金として、今後の社会福祉学科をさらに盛り上げていくために大切に活用させていただきます✨"
          },
          {
            question: "社会福祉学科で選択できるコースを２つ選べ",
            options: ["社会福祉コース", "介護福祉コース", "精神保健コース", "児童福祉コース"],
            type: "checkbox",
            correctIndices: [0, 1],
            explanation: "社会福祉学科では「社会福祉コース」と「介護福祉コース」の2コース制を採用しています。\n\n・社会福祉コース：社会福祉士に加え、精神保健福祉士の国家試験受験資格取得を目指せるコース\n・介護福祉コース：社会福祉士と介護福祉士の2つの国家試験受験資格取得を目指すコース\n\n入学後に将来の進路に合わせてコースを選択できます。"
          },
          {
            question: "社会福祉士に加えて精神保健福祉士の取得を目指すことができる社会福祉学科のコースは？",
            options: ["社会福祉コース", "介護福祉コース", "精神保健福祉コース", "福祉心理コース"],
            correctIndex: 0,
            explanation: "社会福祉コースは、社会福祉士に加えて精神保健福祉士の取得を目指すことができます！\n精神保健福祉士を目指す学生は、社会福祉士の講義に加えて、精神保健福祉士の受験に向けた講義も受けます！"
          },
          {
            question: "社会福祉士に加えて介護福祉士の資格取得に向けて学習していく社会福祉学科のコースは？",
            options: ["社会福祉コース", "介護福祉コース", "福祉介護コース", "介護支援コース"],
            correctIndex: 1,
            explanation: "介護福祉コースでは、社会福祉士と介護福祉士の２つの資格取得に向けて学習に励んでいます✍🏻📚\n介護福祉コースは１年次から実習が始まることもあり、大変なイメージを持たれがちです🥲\nしかし、介護福祉コースにはたくさんの魅力があります！✨"
          }
        ]
      },
      {
        id: 3,
        afterStageId: 12,
        enemyName: "医療事務プリンセス",
        enemyImage: "/images/iryo-jimu-princess.png",
        enemyImageOffsetY: "15%",
        enemyMaxHp: 100,
        playerMaxHp: 100,
        damageToEnemy: 20,
        damageToPlayer: 20,
        randomOrder: true,
        nextLocationHint: "おめでとう！医療情報学科を制覇しました。\nエレベーターで２階へ戻り、第一体育館前へ向かえ！",
        questions: [
          {
            question: "医療情報学科で選択できる２つのコースを選べ",
            options: ["情報コース", "医療コース", "経営情報コース", "情報セキュリティコース"],
            type: "checkbox",
            correctIndices: [0, 1],
            explanation: "医療情報学科は「情報コース」と「医療コース」の2コース制を採用しています。\n\n・情報コース：ITパスポートや基本情報技術者などの情報系国家資格の取得を目指す\n・医療コース：診療情報管理士や医療事務管理士など、医療現場で活きる資格の取得を目指す\n\n医療とITの両方に精通した人材を育成する学科の特色が、このコース構成に表れています。"
          },
          {
            question: "医療情報学科、医療コースで取得できる資格をすべて選べ",
            options: [
              "診療情報管理士",
              "医療事務管理士",
              "基本情報技術者",
              "応用情報技術者",
              "医療情報技師"
            ],
            type: "checkbox",
            correctIndices: [0, 1],
            explanation: "医療コースで取得を目指せる主な資格は「診療情報管理士」と「医療事務管理士」の2つです。\n\n・診療情報管理士：診療記録・情報を管理し、医療の質と病院経営に貢献する専門職\n・医療事務管理士：医療保険制度や診療報酬の仕組みを理解した医療事務スタッフ\n\n病院の情報管理部門や医療事務の現場で即戦力として活躍できる資格です。"
          },
          {
            question: "医療情報学科、情報コースで取得できる資格をすべて選べ",
            options: [
              "ITパスポート",
              "基本情報技術者",
              "情報セキュリティマネジメント",
              "診療情報管理士",
              "医療事務管理士"
            ],
            type: "checkbox",
            correctIndices: [0, 1, 2],
            explanation: "情報コースで取得を目指せる主な国家資格は次の3つです。\n\n・ITパスポート：ITの基礎知識を幅広く問う入門レベルの国家資格\n・基本情報技術者：ITエンジニアの登竜門と呼ばれる中級レベルの国家資格\n・情報セキュリティマネジメント：組織の情報を守る専門知識を認定する国家資格\n\n情報技術の基礎からセキュリティまで体系的に学び、複数の国家資格取得を目指せるのが情報コースの強みです。"
          },
          {
            question: "情報技術のみならず、企業法務や経営分析の基礎を問われるIT関連の基礎知識を問われる国家資格を選べ",
            options: ["ITパスポート", "基本情報技術者", "情報セキュリティマネジメント", "応用情報技術者"],
            correctIndex: 0,
            explanation: "ITパスポートは独立行政法人 情報処理推進機構（IPA）が実施する情報処理技術者試験の一つで、ITの基礎知識に加え、企業経営や法務など幅広いビジネス知識も問われる入門レベルの国家資格です。業種・職種を問わず、社会人として身につけておきたい基礎知識が網羅されています。"
          },
          {
            question: "情報処理技術全般の基本的な知識・技能を認定する、ITパスポートのワンランク上の国家資格を選べ",
            options: ["ITパスポート", "基本情報技術者", "応用情報技術者", "情報セキュリティマネジメント"],
            correctIndex: 1,
            explanation: "基本情報技術者はITパスポートの上位にあたる国家資格で、プログラミング、データベース、ネットワーク、システム開発など情報技術全般の基本的な知識・技能が問われます。ITエンジニアの登竜門と呼ばれ、IT業界を目指す学生にとって重要な資格です。"
          },
          {
            question: "ITの安全な利活用を推進することを目的とした、情報セキュリティに関する基本的な知識・技能を認定する国家資格は？",
            options: [
              "情報セキュリティマネジメント",
              "基本情報技術者",
              "ITパスポート",
              "応用情報技術者"
            ],
            correctIndex: 0,
            explanation: "情報セキュリティマネジメントは、サイバー攻撃や情報漏洩が深刻化する現代において、組織の情報資産を守るための基本的な知識・技能を認定する国家資格です。企業のどの部署にいても必要となる情報セキュリティの知識を体系的に身につけられます。"
          },
          {
            question: "基本情報技術者の上位資格となっており、情報処理技術全般の応用レベルの知識・技能を認定する国家資格は？",
            options: ["基本情報技術者", "応用情報技術者", "ITパスポート", "情報セキュリティマネジメント"],
            correctIndex: 1,
            explanation: "応用情報技術者は基本情報技術者の上位に位置する国家資格で、情報処理技術全般の応用レベルの知識・技能を認定します。技術だけでなくマネジメントや経営戦略にまで踏み込んだ内容が出題され、ITスペシャリストとしてのキャリアを築く上で大きな武器となります。"
          },
          {
            question: "診療記録・情報を管理し、医療における質と病院経営に寄与する資格は？",
            options: ["医療事務管理士", "診療情報管理士", "医療情報技師", "電子カルテ管理士"],
            correctIndex: 1,
            explanation: "診療情報管理士は、病院で扱う診療記録や診療情報を正確かつ適切に管理し、その情報を医療の質向上や病院経営、医学研究などに活用する専門職です。病院の情報管理室やDPC委員会、がん登録業務などで活躍します。"
          },
          {
            question: "医療保険制度や診療報酬の仕組みを理解し、正確に診療報酬を算定できる事務スタッフとしての知識を認定する資格は？",
            options: ["診療情報管理士", "医療事務管理士", "医療情報技師", "医療秘書"],
            correctIndex: 1,
            explanation: "医療事務管理士は、医療保険制度や診療報酬の仕組みを理解し、レセプト（診療報酬明細書）の作成や受付業務など、医療機関における事務業務を担う専門職として必要な知識を認定する資格です。病院・クリニック・調剤薬局など幅広い医療現場で活躍できます。"
          },
          {
            question: "医療の特質を踏まえ、最適な情報処理技術でシステム構築・運営するための資格は？",
            options: ["診療情報管理士", "医療事務管理士", "医療情報技師", "医療IT技術者"],
            correctIndex: 2,
            explanation: "医療情報技師は、一般社団法人 日本医療情報学会が認定する資格で、医療の特質を十分に理解した上で、電子カルテや病院情報システムなどを最適な情報処理技術で構築・運営する能力を持つ専門職を認定します。医療とITの橋渡しを担うスペシャリストです。"
          },
          {
            question: "医療情報学科で開催されている、最新のIT科目やサイバーセキュリティを約５ヶ月間のフィンランド留学を通して学ぶことができる提携大学はどこ？",
            options: ["Jamk応用科学大学", "ヘルシンキ大学", "アアルト大学", "オウル大学"],
            correctIndex: 0,
            explanation: "医療情報学科ではフィンランドのJamk応用科学大学との国際提携により、約5ヶ月間の留学プログラムを実施しています。最新のIT科目やサイバーセキュリティを現地で学ぶことができ、実践的な英語力と国際的な視野を養える貴重な機会です。"
          },
          {
            question: "健大が主催する小学生に対するイベントである健大こども大学にて2025年度に医療情報学科が開催したイベントはどれ？",
            options: [
              "プログラミング体験教室",
              "ウェブデザイナー体験～AIの力でホームページを作ろう～",
              "ロボット工作ワークショップ",
              "はじめてのゲーム開発"
            ],
            correctIndex: 1,
            explanation: "2025年度の健大こども大学で医療情報学科が開催したのは「ウェブデザイナー体験〜AIの力でホームページを作ろう〜」。小学生を対象に、生成AIを活用して自分だけのホームページを作る体験を通じて、ITやウェブデザインの面白さを体感してもらいました。地域連携とSTEAM教育の両面から学科の魅力を発信する取り組みです。"
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
    buildings: "8号館",
    color: "purple",
    icon: "💊",
    stages: [
      {
        id: 1,
        location: "8号館エントランス",
        riddle: "薬学部の学生が取得を目指す資格の名前はどれ？",
        hint: "",
        answer: "",
        type: "select",
        options: ["薬剤師", "医師", "看護師", "管理栄養士"],
        correctIndex: 0,
        nextLocationHint: "ようこそ8号館薬学部へ！左手の学生サロン(自習スペース)へ進め！"
      },
      {
        id: 2,
        location: "1階学生サロン",
        riddle: "張り紙の謎を解け",
        hint: "方向に注目",
        answer: "けんだい",
        nextLocationHint: "サロン正面の掲示板確認しよう！"
      },
      {
        id: 3,
        location: "1階学生サロン前掲示板",
        riddle: "張り紙の謎を解け",
        hint: "文字の位置に当てはめろ",
        answer: "たぬきそば",
        nextLocationHint: "さらに奥、学生食堂へ進め"
      },
      {
        id: 4,
        location: "1階学生食堂",
        riddle: "張り紙の謎を解け",
        hint: "食券に注目",
        answer: "",
        type: "multi-input",
        multiAnswers: [["380"], ["60"], ["620"]],
        inputLabels: ["1つ目の答え", "2つ目の答え", "3つ目の答え"],
        nextLocationHint: "よくやった！2階へ進み左手へ向かえ"
      },
      {
        id: 5,
        location: "2階左奥",
        riddle: "３つの張り紙の答えを入力しろ",
        hint: "○○イベントサー○○\n1階を探索してみよう。",
        answer: "",
        type: "multi-input",
        multiAnswers: [
          ["薬学イベントサークル", "薬学イベントサークル（仮）", "薬学イベントサークル(仮)"],
          ["ヨクイニン"],
          ["240歩", "240"]
        ],
        inputLabels: ["1つ目の答え", "2つ目の答え", "3つ目の答え"],
        nextLocationHint: "2階さらに奥へ進め"
      },
      {
        id: 6,
        location: "2階右奥",
        riddle: "廊下に設置されたシャワーにはなんの意味がある？",
        hint: "",
        answer: "",
        type: "select",
        options: [
          "薬剤が付着した際にすぐ洗い流すため",
          "火災時の消火用",
          "実験器具の洗浄用",
          "温度管理のための冷却装置",
          "掃除用の水道設備",
          "装飾目的のオブジェ"
        ],
        correctIndex: 0,
        nextLocationHint: "戦闘の予感..."
      },
      {
        id: 7,
        location: "8号館3階",
        riddle: "3階を探検し、3Rsの原則を３つ日本語で答えろ。",
        hint: "ピンクのポスターに注目",
        answer: "",
        type: "multi-input",
        multiAnswers: [["代替"], ["削減"], ["洗練"]],
        inputLabels: ["1つ目", "2つ目", "3つ目"],
        skipNextLocationScreen: true,
        nextLocationHint: ""
      },
      {
        id: 8,
        location: "8号館3階",
        riddle: "この階層に存在するシャワーの数を答えろ",
        hint: "",
        answer: "4",
        nextLocationHint: "ついに最上階。４階左へ進め"
      },
      {
        id: 9,
        location: "4階左奥",
        riddle: "張り紙の謎を解け",
        hint: "図書館",
        answer: "ちりょ",
        nextLocationHint: "４階右奥へ進め"
      },
      {
        id: 10,
        location: "8号館4階",
        riddle: "模擬薬局正面に存在する部屋の名前を答えろ",
        hint: "",
        answer: "TDM室",
        nextLocationHint: "４階１番奥へ"
      },
      {
        id: 11,
        location: "8号館4階",
        riddle: "最奥のボードに記載された単語を入力",
        hint: "",
        answer: "ファーマシすと",
        nextLocationHint: "最終試練に挑め！"
      }
    ],
    midBattles: [
      {
        id: 1,
        afterStageId: 6,
        enemyName: "見習いケミスト",
        enemyImage: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
        enemyMaxHp: 100,
        playerMaxHp: 100,
        damageToEnemy: 20,
        damageToPlayer: 20,
        randomOrder: true,
        nextLocationHint: "3階へ進め",
        questions: [
          {
            question: "薬学部夏のオープンキャンパス2025で開催された企画で正しいものはどれ？",
            options: ["VR調剤体験", "薬草園ツアー", "お薬手帳アプリ体験", "模擬MR体験"],
            correctIndex: 0,
            explanation: "薬学部夏のオープンキャンパス2025では「VR調剤体験」が開催され、最新のVR技術を使って調剤の現場を疑似体験できる企画が好評でした。"
          },
          {
            question: "2025年6月29日に薬学イベントサークル主催で開催された薬学の魅力を伝えるイベント名は？",
            options: ["健大薬学体験フェスティバル", "薬学オープンラボ", "くすりの学校", "ファーマシーフェスタ"],
            correctIndex: 0,
            explanation: "2025年6月29日に薬学イベントサークル主催で「健大薬学体験フェスティバル」が開催されました。薬学の魅力を広く伝えるため、体験型のプログラムが多数用意されました。"
          },
          {
            question: "2026年3月30日「サイエンスへの誘い」で開催されたイベントのテーマは？",
            options: ["解熱鎮痛薬を合成してみよう", "ビタミンCを分析しよう", "漢方薬を調合してみよう", "DNAを抽出してみよう"],
            correctIndex: 0,
            explanation: "2026年3月30日の「サイエンスへの誘い」では「解熱鎮痛薬を合成してみよう」をテーマに、実際の有機合成実験を通じて薬の成り立ちを体験する企画が実施されました。"
          },
          {
            question: "健大薬学部は何年制？",
            options: ["4年制", "5年制", "6年制", "7年制"],
            correctIndex: 2,
            explanation: "健大薬学部は6年制です。6年間で基礎から臨床まで体系的に学び、5年次には病院・薬局での実務実習を経験。卒業時に薬剤師国家試験の受験資格が得られます。"
          },
          {
            question: "調剤し、薬の作用や用法などの説明を患者に行うことができる資格は？",
            options: ["薬剤師", "登録販売者", "調剤事務", "MR"],
            correctIndex: 0,
            explanation: "薬剤師は、医師の処方箋に基づいて調剤を行い、患者に対して薬の効果・副作用・服用方法などを説明する専門職です。医薬品の専門家として国民の健康を守る重要な役割を担います。"
          },
          {
            question: "薬剤師は国家試験？民間試験？",
            options: ["国家試験", "民間試験"],
            correctIndex: 0,
            explanation: "薬剤師は厚生労働省が管轄する国家資格です。6年制の薬学部を卒業し、薬剤師国家試験に合格することで免許が与えられます。"
          },
          {
            question: "国家公務員として、薬物犯罪にかかわる捜査・情報収集のほか、犯罪現場から押収された薬物の鑑定を行う資格は？",
            options: ["麻薬取締官", "薬事監視員", "食品衛生監視員", "環境衛生指導員"],
            correctIndex: 0,
            explanation: "麻薬取締官は厚生労働省に所属する国家公務員で、薬物犯罪の捜査・情報収集や押収薬物の鑑定を行います。薬学の専門知識を活かし、社会の安全を守る重要な役割です。"
          },
          {
            question: "医薬品製造所での従業員の監督、施設やその他の物品を管理する事ができる資格は？",
            options: [
              "医薬部外品・化粧品・医療用具製造所責任技術者",
              "薬事監視員",
              "品質管理責任者",
              "製造管理者"
            ],
            correctIndex: 0,
            explanation: "医薬部外品・化粧品・医療用具製造所責任技術者は、製造所における従業員の監督や施設・物品の管理を行い、製品の品質と安全性を確保する責任者です。"
          },
          {
            question: "衛生上の考慮を必要とする食品の製造・加工を行う施設の食品衛生を管理する資格は？",
            options: ["食品衛生管理者", "食品衛生監視員", "HACCP管理者", "栄養士"],
            correctIndex: 0,
            explanation: "食品衛生管理者は、乳製品や肉製品など特に衛生上の考慮を必要とする食品の製造・加工施設において、食品衛生の維持・管理を行う資格です。"
          },
          {
            question: "公務員が食品衛生の仕事に就く際に必要な資格は？",
            options: ["食品衛生監視員", "食品衛生管理者", "環境衛生指導員", "薬事監視員"],
            correctIndex: 0,
            explanation: "食品衛生監視員は、国・都道府県・地方行政機関等の公務員が食品衛生の仕事に就く際に必要な任用資格。輸入食品の検査や飲食店の監視指導などを行います。"
          },
          {
            question: "保健福祉センターなどで、食の安全や住まいの衛生に関わる市民からの相談に応じる業務に携わることができる資格は？",
            options: ["環境衛生指導員", "食品衛生監視員", "保健師", "衛生管理者"],
            correctIndex: 0,
            explanation: "環境衛生指導員は、保健福祉センターなどで食の安全や住まいの衛生に関わる市民からの相談に応じ、適切な指導・助言を行う専門職です。"
          }
        ]
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
        location: "8号館エントランス",
        riddle: "人間発達学部の学科を２つ選択しよう",
        hint: "",
        answer: "",
        type: "checkbox",
        options: ["こども教育学科", "心理学科", "社会福祉学科", "栄養学科", "医療情報学科"],
        correctIndices: [0, 1],
        nextLocationHint: "こども教育学科へようこそ！３つのキーワードを入手して最終試練に挑め！"
      }
    ],
    keywordMode: {
      enabled: true,
      afterStageId: 1,
      keywords: [
        {
          id: 1,
          label: "8号館を探索",
          description: "8号館を探索してキーワードを手に入れよう",
          correctKeyword: "ランドセル",
          routeType: "stages",
          stages: [
            {
              id: 1,
              location: "8号館エントランス",
              riddle: "エントランス中央に聳え立つ絵画の名前を答えろ",
              hint: "",
              answer: "地上のいのち",
              nextLocationHint: "左手の掲示板へ進め"
            },
            {
              id: 2,
              location: "8号館1階掲示板",
              riddle: "黄色の数を答えろ",
              hint: "掲示板の🟡を探せ",
              answer: "",
              type: "multi-input",
              multiAnswers: [["2"], ["11"], ["5"]],
              inputLabels: ["5の答え", "6の答え", "7の答え"],
              itemReward: {
                id: "ukiwa",
                name: "うきわ",
                icon: "🛟",
                description: "水難を防ぐアイテム"
              },
              nextLocationHint: "右に進み掲示板を確認しよう。"
            },
            {
              id: 3,
              location: "8号館エントランス",
              riddle: "Oの次。Qの前\nSの次。Uの前\nBの前",
              hint: "アルファベット",
              answer: "PTA",
              itemReward: {
                id: "bellmark",
                name: "ベルマーク",
                icon: "🔔",
                description: "学校で集めるマーク"
              },
              nextLocationHint: "階段で２階へ進め"
            },
            {
              id: 4,
              location: "8号館2階",
              riddle: "水汲み装置を探せ。寄贈元の団体を答えろ。",
              hint: "エレベータ前",
              answer: "同窓会",
              alternateAnswers: ["高崎健康福祉大学同窓会"],
              accident: {
                image: "/images/water-accident.jpg",
                title: "アクシデント発生！",
                message: "水が溢れ出してしまった。\nこのままでは8号館が水没してしまう。\nなんとかしよう！",
                requiredItemId: "ukiwa",
                showTutorial: true,
                successMessage: "うきわで水から身を守った！水難を回避しました！"
              },
              nextLocationHint: "危機は去った。次の問題に答えろ。"
            },
            {
              id: 5,
              location: "8号館2階",
              riddle: "本学科でさまざまなイベントを行う、子ども教育学科友達の輪を広げようプロジェクトの略称を答えろ",
              hint: "Instagramを確認しよう",
              hintUrl: "https://www.instagram.com/kendai_kodomo_chaitomo/",
              answer: "チャイとも",
              nextLocationHint: "この奥は9号館。引き返して3階へ進め。"
            },
            {
              id: 6,
              location: "8号館3階",
              riddle: "入学式でも披露された、本学の学歌のタイトルを答えよ。",
              hint: "",
              answer: "夢のはじまり",
              nextLocationHint: "3階奥まで進め"
            },
            {
              id: 7,
              location: "8号館3階",
              riddle: "「中学校」青い部分を入れ替えて読め。",
              riddleImage: "/images/kodomo-channel-grid.png",
              hint: "掲示板を確認しよう",
              answer: "こどもチャンネル",
              itemReward: {
                id: "gabyou",
                name: "画鋲",
                icon: "📌",
                description: "掲示物を留めるアイテム"
              },
              nextLocationHint: "戦闘の予感..."
            },
            {
              id: 8,
              location: "8号館4階",
              riddle: "黙ってじっくりと物事を考え込むことを何という？",
              hint: "研究室を調べてみよう",
              answer: "沈思黙考",
              accident: {
                title: "アクシデント発生！",
                message: "火災が発生した。\nアイテムを使って食い止めろ！\n必要なアイテムを持たない場合、別のキーワードを探索してみよう。",
                requiredItemId: "shoukaki",
                successMessage: "消火器で火を消し止めた！火災を回避しました！",
                image: "/images/fire-accident.jpg"
              },
              nextLocationHint: "よくがんばりました。５階へ進みましょう。"
            },
            {
              id: 9,
              location: "8号館4階",
              riddle: "□ 練\n入 □\n□ 行",
              hint: "ためされている。",
              answer: "試",
              nextLocationHint: "戦闘の予感..."
            }
          ],
          battles: [
          {
            id: 1,
            afterStageId: 7,
            enemyName: "カオスチャイルド",
            enemyImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop",
            enemyMaxHp: 100,
            playerMaxHp: 100,
            damageToEnemy: 20,
            damageToPlayer: 20,
            randomOrder: true,
            battleBgm: "trainerBattle",
            nextLocationHint: "よくやった！4階へ進め",
            rewardItem: {
              id: "kyouben",
              name: "教鞭",
              icon: "🪄",
              description: "教師が授業で使う指し棒"
            },
            questions: [
              {
                question: "こども教育学科の２つのコースを選べ",
                options: ["保育・教育コース", "教員養成コース", "発達支援コース", "社会福祉コース"],
                type: "checkbox",
                correctIndices: [0, 1],
                explanation: "こども教育学科は「保育・教育コース」と「教員養成コース」の2コース制です。目指す進路に合わせてコースを選択できます。"
              },
              {
                question: "幼稚園教諭一種免許が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [0],
                explanation: "幼稚園教諭一種免許は保育・教育コースで取得できます。乳幼児期の教育・保育に携わる専門職を養成します。"
              },
              {
                question: "保育士の資格が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [0],
                explanation: "保育士資格は保育・教育コースで取得できます。保育園などで乳幼児の保育を担う専門職です。"
              },
              {
                question: "小学校教諭一種免許が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [0, 1],
                explanation: "小学校教諭一種免許は両コースで取得可能です。保育・教育コースでは幼小連携を、教員養成コースでは小中連携を意識したカリキュラムとなっています。"
              },
              {
                question: "教員養成コースにて取得できる中学校教諭免許の科目はどれ？",
                options: ["英語", "国語", "数学", "社会"],
                correctIndex: 0,
                explanation: "教員養成コースでは中学校教諭一種免許（英語）を取得できます。小中連携を見据えた教員養成が特色です。"
              },
              {
                question: "司書教諭の免許が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [1],
                explanation: "司書教諭の免許は教員養成コースで取得できます。学校図書館の運営・活用の中心的役割を担う専門職です。"
              },
              {
                question: "認定絵本士の資格が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [0, 1],
                explanation: "認定絵本士は両コースで取得できます。絵本の選び方、読み聞かせの技能、お話し会の企画・運営などを学びます。"
              },
              {
                question: "認定ベビーシッターの資格が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [0],
                explanation: "認定ベビーシッターは保育・教育コースで取得できます。保育士資格の科目に加えて『在宅保育論』を履修することで取得可能です。"
              },
              {
                question: "レクリエーションインストラクターの資格が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [0, 1],
                explanation: "レクリエーションインストラクターは両コースで取得できます。ゲームや集団遊び、スポーツの“楽しさ”を活用した支援・プログラム企画の力を身につけます。"
              },
              {
                question: "3歳から就学前までの幼児を対象に、一人ひとりの資質や性格を理解しながら、遊びを中心とした活動のなかで幼児の心と体の発達をうながす仕事は？",
                options: ["幼稚園教諭", "保育士", "小学校教諭", "認定こども園教諭"],
                correctIndex: 0,
                explanation: "幼稚園教諭は3歳から就学前までの幼児を対象に、遊びを中心とした活動を通じて心身の発達を促す専門職です。"
              },
              {
                question: "乳児から就学前までの乳幼児を預かり保護者の子育てをサポートする仕事は？",
                options: ["保育士", "幼稚園教諭", "認定ベビーシッター", "小学校教諭"],
                correctIndex: 0,
                explanation: "保育士は乳児から就学前までの乳幼児を預かり、日々の保育を通じて保護者の子育てをサポートする専門職です。"
              },
              {
                question: "全ての教科指導、担任としての学級経営、一人一人の児童の理解と支援、学校行事の運営、保護者・地域社会との連携等を行う仕事は？",
                options: ["小学校教諭一種", "中学校教諭", "幼稚園教諭", "特別支援学校教諭"],
                correctIndex: 0,
                explanation: "小学校教諭一種は全ての教科指導、学級経営、児童理解、学校行事運営、保護者・地域社会との連携など、学級担任として幅広い役割を担います。"
              },
              {
                question: "障害のある子どもたちが通う特別支援学校の教員の免許は？",
                options: ["特別支援学校教諭免許", "養護教諭免許", "司書教諭免許", "小学校教諭二種免許"],
                correctIndex: 0,
                explanation: "特別支援学校教諭免許は、障害のある子どもたちが通う特別支援学校で教員として働くために必要な免許です。"
              },
              {
                question: "本学科では、どの科目の中学校免許が取得できるか？",
                options: ["英語", "国語", "数学", "理科"],
                correctIndex: 0,
                explanation: "本学科では中学校教諭一種免許（英語）を取得できます。小中連携を見据えた教員養成が特色です。"
              },
              {
                question: "教諭として採用された上で、学校図書館資料の選択・収集・提供や子どもの読書活動に対する指導、学校図書館の利用指導計画の立案など、学校図書館の運営・活用についての中心的な役割を担うお仕事は？",
                options: ["司書教諭", "学校司書", "図書館司書", "司書"],
                correctIndex: 0,
                explanation: "司書教諭は教諭として採用された上で、学校図書館の資料選択・収集・提供、子どもの読書活動指導、学校図書館の運営・活用の中心的役割を担う専門職です。"
              },
              {
                question: "絵本に関する幅広い知識や絵本の選び方、読み聞かせの技能、お話し会の企画・運営などを学ぶ資格は？",
                options: ["認定絵本士", "読み聞かせインストラクター", "絵本専門士", "児童文学士"],
                correctIndex: 0,
                explanation: "認定絵本士は、絵本に関する幅広い知識、絵本の選び方、読み聞かせの技能、お話し会の企画・運営などを学ぶ資格です。"
              },
              {
                question: "保育士資格に必要な全ての科目を履修し、さらに「在宅保育論」を履修することにより、公益社団法人全国保育サービス協会から認定を受けることができる資格は？",
                options: ["認定ベビーシッター", "家庭保育員", "ホームヘルパー", "認定保育士"],
                correctIndex: 0,
                explanation: "認定ベビーシッターは、保育士資格に必要な全ての科目を履修し、さらに「在宅保育論」を履修することで、公益社団法人全国保育サービス協会から認定される資格です。"
              },
              {
                question: "保育・教育現場でゲームや集団遊び、スポーツの“楽しさ”を活用して子どもや親への支援を実践したり、目的に合わせてプログラムを企画・展開したりする力が身につけられる資格は？",
                options: ["レクリエーションインストラクター", "スポーツ指導員", "遊具指導士", "キャンプ指導者"],
                correctIndex: 0,
                explanation: "レクリエーションインストラクターは、ゲームや集団遊び、スポーツの“楽しさ”を活用した子ども・親への支援や、プログラムの企画・展開ができる資格です。"
              },
              {
                question: "福祉事務所のケースワーカーとして任用される者に必要とされる資格は？",
                options: ["社会福祉主事任用資格", "社会福祉士", "精神保健福祉士", "介護福祉士"],
                correctIndex: 0,
                explanation: "社会福祉主事任用資格は、福祉事務所のケースワーカーとして任用される際に必要とされる資格です。福祉分野で幅広く活躍できる基礎資格です。"
              }
            ]
          },
          {
            id: 2,
            afterStageId: 9,
            enemyName: "レジェンドピアニスト",
            enemyImage: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop",
            enemyMaxHp: 100,
            playerMaxHp: 100,
            damageToEnemy: 20,
            damageToPlayer: 20,
            randomOrder: true,
            battleBgm: "trainerBattle",
            questions: [
              {
                question: "こども教育学科の２つのコースを選べ",
                options: ["保育・教育コース", "教員養成コース", "発達支援コース", "社会福祉コース"],
                type: "checkbox",
                correctIndices: [0, 1],
                explanation: "こども教育学科は「保育・教育コース」と「教員養成コース」の2コース制です。"
              },
              {
                question: "幼稚園教諭一種免許が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [0],
                explanation: "幼稚園教諭一種免許は保育・教育コースで取得できます。"
              },
              {
                question: "保育士の資格が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [0],
                explanation: "保育士資格は保育・教育コースで取得できます。"
              },
              {
                question: "小学校教諭一種免許が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [0, 1],
                explanation: "小学校教諭一種免許は両コースで取得可能です。"
              },
              {
                question: "教員養成コースにて取得できる中学校教諭免許の科目はどれ？",
                options: ["英語", "国語", "数学", "社会"],
                correctIndex: 0,
                explanation: "教員養成コースでは中学校教諭一種免許（英語）を取得できます。"
              },
              {
                question: "司書教諭の免許が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [1],
                explanation: "司書教諭の免許は教員養成コースで取得できます。"
              },
              {
                question: "認定絵本士の資格が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [0, 1],
                explanation: "認定絵本士は両コースで取得できます。"
              },
              {
                question: "認定ベビーシッターの資格が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [0],
                explanation: "認定ベビーシッターは保育・教育コースで取得できます。"
              },
              {
                question: "レクリエーションインストラクターの資格が取得できるコースを選べ",
                options: ["保育・教育コース", "教員養成コース"],
                type: "checkbox",
                correctIndices: [0, 1],
                explanation: "レクリエーションインストラクターは両コースで取得できます。"
              },
              {
                question: "SSWはなんの略？",
                options: [
                  "スクールソーシャルワーカー",
                  "スクールサポートワーカー",
                  "スタッフソーシャルワーカー",
                  "スクールセーフティワーカー"
                ],
                correctIndex: 0,
                explanation: "SSWは「スクールソーシャルワーカー（School Social Worker）」の略。いじめ・不登校・虐待など学校や家庭での問題を抱える児童生徒を支援する専門職です。"
              },
              {
                question: "SCはなんの略？",
                options: [
                  "スクールカウンセラー",
                  "スチューデントカウンセラー",
                  "スクールコンサルタント",
                  "スクールケアワーカー"
                ],
                correctIndex: 0,
                explanation: "SCは「スクールカウンセラー（School Counselor）」の略。児童生徒や保護者の心理的支援、教員への助言などを行う心理専門職です。"
              },
              {
                question: "SELはなんの略？",
                options: [
                  "ソーシャルエモーショナルラーニング（こころの教育）",
                  "スチューデントエンゲージメントラーニング",
                  "スクールエデュケーションリーダーシップ",
                  "セルフエクスプレッションラーニング"
                ],
                correctIndex: 0,
                explanation: "SELは「Social Emotional Learning（ソーシャル・エモーショナル・ラーニング／こころの教育）」の略。自己認識・自己管理・社会認識・対人関係・責任ある意思決定など、社会情動的スキルを育む教育です。"
              }
            ]
          }
          ]
        },
        {
          id: 2,
          label: "9号館を探索",
          description: "9号館を探索してキーワードを手に入れよう",
          correctKeyword: "生徒手帳",
          routeType: "stages",
          confirmMessage: "エントランスから左へ進み、ドアを出て隣の号館へ移動しろ。",
          stages: [
            {
              id: 1,
              location: "9号館1階",
              riddle: "9号館1階にある施設を全て選択しろ",
              hint: "",
              answer: "",
              type: "checkbox",
              options: [
                "国際交流センター",
                "VSC",
                "キャリアサポートセンター",
                "教職支援センター",
                "学生ホール",
                "保健センター",
                "図書館"
              ],
              correctIndices: [0, 1, 2, 3, 4],
              nextLocationHint: "9号館へようこそ。次の問題へ進め"
            },
            {
              id: 2,
              location: "9号館1階",
              riddle: "国際交流センターにて毎週金曜日に開催されている海外学生との交流イベントの名前は？",
              hint: "",
              answer: "Global Cafe",
              alternateAnswers: ["Global cafe", "global cafe", "GLOBAL CAFE", "グローバルカフェ"],
              nextLocationHint: "次の問題へ進め"
            },
            {
              id: 3,
              location: "9号館1階",
              riddle: "VSCはなんの略？",
              hint: "",
              answer: "ボランティア・市民活動支援センター",
              alternateAnswers: ["ボランティア市民活動支援センター"],
              nextLocationHint: "次の問題へ進め"
            },
            {
              id: 4,
              location: "9号館1階",
              riddle: "キャリアサポートセンターで受け付けているものの例を２つ答えろ",
              hint: "",
              answer: "",
              type: "checkbox",
              options: ["名刺作成", "模擬面接", "奨学金申請", "パソコン修理"],
              correctIndices: [0, 1],
              itemReward: {
                id: "rirekisho",
                name: "履歴書",
                icon: "📄",
                description: "就職活動に欠かせない書類"
              },
              nextLocationHint: "おめでとう。2階へ進もう。"
            },
            {
              id: 5,
              location: "9号館2階",
              riddle: "欠 □\n□ 呼\n□ 滅\n共通して当てはまるものは？",
              hint: "・",
              answer: "点",
              accident: {
                title: "アクシデント発生！",
                message: "強そうな面接官が現れた！\nアイテムを使って撃退しよう。",
                requiredItemId: "rirekisho",
                showTutorial: true,
                successMessage: "履歴書を差し出したら面接官は去っていった！",
                image: "/images/mensetu.jpg",
                rewardItem: {
                  id: "shoukaki",
                  name: "消火器",
                  icon: "🧯",
                  description: "火災を食い止めるアイテム"
                },
                rewardMessage: "面接官が何かを落としていった、、"
              },
              nextLocationHint: "なんとかなった、、3階へ進もう。"
            },
            {
              id: 6,
              location: "9号館3階",
              riddle: "紅蝶の導く言葉を紡げ",
              hint: "蝶が向いている場所を確認しよう",
              answer: "remember",
              accident: {
                title: "アクシデント発生！",
                message: "ポスターが剥がれかけている！\nこのままだと飛ばされそうだ。\nアイテムを使ってなんとかしよう。",
                requiredItemId: "gabyou",
                successMessage: "画鋲でポスターをしっかり留めた！",
                image: "/images/kami.jpeg"
              },
              nextLocationHint: "左の扉を出て屋上スペースへ"
            },
            {
              id: 7,
              location: "9号館屋上",
              riddle: "レンガ裏に一輪だけ咲く赤い花は何の花？（到着したらヒント必読！）",
              hint: "雨で花が散りました。正解は🌷",
              answer: "チューリップ",
              nextLocationHint: "戦闘の予感..."
            },
            {
              id: 8,
              location: "9号館屋上",
              riddle: "本学でベルマーク運動を行っている学生団体の名称は？",
              hint: "リンクを確認しよう",
              hintUrl: "https://www.takasaki-u.ac.jp/contribution/volunteer/student-vlunteer-jisseki",
              answer: "べるふぁみ",
              accident: {
                title: "アクシデント発生！",
                message: "ベルマークを回収ボックスに投入しよう！\nベルマーク１点は一円に換算することができるぞ！",
                requiredItemId: "bellmark",
                successMessage: "ベルマークを回収ボックスに投入した！",
                image: "/images/bell.png"
              },
              nextLocationHint: "次の問題に答えよう。"
            },
            {
              id: 9,
              location: "9号館屋上",
              riddle: "藤龍祭にて、子ども教育学科有志が出展する遊びのブースの名称を答えろ",
              hint: "リンクを確認しよう",
              hintUrl: "https://www.takasaki-u.ac.jp/faculty_information/138179.html?ref=/news/kodomo",
              answer: "遊びの広場",
              alternateAnswers: ["あそびのひろば"],
              itemReward: {
                id: "kyoushi-no-kokoro",
                name: "教師の心",
                icon: "❤️",
                description: "教師としての情熱"
              },
              nextLocationHint: ""
            }
          ],
          battles: [
            {
              id: 1,
              afterStageId: 7,
              enemyName: "ボランティアマスター",
              enemyImage: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=400&fit=crop",
              enemyMaxHp: 100,
              playerMaxHp: 100,
              damageToEnemy: 20,
              damageToPlayer: 20,
              randomOrder: true,
              battleBgm: "trainerBattle",
              nextLocationHint: "おめでとう。次の問題へ進め。",
              questions: [
                {
                  question: "専門の職員が常駐し、教職課程の履修、実習支援、就職活動をトータルでサポートするセンターの名前は？",
                  options: ["教職支援センター", "キャリアサポートセンター", "学生支援センター", "教員養成センター"],
                  correctIndex: 0,
                  explanation: "教職支援センターは、専門の職員が常駐し、教職課程の履修・実習支援・就職活動を一貫してサポートする本学の施設です。"
                },
                {
                  question: "本学で学科ごとに現場経験の豊富な専門家による職業に係る講演や、卒業生による実体験に基づく就活体験談やアドバイスを聞くことのできる支援講座の名前は？",
                  options: ["キャリアアップ講座", "就活サポート講座", "キャリアデザイン講座", "職業体験講座"],
                  correctIndex: 0,
                  explanation: "キャリアアップ講座は、各学科ごとに現場経験豊富な専門家の講演や、卒業生による就活体験談・アドバイスを聞ける支援講座です。"
                },
                {
                  question: "キャリアサポートセンターにて公務員を志望する学生を対象に行われている講座は？",
                  options: ["公務員試験対策講座", "行政職講座", "公務員就職ゼミ", "官庁対策講座"],
                  correctIndex: 0,
                  explanation: "公務員試験対策講座は、キャリアサポートセンターにて公務員を志望する学生を対象に行われている講座です。"
                },
                {
                  question: "キャリアサポートセンターにて民間企業を志望する学生を対象に行われている講座は？",
                  options: ["SPI講座", "就活筆記講座", "一般常識講座", "就職試験対策講座"],
                  correctIndex: 0,
                  explanation: "SPI講座は、キャリアサポートセンターにて民間企業を志望する学生を対象に行われている講座です。多くの企業が採用試験で用いるSPIに対応した学習を行います。"
                },
                {
                  question: "本学の学術協定提携先となっている海外大学の数はいくつ？",
                  options: ["10", "13", "15", "20"],
                  correctIndex: 1,
                  explanation: "本学は現在13の海外大学と学術協定を結んでおり、国際交流の機会を広く提供しています。"
                },
                {
                  question: "本学の学術協定提携先となっているライン幼稚園はどこの国？",
                  options: ["ドイツ", "フランス", "オーストリア", "スイス"],
                  correctIndex: 0,
                  explanation: "ライン幼稚園はドイツにある本学の学術協定提携先です。"
                },
                {
                  question: "子どもと家族の健康を支援するため、平成17年に設立された施設を選べ",
                  options: ["子ども・家庭支援センター", "子育て支援センター", "こどもホーム", "家庭児童相談室"],
                  correctIndex: 0,
                  explanation: "子ども・家庭支援センターは、子どもと家族の健康を支援するため平成17年に設立された本学の施設です。"
                },
                {
                  question: "毎年公開されている、教職支援センターの広報誌の名称は？",
                  options: ["つなぐ", "かけはし", "ひろば", "すてっぷ"],
                  correctIndex: 0,
                  explanation: "「つなぐ」は、教職支援センターが毎年公開している広報誌の名称です。"
                },
                {
                  question: "VSCの運営を行う学生団体の名称は？",
                  options: ["VSC学生スタッフ", "ボランティア委員会", "VSC運営委員会", "サポートクラブ"],
                  correctIndex: 0,
                  explanation: "VSC学生スタッフは、ボランティアサポートセンター（VSC）の運営を行う学生団体です。"
                },
                {
                  question: "能登半島へ赴きマジックショーを披露するボランティアを行った本学の学生団体の名称は？",
                  options: ["MAGIC CLUB", "手品部", "マジックサークル", "イリュージョン同好会"],
                  correctIndex: 0,
                  explanation: "MAGIC CLUBは本学の学生団体で、能登半島へ赴きマジックショーを披露するボランティア活動を行いました。"
                },
                {
                  question: "VSC学生スタッフが6月22日に行った「空に願いをこめて〜6月のわくわく大作戦」のテーマは？",
                  options: [
                    "七夕まつり あそんで つくって ねがいをこめて",
                    "あじさい鑑賞会",
                    "梅雨の工作ひろば",
                    "虹のかけら集め"
                  ],
                  correctIndex: 0,
                  explanation: "「七夕まつり あそんで つくって ねがいをこめて」は、VSC学生スタッフが6月22日に行った「空に願いをこめて〜6月のわくわく大作戦」のテーマです。"
                },
                {
                  question: "災害復興を支援する本学の学生団体の名称は？",
                  options: ["わたりば", "かけはし", "つながり", "ふくとも"],
                  correctIndex: 0,
                  explanation: "わたりばは、災害復興を支援する本学の学生団体です。"
                },
                {
                  question: "令和７年度前期ベルマーク運動にて集まったベルマークの枚数は？",
                  options: ["250枚", "383枚", "500枚", "1000枚"],
                  correctIndex: 1,
                  explanation: "令和7年度前期のベルマーク運動では383枚（905.3点）のベルマークが集まりました。"
                }
              ]
            }
          ]
        },
        {
          id: 3,
          label: "ミニゲームに挑戦",
          description: "ミニゲームをクリアしてキーワードを手に入れよう",
          correctKeyword: "単語帳",
          routeType: "minigame"
        }
      ],
      completionMessage: "全てのキーワードを入手！最終試練に挑め！"
    },
    finalBattle: {
      enemyName: "第1種ワールド教諭",
      enemyImage: "/images/world.png",
      enemyMaxHp: 150,
      playerMaxHp: 100,
      damageToEnemy: 10,
      damageToPlayer: 20,
      requiredCorrectCount: 15,
      reviveItemId: "kyoushi-no-kokoro",
      finishingItemId: "kyouben",
      battleBgm: "finalBattle",
      victoryMessage: "最終試練を突破した！",
      questions: [
        {
          question: "子ども教育学科2026年度新入生は何人？",
          options: ["102名", "85名", "120名", "95名"],
          correctIndex: 0,
          explanation: "子ども教育学科2026年度の新入生は102名です。"
        },
        {
          question: "2025年12月21日(日)に開催された本学科主催のクリスマスイベントの名称は？",
          options: [
            "健大クリスマス・イルミネーション・コンサート2025",
            "健大クリスマスナイト2025",
            "子ども教育学科クリスマスフェス",
            "健大ホリデーコンサート2025"
          ],
          correctIndex: 0,
          explanation: "2025年12月21日(日)に開催された本学科主催のクリスマスイベントは「健大クリスマス・イルミネーション・コンサート2025」です。"
        },
        {
          question: "子ども達の体験できるクリスマスリース作りと、学生達によるブラックライトシアター、絵本の読み聞かせ、クリスマスソングの合唱が行われた本学科のイベント名は？",
          options: [
            "健大子どものウィンターフェスティバル",
            "健大キッズクリスマスパーティー",
            "子ども教育学科冬まつり",
            "クリスマス子どもフェスタ"
          ],
          correctIndex: 0,
          explanation: "「健大子どものウィンターフェスティバル」では、子ども達のクリスマスリース作り、学生達によるブラックライトシアター、絵本の読み聞かせ、クリスマスソング合唱などが行われました。"
        },
        {
          question: "藤龍祭「遊びの広場」にて科学のおもしろさを子どもが体験したブースの名前は？",
          options: ["おもしろ理科実験室", "科学探検ブース", "サイエンス広場", "理科ひろば"],
          correctIndex: 0,
          explanation: "「おもしろ理科実験室」は、藤龍祭「遊びの広場」にて科学のおもしろさを子ども達が体験できるブースとして出展されました。"
        },
        {
          question: "本学科の学生が訪問するドイツ研修の提携大学は？",
          options: ["ランダウ大学", "ハイデルベルク大学", "ベルリン自由大学", "ミュンヘン大学"],
          correctIndex: 0,
          explanation: "ランダウ大学は本学科のドイツ研修の提携大学です。"
        },
        {
          question: "子ども教育学科の教員が研究者としてアカデミックな専門性を高校生に紹介することで、高等教育機関への導入教育を行うことを目的として実施されるイベントは？",
          options: ["健大PP", "健大スクールビジット", "健大オープンレクチャー", "健大プレカレッジ"],
          correctIndex: 0,
          explanation: "「健大PP」は、子ども教育学科の教員が研究者としてのアカデミックな専門性を高校生に紹介し、高等教育機関への導入教育を行うことを目的としたイベントです。"
        },
        {
          question: "入学式にて学歌「夢のはじまり」を披露した有志たちは何学科？",
          options: ["子ども教育学科", "社会福祉学科", "心理学科", "健康栄養学科"],
          correctIndex: 0,
          explanation: "入学式にて学歌「夢のはじまり」を披露した有志たちは子ども教育学科の学生です。"
        },
        {
          question: "子どもの豊かな感性や表現する力を養い、創造性を育むために、具体的な指導場面を想定して実践的に学ぶ学問は？",
          options: ["保育内容表現", "幼児表現論", "子ども造形論", "保育表現演習"],
          correctIndex: 0,
          explanation: "「保育内容表現」は、子どもの豊かな感性や表現する力を養い、創造性を育むために、具体的な指導場面を想定して実践的に学ぶ学問です。"
        },
        {
          question: "子ども教育学科卒業後に取得できる任用資格をすべて選べ",
          options: [
            "社会福祉主事任用資格",
            "児童福祉司任用資格",
            "精神保健福祉士",
            "介護福祉士任用資格"
          ],
          type: "checkbox",
          correctIndices: [0, 1],
          explanation: "子ども教育学科卒業後には「社会福祉主事任用資格」と「児童福祉司任用資格」の2つの任用資格を取得できます。"
        },
        {
          question: "保育教育コースの学生が一年生で経験する教育基礎実習は？",
          options: ["幼稚園", "保育所", "小学校", "認定こども園"],
          correctIndex: 0,
          explanation: "保育教育コースの学生は一年生で幼稚園での教育基礎実習を経験します。"
        },
        {
          question: "教員養成コースの学生が一年生で経験する教育基礎実習は？",
          options: ["小学校・特別支援学校", "中学校・高等学校", "幼稚園・保育所", "小学校のみ"],
          correctIndex: 0,
          explanation: "教員養成コースの学生は一年生で小学校・特別支援学校での教育基礎実習を経験します。"
        },
        {
          question: "保育教育コースの学生が二年生で経験する教育基礎実習は？",
          options: ["保育実習（保育所）", "幼稚園実習", "施設実習", "小学校実習"],
          correctIndex: 0,
          explanation: "保育教育コースの学生は二年生で保育実習（保育所）を経験します。"
        },
        {
          question: "幼稚園教諭1種免許は短大や専門学校でも取得可能？",
          options: ["不可能", "可能", "短大のみ可能", "専門学校のみ可能"],
          correctIndex: 0,
          explanation: "幼稚園教諭1種免許は4年制大学の課程でのみ取得可能であり、短大や専門学校では取得できません。"
        }
      ]
    }
  },
  {
    id: "agriculture",
    name: "農学部",
    buildings: "10号館",
    color: "orange",
    icon: "🌾",
    unlockPassword: "112233",
    stages: [
      {
        id: 1,
        location: "10号館エントランス",
        riddle: "農学部の学科を答えろ",
        hint: "",
        answer: "",
        type: "select",
        options: ["生物生産学科", "農学科", "農芸化学科", "応用生物科学科"],
        correctIndex: 0,
        nextLocationHint: "次の問題へ進もう"
      },
      {
        id: 2,
        location: "10号館1階",
        riddle: "自動販売機の謎を解け",
        riddleImage: "/images/dna.png",
        hint: "商品を探し当てはまる部分を読め",
        answer: "DNA",
        itemReward: { id: "agr-water", name: "水", icon: "💧", description: "作物に水をあげよう" },
        nextLocationHint: "１階売店へ進め"
      },
      {
        id: 3,
        location: "10号館1階売店",
        riddle: "農学部売店の名称を答えろ",
        hint: "",
        answer: "MARUZEN campus shop",
        alternateAnswers: ["マルゼンキャンパスショップ"],
        itemReward: { id: "agr-nutrient", name: "栄養剤", icon: "💊", description: "作物に栄養を与えよう" },
        nextLocationHint: "売店を出て1階の謎を解け"
      },
      {
        id: 4,
        location: "10号館1階エントランス",
        riddle: "緑色が示す場所を答えろ",
        riddleImage: "/images/douro.png",
        hint: "掲示板を確認しよう。",
        answer: "健大サッカー場",
        itemRewards: [
          { id: "agr-17ice", name: "17アイス", icon: "🍦", description: "冷たくて甘い" },
          { id: "agr-energy", name: "エナドリ", icon: "⚡", description: "元気が出る飲み物" },
          { id: "agr-textbook", name: "参考書", icon: "📚", description: "知識の源" }
        ],
        nextLocationHint: "階段で２階へ進め"
      },
      {
        id: 5,
        location: "10号館2階",
        riddle: "地域連携室の取り組みを答えよう",
        hint: "２階を探索してみよう",
        answer: "",
        type: "multi-input",
        multiAnswers: [
          ["ナス", "なす", "茄子"],
          ["花豆", "はなまめ", "ハナマメ"],
          ["ネギ", "ねぎ", "葱"]
        ],
        inputLabels: [
          "群馬の「」のブランド化",
          "「」の減収要因の究明",
          "「」の品質向上"
        ],
        itemRewards: [
          { id: "agr-chili", name: "唐辛子", icon: "🌶️", description: "辛い刺激" },
          { id: "agr-rice", name: "お米", icon: "🍚", description: "日本の主食" }
        ],
        recoversFullness: true,
        nextLocationHint: "おめでとう。次の問題に答えよう。"
      },
      {
        id: 6,
        location: "10号館2階奥",
        riddle: "返本、書架整理、案内の作成などの図書館業務をシフト制でお手伝いし、１時間につきQUOカードが１枚もらえる本学の学生サポーターの名称は？",
        hint: "１階掲示板を見てみよう",
        answer: "図書館サポーター",
        itemRewards: [
          { id: "agr-banana", name: "バナナ", icon: "🍌", description: "栄養満点の果物" },
          { id: "agr-melon", name: "メロン", icon: "🍈", description: "高級フルーツ" }
        ],
        recoversFullness: true,
        nextLocationHint: "よくやった。次の問題へ進め"
      },
      {
        id: 7,
        location: "10号館2階奥",
        riddle: "地域連携室の右へ進むとどの号館へつながっている？",
        hint: "",
        answer: "9号館",
        alternateAnswers: ["9号館", "９号館", "9ごうかん", "きゅうごうかん"],
        nextLocationHint: "戦闘の予感..."
      },
      {
        id: 8,
        location: "10号館3階",
        riddle: "３階掲示板の謎を解け",
        hint: "「け」をむし・「こ」をけし",
        answer: "きんえん",
        alternateAnswers: ["禁煙", "キンエン"],
        nextLocationHint: "よくやった。次の問題へ進め"
      },
      {
        id: 9,
        location: "10号館3階奥",
        riddle: "３階奥での謎を解け",
        hint: "",
        answer: "あ",
        nextLocationHint: "戦闘の予感..."
      },
      {
        id: 10,
        location: "10号館4階",
        riddle: "４階での謎を解け",
        hint: "",
        answer: "あ",
        nextLocationHint: "４階奥へ進め"
      },
      {
        id: 11,
        location: "10号館4階奥",
        riddle: "４階奥での謎を解け",
        hint: "",
        answer: "あ",
        nextLocationHint: "よくやった。５階へ進め。"
      },
      {
        id: 12,
        location: "10号館5階",
        riddle: "５階での謎を解け",
        hint: "",
        answer: "あ",
        itemRewards: [
          { id: "agr-natural-water", name: "天然水", icon: "🏔️", description: "自然の恵み" },
          { id: "agr-silica-water", name: "シリカ水", icon: "💎", description: "ミネラル豊富な水" },
          { id: "agr-hydrogen-water", name: "水素水", icon: "🫧", description: "水素たっぷりの水" }
        ],
        recoversFullness: true,
        nextLocationHint: "５階奥へ進め"
      },
      {
        id: 13,
        location: "10号館5階奥",
        riddle: "５階奥での謎を解け",
        hint: "",
        answer: "あ",
        nextLocationHint: "次は最上階。６階へ進め。"
      },
      {
        id: 14,
        location: "10号館6階",
        riddle: "６階での謎を解け",
        hint: "",
        answer: "あ",
        nextLocationHint: ""
      }
    ],
    midBattles: [
      {
        id: 3,
        afterStageId: 7,
        cropBattle: true,
        enemyCropName: "じゃがジュニア",
        enemyCropImage: "/images/jaga.png",
        enemyName: "じゃがジュニア",
        enemyImage: "/images/jaga.png",
        enemyMaxHp: 100,
        playerMaxHp: 100,
        damageToEnemy: 20,
        damageToPlayer: 15,
        randomOrder: true,
        nextLocationHint: "よくやった。３階へ進め",
        questions: [
          {
            question: "生物生産学科の４つのコースを選択しろ",
            options: [
              "生命科学コース",
              "作物園芸システムコース",
              "フードサイエンスコース",
              "アグリビジネスコース",
              "農業経済コース",
              "畜産学コース",
              "林学コース"
            ],
            type: "checkbox",
            correctIndices: [0, 1, 2, 3],
            explanation: "生物生産学科は「生命科学コース」「作物園芸システムコース」「フードサイエンスコース」「アグリビジネスコース」の4コース制です。"
          },
          {
            question: "遺伝子工学や生理学を中心とし、分析や統計に関する知識と実験技術を身につけるコースは？",
            options: ["生命科学コース", "作物園芸システムコース", "フードサイエンスコース", "アグリビジネスコース"],
            correctIndex: 0,
            explanation: "生命科学コースでは遺伝子工学や生理学を中心に、分析や統計の知識・実験技術を身につけます。"
          },
          {
            question: "作物学や園芸学を基礎とし、先端技術を活用したスマート農業を学ぶコースは？",
            options: ["作物園芸システムコース", "生命科学コース", "フードサイエンスコース", "アグリビジネスコース"],
            correctIndex: 0,
            explanation: "作物園芸システムコースでは作物学・園芸学を基礎に、先端技術を活用したスマート農業を学びます。"
          },
          {
            question: "食品科学と生命科学を基礎とし、安全安心を届ける食品開発や衛生に携わる人材を養成するコースは？",
            options: ["フードサイエンスコース", "生命科学コース", "作物園芸システムコース", "アグリビジネスコース"],
            correctIndex: 0,
            explanation: "フードサイエンスコースでは食品科学・生命科学を基礎に、食品開発や衛生に携わる人材を養成します。"
          },
          {
            question: "食材や地球環境について文理融合型で体系的に学ぶコースは？",
            options: ["アグリビジネスコース", "生命科学コース", "作物園芸システムコース", "フードサイエンスコース"],
            correctIndex: 0,
            explanation: "アグリビジネスコースでは食材や地球環境について文理融合型で体系的に学びます。"
          },
          {
            question: "生命科学コースに含まれる研究室をすべて選べ",
            options: [
              "植物生命科学研究室",
              "基礎生命科学研究室",
              "生命工学研究室",
              "動物生命科学研究室",
              "作物学研究室",
              "食品学研究室",
              "アグリビジネス研究室"
            ],
            type: "checkbox",
            correctIndices: [0, 1, 2, 3],
            explanation: "生命科学コースには「植物生命科学研究室」「基礎生命科学研究室」「生命工学研究室」「動物生命科学研究室」の4研究室があります。"
          },
          {
            question: "作物園芸システムコースに含まれる研究室をすべて選べ",
            options: [
              "作物学研究室",
              "園芸学研究室",
              "農業情報システム学研究室",
              "植物生命科学研究室",
              "食品学研究室",
              "アグリビジネス研究室"
            ],
            type: "checkbox",
            correctIndices: [0, 1, 2],
            explanation: "作物園芸システムコースには「作物学研究室」「園芸学研究室」「農業情報システム学研究室」の3研究室があります。"
          },
          {
            question: "フードサイエンスコースに含まれる研究室をすべて選べ",
            options: [
              "食品学研究室",
              "食品微生物学研究室",
              "食品安全学研究室",
              "基礎生命科学研究室",
              "作物学研究室",
              "アグリビジネス研究室"
            ],
            type: "checkbox",
            correctIndices: [0, 1, 2],
            explanation: "フードサイエンスコースには「食品学研究室」「食品微生物学研究室」「食品安全学研究室」の3研究室があります。"
          },
          {
            question: "アグリビジネスコースに含まれる研究室は？",
            options: ["アグリビジネス研究室", "作物学研究室", "食品学研究室", "基礎生命科学研究室"],
            correctIndex: 0,
            explanation: "アグリビジネス研究室はアグリビジネスコースに属しています。"
          },
          {
            question: "食と血液レオロジーに関する研究を行っている研究室は？",
            options: ["基礎生命科学研究室", "植物生命科学研究室", "生命工学研究室", "動物生命科学研究室"],
            correctIndex: 0,
            explanation: "基礎生命科学研究室では食と血液レオロジーに関する研究を行っています。"
          },
          {
            question: "遺伝子の転写調節に関する研究を行っている研究室は？",
            options: ["基礎生命科学研究室", "植物生命科学研究室", "生命工学研究室", "動物生命科学研究室"],
            correctIndex: 0,
            explanation: "基礎生命科学研究室では遺伝子の転写調節に関する研究を行っています。"
          },
          {
            question: "植物を自在に制御するバイテク技術の研究を行っている研究室は？",
            options: ["植物生命科学研究室", "基礎生命科学研究室", "生命工学研究室", "作物学研究室"],
            correctIndex: 0,
            explanation: "植物生命科学研究室では植物を自在に制御するバイテク技術の研究を行っています。"
          },
          {
            question: "植物病原菌の早期検出技術の研究を行っている研究室は？",
            options: ["植物生命科学研究室", "基礎生命科学研究室", "食品微生物学研究室", "動物生命科学研究室"],
            correctIndex: 0,
            explanation: "植物生命科学研究室では植物病原菌の早期検出技術の研究を行っています。"
          },
          {
            question: "咀嚼の健康効果のメカニズムに関する研究を行っている研究室は？",
            options: ["動物生命科学研究室", "植物生命科学研究室", "基礎生命科学研究室", "食品学研究室"],
            correctIndex: 0,
            explanation: "動物生命科学研究室では咀嚼の健康効果のメカニズムに関する研究を行っています。"
          },
          {
            question: "食肉と生体組織としての骨格筋に関する研究を行っている研究室は？",
            options: ["動物生命科学研究室", "食品学研究室", "食品微生物学研究室", "基礎生命科学研究室"],
            correctIndex: 0,
            explanation: "動物生命科学研究室では食肉と生体組織としての骨格筋に関する研究を行っています。"
          },
          {
            question: "作物の生態と生産性、品質に関する研究を行っている研究室は？",
            options: ["作物学研究室", "園芸学研究室", "植物生命科学研究室", "農業情報システム学研究室"],
            correctIndex: 0,
            explanation: "作物学研究室では作物の生態と生産性、品質に関する研究を行っています。"
          }
        ]
      },
      {
        id: 1,
        afterStageId: 9,
        cropBattle: true,
        enemyCropName: "ダークフラワー",
        enemyCropImage: "/images/tane3.png",
        enemyName: "ダークフラワー",
        enemyImage: "/images/tane3.png",
        enemyMaxHp: 100,
        playerMaxHp: 100,
        damageToEnemy: 20,
        damageToPlayer: 20,
        randomOrder: true,
        nextLocationHint: "よくやった。４階へ進め",
        recoversFullness: true,
        rewardItems: [
          { id: "agr-fisher-heart", name: "漁師の心", icon: "🐟", description: "海の男の魂" },
          { id: "agr-teacher-heart", name: "教師の心", icon: "❤️", description: "教える情熱" },
          { id: "agr-warrior-heart", name: "戦士の心", icon: "⚔️", description: "戦う勇気" }
        ],
        questions: [
          {
            question: "日本の農業従事者の平均年齢はおよそ何歳？",
            options: ["50歳", "60歳", "68歳", "75歳"],
            correctIndex: 2,
            explanation: "日本の農業従事者の平均年齢は約68歳です。"
          },
          {
            question: "日本で最も生産量が多い野菜は？",
            options: ["キャベツ", "大根", "玉ねぎ", "トマト"],
            correctIndex: 1,
            explanation: "日本で最も生産量が多い野菜は大根です。"
          },
          {
            question: "群馬県の農業生産額が全国1位の作物は？",
            options: ["こんにゃく芋", "りんご", "米", "キャベツ"],
            correctIndex: 0,
            explanation: "群馬県はこんにゃく芋の生産量が全国1位です。"
          },
          {
            question: "稲作で「田植え」が行われる時期は？",
            options: ["3月〜4月", "5月〜6月", "7月〜8月", "9月〜10月"],
            correctIndex: 1,
            explanation: "田植えは一般的に5月〜6月に行われます。"
          },
          {
            question: "「有機農業」で使用が禁止されているものは？",
            options: ["堆肥", "化学肥料", "種", "水"],
            correctIndex: 1,
            explanation: "有機農業では化学肥料の使用が禁止されています。"
          }
        ]
      },
      {
        id: 2,
        afterStageId: 14,
        cropBattle: true,
        enemyCropName: "キングフラワー",
        enemyCropImage: "/images/tane3.png",
        enemyName: "キングフラワー",
        enemyImage: "/images/tane3.png",
        enemyMaxHp: 150,
        playerMaxHp: 100,
        damageToEnemy: 15,
        damageToPlayer: 20,
        randomOrder: true,
        battleBgm: "finalBattle",
        questions: [
          {
            question: "[プロトタイプ] 光合成に必要な3要素は？",
            options: ["水・二酸化炭素・光", "酸素・窒素・光", "水・酸素・土", "光・窒素・リン"],
            correctIndex: 0,
            explanation: "光合成には水・二酸化炭素・光の3要素が必要です。"
          },
          {
            question: "[プロトタイプ] 日本の食料自給率(カロリーベース)はおよそ？",
            options: ["38%", "55%", "72%", "85%"],
            correctIndex: 0,
            explanation: "日本のカロリーベース食料自給率は約38%です。"
          },
          {
            question: "[プロトタイプ] 世界で最も生産量が多い穀物は？",
            options: ["トウモロコシ", "米", "小麦", "大麦"],
            correctIndex: 0,
            explanation: "トウモロコシは世界で最も生産量が多い穀物です。"
          },
          {
            question: "[プロトタイプ] 連作障害を防ぐ農法は？",
            options: ["輪作", "直播", "密植", "施肥"],
            correctIndex: 0,
            explanation: "輪作は連作障害を防ぐために異なる作物を交互に栽培する農法です。"
          },
          {
            question: "[プロトタイプ] 植物ホルモン「オーキシン」の主な作用は？",
            options: ["細胞の伸長促進", "開花の促進", "落葉の促進", "果実の着色"],
            correctIndex: 0,
            explanation: "オーキシンは細胞の伸長を促進する植物ホルモンです。"
          },
          {
            question: "[プロトタイプ] SDGsの目標2は？",
            options: ["飢餓をゼロに", "貧困をなくそう", "すべての人に健康と福祉を", "質の高い教育をみんなに"],
            correctIndex: 0,
            explanation: "SDGs目標2は「飢餓をゼロに」です。"
          },
          {
            question: "[プロトタイプ] 群馬県の名産品でないものは？",
            options: ["みかん", "こんにゃく", "キャベツ", "ほうれん草"],
            correctIndex: 0,
            explanation: "みかんは主に愛媛県・和歌山県が名産地です。"
          }
        ]
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

/** 学部内のすべての戦闘問題（midBattles + keywordMode.battles）を集めて返す。
 *  最終戦闘のフォールバック問題プールとして使用する。 */
export const getFallbackBattleQuestions = (departmentId: string): MidBattleQuestion[] => {
  const dept = getDepartmentById(departmentId);
  if (!dept) return [];
  const questions: MidBattleQuestion[] = [];
  dept.midBattles?.forEach(b => {
    b.questions.forEach(q => questions.push(q));
  });
  dept.keywordMode?.keywords.forEach(kw => {
    kw.battles?.forEach(b => {
      b.questions.forEach(q => questions.push(q));
    });
  });
  return questions;
};

// 答えを正規化する関数
export const normalizeAnswer = (answer: string): string => {
  return answer
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/[ァ-ン]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60))
    .replace(/盛り上げよう/g, 'もりあげよう')
    .replace(/台本/g, 'だいほん')
    .replace(/〜|～|~$/g, '')
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
  const isNewClear = !cleared.includes(departmentId);
  if (isNewClear) {
    cleared.push(departmentId);
    localStorage.setItem('clearedDepartments', JSON.stringify(cleared));
  }
  // サーバー側にも記録（初回/重複どちらでも実行、サーバー側で重複は無視される）
  const account = loadUserAccount();
  if (account) {
    void recordClearedDepartmentToServer(account.studentId, departmentId);
  }
};

/** ログイン時などに、サーバーから取得したクリア済み学部リストをローカルに書き戻す
 *  （サーバーへの再送信は行わない） */
export const setClearedDepartmentsLocally = (deptIds: string[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('clearedDepartments', JSON.stringify(deptIds));
};

// ===== 農学部 育成シミュレーター v2 =====
export type CropStat = "kindness" | "strength" | "wisdom";

export interface CropState {
  seeded: boolean;
  totalFeeds: number;
  fullness: number; // 0〜100
  rewardTimings: number;
  /** 各ステータスの蓄積値 */
  kindness: number;  // 優しさ
  strength: number;  // 強さ
  wisdom: number;    // 賢さ
  /** ユーザーがつけた作物の名前 */
  nickname?: string;
  /** 使用した心アイテムのID（1つだけ使用可能） */
  usedHeartId?: string;
  /** 心を使った時点での基本進化名（最終進化名を固定するため） */
  baseEvoAtHeartUse?: string;
}

/** 3種類の「心」アイテム */
export const HEART_ITEM_IDS = ["agr-teacher-heart", "agr-fisher-heart", "agr-warrior-heart"] as const;

export const isHeartItem = (itemId: string): boolean => {
  return (HEART_ITEM_IDS as readonly string[]).includes(itemId);
};

/** アイテムIDごとのステータス対応表 */
const ITEM_STAT_MAP: Record<string, CropStat> = {
  "agr-17ice": "kindness",
  "agr-melon": "kindness",
  "agr-natural-water": "kindness",
  "agr-energy": "strength",
  "agr-chili": "strength",
  "agr-banana": "strength",
  "agr-hydrogen-water": "strength",
  "agr-textbook": "wisdom",
  "agr-rice": "wisdom",
  "agr-silica-water": "wisdom",
};

export const getItemStat = (itemId: string): CropStat | null => {
  return ITEM_STAT_MAP[itemId] ?? null;
};

export const CROP_FULLNESS_PER_FEED = 34;
/** アイテム1つ入手ごとの満腹度回復量（1フィード分） */
export const CROP_FULLNESS_RECOVERY_PER_ITEM = 34;
export const CROP_FULLNESS_MAX = 100;

const DEFAULT_CROP: CropState = { seeded: false, totalFeeds: 0, fullness: 0, rewardTimings: 0, kindness: 0, strength: 0, wisdom: 0, usedHeartId: undefined, baseEvoAtHeartUse: undefined };

export const getCropState = (departmentId: string): CropState => {
  if (typeof window === 'undefined') return { ...DEFAULT_CROP };
  const raw = localStorage.getItem(`cropState_${departmentId}`);
  if (raw) return { ...DEFAULT_CROP, ...JSON.parse(raw) };
  return { ...DEFAULT_CROP };
};

/** 種を植える */
export const seedCrop = (departmentId: string): CropState => {
  const state = getCropState(departmentId);
  state.seeded = true;
  saveCropState(departmentId, state);
  return state;
};

export const saveCropState = (departmentId: string, state: CropState): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`cropState_${departmentId}`, JSON.stringify(state));
};

/** 心アイテムを使用可能かどうかを判定 */
export const canUseHeartItem = (departmentId: string): boolean => {
  const state = getCropState(departmentId);
  return !state.usedHeartId;
};

/** アイテムを作物に与える（ステータスも加算 / 心なら最終進化） */
export const feedCrop = (departmentId: string, itemId?: string): CropState => {
  const state = getCropState(departmentId);
  // 心アイテムの特殊処理
  if (itemId && isHeartItem(itemId)) {
    if (state.usedHeartId) {
      // すでに使用済みなのでそのまま返す（呼び出し側でブロック）
      return state;
    }
    // 現在の基本進化名を記録してから心を使用
    const currentBase = computeBaseEvolution(state);
    if (currentBase) {
      state.baseEvoAtHeartUse = currentBase;
    }
    state.usedHeartId = itemId;
  }
  state.totalFeeds += 1;
  state.fullness = Math.min(CROP_FULLNESS_MAX, state.fullness + CROP_FULLNESS_PER_FEED);
  // ステータス加算
  if (itemId) {
    const stat = getItemStat(itemId);
    if (stat) state[stat] += 1;
  }
  saveCropState(departmentId, state);
  return state;
};

/** 満腹度を1フィード分（34）回復する */
export const digestCrop = (departmentId: string): CropState => {
  const state = getCropState(departmentId);
  state.fullness = Math.max(0, state.fullness - CROP_FULLNESS_RECOVERY_PER_ITEM);
  saveCropState(departmentId, state);
  return state;
};

/** 作物の成長段階（見た目に影響） */
export const getCropGrowthLevel = (state: CropState): number => {
  const t = state.totalFeeds;
  if (t === 0) return 0;
  if (t <= 2) return 1;
  if (t <= 4) return 2;
  return 3;
};

/** 育成段階の画像とラベル（進化済みならフラワー画像を優先） */
export const getCropVisual = (state: CropState): {
  image: string;
  label: string;
  color: string;
} => {
  // 進化済みなら専用のフラワー画像
  const evoImage = getCropEvolutionImage(state);
  const evoName = getCropEvolutionName(state);
  if (evoImage && evoName) {
    return { image: evoImage, label: evoName, color: "text-purple-700" };
  }
  const level = getCropGrowthLevel(state);
  switch (level) {
    case 0: return state.seeded
      ? { image: "/images/tane0.png", label: "種まき済み", color: "text-green-500" }
      : { image: "", label: "種まき前", color: "text-gray-500" };
    case 1: return { image: "/images/tane1.png", label: "発芽", color: "text-green-600" };
    case 2: return { image: "/images/tane2.png", label: "若葉", color: "text-green-700" };
    case 3: return { image: "/images/tane3.png", label: "成長中", color: "text-emerald-700" };
    default: return { image: "/images/tane1.png", label: "発芽", color: "text-green-600" };
  }
};

/** ステータスから基本進化名を計算する（優先度: 単独3 > 2+2 > 単独2） */
export const computeBaseEvolution = (state: CropState): string | null => {
  const { kindness: k, strength: s, wisdom: w } = state;
  if (k >= 3) return "天使フラワー";
  if (s >= 3) return "最強フラワー";
  if (w >= 3) return "天才フラワー";
  if (k >= 2 && s >= 2) return "イケメンフラワー";
  if (s >= 2 && w >= 2) return "賢者フラワー";
  if (k >= 2 && w >= 2) return "紳士フラワー";
  if (k >= 2) return "優しさフラワー";
  if (s >= 2) return "強さフラワー";
  if (w >= 2) return "賢さフラワー";
  return null;
};

/** 基本進化 × 心アイテム → 最終進化名のマッピング */
const FINAL_EVOLUTIONS: Record<string, Record<string, string>> = {
  "優しさフラワー": {
    "agr-teacher-heart": "慈愛教師フラワー",
    "agr-fisher-heart": "海の母フラワー",
    "agr-warrior-heart": "聖騎士フラワー",
  },
  "強さフラワー": {
    "agr-teacher-heart": "熱血教師フラワー",
    "agr-fisher-heart": "荒海の漁師フラワー",
    "agr-warrior-heart": "猛将フラワー",
  },
  "賢さフラワー": {
    "agr-teacher-heart": "博識教授フラワー",
    "agr-fisher-heart": "海神フラワー",
    "agr-warrior-heart": "知将フラワー",
  },
  "イケメンフラワー": {
    "agr-teacher-heart": "理想の先生フラワー",
    "agr-fisher-heart": "海の貴公子フラワー",
    "agr-warrior-heart": "美形騎士フラワー",
  },
  "賢者フラワー": {
    "agr-teacher-heart": "大賢者教授フラワー",
    "agr-fisher-heart": "海の賢人フラワー",
    "agr-warrior-heart": "軍師フラワー",
  },
  "紳士フラワー": {
    "agr-teacher-heart": "教養紳士フラワー",
    "agr-fisher-heart": "海の紳士フラワー",
    "agr-warrior-heart": "騎士道フラワー",
  },
  "天使フラワー": {
    "agr-teacher-heart": "聖母教師フラワー",
    "agr-fisher-heart": "海の女神フラワー",
    "agr-warrior-heart": "大天使フラワー",
  },
  "最強フラワー": {
    "agr-teacher-heart": "無双教授フラワー",
    "agr-fisher-heart": "伝説の漁師フラワー",
    "agr-warrior-heart": "絶対王者フラワー",
  },
  "天才フラワー": {
    "agr-teacher-heart": "神童フラワー",
    "agr-fisher-heart": "海のカリスマフラワー",
    "agr-warrior-heart": "覇王フラワー",
  },
};

/** 心アイテム使用済みなら最終進化名、それ以外なら基本進化名を返す */
export const getCropEvolutionName = (state: CropState): string | null => {
  if (state.usedHeartId && state.baseEvoAtHeartUse) {
    return FINAL_EVOLUTIONS[state.baseEvoAtHeartUse]?.[state.usedHeartId] ?? state.baseEvoAtHeartUse;
  }
  return computeBaseEvolution(state);
};

/** 基本進化名 → 画像ファイルのベース名 */
const EVO_IMAGE_BASE: Record<string, string> = {
  "優しさフラワー":   "yasashisa",
  "強さフラワー":     "tsuyosa",
  "賢さフラワー":     "kashikosa",
  "イケメンフラワー": "ikemen",
  "賢者フラワー":     "kenja",
  "紳士フラワー":     "shinshi",
  "天使フラワー":     "tenshi",
  "最強フラワー":     "saikyo",
  "天才フラワー":     "tensai",
};

/** 心アイテムID → 画像ファイルのサフィックス */
const HEART_SUFFIX: Record<string, string> = {
  "agr-teacher-heart": "-teacher",
  "agr-fisher-heart":  "-fisher",
  "agr-warrior-heart": "-warrior",
};

/** 画像が未生成の進化名セット（該当する場合は fallback 表示）。現在は全36枚揃っているため空。 */
const MISSING_EVO_IMAGES: Set<string> = new Set();

/** 進化フラワーの画像パスを返す（進化前 / 画像未生成は null） */
export const getCropEvolutionImage = (state: CropState): string | null => {
  const base = state.usedHeartId && state.baseEvoAtHeartUse
    ? state.baseEvoAtHeartUse
    : computeBaseEvolution(state);
  if (!base) return null;
  const baseName = EVO_IMAGE_BASE[base];
  if (!baseName) return null;
  const suffix = state.usedHeartId ? (HEART_SUFFIX[state.usedHeartId] ?? "") : "";
  const fileKey = `${baseName}${suffix}`;
  if (MISSING_EVO_IMAGES.has(fileKey)) return null;
  return `/images/flowers/${fileKey}.png`;
};

/** ステータスの表示情報 */
export const CROP_STAT_INFO: Record<CropStat, { label: string; icon: string; color: string }> = {
  kindness: { label: "優しさ", icon: "💗", color: "text-pink-600" },
  strength: { label: "強さ", icon: "💪", color: "text-red-600" },
  wisdom:   { label: "賢さ", icon: "📖", color: "text-blue-600" },
};

/** この学部が育成シミュレーターを使うかどうか */
export const isCropDepartment = (departmentId: string): boolean => {
  return departmentId === "agriculture";
};

export const isDepartmentCleared = (departmentId: string): boolean => {
  return getClearedDepartments().includes(departmentId);
};

export const isAllDepartmentsCleared = (): boolean => {
  return getClearedDepartments().length === getTotalDepartments();
};

export const resetProgress = (): void => {
  localStorage.removeItem('clearedDepartments');
  localStorage.removeItem('gameProgress');
};

// 経過保存の管理
export interface GameProgress {
  currentPath: string;
  savedAt: string;
}

export const saveGameProgress = (path: string): void => {
  if (typeof window === 'undefined') return;
  const progress: GameProgress = {
    currentPath: path,
    savedAt: new Date().toLocaleString('ja-JP'),
  };
  localStorage.setItem('gameProgress', JSON.stringify(progress));
};

export const loadGameProgress = (): GameProgress | null => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('gameProgress');
  return saved ? JSON.parse(saved) : null;
};

export const clearGameProgress = (): void => {
  localStorage.removeItem('gameProgress');
};

// ユーザーアカウント管理
export interface UserAccount {
  studentId: string;
  name: string;
  createdAt: string;
}

export const saveUserAccount = (studentId: string, name: string): void => {
  if (typeof window === 'undefined') return;
  const account: UserAccount = {
    studentId,
    name,
    createdAt: new Date().toLocaleString('ja-JP'),
  };
  localStorage.setItem('userAccount', JSON.stringify(account));
};

export const loadUserAccount = (): UserAccount | null => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('userAccount');
  return saved ? JSON.parse(saved) : null;
};

// パスワード解除状態の管理
export const getUnlockedDepartments = (): string[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('unlockedDepartments');
  return saved ? JSON.parse(saved) : [];
};

export const unlockDepartment = (departmentId: string): void => {
  const unlocked = getUnlockedDepartments();
  if (!unlocked.includes(departmentId)) {
    unlocked.push(departmentId);
    localStorage.setItem('unlockedDepartments', JSON.stringify(unlocked));
  }
};

export const isDepartmentUnlocked = (departmentId: string): boolean => {
  return getUnlockedDepartments().includes(departmentId);
};

// キーワード収集状態の管理
export const getObtainedKeywords = (departmentId: string): Record<number, string> => {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem(`keywords_${departmentId}`);
  return saved ? JSON.parse(saved) : {};
};

export const saveObtainedKeyword = (departmentId: string, keywordId: number, keyword: string): void => {
  const existing = getObtainedKeywords(departmentId);
  existing[keywordId] = keyword;
  localStorage.setItem(`keywords_${departmentId}`, JSON.stringify(existing));
};

export const clearObtainedKeywords = (departmentId: string): void => {
  localStorage.removeItem(`keywords_${departmentId}`);
};

// キーワードルート進行状況の管理（途中保存）
export const saveKeywordStageProgress = (
  departmentId: string,
  routeId: number,
  stageId: number
): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`keywordProgress_${departmentId}_${routeId}`, String(stageId));
};

export const loadKeywordStageProgress = (
  departmentId: string,
  routeId: number
): number | null => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(`keywordProgress_${departmentId}_${routeId}`);
  return saved ? parseInt(saved) : null;
};

export const clearKeywordStageProgress = (
  departmentId: string,
  routeId: number
): void => {
  localStorage.removeItem(`keywordProgress_${departmentId}_${routeId}`);
  localStorage.removeItem(`keywordPhase_${departmentId}_${routeId}`);
};

// ステージのフェーズ保存（アクシデント中断など）
export const saveKeywordStagePhase = (
  departmentId: string,
  routeId: number,
  stageId: number,
  phase: string
): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    `keywordPhase_${departmentId}_${routeId}`,
    JSON.stringify({ stageId, phase })
  );
};

export const loadKeywordStagePhase = (
  departmentId: string,
  routeId: number,
  stageId: number
): string | null => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(`keywordPhase_${departmentId}_${routeId}`);
  if (!saved) return null;
  try {
    const data = JSON.parse(saved);
    return data.stageId === stageId ? data.phase : null;
  } catch {
    return null;
  }
};

export const clearKeywordStagePhase = (
  departmentId: string,
  routeId: number
): void => {
  localStorage.removeItem(`keywordPhase_${departmentId}_${routeId}`);
};

// アイテム管理
export const getObtainedItems = (): ItemData[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('obtainedItems');
  return saved ? JSON.parse(saved) : [];
};

export const addItem = (item: ItemData): void => {
  const items = getObtainedItems();
  if (!items.find(i => i.id === item.id)) {
    items.push(item);
    localStorage.setItem('obtainedItems', JSON.stringify(items));
  }
};

export const hasItem = (itemId: string): boolean => {
  return getObtainedItems().some(i => i.id === itemId);
};

export const removeItem = (itemId: string): void => {
  const items = getObtainedItems().filter(i => i.id !== itemId);
  localStorage.setItem('obtainedItems', JSON.stringify(items));
};

// チュートリアル表示状態
export const hasSeenItemTutorial = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('seenItemTutorial') === 'true';
};

export const markItemTutorialSeen = (): void => {
  localStorage.setItem('seenItemTutorial', 'true');
};

// 農学部用のアイテム使用チュートリアル
export const hasSeenAgrItemTutorial = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('seenAgrItemTutorial') === 'true';
};

export const markAgrItemTutorialSeen = (): void => {
  localStorage.setItem('seenAgrItemTutorial', 'true');
};

// ===== ブラウザバック対策：ステート・スナップショット =====
// 各ステージ表示時に localStorage の状態を history.state に保存し、
// ブラウザバック時に復元することでアイテム消失を防ぐ。

/** 現在の localStorage 状態を history.state にスナップショット保存する */
export const pushStateSnapshot = (): void => {
  if (typeof window === 'undefined') return;
  const snapshot: Record<string, string | null> = {};
  // アイテム
  snapshot['obtainedItems'] = localStorage.getItem('obtainedItems');
  // 作物ステート（全学部分）
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('cropState_')) {
      snapshot[key] = localStorage.getItem(key);
    }
  }
  try {
    const current = window.history.state ?? {};
    window.history.replaceState({ ...current, __snapshot: snapshot }, '');
  } catch {
    // replaceState が失敗しても無視
  }
};

/** history.state からスナップショットを復元する */
export const restoreStateSnapshot = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const snapshot = window.history.state?.__snapshot as Record<string, string | null> | undefined;
    if (!snapshot) return false;
    for (const [key, value] of Object.entries(snapshot)) {
      if (value !== null && value !== undefined) {
        localStorage.setItem(key, value);
      }
    }
    return true;
  } catch {
    return false;
  }
};