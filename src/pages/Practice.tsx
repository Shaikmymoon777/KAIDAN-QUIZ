import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Volume2, 
  Mic, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw,
  Play,
  Pause,
  BookOpen,
  Zap,
  Target,
  Trophy
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

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
  level: string;
}

const vocabularyData: { [key: string]: VocabWord[] } = {
  n5: [
    { id: 'v1', word: 'こんにちは', reading: 'konnichiwa', meaning: 'hello', level: 'n5' },
{ id: 'v2', word: 'おはよう', reading: 'ohayou', meaning: 'good morning', level: 'n5' },
{ id: 'v3', word: 'こんばんは', reading: 'konbanwa', meaning: 'good evening', level: 'n5' },
{ id: 'v4', word: 'おやすみ', reading: 'oyasumi', meaning: 'good night', level: 'n5' },
{ id: 'v5', word: 'すみません', reading: 'sumimasen', meaning: 'sorry/excuse me', level: 'n5' },
{ id: 'v6', word: 'ありがとう', reading: 'arigatou', meaning: 'thank you', level: 'n5' },
{ id: 'v7', word: 'おめでとう', reading: 'omedetou', meaning: 'congratulations', level: 'n5' },
{ id: 'v8', word: 'おねがいします', reading: 'onegaishimasu', meaning: 'please', level: 'n5' },
{ id: 'v9', word: 'よろしく', reading: 'yoroshiku', meaning: 'best regards', level: 'n5' },
{ id: 'v10', word: 'いち', reading: 'ichi', meaning: 'one', level: 'n5' },
{ id: 'v11', word: 'に', reading: 'ni', meaning: 'two', level: 'n5' },
{ id: 'v12', word: 'さん', reading: 'san', meaning: 'three', level: 'n5' },
{ id: 'v13', word: 'よん', reading: 'yon', meaning: 'four', level: 'n5' },
{ id: 'v14', word: 'ご', reading: 'go', meaning: 'five', level: 'n5' },
{ id: 'v15', word: 'ろく', reading: 'roku', meaning: 'six', level: 'n5' },
{ id: 'v16', word: 'なな', reading: 'nana', meaning: 'seven', level: 'n5' },
{ id: 'v17', word: 'はち', reading: 'hachi', meaning: 'eight', level: 'n5' },
{ id: 'v18', word: 'きゅう', reading: 'kyuu', meaning: 'nine', level: 'n5' },
{ id: 'v19', word: 'じゅう', reading: 'juu', meaning: 'ten', level: 'n5' },
{ id: 'v20', word: 'ひゃく', reading: 'hyaku', meaning: 'hundred', level: 'n5' },
{ id: 'v21', word: 'せん', reading: 'sen', meaning: 'thousand', level: 'n5' },
{ id: 'v22', word: 'まん', reading: 'man', meaning: 'ten thousand', level: 'n5' },
{ id: 'v23', word: 'ひとつ', reading: 'hitotsu', meaning: 'one', level: 'n5' },
{ id: 'v24', word: 'ふたつ', reading: 'futatsu', meaning: 'two', level: 'n5' },
{ id: 'v25', word: 'みっつ', reading: 'mittsu', meaning: 'three', level: 'n5' },
{ id: 'v26', word: 'よっつ', reading: 'yottsu', meaning: 'four', level: 'n5' },
{ id: 'v27', word: 'いつつ', reading: 'itsutsu', meaning: 'five', level: 'n5' },
{ id: 'v28', word: 'むっつ', reading: 'muttsu', meaning: 'six', level: 'n5' },
{ id: 'v29', word: 'やっつ', reading: 'yattsu', meaning: 'eight', level: 'n5' },
{ id: 'v30', word: 'ひとり', reading: 'hitori', meaning: 'one person', level: 'n5' },
{ id: 'v31', word: 'ふたり', reading: 'futari', meaning: 'two people', level: 'n5' },
{ id: 'v32', word: 'いちばん', reading: 'ichiban', meaning: 'best/first/number one', level: 'n5' },
{ id: 'v33', word: 'いっしょ', reading: 'issho', meaning: 'together', level: 'n5' },
{ id: 'v34', word: 'うえ', reading: 'ue', meaning: 'on top of', level: 'n5' },
{ id: 'v35', word: 'した', reading: 'shita', meaning: 'below', level: 'n5' },
{ id: 'v36', word: 'なか', reading: 'naka', meaning: 'middle', level: 'n5' },
{ id: 'v37', word: 'まるい', reading: 'marui', meaning: 'round/circular', level: 'n5' },
{ id: 'v38', word: 'こと', reading: 'koto', meaning: 'thing/matter/fact', level: 'n5' },
{ id: 'v39', word: 'ひと', reading: 'hito', meaning: 'person', level: 'n5' },
{ id: 'v40', word: 'いま', reading: 'ima', meaning: 'now', level: 'n5' },
{ id: 'v41', word: 'きょう', reading: 'kyou', meaning: 'today', level: 'n5' },
{ id: 'v42', word: 'あした', reading: 'ashita', meaning: 'tomorrow', level: 'n5' },
{ id: 'v43', word: 'きのう', reading: 'kinou', meaning: 'yesterday', level: 'n5' },
{ id: 'v44', word: 'こんしゅう', reading: 'konshuu', meaning: 'this week', level: 'n5' },
{ id: 'v45', word: 'せんしゅう', reading: 'senshuu', meaning: 'last week', level: 'n5' },
{ id: 'v46', word: 'しごと', reading: 'shigoto', meaning: 'job', level: 'n5' },
{ id: 'v47', word: 'はいる', reading: 'hairu', meaning: 'to enter', level: 'n5' },
{ id: 'v48', word: 'いれる', reading: 'ireru', meaning: 'to put in', level: 'n5' },
{ id: 'v49', word: 'でる', reading: 'deru', meaning: 'to appear/to leave', level: 'n5' },
{ id: 'v50', word: 'でぐち', reading: 'deguchi', meaning: 'exit', level: 'n5' },
{ id: 'v51', word: 'かいわ', reading: 'kaiwa', meaning: 'conversation', level: 'n5' },
{ id: 'v52', word: 'かいぎ', reading: 'kaigi', meaning: 'meeting', level: 'n5' },
{ id: 'v53', word: 'しんじる', reading: 'shinjiru', meaning: 'to believe', level: 'n5' },
{ id: 'v54', word: 'わかる', reading: 'wakaru', meaning: 'to be understood', level: 'n5' },
{ id: 'v55', word: 'すむ', reading: 'sumu', meaning: 'to live in', level: 'n5' },
{ id: 'v56', word: 'からだ', reading: 'karada', meaning: 'body', level: 'n5' },
{ id: 'v57', word: 'なに', reading: 'nani', meaning: 'what', level: 'n5' },
{ id: 'v58', word: 'なん', reading: 'nan', meaning: 'what', level: 'n5' },
{ id: 'v59', word: 'どれ', reading: 'dore', meaning: 'which (of three or more)', level: 'n5' },
{ id: 'v60', word: 'どこ', reading: 'doko', meaning: 'where', level: 'n5' },
{ id: 'v61', word: 'なぜ', reading: 'naze', meaning: 'why/how', level: 'n5' },
{ id: 'v62', word: 'どなた', reading: 'donata', meaning: 'who', level: 'n5' },
{ id: 'v63', word: 'いつ', reading: 'itsu', meaning: 'when', level: 'n5' },
{ id: 'v64', word: 'いつも', reading: 'itsumo', meaning: 'always/usually', level: 'n5' },
{ id: 'v65', word: 'あんまり', reading: 'anmari', meaning: 'not very/not much', level: 'n5' },
{ id: 'v66', word: 'あまり', reading: 'amari', meaning: 'not very/not much', level: 'n5' },
{ id: 'v67', word: 'つくる', reading: 'tsukuru', meaning: 'to make', level: 'n5' },
{ id: 'v68', word: 'つかう', reading: 'tsukau', meaning: 'to use', level: 'n5' },
{ id: 'v69', word: 'かりる', reading: 'kariru', meaning: 'to borrow', level: 'n5' },
{ id: 'v70', word: 'げんき', reading: 'genki', meaning: 'health/vitality', level: 'n5' },
{ id: 'v71', word: 'せんげつ', reading: 'sengetsu', meaning: 'last month', level: 'n5' },
{ id: 'v72', word: 'せんせい', reading: 'sensei', meaning: 'teacher/doctor', level: 'n5' },
{ id: 'v73', word: 'ひかり', reading: 'hikari', meaning: 'light', level: 'n5' },
{ id: 'v74', word: 'ひかる', reading: 'hikaru', meaning: 'to shine/to glitter', level: 'n5' },
{ id: 'v75', word: 'うさぎ', reading: 'usagi', meaning: 'rabbit/hare', level: 'n5' },
{ id: 'v76', word: 'ぜんぶ', reading: 'zenbu', meaning: 'all', level: 'n5' },
{ id: 'v77', word: 'ようか', reading: 'youka', meaning: 'eight days/eighth day', level: 'n5' },
{ id: 'v78', word: 'やおや', reading: 'yaoya', meaning: 'greengrocer', level: 'n5' },
{ id: 'v79', word: 'こうえん', reading: 'kouen', meaning: 'park', level: 'n5' },
{ id: 'v80', word: 'むいか', reading: 'muika', meaning: 'six days/sixth day', level: 'n5' },
{ id: 'v81', word: 'じょうだん', reading: 'joudan', meaning: 'jest/joke', level: 'n5' },
{ id: 'v82', word: 'しゃしん', reading: 'shashin', meaning: 'photograph', level: 'n5' },
{ id: 'v83', word: 'ふゆ', reading: 'fuyu', meaning: 'winter', level: 'n5' },
{ id: 'v84', word: 'つめたい', reading: 'tsumetai', meaning: 'cold to the touch', level: 'n5' },
{ id: 'v85', word: 'ひやす', reading: 'hiyasu', meaning: 'to cool/to refrigerate', level: 'n5' },
{ id: 'v86', word: 'れいぞうこ', reading: 'reizouko', meaning: 'refrigerator', level: 'n5' },
{ id: 'v87', word: 'すごい', reading: 'sugoi', meaning: 'terrific', level: 'n5' },
{ id: 'v88', word: 'たまご', reading: 'tamago', meaning: 'egg', level: 'n5' },
{ id: 'v89', word: 'すう', reading: 'suu', meaning: 'to smoke/to suck', level: 'n5' },
{ id: 'v90', word: 'ふく', reading: 'fuku', meaning: 'to blow', level: 'n5' },
{ id: 'v91', word: 'きる', reading: 'kiru', meaning: 'to cut', level: 'n5' },
{ id: 'v92', word: 'きれる', reading: 'kireru', meaning: 'to cut well/to be sharp', level: 'n5' },
{ id: 'v93', word: 'きっぷ', reading: 'kippu', meaning: 'ticket', level: 'n5' },
{ id: 'v94', word: 'れっしゃ', reading: 'ressha', meaning: 'train', level: 'n5' },
{ id: 'v95', word: 'はじめて', reading: 'hajimete', meaning: 'for the first time', level: 'n5' },
{ id: 'v96', word: 'する', reading: 'suru', meaning: 'to print', level: 'n5' },
{ id: 'v97', word: 'さしみ', reading: 'sashimi', meaning: 'sliced raw fish', level: 'n5' },
{ id: 'v98', word: 'まえ', reading: 'mae', meaning: 'before', level: 'n5' },
{ id: 'v99', word: 'うごく', reading: 'ugoku', meaning: 'to move', level: 'n5' },
{ id: 'v100', word: 'かつ', reading: 'katsu', meaning: 'to win', level: 'n5' },
{ id: 'v101', word: 'くわえる', reading: 'kuwaeru', meaning: 'to append/to add', level: 'n5' },
{ id: 'v102', word: 'きく', reading: 'kiku', meaning: 'to be effective', level: 'n5' },
{ id: 'v103', word: 'べんきょう', reading: 'benkyou', meaning: 'study', level: 'n5' },
{ id: 'v104', word: 'べんきょうする', reading: 'benkyousuru', meaning: 'to study', level: 'n5' },
{ id: 'v105', word: 'こきゅう', reading: 'kokyuu', meaning: 'breath/respiration', level: 'n5' },
{ id: 'v106', word: 'あじ', reading: 'aji', meaning: 'flavour', level: 'n5' },
{ id: 'v107', word: 'みそ', reading: 'miso', meaning: 'bean paste', level: 'n5' },
{ id: 'v108', word: 'しなもの', reading: 'shinamono', meaning: 'goods', level: 'n5' },
{ id: 'v109', word: 'じゅうぶん', reading: 'juubun', meaning: 'enough', level: 'n5' },
{ id: 'v110', word: 'ごぜん', reading: 'gozen', meaning: 'morning', level: 'n5' },
{ id: 'v111', word: 'ごご', reading: 'gogo', meaning: 'afternoon', level: 'n5' },
{ id: 'v112', word: 'はん', reading: 'han', meaning: 'half', level: 'n5' },
{ id: 'v113', word: 'はんぶん', reading: 'hanbun', meaning: 'half minute', level: 'n5' },
{ id: 'v114', word: 'そつぎょう', reading: 'sotsugyou', meaning: 'graduation', level: 'n5' },
{ id: 'v115', word: 'こてん', reading: 'koten', meaning: 'old book/classics', level: 'n5' },
{ id: 'v116', word: 'かわいい', reading: 'kawaii', meaning: 'pretty/cute/lovely', level: 'n5' },
{ id: 'v117', word: 'たべる', reading: 'taberu', meaning: 'to eat', level: 'n5' },
{ id: 'v118', word: 'たべもの', reading: 'tabemono', meaning: 'food', level: 'n5' },
{ id: 'v119', word: 'つば', reading: 'tsuba', meaning: 'saliva', level: 'n5' },
{ id: 'v120', word: 'しょうばい', reading: 'shoubai', meaning: 'trade/business', level: 'n5' },
{ id: 'v121', word: 'もんどう', reading: 'mondou', meaning: 'questions and answers', level: 'n5' },
{ id: 'v122', word: 'のど', reading: 'nodo', meaning: 'throat', level: 'n5' },
{ id: 'v123', word: 'よろこぶ', reading: 'yorokobu', meaning: 'to be delighted', level: 'n5' },
{ id: 'v124', word: 'けんか', reading: 'kenka', meaning: 'quarrel/brawl', level: 'n5' },
{ id: 'v125', word: 'きっさ', reading: 'kissa', meaning: 'tea drinking/tea house', level: 'n5' },
{ id: 'v126', word: 'きっさてん', reading: 'kissaten', meaning: 'coffee lounge', level: 'n5' },
{ id: 'v127', word: 'えんげい', reading: 'engei', meaning: 'horticulture/gardening', level: 'n5' },
{ id: 'v128', word: 'つち', reading: 'tsuchi', meaning: 'earth/soil', level: 'n5' },
{ id: 'v129', word: 'どひょう', reading: 'dohyou', meaning: 'arena', level: 'n5' },
{ id: 'v130', word: 'とち', reading: 'tochi', meaning: 'plot of land/lot/soil', level: 'n5' },
{ id: 'v131', word: 'どて', reading: 'dote', meaning: 'embankment/bank', level: 'n5' },
{ id: 'v132', word: 'どよう', reading: 'doyou', meaning: 'Saturday', level: 'n5' },
{ id: 'v133', word: 'どようび', reading: 'doyoubi', meaning: 'Saturday', level: 'n5' },
{ id: 'v134', word: 'あつりょく', reading: 'atsuryoku', meaning: 'stress/pressure', level: 'n5' },
{ id: 'v135', word: 'ある', reading: 'aru', meaning: 'to live/to be', level: 'n5' },
{ id: 'v136', word: 'ちず', reading: 'chizu', meaning: 'map', level: 'n5' },
{ id: 'v137', word: 'じしん', reading: 'jishin', meaning: 'earthquake', level: 'n5' },
{ id: 'v138', word: 'さか', reading: 'saka', meaning: 'slope/hill', level: 'n5' },
{ id: 'v139', word: 'こえ', reading: 'koe', meaning: 'voice', level: 'n5' },
{ id: 'v140', word: 'うる', reading: 'uru', meaning: 'to sell', level: 'n5' },
{ id: 'v141', word: 'うれる', reading: 'ureru', meaning: 'to be sold', level: 'n5' },
{ id: 'v142', word: 'へん', reading: 'hen', meaning: 'strange', level: 'n5' },
{ id: 'v143', word: 'なつ', reading: 'natsu', meaning: 'summer', level: 'n5' },
{ id: 'v144', word: 'ゆうがた', reading: 'yuugata', meaning: 'evening', level: 'n5' },
{ id: 'v145', word: 'よる', reading: 'yoru', meaning: 'night', level: 'n5' },
{ id: 'v146', word: 'ゆめ', reading: 'yume', meaning: 'dream', level: 'n5' },
{ id: 'v147', word: 'だいじ', reading: 'daiji', meaning: 'important/serious/crucial', level: 'n5' },
{ id: 'v148', word: 'おとな', reading: 'otona', meaning: 'adult', level: 'n5' },
{ id: 'v149', word: 'たいへん', reading: 'taihen', meaning: 'very/greatly/serious/difficult', level: 'n5' },
{ id: 'v150', word: 'てんき', reading: 'tenki', meaning: 'weather', level: 'n5' },
{ id: 'v151', word: 'おっと', reading: 'otto', meaning: 'husband', level: 'n5' },
{ id: 'v152', word: 'いもうと', reading: 'imouto', meaning: 'younger sister', level: 'n5' },
{ id: 'v153', word: 'あね', reading: 'ane', meaning: 'older sister', level: 'n5' },
{ id: 'v154', word: 'はじまる', reading: 'hajimaru', meaning: 'to begin', level: 'n5' },
{ id: 'v155', word: 'こども', reading: 'kodomo', meaning: 'child', level: 'n5' },
{ id: 'v156', word: 'がっこう', reading: 'gakkou', meaning: 'school', level: 'n5' },
{ id: 'v157', word: 'さむい', reading: 'samui', meaning: 'cold (weather)', level: 'n5' },
{ id: 'v158', word: 'ねる', reading: 'neru', meaning: 'to sleep', level: 'n5' },
{ id: 'v159', word: 'ちいさい', reading: 'chiisai', meaning: 'small', level: 'n5' },
{ id: 'v160', word: 'すくない', reading: 'sukunai', meaning: 'few', level: 'n5' },
{ id: 'v161', word: 'おくじょう', reading: 'okujou', meaning: 'rooftop', level: 'n5' },
{ id: 'v162', word: 'やま', reading: 'yama', meaning: 'mountain', level: 'n5' },
{ id: 'v163', word: 'かわ', reading: 'kawa', meaning: 'river', level: 'n5' },
{ id: 'v164', word: 'かえる', reading: 'kaeru', meaning: 'to return home', level: 'n5' },
{ id: 'v165', word: 'とし', reading: 'toshi', meaning: 'year', level: 'n5' },
{ id: 'v166', word: 'みせ', reading: 'mise', meaning: 'shop', level: 'n5' },
{ id: 'v167', word: 'にわ', reading: 'niwa', meaning: 'garden', level: 'n5' },
{ id: 'v168', word: 'たてもの', reading: 'tatemono', meaning: 'building', level: 'n5' },
{ id: 'v169', word: 'おとうと', reading: 'otouto', meaning: 'younger brother', level: 'n5' },
{ id: 'v170', word: 'かれ', reading: 'kare', meaning: 'he', level: 'n5' },
{ id: 'v171', word: 'いそがしい', reading: 'isogashii', meaning: 'busy', level: 'n5' },
{ id: 'v172', word: 'むすこ', reading: 'musuko', meaning: 'son', level: 'n5' },
{ id: 'v173', word: 'て', reading: 'te', meaning: 'hand', level: 'n5' },
{ id: 'v174', word: 'てがみ', reading: 'tegami', meaning: 'letter', level: 'n5' },
{ id: 'v175', word: 'そうじ', reading: 'souji', meaning: 'cleaning', level: 'n5' },
{ id: 'v176', word: 'おしえる', reading: 'oshieru', meaning: 'to teach', level: 'n5' },
{ id: 'v177', word: 'あたらしい', reading: 'atarashii', meaning: 'new', level: 'n5' },
{ id: 'v178', word: 'りょこう', reading: 'ryokou', meaning: 'travel', level: 'n5' },
{ id: 'v179', word: 'えいが', reading: 'eiga', meaning: 'movie', level: 'n5' },
{ id: 'v180', word: 'つき', reading: 'tsuki', meaning: 'moon', level: 'n5' },
{ id: 'v181', word: 'ほんとう', reading: 'hontou', meaning: 'truth', level: 'n5' },
{ id: 'v182', word: 'つくえ', reading: 'tsukue', meaning: 'desk', level: 'n5' },
{ id: 'v183', word: 'くる', reading: 'kuru', meaning: 'to come', level: 'n5' },
{ id: 'v184', word: 'たのしい', reading: 'tanoshii', meaning: 'enjoyable', level: 'n5' },
{ id: 'v185', word: 'うた', reading: 'uta', meaning: 'song', level: 'n5' },
{ id: 'v186', word: 'あるく', reading: 'aruku', meaning: 'to walk', level: 'n5' },
{ id: 'v187', word: 'はは', reading: 'haha', meaning: 'mother', level: 'n5' },
{ id: 'v188', word: 'まいにち', reading: 'mainichi', meaning: 'every day', level: 'n5' },
{ id: 'v189', word: 'いけ', reading: 'ike', meaning: 'pond', level: 'n5' },
{ id: 'v190', word: 'うみ', reading: 'umi', meaning: 'sea', level: 'n5' },
{ id: 'v191', word: 'かんじ', reading: 'kanji', meaning: 'kanji', level: 'n5' },
{ id: 'v192', word: 'ひ', reading: 'hi', meaning: 'fire', level: 'n5' },
{ id: 'v193', word: 'ちち', reading: 'chichi', meaning: 'father', level: 'n5' },
{ id: 'v194', word: 'うし', reading: 'ushi', meaning: 'cow', level: 'n5' },
{ id: 'v195', word: 'いぬ', reading: 'inu', meaning: 'dog', level: 'n5' },
{ id: 'v196', word: 'ねこ', reading: 'neko', meaning: 'cat', level: 'n5' },
{ id: 'v197', word: 'げんかん', reading: 'genkan', meaning: 'entrance', level: 'n5' },
{ id: 'v198', word: 'おうさま', reading: 'ousama', meaning: 'king', level: 'n5' },
{ id: 'v199', word: 'あまい', reading: 'amai', meaning: 'sweet', level: 'n5' },
{ id: 'v200', word: 'うまれる', reading: 'umareru', meaning: 'to be born', level: 'n5' },
{ id: 'v201', word: 'せいねんがっぴ', reading: 'seinengappi', meaning: 'date of birth', level: 'n5' },
{ id: 'v202', word: 'いなか', reading: 'inaka', meaning: 'countryside', level: 'n5' },
{ id: 'v203', word: 'おとこ', reading: 'otoko', meaning: 'man', level: 'n5' },
{ id: 'v204', word: 'まち', reading: 'machi', meaning: 'town', level: 'n5' },
{ id: 'v205', word: 'がようし', reading: 'gayoushi', meaning: 'drawing paper', level: 'n5' },
{ id: 'v206', word: 'ばんごう', reading: 'bangou', meaning: 'number', level: 'n5' },
{ id: 'v207', word: 'しろい', reading: 'shiroi', meaning: 'white', level: 'n5' },
{ id: 'v208', word: 'め', reading: 'me', meaning: 'eye', level: 'n5' },
{ id: 'v209', word: 'つく', reading: 'tsuku', meaning: 'to arrive', level: 'n5' },
{ id: 'v210', word: 'しる', reading: 'shiru', meaning: 'to know', level: 'n5' },
{ id: 'v211', word: 'みじかい', reading: 'mijikai', meaning: 'short', level: 'n5' },
{ id: 'v212', word: 'とぐ', reading: 'togu', meaning: 'to sharpen', level: 'n5' },
{ id: 'v213', word: 'しゃかい', reading: 'shakai', meaning: 'society', level: 'n5' },
{ id: 'v214', word: 'わたし', reading: 'watashi', meaning: 'I', level: 'n5' },
{ id: 'v215', word: 'あき', reading: 'aki', meaning: 'autumn', level: 'n5' },
{ id: 'v216', word: 'そら', reading: 'sora', meaning: 'sky', level: 'n5' },
{ id: 'v217', word: 'たつ', reading: 'tatsu', meaning: 'to stand', level: 'n5' },
{ id: 'v218', word: 'こたえ', reading: 'kotae', meaning: 'answer', level: 'n5' },
{ id: 'v219', word: 'かみ', reading: 'kami', meaning: 'paper', level: 'n5' },
{ id: 'v220', word: 'けっこん', reading: 'kekkon', meaning: 'marriage', level: 'n5' },
{ id: 'v221', word: 'みみ', reading: 'mimi', meaning: 'ear', level: 'n5' },
{ id: 'v222', word: 'きく', reading: 'kiku', meaning: 'to hear', level: 'n5' },
{ id: 'v223', word: 'じぶん', reading: 'jibun', meaning: 'oneself', level: 'n5' },
{ id: 'v224', word: 'いろ', reading: 'iro', meaning: 'color', level: 'n5' },
{ id: 'v225', word: 'はな', reading: 'hana', meaning: 'flower', level: 'n5' },
{ id: 'v226', word: 'えいご', reading: 'eigo', meaning: 'English language', level: 'n5' },
{ id: 'v227', word: 'いく', reading: 'iku', meaning: 'to go', level: 'n5' },
{ id: 'v228', word: 'みる', reading: 'miru', meaning: 'to see', level: 'n5' },
{ id: 'v229', word: 'いう', reading: 'iu', meaning: 'to say', level: 'n5' },
{ id: 'v230', word: 'よむ', reading: 'yomu', meaning: 'to read', level: 'n5' },
{ id: 'v231', word: 'かいもの', reading: 'kaimono', meaning: 'shopping', level: 'n5' },
{ id: 'v232', word: 'かう', reading: 'kau', meaning: 'to buy', level: 'n5' },
{ id: 'v233', word: 'おきる', reading: 'okiru', meaning: 'to wake up', level: 'n5' },
{ id: 'v234', word: 'あし', reading: 'ashi', meaning: 'foot', level: 'n5' },
{ id: 'v235', word: 'くるま', reading: 'kuruma', meaning: 'car', level: 'n5' },
{ id: 'v236', word: 'じしょ', reading: 'jisho', meaning: 'dictionary', level: 'n5' },
{ id: 'v237', word: 'ちかい', reading: 'chikai', meaning: 'near', level: 'n5' },
{ id: 'v238', word: 'しゅう', reading: 'shuu', meaning: 'week', level: 'n5' },
{ id: 'v239', word: 'みち', reading: 'michi', meaning: 'road', level: 'n5' },
{ id: 'v240', word: 'おそい', reading: 'osoi', meaning: 'late', level: 'n5' },
{ id: 'v241', word: 'あそぶ', reading: 'asobu', meaning: 'to play', level: 'n5' },
{ id: 'v242', word: 'うんてん', reading: 'unten', meaning: 'driving', level: 'n5' },
{ id: 'v243', word: 'へや', reading: 'heya', meaning: 'room', level: 'n5' },
{ id: 'v244', word: 'やさい', reading: 'yasai', meaning: 'vegetable', level: 'n5' },
{ id: 'v245', word: 'かね', reading: 'kane', meaning: 'money', level: 'n5' },
{ id: 'v246', word: 'ながい', reading: 'nagai', meaning: 'long', level: 'n5' },
{ id: 'v247', word: 'あける', reading: 'akeru', meaning: 'to open', level: 'n5' },
{ id: 'v248', word: 'あめ', reading: 'ame', meaning: 'rain', level: 'n5' },
{ id: 'v249', word: 'でんしゃ', reading: 'densha', meaning: 'train', level: 'n5' },
{ id: 'v250', word: 'でんわ', reading: 'denwa', meaning: 'telephone', level: 'n5' },
{ id: 'v251', word: 'あおい', reading: 'aoi', meaning: 'blue', level: 'n5' },
{ id: 'v252', word: 'のみもの', reading: 'nomimono', meaning: 'drink', level: 'n5' },
{ id: 'v253', word: 'のむ', reading: 'nomu', meaning: 'to drink', level: 'n5' },
{ id: 'v254', word: 'えき', reading: 'eki', meaning: 'station', level: 'n5' },
{ id: 'v255', word: 'おかわり', reading: 'okawari', meaning: 'second helping/another cup', level: 'n5' },
{ id: 'v256', word: 'おにいさん', reading: 'oniisan', meaning: 'older brother', level: 'n5' },
{ id: 'v257', word: 'おやつ', reading: 'oyatsu', meaning: 'snack/afternoon tea', level: 'n5' },
{ id: 'v258', word: 'おみやげ', reading: 'omiyage', meaning: 'souvenir', level: 'n5' },
{ id: 'v259', word: 'おだいじに', reading: 'odaijini', meaning: 'take care of yourself', level: 'n5' },
{ id: 'v260', word: 'おねえさん', reading: 'oneesan', meaning: 'older sister', level: 'n5' },
{ id: 'v261', word: 'おまわりさん', reading: 'omawarisan', meaning: 'policeman', level: 'n5' },
{ id: 'v262', word: 'おべんとう', reading: 'obentou', meaning: 'boxed lunch', level: 'n5' },
{ id: 'v263', word: 'おてあらい', reading: 'otearai', meaning: 'bathroom', level: 'n5' },
{ id: 'v264', word: 'おひる', reading: 'ohiru', meaning: 'lunch/noon', level: 'n5' },
{ id: 'v265', word: 'おかあさん', reading: 'okaasan', meaning: 'mother', level: 'n5' },
{ id: 'v266', word: 'おとうさん', reading: 'otousan', meaning: 'father', level: 'n5' },
{ id: 'v267', word: 'おさら', reading: 'osara', meaning: 'plate/dish', level: 'n5' },
{ id: 'v268', word: 'おばあさん', reading: 'obaasan', meaning: 'grandmother', level: 'n5' },
{ id: 'v269', word: 'おじいさん', reading: 'ojiisan', meaning: 'grandfather', level: 'n5' },
{ id: 'v270', word: 'おちゃ', reading: 'ocha', meaning: 'green tea', level: 'n5' },
{ id: 'v271', word: 'おかし', reading: 'okashi', meaning: 'sweets/candy', level: 'n5' },
{ id: 'v272', word: 'おさけ', reading: 'osake', meaning: 'alcohol/rice wine', level: 'n5' },
{ id: 'v273', word: 'おかね', reading: 'okane', meaning: 'money', level: 'n5' },
{ id: 'v274', word: 'おふろ', reading: 'ofuro', meaning: 'bath', level: 'n5' },
{ id: 'v275', word: 'ここ', reading: 'koko', meaning: 'here', level: 'n5' },
{ id: 'v276', word: 'この', reading: 'kono', meaning: 'this', level: 'n5' },
{ id: 'v277', word: 'ございます', reading: 'gozaimasu', meaning: 'to be (polite)', level: 'n5' },
{ id: 'v278', word: 'ごちそうさま', reading: 'gochisousama', meaning: 'feast', level: 'n5' },
{ id: 'v279', word: 'そう', reading: 'sou', meaning: 'so', level: 'n5' },
{ id: 'v280', word: 'そこ', reading: 'soko', meaning: 'bottom/sole', level: 'n5' },
{ id: 'v281', word: 'その', reading: 'sono', meaning: 'the/that', level: 'n5' },
{ id: 'v282', word: 'それ', reading: 'sore', meaning: 'it/that', level: 'n5' },
{ id: 'v283', word: 'どう', reading: 'dou', meaning: 'how', level: 'n5' },
{ id: 'v284', word: 'どうぞよろしく', reading: 'douzoyoroshiku', meaning: 'pleased to meet you', level: 'n5' },
{ id: 'v285', word: 'とりにく', reading: 'toriniku', meaning: 'chicken meat', level: 'n5' },
{ id: 'v286', word: 'はい', reading: 'hai', meaning: 'yes', level: 'n5' },
{ id: 'v287', word: 'ふべん', reading: 'fuben', meaning: 'inconvenience', level: 'n5' },
{ id: 'v288', word: 'おか', reading: 'oka', meaning: 'hill/height', level: 'n5' },
{ id: 'v289', word: 'おりる', reading: 'oriru', meaning: 'to get off', level: 'n5' },
{ id: 'v290', word: 'へた', reading: 'heta', meaning: 'unskillful', level: 'n5' },
{ id: 'v291', word: 'にゅういん', reading: 'nyuuin', meaning: 'hospitalization', level: 'n5' },
{ id: 'v292', word: 'きざし', reading: 'kizashi', meaning: 'signs/omen/symptoms', level: 'n5' },
{ id: 'v293', word: 'めんきょ', reading: 'menkyo', meaning: 'license/permit', level: 'n5' },
{ id: 'v294', word: 'とにかく', reading: 'tonikaku', meaning: 'anyhow/at any rate/anyway', level: 'n5' },
 ],
  n4: [
    { id: 'v6', word: 'きれい', reading: 'kirei', meaning: 'beautiful', level: 'n4' },
    { id: 'v7', word: 'たいせつ', reading: 'taisetsu', meaning: 'important', level: 'n4' },
    { id: 'v8', word: 'べんり', reading: 'benri', meaning: 'convenient', level: 'n4' },
    { id: 'v9', word: 'しずか', reading: 'shizuka', meaning: 'quiet', level: 'n4' },
    { id: 'v10', word: 'げんき', reading: 'genki', meaning: 'healthy', level: 'n4' },
  ]
};

export default function Practice() {
  const { state, dispatch } = useApp();
  const [mode, setMode] = useState<'flashcards' | 'vocabulary' | null>(null);
  const [flashcardType, setFlashcardType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [vocabularyLevel, setVocabularyLevel] = useState('n5');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [userSpeech, setUserSpeech] = useState('');
  const [practiceStats, setPracticeStats] = useState({
    correct: 0,
    total: 0,
    streak: 0
  });

  useEffect(() => {
    // Load flashcards based on type
    const loadFlashcards = async () => {
      try {
        const response = await import(`../data/flashcards/${flashcardType}.json`);
        setFlashcards(response.default);
      } catch (error) {
        console.error('Failed to load flashcards:', error);
      }
    };
    
    if (mode === 'flashcards') {
      loadFlashcards();
    }
  }, [flashcardType, mode]);

  useEffect(() => {
    // Setup speech recognition
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
        };
        
        recognitionInstance.onerror = () => {
          setIsListening(false);
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(recognitionInstance);
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoplay && mode === 'flashcards') {
      interval = setInterval(() => {
        nextCard();
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
      recognition.start();
    }
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
    setShowAnswer(false);
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    } else {
      setCurrentCardIndex(flashcards.length - 1);
    }
    setShowAnswer(false);
  };

  const handleCardClick = () => {
    setShowAnswer(!showAnswer);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      prevCard();
    } else if (event.key === 'ArrowRight') {
      nextCard();
    } else if (event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  const resetProgress = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setPracticeStats({ correct: 0, total: 0, streak: 0 });
  };

  if (!mode) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Practice Zone
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Master Japanese through interactive flashcards and vocabulary training with speech recognition.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Flashcards */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('flashcards')}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Flashcards
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Practice hiragana and katakana characters with interactive flashcards. 
                Use keyboard navigation and autoplay features.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {state.practiceProgress.flashcards.hiragana.completed}/46 Hiragana
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {state.practiceProgress.flashcards.katakana.completed}/46 Katakana
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </motion.div>

            {/* Vocabulary Trainer */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('vocabulary')}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Vocabulary Trainer
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Learn Japanese vocabulary with speech recognition. Practice pronunciation 
                and get feedback on your speaking skills.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Speech Recognition
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Audio Playback
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </motion.div>
          </div>

          {/* Stats Overview */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Practice Statistics
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {state.practiceProgress.flashcards.hiragana.completed + state.practiceProgress.flashcards.katakana.completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Characters Learned</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.max(state.practiceProgress.flashcards.hiragana.streak, state.practiceProgress.flashcards.katakana.streak)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Best Streak</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.values(state.practiceProgress.vocabulary).reduce((sum, level) => sum + (level.wordsLearned || 0), 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Vocabulary Words</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.max(...Object.values(state.practiceProgress.vocabulary).map(level => level.accuracy || 0), 0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Best Accuracy</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === 'flashcards' && flashcards.length > 0) {
    const currentCard = flashcards[currentCardIndex];
    
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" onKeyDown={handleKeyPress} tabIndex={0}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMode(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {flashcardType.charAt(0).toUpperCase() + flashcardType.slice(1)} Flashcards
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={flashcardType}
                onChange={(e) => setFlashcardType(e.target.value as 'hiragana' | 'katakana')}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="hiragana">Hiragana</option>
                <option value="katakana">Katakana</option>
              </select>
              
              <button
                onClick={() => setIsAutoplay(!isAutoplay)}
                className={`p-2 rounded-lg transition-colors ${
                  isAutoplay
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {isAutoplay ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <button
                onClick={resetProgress}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Card {currentCardIndex + 1} of {flashcards.length}
              </span>
              <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                {Math.round(((currentCardIndex + 1) / flashcards.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <div className="flex justify-center mb-8">
            <motion.div
              key={currentCard.id}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: showAnswer ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-80 h-80 cursor-pointer"
              onClick={handleCardClick}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col items-center justify-center border-2 border-gray-200 dark:border-gray-600"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="text-8xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentCard.character}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Click to reveal
                </p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 w-full h-full bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl shadow-xl flex flex-col items-center justify-center border-2 border-indigo-200 dark:border-indigo-700"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {currentCard.romaji}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                  {currentCard.meaning}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentCard.character);
                  }}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <Volume2 size={20} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={prevCard}
              className="p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Use ← → keys or click card
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Space bar to flip
              </p>
            </div>
            
            <button
              onClick={nextCard}
              className="p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === 'vocabulary') {
    const vocabularyWords = vocabularyData[vocabularyLevel] || [];
    const currentWord = vocabularyWords[currentCardIndex] || vocabularyWords[0];
    
    if (!currentWord) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No vocabulary available for this level
            </h2>
            <button
              onClick={() => setMode(null)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              Back to Practice Zone
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMode(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Vocabulary Trainer
              </h1>
            </div>
            
            <select
              value={vocabularyLevel}
              onChange={(e) => {
                setVocabularyLevel(e.target.value);
                setCurrentCardIndex(0);
              }}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="n5">N5 Level</option>
              <option value="n4">N4 Level</option>
            </select>
          </div>

          {/* Word Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                {currentWord.word}
              </div>
              <div className="text-2xl text-indigo-600 dark:text-indigo-400 mb-2">
                {currentWord.reading}
              </div>
              <div className="text-xl text-gray-600 dark:text-gray-400">
                {currentWord.meaning}
              </div>
            </div>

            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => speakText(currentWord.word)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Volume2 size={20} />
                <span>Listen</span>
              </button>
              
              <button
                onClick={startListening}
                disabled={isListening || !recognition}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Mic size={20} />
                <span>{isListening ? 'Listening...' : 'Practice'}</span>
              </button>
            </div>

            {userSpeech && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Your pronunciation:
                </h4>
                <p className="text-blue-800 dark:text-blue-200">{userSpeech}</p>
              </div>
            )}

            {!recognition && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Speech recognition is not supported in your browser. You can still practice by listening to the pronunciation.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
              disabled={currentCardIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={20} />
              <span>Previous</span>
            </button>
            
            <span className="text-gray-600 dark:text-gray-400">
              {currentCardIndex + 1} of {vocabularyWords.length}
            </span>
            
            <button
              onClick={() => setCurrentCardIndex(Math.min(vocabularyWords.length - 1, currentCardIndex + 1))}
              disabled={currentCardIndex === vocabularyWords.length - 1}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}