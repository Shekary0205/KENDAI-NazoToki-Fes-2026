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
}

export interface DepartmentData {
  id: string;
  name: string;
  buildings: string;
  color: string;
  icon: string;
  stages: StageData[];
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
        hint: "カタカナを逆から読んでみよう",
        answer: "あいてぃらんぼ",
        nextLocationHint: "3号館の学生ラウンジへ向かおう"
      },
      {
        id: 3,
        location: "3号館 学生ラウンジ",
        riddle: "ここは学生の憩いの場。\n「ラウンジ」のローマ字「LOUNGE」の\n3番目と5番目の文字を組み合わせると？",
        hint: "L-O-U-N-G-E の3番目と5番目",
        answer: "UG",
        nextLocationHint: ""
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