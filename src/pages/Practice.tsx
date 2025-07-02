import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Volume2, 
  Mic, 
  ArrowLeft, 
  ArrowRight, 
  BookOpen,
  Zap,
  Target,
  Trophy,
  Grid3X3,
  Star,
  Pen
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import IncorrectAnswerDialog from '../components/IncorrectAnswerDialog';

// Interfaces
interface FlashCard {
  id: string;
  character: string;
  romaji: string;
  meaning: string;
}

interface VocabWord {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  category: string;
  level?: string;
}

interface CharacterData {
  character: string;
  romaji: string;
  learned?: boolean;
}

// Updated Hiragana chart to match the provided image order
const hiraganaCharts: CharacterData[][] = [
  // a-row
  [
    { character: 'あ', romaji: 'a' },
    { character: 'い', romaji: 'i' },
    { character: 'う', romaji: 'u' },
    { character: 'え', romaji: 'e' },
    { character: 'お', romaji: 'o' }
  ],
  // ka-row
  [
    { character: 'か', romaji: 'ka' },
    { character: 'き', romaji: 'ki' },
    { character: 'く', romaji: 'ku' },
    { character: 'け', romaji: 'ke' },
    { character: 'こ', romaji: 'ko' }
  ],
  // sa-row
  [
    { character: 'さ', romaji: 'sa' },
    { character: 'し', romaji: 'shi' },
    { character: 'す', romaji: 'su' },
    { character: 'せ', romaji: 'se' },
    { character: 'そ', romaji: 'so' }
  ],
  // ta-row
  [
    { character: 'た', romaji: 'ta' },
    { character: 'ち', romaji: 'chi' },
    { character: 'つ', romaji: 'tsu' },
    { character: 'て', romaji: 'te' },
    { character: 'と', romaji: 'to' }
  ],
  // na-row
  [
    { character: 'な', romaji: 'na' },
    { character: 'に', romaji: 'ni' },
    { character: 'ぬ', romaji: 'nu' },
    { character: 'ね', romaji: 'ne' },
    { character: 'の', romaji: 'no' }
  ],
  // ha-row
  [
    { character: 'は', romaji: 'ha' },
    { character: 'ひ', romaji: 'hi' },
    { character: 'ふ', romaji: 'fu' },
    { character: 'へ', romaji: 'he' },
    { character: 'ほ', romaji: 'ho' }
  ],
  // ma-row
  [
    { character: 'ま', romaji: 'ma' },
    { character: 'み', romaji: 'mi' },
    { character: 'む', romaji: 'mu' },
    { character: 'め', romaji: 'me' },
    { character: 'も', romaji: 'mo' }
  ],
  // ya-row
  [
    { character: 'や', romaji: 'ya' },
    { character: '', romaji: '' },
    { character: 'ゆ', romaji: 'yu' },
    { character: '', romaji: '' },
    { character: 'よ', romaji: 'yo' }
  ],
  // ra-row
  [
    { character: 'ら', romaji: 'ra' },
    { character: 'り', romaji: 'ri' },
    { character: 'る', romaji: 'ru' },
    { character: 'れ', romaji: 're' },
    { character: 'ろ', romaji: 'ro' }
  ],
  // wa-row
  [
    { character: 'わ', romaji: 'wa' },
    { character: '', romaji: '' },
    { character: '', romaji: '' },
    { character: '', romaji: '' },
    { character: 'を', romaji: 'wo' }
  ],
  // n
  [
    { character: 'ん', romaji: 'n' },
    { character: '', romaji: '' },
    { character: '', romaji: '' },
    { character: '', romaji: '' },
    { character: '', romaji: '' }
  ]
];

const katakanaCharts: CharacterData[][] = [
  // a-row
  [
    { character: 'ア', romaji: 'a' },
    { character: 'イ', romaji: 'i' },
    { character: 'ウ', romaji: 'u' },
    { character: 'エ', romaji: 'e' },
    { character: 'オ', romaji: 'o' }
  ],
  // ka-row
  [
    { character: 'カ', romaji: 'ka' },
    { character: 'キ', romaji: 'ki' },
    { character: 'ク', romaji: 'ku' },
    { character: 'ケ', romaji: 'ke' },
    { character: 'コ', romaji: 'ko' }
  ],
  // sa-row
  [
    { character: 'サ', romaji: 'sa' },
    { character: 'シ', romaji: 'shi' },
    { character: 'ス', romaji: 'su' },
    { character: 'セ', romaji: 'se' },
    { character: 'ソ', romaji: 'so' }
  ],
  // ta-row
  [
    { character: 'タ', romaji: 'ta' },
    { character: 'チ', romaji: 'chi' },
    { character: 'ツ', romaji: 'tsu' },
    { character: 'テ', romaji: 'te' },
    { character: 'ト', romaji: 'to' }
  ],
  // na-row
  [
    { character: 'ナ', romaji: 'na' },
    { character: 'ニ', romaji: 'ni' },
    { character: 'ヌ', romaji: 'nu' },
    { character: 'ネ', romaji: 'ne' },
    { character: 'ノ', romaji: 'no' }
  ],
  // ha-row
  [
    { character: 'ハ', romaji: 'ha' },
    { character: 'ヒ', romaji: 'hi' },
    { character: 'フ', romaji: 'fu' },
    { character: 'ヘ', romaji: 'he' },
    { character: 'ホ', romaji: 'ho' }
  ],
  // ma-row
  [
    { character: 'マ', romaji: 'ma' },
    { character: 'ミ', romaji: 'mi' },
    { character: 'ム', romaji: 'mu' },
    { character: 'メ', romaji: 'me' },
    { character: 'モ', romaji: 'mo' }
  ],
  // ya-row
  [
    { character: 'ヤ', romaji: 'ya' },
    { character: '', romaji: '' },
    { character: 'ユ', romaji: 'yu' },
    { character: '', romaji: '' },
    { character: 'ヨ', romaji: 'yo' }
  ],
  // ra-row
  [
    { character: 'ラ', romaji: 'ra' },
    { character: 'リ', romaji: 'ri' },
    { character: 'ル', romaji: 'ru' },
    { character: 'レ', romaji: 're' },
    { character: 'ロ', romaji: 'ro' }
  ],
  // wa-row
  [
    { character: 'ワ', romaji: 'wa' },
    { character: 'ヰ', romaji: 'wi' },
    { character: '', romaji: '' },
    { character: 'ヱ', romaji: 'we' },
    { character: 'ヲ', romaji: 'wo' }
  ],
  // n
  [
    { character: 'ン', romaji: 'n' },
    { character: '', romaji: '' },
    { character: '', romaji: '' },
    { character: '', romaji: '' },
    { character: '', romaji: '' }
  ]
];

const vocabularyData: { [key: string]: VocabWord[] } = {
  greetings: [
    { id: '1', word: 'こんにちは', reading: 'konnichiwa', meaning: 'Hello', category: 'greetings' },
    { id: '2', word: 'おはよう', reading: 'ohayou', meaning: 'Good morning', category: 'greetings' },
    { id: 'v3', word: 'こんばんは', reading: 'konbanwa', meaning: 'good evening', level: 'n5', category: 'greetings' },
    { id: 'v4', word: 'おやすみ', reading: 'oyasumi', meaning: 'good night', level: 'n5', category: 'greetings' },
    { id: 'v5', word: 'すみません', reading: 'sumimasen', meaning: 'sorry/excuse me', level: 'n5', category: 'greetings' },
    { id: 'v6', word: 'ありがとう', reading: 'arigatou', meaning: 'thank you', level: 'n5', category: 'greetings' },
    { id: 'v7', word: 'おめでとう', reading: 'omedetou', meaning: 'congratulations', level: 'n5', category: 'greetings' },
    { id: 'v8', word: 'おねがいします', reading: 'onegaishimasu', meaning: 'please', level: 'n5', category: 'greetings' },
    { id: 'v9', word: 'よろしく', reading: 'yoroshiku', meaning: 'best regards', level: 'n5', category: 'greetings' },
  ],
  numbers: [
    { id: 'v10', word: 'いち', reading: 'ichi', meaning: 'one', level: 'n5', category: 'numbers' },
    { id: 'v11', word: 'に', reading: 'ni', meaning: 'two', level: 'n5', category: 'numbers' },
    { id: 'v12', word: 'さん', reading: 'san', meaning: 'three', level: 'n5', category: 'numbers' },
    { id: 'v13', word: 'よん', reading: 'yon', meaning: 'four', level: 'n5', category: 'numbers' },
    { id: 'v14', word: 'ご', reading: 'go', meaning: 'five', level: 'n5', category: 'numbers' },
    { id: 'v15', word: 'ろく', reading: 'roku', meaning: 'six', level: 'n5', category: 'numbers' },
    { id: 'v16', word: 'なな', reading: 'nana', meaning: 'seven', level: 'n5', category: 'numbers' },
    { id: 'v17', word: 'はち', reading: 'hachi', meaning: 'eight', level: 'n5', category: 'numbers' },
    { id: 'v18', word: 'きゅう', reading: 'kyuu', meaning: 'nine', level: 'n5', category: 'numbers' },
    { id: 'v19', word: 'じゅう', reading: 'juu', meaning: 'ten', level: 'n5', category: 'numbers' },
    { id: 'v20', word: 'ひゃく', reading: 'hyaku', meaning: 'hundred', level: 'n5', category: 'numbers' },
    { id: 'v21', word: 'せん', reading: 'sen', meaning: 'thousand', level: 'n5', category: 'numbers' },
    { id: 'v22', word: 'まん', reading: 'man', meaning: 'ten thousand', level: 'n5', category: 'numbers' },
    { id: 'v23', word: 'ひとつ', reading: 'hitotsu', meaning: 'one', level: 'n5', category: 'numbers' },
    { id: 'v24', word: 'ふたつ', reading: 'futatsu', meaning: 'two', level: 'n5', category: 'numbers' },
    { id: 'v25', word: 'みっつ', reading: 'mittsu', meaning: 'three', level: 'n5', category: 'numbers' },
    { id: 'v26', word: 'よっつ', reading: 'yottsu', meaning: 'four', level: 'n5', category: 'numbers' },
    { id: 'v27', word: 'いつつ', reading: 'itsutsu', meaning: 'five', level: 'n5', category: 'numbers' },
    { id: 'v28', word: 'むっつ', reading: 'muttsu', meaning: 'six', level: 'n5', category: 'numbers' },
    { id: 'v29', word: 'やっつ', reading: 'yattsu', meaning: 'eight', level: 'n5', category: 'numbers' },
    { id: 'v30', word: 'ひとり', reading: 'hitori', meaning: 'one person', level: 'n5', category: 'numbers' },
    { id: 'v31', word: 'ふたり', reading: 'futari', meaning: 'two people', level: 'n5', category: 'numbers' },
    { id: 'v32', word: 'いちばん', reading: 'ichiban', meaning: 'best/first/number one', level: 'n5', category: 'numbers' },
  ],
  time: [
    { id: 'v40', word: 'いま', reading: 'ima', meaning: 'now', level: 'n5', category: 'time' },
    { id: 'v41', word: 'きょう', reading: 'kyou', meaning: 'today', level: 'n5', category: 'time' },
    { id: 'v42', word: 'あした', reading: 'ashita', meaning: 'tomorrow', level: 'n5', category: 'time' },
    { id: 'v43', word: 'きのう', reading: 'kinou', meaning: 'yesterday', level: 'n5', category: 'time' },
    { id: 'v44', word: 'こんしゅう', reading: 'konshuu', meaning: 'this week', level: 'n5', category: 'time' },
    { id: 'v45', word: 'せんしゅう', reading: 'senshuu', meaning: 'last week', level: 'n5', category: 'time' },
    { id: 'v71', word: 'せんげつ', reading: 'sengetsu', meaning: 'last month', level: 'n5', category: 'time' },
    { id: 'v110', word: 'ごぜん', reading: 'gozen', meaning: 'morning', level: 'n5', category: 'time' },
    { id: 'v111', word: 'ごご', reading: 'gogo', meaning: 'afternoon', level: 'n5', category: 'time' },
    { id: 'v112', word: 'はん', reading: 'han', meaning: 'half', level: 'n5', category: 'time' },
    { id: 'v113', word: 'はんぶん', reading: 'hanbun', meaning: 'half minute', level: 'n5', category: 'time' },
    { id: 'v132', word: 'どよう', reading: 'doyou', meaning: 'Saturday', level: 'n5', category: 'time' },
    { id: 'v133', word: 'どようび', reading: 'doyoubi', meaning: 'Saturday', level: 'n5', category: 'time' },
    { id: 'v144', word: 'ゆうがた', reading: 'yuugata', meaning: 'evening', level: 'n5', category: 'time' },
    { id: 'v145', word: 'よる', reading: 'yoru', meaning: 'night', level: 'n5', category: 'time' },
    { id: 'v165', word: 'とし', reading: 'toshi', meaning: 'year', level: 'n5', category: 'time' },
  ],
  places: [
    { id: 'v34', word: 'うえ', reading: 'ue', meaning: 'on top of', level: 'n5', category: 'places' },
    { id: 'v35', word: 'した', reading: 'shita', meaning: 'below', level: 'n5', category: 'places' },
    { id: 'v36', word: 'なか', reading: 'naka', meaning: 'middle', level: 'n5', category: 'places' },
    { id: 'v46', word: 'しごと', reading: 'shigoto', meaning: 'job', level: 'n5', category: 'places' },
    { id: 'v50', word: 'でぐち', reading: 'deguchi', meaning: 'exit', level: 'n5', category: 'places' },
    { id: 'v79', word: 'こうえん', reading: 'kouen', meaning: 'park', level: 'n5', category: 'places' },
    { id: 'v156', word: 'がっこう', reading: 'gakkou', meaning: 'school', level: 'n5', category: 'places' },
    { id: 'v161', word: 'おくじょう', reading: 'okujou', meaning: 'rooftop', level: 'n5', category: 'places' },
    { id: 'v162', word: 'やま', reading: 'yama', meaning: 'mountain', level: 'n5', category: 'places' },
    { id: 'v163', word: 'かわ', reading: 'kawa', meaning: 'river', level: 'n5', category: 'places' },
    { id: 'v166', word: 'みせ', reading: 'mise', meaning: 'shop', level: 'n5', category: 'places' },
    { id: 'v167', word: 'にわ', reading: 'niwa', meaning: 'garden', level: 'n5', category: 'places' },
    { id: 'v168', word: 'たてもの', reading: 'tatemono', meaning: 'building', level: 'n5', category: 'places' },
    { id: 'v189', word: 'いけ', reading: 'ike', meaning: 'pond', level: 'n5', category: 'places' },
    { id: 'v190', word: 'うみ', reading: 'umi', meaning: 'sea', level: 'n5', category: 'places' },
    { id: 'v204', word: 'まち', reading: 'machi', meaning: 'town', level: 'n5', category: 'places' },
    { id: 'v243', word: 'へや', reading: 'heya', meaning: 'room', level: 'n5', category: 'places' },
    { id: 'v263', word: 'おてあらい', reading: 'otearai', meaning: 'bathroom', level: 'n5', category: 'places' },
    { id: 'v274', word: 'おふろ', reading: 'ofuro', meaning: 'bath', level: 'n5', category: 'places' },
    { id: 'v275', word: 'ここ', reading: 'koko', meaning: 'here', level: 'n5', category: 'places' },
    { id: 'v280', word: 'そこ', reading: 'soko', meaning: 'bottom/sole', level: 'n5', category: 'places' },
  ],
  people: [
    { id: 'v39', word: 'ひと', reading: 'hito', meaning: 'person', level: 'n5', category: 'people' },
    { id: 'v72', word: 'せんせい', reading: 'sensei', meaning: 'teacher/doctor', level: 'n5', category: 'people' },
    { id: 'v151', word: 'おっと', reading: 'otto', meaning: 'husband', level: 'n5', category: 'people' },
    { id: 'v152', word: 'いもうと', reading: 'imouto', meaning: 'younger sister', level: 'n5', category: 'people' },
    { id: 'v153', word: 'あね', reading: 'ane', meaning: 'older sister', level: 'n5', category: 'people' },
    { id: 'v155', word: 'こども', reading: 'kodomo', meaning: 'child', level: 'n5', category: 'people' },
    { id: 'v169', word: 'おとうと', reading: 'otouto', meaning: 'younger brother', level: 'n5', category: 'people' },
    { id: 'v170', word: 'かれ', reading: 'kare', meaning: 'he', level: 'n5', category: 'people' },
    { id: 'v172', word: 'むすこ', reading: 'musuko', meaning: 'son', level: 'n5', category: 'people' },
    { id: 'v187', word: 'はは', reading: 'haha', meaning: 'mother', level: 'n5', category: 'people' },
    { id: 'v193', word: 'ちち', reading: 'chichi', meaning: 'father', level: 'n5', category: 'people' },
    { id: 'v148', word: 'おとな', reading: 'otona', meaning: 'adult', level: 'n5', category: 'people' },
    { id: 'v256', word: 'おにいさん', reading: 'oniisan', meaning: 'older brother', level: 'n5', category: 'people' },
    { id: 'v260', word: 'おねえさん', reading: 'oneesan', meaning: 'older sister', level: 'n5', category: 'people' },
    { id: 'v261', word: 'おまわりさん', reading: 'omawarisan', meaning: 'policeman', level: 'n5', category: 'people' },
    { id: 'v265', word: 'おかあさん', reading: 'okaasan', meaning: 'mother', level: 'n5', category: 'people' },
    { id: 'v266', word: 'おとうさん', reading: 'otousan', meaning: 'father', level: 'n5', category: 'people' },
    { id: 'v268', word: 'おばあさん', reading: 'obaasan', meaning: 'grandmother', level: 'n5', category: 'people' },
    { id: 'v269', word: 'おじいさん', reading: 'ojiisan', meaning: 'grandfather', level: 'n5', category: 'people' },
    { id: 'v203', word: 'おとこ', reading: 'otoko', meaning: 'man', level: 'n5', category: 'people' },
    { id: 'v223', word: 'じぶん', reading: 'jibun', meaning: 'oneself', level: 'n5', category: 'people' },
  ],
  adjectives: [
    { id: 'v37', word: 'まるい', reading: 'marui', meaning: 'round/circular', level: 'n5', category: 'adjectives' },
    { id: 'v84', word: 'つめたい', reading: 'tsumetai', meaning: 'cold to the touch', level: 'n5', category: 'adjectives' },
    { id: 'v87', word: 'すごい', reading: 'sugoi', meaning: 'terrific', level: 'n5', category: 'adjectives' },
    { id: 'v116', word: 'かわいい', reading: 'kawaii', meaning: 'pretty/cute/lovely', level: 'n5', category: 'adjectives' },
    { id: 'v142', word: 'へん', reading: 'hen', meaning: 'strange', level: 'n5', category: 'adjectives' },
    { id: 'v147', word: 'だいじ', reading: 'daiji', meaning: 'important/serious/crucial', level: 'n5', category: 'adjectives' },
    { id: 'v149', word: 'たいへん', reading: 'taihen', meaning: 'very/greatly/serious/difficult', level: 'n5', category: 'adjectives' },
    { id: 'v157', word: 'さむい', reading: 'samui', meaning: 'cold (weather)', level: 'n5', category: 'adjectives' },
    { id: 'v159', word: 'ちいさい', reading: 'chiisai', meaning: 'small', level: 'n5', category: 'adjectives' },
    { id: 'v160', word: 'すくない', reading: 'sukunai', meaning: 'few', level: 'n5', category: 'adjectives' },
    { id: 'v171', word: 'いそがしい', reading: 'isogashii', meaning: 'busy', level: 'n5', category: 'adjectives' },
    { id: 'v177', word: 'あたらしい', reading: 'atarashii', meaning: 'new', level: 'n5', category: 'adjectives' },
    { id: 'v184', word: 'たのしい', reading: 'tanoshii', meaning: 'enjoyable', level: 'n5', category: 'adjectives' },
    { id: 'v199', word: 'あまい', reading: 'amai', meaning: 'sweet', level: 'n5', category: 'adjectives' },
    { id: 'v207', word: 'しろい', reading: 'shiroi', meaning: 'white', level: 'n5', category: 'adjectives' },
    { id: 'v211', word: 'みじかい', reading: 'mijikai', meaning: 'short', level: 'n5', category: 'adjectives' },
    { id: 'v237', word: 'ちかい', reading: 'chikai', meaning: 'near', level: 'n5', category: 'adjectives' },
    { id: 'v240', word: 'おそい', reading: 'osoi', meaning: 'late', level: 'n5', category: 'adjectives' },
    { id: 'v246', word: 'ながい', reading: 'nagai', meaning: 'long', level: 'n5', category: 'adjectives' },
    { id: 'v251', word: 'あおい', reading: 'aoi', meaning: 'blue', level: 'n5', category: 'adjectives' },
    { id: 'v290', word: 'へた', reading: 'heta', meaning: 'unskillful', level: 'n5', category: 'adjectives' },
  ],
  verbs: [
    { id: 'v33', word: 'いっしょ', reading: 'issho', meaning: 'together', level: 'n5', category: 'verbs' },
    { id: 'v47', word: 'はいる', reading: 'hairu', meaning: 'to enter', level: 'n5', category: 'verbs' },
    { id: 'v48', word: 'いれる', reading: 'ireru', meaning: 'to put in', level: 'n5', category: 'verbs' },
    { id: 'v49', word: 'でる', reading: 'deru', meaning: 'to appear/to leave', level: 'n5', category: 'verbs' },
    { id: 'v53', word: 'しんじる', reading: 'shinjiru', meaning: 'to believe', level: 'n5', category: 'verbs' },
    { id: 'v54', word: 'わかる', reading: 'wakaru', meaning: 'to be understood', level: 'n5', category: 'verbs' },
    { id: 'v55', word: 'すむ', reading: 'sumu', meaning: 'to live in', level: 'n5', category: 'verbs' },
    { id: 'v67', word: 'つくる', reading: 'tsukuru', meaning: 'to make', level: 'n5', category: 'verbs' },
    { id: 'v68', word: 'つかう', reading: 'tsukau', meaning: 'to use', level: 'n5', category: 'verbs' },
    { id: 'v69', word: 'かりる', reading: 'kariru', meaning: 'to borrow', level: 'n5', category: 'verbs' },
    { id: 'v74', word: 'ひかる', reading: 'hikaru', meaning: 'to shine/to glitter', level: 'n5', category: 'verbs' },
    { id: 'v85', word: 'ひやす', reading: 'hiyasu', meaning: 'to cool/to refrigerate', level: 'n5', category: 'verbs' },
    { id: 'v89', word: 'すう', reading: 'suu', meaning: 'to smoke/to suck', level: 'n5', category: 'verbs' },
    { id: 'v90', word: 'ふく', reading: 'fuku', meaning: 'to blow', level: 'n5', category: 'verbs' },
    { id: 'v91', word: 'きる', reading: 'kiru', meaning: 'to cut', level: 'n5', category: 'verbs' },
    { id: 'v92', word: 'きれる', reading: 'kireru', meaning: 'to cut well/to be sharp', level: 'n5', category: 'verbs' },
    { id: 'v95', word: 'はじめて', reading: 'hajimete', meaning: 'for the first time', level: 'n5', category: 'verbs' },
    { id: 'v96', word: 'する', reading: 'suru', meaning: 'to print', level: 'n5', category: 'verbs' },
    { id: 'v100', word: 'かつ', reading: 'katsu', meaning: 'to win', level: 'n5', category: 'verbs' },
    { id: 'v101', word: 'くわえる', reading: 'kuwaeru', meaning: 'to append/to add', level: 'n5', category: 'verbs' },
    { id: 'v102', word: 'きく', reading: 'kiku', meaning: 'to be effective', level: 'n5', category: 'verbs' },
    { id: 'v104', word: 'べんきょうする', reading: 'benkyousuru', meaning: 'to study', level: 'n5', category: 'verbs' },
    { id: 'v117', word: 'たべる', reading: 'taberu', meaning: 'to eat', level: 'n5', category: 'verbs' },
    { id: 'v123', word: 'よろこぶ', reading: 'yorokobu', meaning: 'to be delighted', level: 'n5', category: 'verbs' },
    { id: 'v135', word: 'ある', reading: 'aru', meaning: 'to live/to be', level: 'n5', category: 'verbs' },
    { id: 'v140', word: 'うる', reading: 'uru', meaning: 'to sell', level: 'n5', category: 'verbs' },
    { id: 'v141', word: 'うれる', reading: 'ureru', meaning: 'to be sold', level: 'n5', category: 'verbs' },
    { id: 'v154', word: 'はじまる', reading: 'hajimaru', meaning: 'to begin', level: 'n5', category: 'verbs' },
    { id: 'v164', word: 'かえる', reading: 'kaeru', meaning: 'to return home', level: 'n5', category: 'verbs' },
    { id: 'v176', word: 'おしえる', reading: 'oshieru', meaning: 'to teach', level: 'n5', category: 'verbs' },
    { id: 'v183', word: 'くる', reading: 'kuru', meaning: 'to come', level: 'n5', category: 'verbs' },
    { id: 'v186', word: 'あるく', reading: 'aruku', meaning: 'to walk', level: 'n5', category: 'verbs' },
    { id: 'v200', word: 'うまれる', reading: 'umareru', meaning: 'to be born', level: 'n5', category: 'verbs' },
    { id: 'v209', word: 'つく', reading: 'tsuku', meaning: 'to arrive', level: 'n5', category: 'verbs' },
    { id: 'v210', word: 'しる', reading: 'shiru', meaning: 'to know', level: 'n5', category: 'verbs' },
    { id: 'v212', word: 'とぐ', reading: 'togu', meaning: 'to sharpen', level: 'n5', category: 'verbs' },
    { id: 'v217', word: 'たつ', reading: 'tatsu', meaning: 'to stand', level: 'n5', category: 'verbs' },
    { id: 'v222', word: 'きく', reading: 'kiku', meaning: 'to hear', level: 'n5', category: 'verbs' },
    { id: 'v227', word: 'いく', reading: 'iku', meaning: 'to go', level: 'n5', category: 'verbs' },
    { id: 'v228', word: 'みる', reading: 'miru', meaning: 'to see', level: 'n5', category: 'verbs' },
    { id: 'v229', word: 'いう', reading: 'iu', meaning: 'to say', level: 'n5', category: 'verbs' },
    { id: 'v230', word: 'よむ', reading: 'yomu', meaning: 'to read', level: 'n5', category: 'verbs' },
    { id: 'v232', word: 'かう', reading: 'kau', meaning: 'to buy', level: 'n5', category: 'verbs' },
    { id: 'v233', word: 'おきる', reading: 'okiru', meaning: 'to wake up', level: 'n5', category: 'verbs' },
    { id: 'v241', word: 'あそぶ', reading: 'asobu', meaning: 'to play', level: 'n5', category: 'verbs' },
    { id: 'v247', word: 'あける', reading: 'akeru', meaning: 'to open', level: 'n5', category: 'verbs' },
    { id: 'v289', word: 'おりる', reading: 'oriru', meaning: 'to get off', level: 'n5', category: 'verbs' },
    { id: 'v99', word: 'うごく', reading: 'ugoku', meaning: 'to move', level: 'n5', category: 'verbs' },
  ],
  nouns: [
    { id: 'v38', word: 'こと', reading: 'koto', meaning: 'thing/matter/fact', level: 'n5', category: 'nouns' },
    { id: 'v51', word: 'かいわ', reading: 'kaiwa', meaning: 'conversation', level: 'n5', category: 'nouns' },
    { id: 'v52', word: 'かいぎ', reading: 'kaigi', meaning: 'meeting', level: 'n5', category: 'nouns' },
    { id: 'v56', word: 'からだ', reading: 'karada', meaning: 'body', level: 'n5', category: 'nouns' },
    { id: 'v57', word: 'なに', reading: 'nani', meaning: 'what', level: 'n5', category: 'nouns' },
    { id: 'v58', word: 'なん', reading: 'nan', meaning: 'what', level: 'n5', category: 'nouns' },
    { id: 'v59', word: 'どれ', reading: 'dore', meaning: 'which (of three or more)', level: 'n5', category: 'nouns' },
    { id: 'v60', word: 'どこ', reading: 'doko', meaning: 'where', level: 'n5', category: 'nouns' },
    { id: 'v61', word: 'なぜ', reading: 'naze', meaning: 'why/how', level: 'n5', category: 'nouns' },
    { id: 'v62', word: 'どなた', reading: 'donata', meaning: 'who', level: 'n5', category: 'nouns' },
    { id: 'v63', word: 'いつ', reading: 'itsu', meaning: 'when', level: 'n5', category: 'nouns' },
    { id: 'v64', word: 'いつも', reading: 'itsumo', meaning: 'always/usually', level: 'n5', category: 'nouns' },
    { id: 'v65', word: 'あんまり', reading: 'anmari', meaning: 'not very/not much', level: 'n5', category: 'nouns' },
    { id: 'v66', word: 'あまり', reading: 'amari', meaning: 'not very/not much', level: 'n5', category: 'nouns' },
    { id: 'v70', word: 'げんき', reading: 'genki', meaning: 'health/vitality', level: 'n5', category: 'nouns' },
    { id: 'v73', word: 'ひかり', reading: 'hikari', meaning: 'light', level: 'n5', category: 'nouns' },
    { id: 'v75', word: 'うさぎ', reading: 'usagi', meaning: 'rabbit/hare', level: 'n5', category: 'nouns' },
    { id: 'v76', word: 'ぜんぶ', reading: 'zenbu', meaning: 'all', level: 'n5', category: 'nouns' },
    { id: 'v77', word: 'ようか', reading: 'youka', meaning: 'eight days/eighth day', level: 'n5', category: 'nouns' },
    { id: 'v78', word: 'やおや', reading: 'yaoya', meaning: 'greengrocer', level: 'n5', category: 'nouns' },
    { id: 'v80', word: 'むいか', reading: 'muika', meaning: 'six days/sixth day', level: 'n5', category: 'nouns' },
    { id: 'v81', word: 'じょうだん', reading: 'joudan', meaning: 'jest/joke', level: 'n5', category: 'nouns' },
    { id: 'v82', word: 'しゃしん', reading: 'shashin', meaning: 'photograph', level: 'n5', category: 'nouns' },
    { id: 'v83', word: 'ふゆ', reading: 'fuyu', meaning: 'winter', level: 'n5', category: 'nouns' },
    { id: 'v86', word: 'れいぞうこ', reading: 'reizouko', meaning: 'refrigerator', level: 'n5', category: 'nouns' },
    { id: 'v88', word: 'たまご', reading: 'tamago', meaning: 'egg', level: 'n5', category: 'nouns' },
    { id: 'v93', word: 'きっぷ', reading: 'kippu', meaning: 'ticket', level: 'n5', category: 'nouns' },
    { id: 'v94', word: 'もんだい', reading: 'mondai', meaning: 'problem/question', level: 'n5', category: 'nouns' },
    { id: 'v97', word: 'さしみ', reading: 'sashimi', meaning: 'sliced raw fish', level: 'n5', category: 'nouns' },
    { id: 'v98', word: 'まえ', reading: 'mae', meaning: 'before', level: 'n5', category: 'nouns' },
    { id: 'v103', word: 'べんきょう', reading: 'benkyou', meaning: 'study', level: 'n5', category: 'nouns' },
    { id: 'v105', word: 'こきゅう', reading: 'kokyuu', meaning: 'breath/respiration', level: 'n5', category: 'nouns' },
    { id: 'v106', word: 'あじ', reading: 'aji', meaning: 'flavour', level: 'n5', category: 'nouns' },
    { id: 'v107', word: 'みそ', reading: 'miso', meaning: 'bean paste', level: 'n5', category: 'nouns' },
    { id: 'v108', word: 'しなもの', reading: 'shinamono', meaning: 'goods', level: 'n5', category: 'nouns' },
    { id: 'v109', word: 'じゅうぶん', reading: 'juubun', meaning: 'enough', level: 'n5', category: 'nouns' },
    { id: 'v114', word: 'そつぎょう', reading: 'sotsugyou', meaning: 'graduation', level: 'n5', category: 'nouns' },
    { id: 'v115', word: 'こてん', reading: 'koten', meaning: 'old book/classics', level: 'n5', category: 'nouns' },
    { id: 'v118', word: 'たべもの', reading: 'tabemono', meaning: 'food', level: 'n5', category: 'nouns' },
    { id: 'v119', word: 'つば', reading: 'tsuba', meaning: 'saliva', level: 'n5', category: 'nouns' },
    { id: 'v120', word: 'しょうばい', reading: 'shoubai', meaning: 'trade/business', level: 'n5', category: 'nouns' },
    { id: 'v121', word: 'もんどう', reading: 'mondou', meaning: 'questions and answers', level: 'n5', category: 'nouns' },
    { id: 'v122', word: 'のど', reading: 'nodo', meaning: 'throat', level: 'n5', category: 'nouns' },
    { id: 'v124', word: 'けんか', reading: 'kenka', meaning: 'quarrel/brawl', level: 'n5', category: 'nouns' },
    { id: 'v125', word: 'きっさ', reading: 'kissa', meaning: 'tea drinking/tea house', level: 'n5', category: 'nouns' },
    { id: 'v126', word: 'きっさてん', reading: 'kissaten', meaning: 'coffee lounge', level: 'n5', category: 'nouns' },
    { id: 'v127', word: 'えんげい', reading: 'engei', meaning: 'horticulture/gardening', level: 'n5', category: 'nouns' },
    { id: 'v128', word: 'つち', reading: 'tsuchi', meaning: 'earth/soil', level: 'n5', category: 'nouns' },
    { id: 'v129', word: 'どひょう', reading: 'dohyou', meaning: 'arena', level: 'n5', category: 'nouns' },
    { id: 'v130', word: 'とち', reading: 'tochi', meaning: 'plot of land/lot/soil', level: 'n5', category: 'nouns' },
    { id: 'v131', word: 'どて', reading: 'dote', meaning: 'embankment/bank', level: 'n5', category: 'nouns' },
    { id: 'v134', word: 'あつりょく', reading: 'atsuryoku', meaning: 'stress/pressure', level: 'n5', category: 'nouns' },
    { id: 'v136', word: 'ちず', reading: 'chizu', meaning: 'map', level: 'n5', category: 'nouns' },
    { id: 'v137', word: 'じしん', reading: 'jishin', meaning: 'earthquake', level: 'n5', category: 'nouns' },
    { id: 'v138', word: 'さか', reading: 'saka', meaning: 'slope/hill', level: 'n5', category: 'nouns' },
    { id: 'v139', word: 'こえ', reading: 'koe', meaning: 'voice', level: 'n5', category: 'nouns' },
    { id: 'v146', word: 'ゆめ', reading: 'yume', meaning: 'dream', level: 'n5', category: 'nouns' },
    { id: 'v150', word: 'てんき', reading: 'tenki', meaning: 'weather', level: 'n5', category: 'nouns' },
    { id: 'v173', word: 'て', reading: 'te', meaning: 'hand', level: 'n5', category: 'nouns' },
    { id: 'v174', word: 'てがみ', reading: 'tegami', meaning: 'letter', level: 'n5', category: 'nouns' },
    { id: 'v175', word: 'そうじ', reading: 'souji', meaning: 'cleaning', level: 'n5', category: 'nouns' },
    { id: 'v178', word: 'りょこう', reading: 'ryokou', meaning: 'travel', level: 'n5', category: 'nouns' },
    { id: 'v179', word: 'えいが', reading: 'eiga', meaning: 'movie', level: 'n5', category: 'nouns' },
    { id: 'v180', word: 'つき', reading: 'tsuki', meaning: 'moon', level: 'n5', category: 'nouns' },
    { id: 'v181', word: 'ほんとう', reading: 'hontou', meaning: 'truth', level: 'n5', category: 'nouns' },
    { id: 'v182', word: 'つくえ', reading: 'tsukue', meaning: 'desk', level: 'n5', category: 'nouns' },
    { id: 'v185', word: 'うた', reading: 'uta', meaning: 'song', level: 'n5', category: 'nouns' },
    { id: 'v188', word: 'まいにち', reading: 'mainichi', meaning: 'every day', level: 'n5', category: 'nouns' },
    { id: 'v191', word: 'かんじ', reading: 'kanji', meaning: 'kanji', level: 'n5', category: 'nouns' },
    { id: 'v192', word: 'ひ', reading: 'hi', meaning: 'fire', level: 'n5', category: 'nouns' },
    { id: 'v194', word: 'うし', reading: 'ushi', meaning: 'cow', level: 'n5', category: 'nouns' },
    { id: 'v195', word: 'いぬ', reading: 'inu', meaning: 'dog', level: 'n5', category: 'nouns' },
    { id: 'v196', word: 'ねこ', reading: 'neko', meaning: 'cat', level: 'n5', category: 'nouns' },
    { id: 'v197', word: 'げんかん', reading: 'genkan', meaning: 'entrance', level: 'n5', category: 'nouns' },
    { id: 'v198', word: 'おうさま', reading: 'ousama', meaning: 'king', level: 'n5', category: 'nouns' },
    { id: 'v201', word: 'せいねんがっぴ', reading: 'seinengappi', meaning: 'date of birth', level: 'n5', category: 'nouns' },
    { id: 'v202', word: 'いなか', reading: 'inaka', meaning: 'countryside', level: 'n5', category: 'nouns' },
    { id: 'v205', word: 'がようし', reading: 'gayoushi', meaning: 'drawing paper', level: 'n5', category: 'nouns' },
    { id: 'v206', word: 'ばんごう', reading: 'bangou', meaning: 'number', level: 'n5', category: 'nouns' },
    { id: 'v208', word: 'め', reading: 'me', meaning: 'eye', level: 'n5', category: 'nouns' },
    { id: 'v213', word: 'しゃかい', reading: 'shakai', meaning: 'society', level: 'n5', category: 'nouns' },
    { id: 'v214', word: 'わたし', reading: 'watashi', meaning: 'I', level: 'n5', category: 'nouns' },
    { id: 'v215', word: 'あき', reading: 'aki', meaning: 'autumn', level: 'n5', category: 'nouns' },
    { id: 'v216', word: 'そら', reading: 'sora', meaning: 'sky', level: 'n5', category: 'nouns' },
    { id: 'v218', word: 'こたえ', reading: 'kotae', meaning: 'answer', level: 'n5', category: 'nouns' },
    { id: 'v219', word: 'かみ', reading: 'kami', meaning: 'paper', level: 'n5', category: 'nouns' },
    { id: 'v220', word: 'けっこん', reading: 'kekkon', meaning: 'marriage', level: 'n5', category: 'nouns' },
    { id: 'v221', word: 'みみ', reading: 'mimi', meaning: 'ear', level: 'n5', category: 'nouns' },
    { id: 'v224', word: 'いろ', reading: 'iro', meaning: 'color', level: 'n5', category: 'nouns' },
    { id: 'v225', word: 'はな', reading: 'hana', meaning: 'flower', level: 'n5', category: 'nouns' },
    { id: 'v226', word: 'えいご', reading: 'eigo', meaning: 'English language', level: 'n5', category: 'nouns' },
    { id: 'v231', word: 'かいもの', reading: 'kaimono', meaning: 'shopping', level: 'n5', category: 'nouns' },
    { id: 'v234', word: 'あし', reading: 'ashi', meaning: 'foot', level: 'n5', category: 'nouns' },
    { id: 'v235', word: 'くるま', reading: 'kuruma', meaning: 'car', level: 'n5', category: 'nouns' },
    { id: 'v236', word: 'じしょ', reading: 'jisho', meaning: 'dictionary', level: 'n5', category: 'nouns' },
    { id: 'v238', word: 'しゅう', reading: 'shuu', meaning: 'week', level: 'n5', category: 'nouns' },
    { id: 'v239', word: 'みち', reading: 'michi', meaning: 'road', level: 'n5', category: 'nouns' },
    { id: 'v242', word: 'うんてん', reading: 'unten', meaning: 'driving', level: 'n5', category: 'nouns' },
    { id: 'v244', word: 'やさい', reading: 'yasai', meaning: 'vegetable', level: 'n5', category: 'nouns' },
    { id: 'v245', word: 'かね', reading: 'kane', meaning: 'money', level: 'n5', category: 'nouns' },
    { id: 'v248', word: 'あめ', reading: 'ame', meaning: 'rain', level: 'n5', category: 'nouns' },
    { id: 'v249', word: 'でんしゃ', reading: 'densha', meaning: 'train', level: 'n5', category: 'nouns' },
    { id: 'v250', word: 'でんわ', reading: 'denwa', meaning: 'telephone', level: 'n5', category: 'nouns' },
    { id: 'v252', word: 'のみもの', reading: 'nomimono', meaning: 'drink', level: 'n5', category: 'nouns' },
    { id: 'v254', word: 'えき', reading: 'eki', meaning: 'station', level: 'n5', category: 'nouns' },
    { id: 'v255', word: 'おかわり', reading: 'okawari', meaning: 'second helping/another cup', level: 'n5', category: 'nouns' },
    { id: 'v257', word: 'おやつ', reading: 'oyatsu', meaning: 'snack/afternoon tea', level: 'n5', category: 'nouns' },
    { id: 'v258', word: 'おみやげ', reading: 'omiyage', meaning: 'souvenir', level: 'n5', category: 'nouns' },
    { id: 'v259', word: 'おだいじに', reading: 'odaijini', meaning: 'take care of yourself', level: 'n5', category: 'nouns' },
    { id: 'v262', word: 'おべんとう', reading: 'obentou', meaning: 'boxed lunch', level: 'n5', category: 'nouns' },
    { id: 'v264', word: 'おひる', reading: 'ohiru', meaning: 'lunch/noon', level: 'n5', category: 'nouns' },
    { id: 'v267', word: 'おさら', reading: 'osara', meaning: 'plate/dish', level: 'n5', category: 'nouns' },
    { id: 'v270', word: 'おちゃ', reading: 'ocha', meaning: 'green tea', level: 'n5', category: 'nouns' },
    { id: 'v271', word: 'おかし', reading: 'okashi', meaning: 'sweets/candy', level: 'n5', category: 'nouns' },
    { id: 'v272', word: 'おさけ', reading: 'osake', meaning: 'alcohol/rice wine', level: 'n5', category: 'nouns' },
    { id: 'v273', word: 'おかね', reading: 'okane', meaning: 'money', level: 'n5', category: 'nouns' },
    { id: 'v276', word: 'この', reading: 'kono', meaning: 'this', level: 'n5', category: 'nouns' },
    { id: 'v277', word: 'ございます', reading: 'gozaimasu', meaning: 'to be (polite)', level: 'n5', category: 'nouns' },
    { id: 'v278', word: 'ごちそうさま', reading: 'gochisousama', meaning: 'feast', level: 'n5', category: 'nouns' },
    { id: 'v279', word: 'そう', reading: 'sou', meaning: 'so', level: 'n5', category: 'nouns' },
    { id: 'v281', word: 'その', reading: 'sono', meaning: 'the/that', level: 'n5', category: 'nouns' },
    { id: 'v282', word: 'それ', reading: 'sore', meaning: 'it/that', level: 'n5', category: 'nouns' },
    { id: 'v283', word: 'どう', reading: 'dou', meaning: 'how', level: 'n5', category: 'nouns' },
    { id: 'v284', word: 'どうぞよろしく', reading: 'douzoyoroshiku', meaning: 'pleased to meet you', level: 'n5', category: 'nouns' },
    { id: 'v285', word: 'とりにく', reading: 'toriniku', meaning: 'chicken meat', level: 'n5', category: 'nouns' },
    { id: 'v286', word: 'はい', reading: 'hai', meaning: 'yes', level: 'n5', category: 'nouns' },
    { id: 'v287', word: 'ふべん', reading: 'fuben', meaning: 'inconvenience', level: 'n5', category: 'nouns' },
    { id: 'v288', word: 'おか', reading: 'oka', meaning: 'hill/height', level: 'n5', category: 'nouns' },
    { id: 'v291', word: 'にゅういん', reading: 'nyuuin', meaning: 'hospitalization', level: 'n5', category: 'nouns' },
    { id: 'v292', word: 'きざし', reading: 'kizashi', meaning: 'signs/omen/symptoms', level: 'n5', category: 'nouns' },
    { id: 'v293', word: 'めんきょ', reading: 'menkyo', meaning: 'license/permit', level: 'n5', category: 'nouns' },
    { id: 'v294', word: 'とにかく', reading: 'tonikaku', meaning: 'anyhow/at any rate/anyway', level: 'n5', category: 'nouns' },
  ],
  n4: [
    { id: 'v6', word: 'きれい', reading: 'kirei', meaning: 'beautiful', level: 'n4', category: 'adjectives' },
    { id: 'v7', word: 'たいせつ', reading: 'taisetsu', meaning: 'important', level: 'n4', category: 'adjectives' },
    { id: 'v8', word: 'べんり', reading: 'benri', meaning: 'convenient', level: 'n4', category: 'adjectives' },
    { id: 'v9', word: 'しずか', reading: 'shizuka', meaning: 'quiet', level: 'n4', category: 'adjectives' },
    { id: 'v10', word: 'げんき', reading: 'genki', meaning: 'healthy', level: 'n4', category: 'adjectives' },
  ],
};

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Sample stroke order data for 'あ' (Hiragana) - placeholder for demonstration
const strokeOrderData: { [key: string]: { paths: string[], strokeCount: number } } = {
  'あ': {
    paths: [
      'M 20 30 C 30 10, 50 10, 60 30 S 50 50, 40 50', // Stroke 1
      'M 30 60 C 40 40, 60 40, 70 60 S 60 80, 50 80', // Stroke 2
      'M 70 20 L 70 80' // Stroke 3
    ],
    strokeCount: 3
  }
  // Add more characters' stroke order data here
};

export default function Practice() {
  const { state } = useApp();
  const [mode, setMode] = useState<'flashcards' | 'vocabulary' | 'charts' | null>(null);
  const [flashcardType, setFlashcardType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [vocabularyCategory, setVocabularyCategory] = useState('greetings');
  const [chartType, setChartType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAutoplay] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [userSpeech, setUserSpeech] = useState('');
  const [showIncorrectDialog, setShowIncorrectDialog] = useState(false);
  const [incorrectAnswerData, setIncorrectAnswerData] = useState({
    userAnswer: '',
    correctAnswer: '',
    word: ''
  });
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterData | null>(null);
  const [quizOptions, setQuizOptions] = useState<FlashCard[]>([]);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[。、！？\s]/g, '')
      .replace(/っ/g, 'tsu')
      .replace(/ー/g, '')
      .replace(/[ァ-ヶ]/g, (match) => {
        const code = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(code);
      });
  };

  const checkPronunciation = (userInput: string, correctReading: string, word: string): boolean => {
    const normalizeJapanese = (text: string) =>
      text.replace(/[。、！？\s]/g, '').replace(/ー/g, '').trim();
    const normalizedUserJapanese = normalizeJapanese(userInput);
    const normalizedCorrectJapanese = normalizeJapanese(word);
    const normalizedUserRomaji = normalizeText(userInput);
    const normalizedCorrectRomaji = normalizeText(correctReading);
    const isCorrectJapanese =
      normalizedUserJapanese === normalizedCorrectJapanese ||
      normalizedUserJapanese.includes(normalizedCorrectJapanese) ||
      normalizedCorrectJapanese.includes(normalizedUserJapanese);
    const isCorrectRomaji =
      normalizedUserRomaji === normalizedCorrectRomaji ||
      normalizedUserRomaji.includes(normalizedCorrectRomaji) ||
      normalizedCorrectRomaji.includes(normalizedUserRomaji);
    const isCorrect = isCorrectJapanese || isCorrectRomaji;
    if (!isCorrect) {
      setIncorrectAnswerData({ userAnswer: userInput, correctAnswer: correctReading, word });
      setShowIncorrectDialog(true);
    }
    return isCorrect;
  };

  useEffect(() => {
    const loadFlashcards = () => {
      try {
        const data = flashcardType === 'hiragana' 
          ? hiraganaCharts.flat().filter(c => c.character)
          : katakanaCharts.flat().filter(c => c.character);
        const formattedData = data.map((item, index) => ({
          id: `fc-${index}`,
          character: item.character,
          romaji: item.romaji,
          meaning: item.romaji
        }));
        setFlashcards(mode === 'flashcards' ? shuffleArray(formattedData) : formattedData);
        setCurrentCardIndex(0);
      } catch (error) {
        console.error('Failed to load flashcards:', error);
      }
    };
    if (mode === 'flashcards') loadFlashcards();
  }, [flashcardType, mode]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'ja-JP';
        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserSpeech(transcript);
          setIsListening(false);
          if (mode === 'vocabulary') {
            const vocabularyWords = vocabularyData[vocabularyCategory] || [];
            const currentWord = vocabularyWords[currentCardIndex] || vocabularyWords[0];
            if (currentWord) {
              const isCorrect = checkPronunciation(transcript, currentWord.reading, currentWord.word);
              if (isCorrect) {
                setTimeout(() => {
                  setCurrentCardIndex((prev) => (prev < vocabularyWords.length - 1 ? prev + 1 : 0));
                }, 800);
              }
            }
          }
        };
        recognitionInstance.onerror = () => setIsListening(false);
        recognitionInstance.onend = () => setIsListening(false);
        setRecognition(recognitionInstance);
      }
    }
  }, [mode, vocabularyCategory, currentCardIndex]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoplay && mode === 'flashcards') {
      interval = setInterval(() => {
        setCurrentCardIndex(prev => (prev < flashcards.length - 1 ? prev + 1 : 0));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay, currentCardIndex, mode]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      setUserSpeech('');
      recognition.start();
    }
  };

  const closeIncorrectDialog = () => {
    setShowIncorrectDialog(false);
    setUserSpeech('');
  };

  const getQuizOptions = (cards: FlashCard[], correctIndex: number): FlashCard[] => {
    const correct = cards[correctIndex];
    const others = cards.filter((_, idx) => idx !== correctIndex);
    const distractors = [];
    while (distractors.length < 3 && others.length > 0) {
      const idx = Math.floor(Math.random() * others.length);
      distractors.push(others[idx]);
      others.splice(idx, 1);
    }
    const options = [correct, ...distractors];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  };

  useEffect(() => {
    if (mode === 'flashcards' && flashcards.length > 0) {
      setQuizOptions(getQuizOptions(flashcards, currentCardIndex));
      setQuizAnswered(false);
      setQuizCorrect(null);
    }
  }, [mode, flashcards, currentCardIndex]);

  const handleQuizOptionClick = (option: FlashCard) => {
    if (quizAnswered) return;
    const isCorrect = option.id === flashcards[currentCardIndex].id;
    setQuizAnswered(true);
    setQuizCorrect(isCorrect);
    if (!isCorrect) {
      setIncorrectAnswerData({
        userAnswer: option.character,
        correctAnswer: flashcards[currentCardIndex].character,
        word: flashcards[currentCardIndex].romaji
      });
      setShowIncorrectDialog(true);
    } else {
      setTimeout(() => {
        setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
      }, 800);
    }
  };

  // Japanese Themed Background with CSS Animations
  const JapaneseBackground = () => (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="sakura-petal left-[10%] top-[-10%]"></div>
      <div className="sakura-petal left-[30%] top-[-20%] animation-delay-2s"></div>
      <div className="sakura-petal left-[50%] top-[-15%] animation-delay-4s"></div>
      <div className="sakura-petal left-[70%] top-[-25%] animation-delay-6s"></div>
      <div className="sakura-petal left-[90%] top-[-10%] animation-delay-8s"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-t from-red-500/50 to-transparent rounded-t-full animate-pulse"></div>
    </div>
  );

  // Main Menu
  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-300 to-cyan-400 dark:from-pink-900 dark:via-yellow-900 dark:to-cyan-900 relative overflow-hidden">
        <style>
          {`
            @keyframes sakura-fall {
              0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
            }
            .sakura-petal {
              position: absolute;
              width: 12px;
              height: 12px;
              background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
              clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
              animation: sakura-fall 8s linear infinite;
            }
            .animation-delay-2s { animation-delay: 2s; }
            .animation-delay-4s { animation-delay: 4s; }
            .animation-delay-6s { animation-delay: 6s; }
            .animation-delay-8s { animation-delay: 8s; }
            @keyframes wave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-wave { animation: wave 2s ease-in-out infinite; }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
            .animate-shake { animation: shake 0.3s ease-in-out 3; }
          `}
        </style>
        <JapaneseBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6 relative"
              >
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-pink-400 rounded-full flex items-center justify-center shadow-2xl animate-wave">
                  <span className="text-6xl">🏯</span>
                </div>
              </motion.div>
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-6xl font-extrabold bg-gradient-to-r from-red-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent mb-4 drop-shadow-2xl animate-pulse"
              >
                Nihongo Quest!
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-2xl text-gray-800 dark:text-gray-100 max-w-3xl mx-auto leading-relaxed font-semibold"
              >
                Embark on a colorful journey to master Japanese Hiragana, Katakana, and vocabulary with playful quizzes and animations!
              </motion.p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 4, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('flashcards')}
                className="group bg-gradient-to-br from-pink-500 to-red-500 dark:from-pink-800 dark:to-red-800 rounded-3xl shadow-2xl border-4 border-yellow-400 dark:border-yellow-700 cursor-pointer p-8 relative overflow-hidden"
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-400/30 rounded-full animate-pulse"></div>
                <BookOpen className="w-14 h-14 text-yellow-300 group-hover:scale-125 transition-transform duration-300" />
                <h2 className="text-3xl font-extrabold text-white mb-3">Flashcard Quest</h2>
                <p className="text-gray-100 mb-4 text-lg">Race through kana with vibrant quizzes!</p>
                <div className="flex items-center space-x-2 text-sm">
                  <Star className="w-5 h-5 text-yellow-300 animate-spin-slow" />
                  <span className="font-semibold text-white">Collect Stars!</span>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: -4, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('charts')}
                className="group bg-gradient-to-br from-cyan-500 to-blue-500 dark:from-cyan-800 dark:to-blue-800 rounded-3xl shadow-2xl border-4 border-pink-400 dark:border-pink-700 cursor-pointer p-8 relative overflow-hidden"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-pink-400/30 rounded-full animate-pulse"></div>
                <Grid3X3 className="w-14 h-14 text-pink-300 group-hover:scale-125 transition-transform duration-300" />
                <h2 className="text-3xl font-extrabold text-white mb-3">Kana Garden</h2>
                <p className="text-gray-100 mb-4 text-lg">Explore colorful kana charts with sound!</p>
                <div className="flex items-center space-x-2 text-sm">
                  <Volume2 className="w-5 h-5 text-yellow-300 animate-pulse" />
                  <span className="font-semibold text-white">Hear & Learn</span>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 4, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('vocabulary')}
                className="group bg-gradient-to-br from-yellow-500 to-orange-500 dark:from-yellow-800 dark:to-orange-800 rounded-3xl shadow-2xl border-4 border-cyan-400 dark:border-cyan-700 cursor-pointer p-8 relative overflow-hidden"
              >
                <div className="absolute -bottom-10 right-0 w-32 h-32 bg-cyan-400/30 rounded-full animate-pulse"></div>
                <Brain className="w-14 h-14 text-cyan-300 group-hover:scale-125 transition-transform duration-300" />
                <h2 className="text-3xl font-extrabold text-white mb-3">Vocab Temple</h2>
                <p className="text-gray-100 mb-4 text-lg">Master words with fun speech challenges!</p>
                <div className="flex items-center space-x-2 text-sm">
                  <Mic className="w-5 h-5 text-pink-300 animate-pulse" />
                  <span className="font-semibold text-white">Speak & Shine</span>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-gradient-to-r from-pink-300/90 to-cyan-300/90 dark:from-pink-800/90 dark:to-cyan-800/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border-4 border-yellow-400 dark:border-yellow-700"
            >
              <h3 className="text-3xl font-extrabold text-white mb-8 text-center bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent">
                Your Ninja Journey
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
                  >
                    <Target className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="text-4xl font-extrabold text-white mb-2">
                    {state.practiceProgress.flashcards.hiragana.completed + state.practiceProgress.flashcards.katakana.completed}
                  </div>
                  <div className="text-base text-gray-100 font-semibold">Kana Mastered</div>
                </div>
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
                  >
                    <Zap className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="text-4xl font-extrabold text-white mb-2">
                    {Math.max(state.practiceProgress.flashcards.hiragana.streak, state.practiceProgress.flashcards.katakana.streak)}
                  </div>
                  <div className="text-base text-gray-100 font-semibold">Epic Streak</div>
                </div>
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
                  >
                    <Brain className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="text-4xl font-extrabold text-white mb-2">
                    {Object.values(state.practiceProgress.vocabulary).reduce((sum, level) => sum + (level.wordsLearned || 0), 0)}
                  </div>
                  <div className="text-base text-gray-100 font-semibold">Words Conquered</div>
                </div>
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
                  >
                    <Trophy className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="text-4xl font-extrabold text-white mb-2">
                    {Math.max(...Object.values(state.practiceProgress.vocabulary).map(level => level.accuracy || 0), 0)}%
                  </div>
                  <div className="text-base text-gray-100 font-semibold">Top Accuracy</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Flashcards Mode
  if (mode === 'flashcards' && flashcards.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-300 to-cyan-400 dark:from-pink-900 dark:via-yellow-900 dark:to-cyan-900 relative overflow-hidden">
        <style>
          {`
            @keyframes sakura-fall {
              0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
            }
            .sakura-petal {
              position: absolute;
              width: 12px;
              height: 12px;
              background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
              clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
              animation: sakura-fall 8s linear infinite;
            }
            .animation-delay-2s { animation-delay: 2s; }
            .animation-delay-4s { animation-delay: 4s; }
            .animation-delay-6s { animation-delay: 6s; }
            .animation-delay-8s { animation-delay: 8s; }
            @keyframes wave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-wave { animation: wave 2s ease-in-out infinite; }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
            .animate-shake { animation: shake 0.3s ease-in-out 3; }
          `}
        </style>
        <JapaneseBackground />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-between mb-8">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(null)}
                className="flex items-center space-x-3 text-white bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 px-6 py-3 rounded-full font-bold shadow-2xl"
              >
                <ArrowLeft size={24} />
                <span>Back</span>
              </motion.button>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600">Flashcard Frenzy</h1>
              <select
                value={flashcardType}
                onChange={e => setFlashcardType(e.target.value as 'hiragana' | 'katakana')}
                className="rounded-full border-4 border-yellow-400 px-6 py-3 bg-gradient-to-r from-white/90 to-yellow-200/90 dark:bg-gradient-to-r dark:from-gray-800/90 dark:to-yellow-800/90 text-pink-600 font-bold shadow-lg hover:bg-yellow-300/90 transition-all duration-300"
              >
                <option value="hiragana">Hiragana</option>
                <option value="katakana">Katakana</option>
              </select>
            </div>
            <div className="mb-8">
              <div className="w-full bg-white/30 rounded-full h-4 shadow-inner">
                <motion.div
                  className="h-4 bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </div>
              <div className="text-right text-sm text-white font-bold mt-2">
                {currentCardIndex + 1} / {flashcards.length}
              </div>
            </div>
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl border-4 border-pink-400 dark:border-pink-700 p-8 mb-6 text-center relative overflow-hidden max-w-md mx-auto"
            >
              <div className="sakura-petal absolute -top-6 right-6"></div>
              <div className="text-lg font-bold text-pink-600 mb-4">Find the character for:</div>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-5xl font-extrabold text-cyan-600 mb-6 animate-wave"
              >
                {flashcards[currentCardIndex].romaji}
              </motion.div>
              <div className="grid grid-cols-2 gap-4">
                {quizOptions.map(option => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: quizAnswered ? 1 : 1.1, rotate: quizAnswered ? 0 : 3, boxShadow: quizAnswered ? "" : "0 10px 20px rgba(0,0,0,0.2)" }}
                    whileTap={{ scale: quizAnswered ? 1 : 0.95 }}
                    onClick={() => handleQuizOptionClick(option)}
                    disabled={quizAnswered}
                    className={`
                      p-6 rounded-2xl shadow-lg border-2 text-4xl font-extrabold transition-all duration-300
                      ${quizAnswered
                        ? option.id === flashcards[currentCardIndex].id
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-300 text-white'
                          : 'bg-gradient-to-r from-red-400 to-rose-500 border-red-300 text-white animate-shake'
                        : 'bg-gradient-to-r from-pink-300 to-yellow-300 border-pink-200 text-pink-700 hover:bg-gradient-to-r hover:from-pink-400 hover:to-yellow-400'
                      }
                    `}
                  >
                    {option.character}
                  </motion.button>
                ))}
              </div>
              {quizAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-6 text-center"
                >
                  {quizCorrect ? (
                    <div className="text-xl font-extrabold text-green-500 mb-2 animate-bounce">Awesome! 🎉</div>
                  ) : (
                    <>
                      <div className="text-xl font-extrabold text-red-500 mb-2 animate-shake">
                        Oops! Correct answer: <span className="font-mono">{flashcards[currentCardIndex].character}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0))}
                        className="mt-4 px-8 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-full font-bold shadow-lg"
                      >
                        Next
                      </motion.button>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
            <IncorrectAnswerDialog
              isOpen={showIncorrectDialog}
              onClose={closeIncorrectDialog}
              userAnswer={incorrectAnswerData.userAnswer}
              correctAnswer={incorrectAnswerData.correctAnswer}
              word={incorrectAnswerData.word}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // Charts Mode
  if (mode === 'charts') {
    const currentCharts = chartType === 'hiragana' ? hiraganaCharts : katakanaCharts;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-white dark:from-blue-900 dark:via-green-900 dark:to-gray-800 relative overflow-hidden">
        <style>
          {`
            @keyframes sakura-fall {
              0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.8; }
              100% { transform: translateY(100vh) rotate(360deg); opacity: 0.1; }
            }
            .sakura-petal {
              position: absolute;
              width: 10px;
              height: 10px;
              background: radial-gradient(circle, #f8c1cc 40%, #f78ca0 70%, transparent);
              clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
              animation: sakura-fall 10s linear infinite;
            }
            .animation-delay-2s { animation-delay: 2s; }
            .animation-delay-4s { animation-delay: 4s; }
            .animation-delay-6s { animation-delay: 6s; }
            .animation-delay-8s { animation-delay: 8s; }
            @keyframes wave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }
            .animate-wave { animation: wave 1.5s ease-in-out infinite; }
            @keyframes draw {
              to { stroke-dashoffset: 0; }
            }
            .stroke-path {
              stroke: #1e3a8a;
              stroke-width: 2;
              fill: none;
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
              animation: draw 2s linear forwards;
            }
            @keyframes fade-in {
              0% { opacity: 0; transform: scale(0.95); }
              100% { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            .character-card {
              transition: all 0.3s ease;
              font-family: 'Noto Sans JP', sans-serif;
            }
            .character-card:hover {
              transform: scale(1.15) rotate(2deg);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            }
          `}
        </style>
        <JapaneseBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode(null)}
                  className="flex items-center space-x-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3 rounded-full font-bold shadow-lg"
                >
                  <ArrowLeft size={24} />
                  <span>Back</span>
                </motion.button>
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Garden
                </h1>
              </div>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'hiragana' | 'katakana')}
                className="px-6 py-3 bg-white/90 dark:bg-gray-800/90 rounded-full border-2 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-300 font-bold shadow-md hover:bg-blue-100/90 dark:hover:bg-blue-900/90 transition-all duration-300"
              >
                <option value="hiragana">Hiragana</option>
                <option value="katakana">Katakana</option>
              </select>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border-2 border-blue-200 dark:border-blue-700">
              <div
                className="grid gap-1" // Reduced gap from 2 to 1
                style={{
                  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                  gridAutoRows: "minmax(80px, auto)", // Increased height from 60px to 80px
                  justifyItems: "center",
                  alignItems: "center",
                }}
              >
                {currentCharts.flat().map((char, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.02 }}
                    onClick={() => {
                      if (char.character) {
                        setSelectedCharacter(char);
                        setShowStrokeOrder(false);
                        speakText(char.character);
                      }
                    }}
                    className={`
                      character-card
                      aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer
                      ${char.character 
                        ? 'bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/50 dark:to-green-900/50 hover:bg-gradient-to-br hover:from-blue-100 hover:to-green-100 dark:hover:from-blue-800/50 dark:hover:to-green-800/50 border border-blue-200 dark:border-blue-600 shadow-sm' 
                        : 'bg-transparent'
                      }
                      p-4 min-w-[80px] min-h-[80px]" // Increased padding and min dimensions from 50px to 80px
                    `}
                    style={{ fontSize: "2.5rem" }} // Increased font size from 2rem to 2.5rem
                  >
                    {char.character && (
                      <>
                        <div className="font-bold text-blue-800 dark:text-blue-200">{char.character}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{char.romaji}</div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            <AnimatePresence>
              {selectedCharacter && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.6 }}
                  className="mt-10 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-8 border-2 border-blue-200 dark:border-blue-600"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-9xl font-bold text-blue-700 dark:text-blue-300 mb-6 animate-wave"
                    >
                      {selectedCharacter.character}
                    </motion.div>
                    <div className="text-3xl text-gray-600 dark:text-gray-300 mb-6 font-medium">{selectedCharacter.romaji}</div>
                    <div className="flex justify-center space-x-6 mb-6">
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => speakText(selectedCharacter.character)}
                        className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full font-bold shadow-md"
                      >
                        <Volume2 size={20} />
                        <span>Pronounce</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowStrokeOrder(!showStrokeOrder)}
                        className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-full font-bold shadow-md"
                      >
                        <Pen size={20} />
                        <span>{showStrokeOrder ? 'Hide Stroke Order' : 'Show Stroke Order'}</span>
                      </motion.button>
                    </div>
                    {showStrokeOrder && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/95 dark:bg-gray-900/95 rounded-xl p-6 border border-blue-200 dark:border-blue-600"
                      >
                        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-4">
                          Stroke Order for {selectedCharacter.character}
                        </h3>
                        <svg width="200" height="200" viewBox="0 0 100 100" className="mx-auto">
                          {strokeOrderData[selectedCharacter.character] ? (
                            strokeOrderData[selectedCharacter.character].paths.map((path, index) => (
                              <path
                                key={index}
                                d={path}
                                className="stroke-path"
                                style={{ animationDelay: `${index * 0.5}s` }}
                              />
                            ))
                          ) : (
                            <text x="50%" y="50%" textAnchor="middle" className="text-gray-500 text-sm">
                              Stroke order data not available
                            </text>
                          )}
                        </svg>
                        {strokeOrderData[selectedCharacter.character] && (
                          <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
                            Stroke Count: {strokeOrderData[selectedCharacter.character].strokeCount}
                          </p>
                        )}
                        <div className="mt-6">
                          <h4 className="text-lg font-bold text-blue-600 dark:text-blue-300 mb-2">How to write</h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            {strokeOrderData[selectedCharacter.character]
                              ? 'Follow the animated strokes above to learn how to write this character. Start at the beginning of each stroke and follow the direction.'
                              : 'Stroke order data is not available for this character yet. Try searching online or in a textbook for writing guidance!'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  // Vocabulary Mode
  if (mode === 'vocabulary') {
    const vocabularyWords = vocabularyData[vocabularyCategory] || [];
    const currentWord = vocabularyWords[currentCardIndex] || vocabularyWords[0];
    
    if (!currentWord) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 dark:from-purple-900 dark:via-pink-900 dark:to-red-900 flex items-center justify-center relative overflow-hidden">
          <style>
            {`
              @keyframes sakura-fall {
                0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
              }
              .sakura-petal {
                position: absolute;
                width: 12px;
                height: 12px;
                background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
                clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
                animation: sakura-fall 8s linear infinite;
            }
            .animation-delay-2s { animation-delay: 2s; }
            .animation-delay-4s { animation-delay: 4s; }
            .animation-delay-6s { animation-delay: 6s; }
            .animation-delay-8s { animation-delay: 8s; }
            @keyframes wave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-wave { animation: wave 2s ease-in-out infinite; }
          `}
          </style>
          <JapaneseBackground />
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white mb-6 bg-clip-text bg-gradient-to-r from-purple-600 to-red-600">
              No vocabulary available for this category
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(null)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white rounded-full font-bold shadow-2xl"
            >
              Back to Practice Zone
            </motion.button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 dark:from-purple-900 dark:via-pink-900 dark:to-red-900 relative overflow-hidden">
        <style>
          {`
            @keyframes sakura-fall {
              0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
            }
            .sakura-petal {
              position: absolute;
              width: 12px;
              height: 12px;
              background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
              clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
              animation: sakura-fall 8s linear infinite;
            }
            .animation-delay-2s { animation-delay: 2s; }
            .animation-delay-4s { animation-delay: 4s; }
            .animation-delay-6s { animation-delay: 6s; }
            .animation-delay-8s { animation-delay: 8s; }
            @keyframes wave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-wave { animation: wave 2s ease-in-out infinite; }
          `}
        </style>
        <JapaneseBackground />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode(null)}
                  className="flex items-center space-x-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-full font-bold shadow-2xl"
                >
                  <ArrowLeft size={24} />
                  <span>Back</span>
                </motion.button>
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-red-600">
                  Vocabulary Temple
                </h1>
              </div>
              <select
                value={vocabularyCategory}
                onChange={(e) => {
                  setVocabularyCategory(e.target.value);
                  setCurrentCardIndex(0);
                }}
                className="px-6 py-3 bg-gradient-to-r from-white/90 to-purple-200/90 dark:bg-gradient-to-r dark:from-gray-800/90 dark:to-purple-800/90 rounded-full border-4 border-red-400 text-purple-600 font-bold shadow-lg hover:bg-purple-300/90 transition-all duration-300 capitalize"
              >
                {Object.keys(vocabularyData).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-white/90 to-purple-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-purple-800/90 rounded-3xl shadow-2xl p-12 mb-8 border-4 border-red-400 dark:border-red-700"
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-8xl font-extrabold text-purple-600 dark:text-white mb-6 animate-wave"
                >
                  {currentWord.word}
                </motion.div>
                <div className="text-4xl text-red-500 dark:text-red-400 mb-4 font-semibold">{currentWord.reading}</div>
                <div className="text-3xl text-gray-700 dark:text-gray-100">{currentWord.meaning}</div>
                <div className="mt-4 inline-block px-4 py-2 bg-red-300/50 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-full text-base font-semibold capitalize">
                  {currentWord.category}
                </div>
              </div>
              <div className="flex justify-center space-x-6 mb-8">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speakText(currentWord.word)}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white rounded-full font-bold shadow-2xl"
                >
                  <Volume2 size={24} />
                  <span>Listen</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startListening}
                  disabled={isListening || !recognition}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-full font-bold shadow-2xl transition-all duration-300 ${
                    isListening
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                      : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-100 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500'
                  }`}
                >
                  <Mic size={24} />
                  <span>{isListening ? 'Listening...' : 'Practice'}</span>
                </motion.button>
              </div>
              {userSpeech && !showIncorrectDialog && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-blue-300 to-cyan-300 dark:from-blue-800/50 dark:to-cyan-800/50 rounded-2xl p-6 mb-6 border-2 border-blue-400 dark:border-blue-700"
                >
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    Your pronunciation:
                  </h4>
                  <p className="text-blue-700 dark:text-blue-200 text-lg">{userSpeech}</p>
                </motion.div>
              )}
              {!recognition && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-yellow-300 to-orange-300 dark:from-yellow-800/50 dark:to-orange-800/50 rounded-2xl p-6 mb-6 border-2 border-orange-400 dark:border-orange-700"
                >
                  <p className="text-orange-700 dark:text-orange-200">
                    Speech recognition is not supported in your browser. You can still practice by listening to the pronunciation.
                  </p>
                </motion.div>
              )}
            </motion.div>
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
                disabled={currentCardIndex === 0}
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-white/90 to-purple-200/90 dark:bg-gradient-to-r dark:from-gray-800/90 dark:to-purple-800/90 hover:bg-purple-300/90 text-purple-600 rounded-full font-bold shadow-2xl border-4 border-red-400 dark:border-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={24} />
                <span>Previous</span>
              </motion.button>
              <div className="text-center">
                <span className="text-white font-extrabold text-lg">
                  {currentCardIndex + 1} of {vocabularyWords.length}
                </span>
                <div className="text-sm text-gray-100 font-semibold capitalize">
                  {vocabularyCategory} category
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentCardIndex(Math.min(vocabularyWords.length - 1, currentCardIndex + 1))}
                disabled={currentCardIndex === vocabularyWords.length - 1}
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-white/90 to-purple-200/90 dark:bg-gradient-to-r dark:from-gray-800/90 dark:to-purple-800/90 hover:bg-purple-300/90 text-purple-600 rounded-full font-bold shadow-2xl border-4 border-red-400 dark:border-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight size={24} />
              </motion.button>
            </div>
            <IncorrectAnswerDialog
              isOpen={showIncorrectDialog}
              onClose={closeIncorrectDialog}
              userAnswer={incorrectAnswerData.userAnswer}
              correctAnswer={incorrectAnswerData.correctAnswer}
              word={incorrectAnswerData.word}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}