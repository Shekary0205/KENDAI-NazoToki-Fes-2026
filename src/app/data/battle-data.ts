export interface BattleQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface BattleData {
  departmentId: string;
  enemyName: string;
  enemyImage: string;
  enemyMaxHp: number;
  playerMaxHp: number;
  damageToEnemy: number;
  damageToPlayer: number;
  questions: BattleQuestion[];
}

export const battleData: BattleData[] = [
  {
    departmentId: "health-welfare",
    enemyName: "健康福祉の守護者",
    enemyImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop",
    enemyMaxHp: 100,
    playerMaxHp: 100,
    damageToEnemy: 20,
    damageToPlayer: 25,
    questions: [
      {
        question: "日本の「健康」という言葉の由来で正しいものは？",
        options: ["中国の古典から", "明治時代の造語", "江戸時代の医学書", "仏教用語から"],
        correctIndex: 0
      },
      {
        question: "高齢者福祉で重要な「QOL」とは何の略？",
        options: ["Quality of Life", "Quick of Living", "Question of Life", "Quiet of Life"],
        correctIndex: 0
      },
      {
        question: "介護保険制度が日本で始まったのは何年？",
        options: ["1995年", "2000年", "2005年", "2010年"],
        correctIndex: 1
      },
      {
        question: "高崎健康福祉大学の本部がある号館は？",
        options: ["1号館", "2号館", "3号館", "5号館"],
        correctIndex: 0
      },
      {
        question: "「福祉」の「福」という字の意味として最も近いものは？",
        options: ["幸せ", "助け合い", "健康", "平和"],
        correctIndex: 0
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
    enemyName: "薬学の魔術師",
    enemyImage: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
    enemyMaxHp: 100,
    playerMaxHp: 100,
    damageToEnemy: 20,
    damageToPlayer: 25,
    questions: [
      {
        question: "薬剤師の職能を象徴する「緑十字」の由来は？",
        options: ["植物由来", "安全の色", "ドイツの薬局", "WHO"],
        correctIndex: 2
      },
      {
        question: "「薬」という漢字の部首は？",
        options: ["くさかんむり", "きへん", "のぎへん", "たけかんむり"],
        correctIndex: 0
      },
      {
        question: "薬を水なしで飲める錠剤の名称は？",
        options: ["チュアブル錠", "口腔内崩壊錠", "舌下錠", "トローチ"],
        correctIndex: 1
      },
      {
        question: "薬局のシンボルマークでよく見られる動物は？",
        options: ["蛇", "鳩", "馬", "犬"],
        correctIndex: 0
      },
      {
        question: "日本薬局方の略称は？",
        options: ["JP", "JHP", "NPJ", "PHJ"],
        correctIndex: 0
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
