import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Pen, Star, Target, Video, Zap } from 'lucide-react';

// Example data for lessons (unchanged)
const lessons = [
	{
		lesson: 1,
		title: 'Lesson 1',
		description: 'Introducing basic sentence structure, self-introduction, and essential particles like は, の, か, and も.',
		grammarPoints: [
			{
				title: 'N1 は N2 です',
				explanation: 'Used to state that N1 is N2. は marks the topic of the sentence.\n\nExample: わたしは がくせいです。 (I am a student.)',
				audio: '',
				video: 'https://www.youtube.com/embed/d6QU8E8CeNA',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Japanese_student.jpg/320px-Japanese_student.jpg'
			},
			{
				title: 'N1 は N2 じゃありません',
				explanation: 'Used to negate a statement politely.\n\nExample: わたしは せんせいじゃありません。 (I am not a teacher.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Japanese_teacher.jpg/320px-Japanese_teacher.jpg'
			},
			{
				title: 'N1 は N2 ですか',
				explanation: 'Used to form a question. か is added at the end of the sentence.\n\nExample: あなたは にほんじんですか。 (Are you Japanese?)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_flag_question.jpg/320px-Japanese_flag_question.jpg'
			},
			{
				title: 'N1 も',
				explanation: 'も means “also” or “too.” It replaces は when used.\n\nExample: わたしも がくせいです。 (I am also a student.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Japanese_classmates.jpg/320px-Japanese_classmates.jpg'
			},
			{
				title: 'N1 の N2',
				explanation: 'の indicates possession or relationship between two nouns.\n\nExample: わたしの なまえは たなかです。 (My name is Tanaka.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Japanese_name_tag.jpg/320px-Japanese_name_tag.jpg'
			},
			{
				title: '～さん',
				explanation: 'A polite suffix added to names (Mr./Ms.).\n\nExample: たなかさん (Mr./Ms. Tanaka)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Japanese_conversation.jpg/320px-Japanese_conversation.jpg'
			}
		]
	},
	{
		lesson: 2,
		title: 'Lesson 2',
		description: 'Learning demonstratives (this/that), possession, and basic question structures. This lesson focuses on identifying and describing objects using これ, それ, あれ, and related forms.',
		grammarPoints: [
			{
				title: 'これ / それ / あれ',
				explanation: 'Used to refer to things based on proximity:\n- これ: near the speaker\n- それ: near the listener\n- あれ: far from both\n\nExample: これは ほんです。 (This is a book.)',
				audio: '',
				video: 'https://www.youtube.com/watch?v=9EfbkBkF2ag',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_books.jpg/320px-Japanese_books.jpg'
			},
			{
				title: 'この / その / あの + noun',
				explanation: 'Used to modify a noun with a demonstrative:\n- この: this [noun]\n- その: that [noun]\n- あの: that [noun] over there\n\nExample: このかばんは わたしのです。 (This bag is mine.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Japanese_bag.jpg/320px-Japanese_bag.jpg'
			},
			{
				title: 'そうです / そうじゃありません',
				explanation: 'Used to affirm or deny something:\n- そうです: That’s right.\n- そうじゃありません: That’s not right.\n\nExample: それは じしょですか。 はい、そうです。 (Is that a dictionary? Yes, it is.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Japanese_dictionary.jpg/320px-Japanese_dictionary.jpg'
			},
			{
				title: '～か、～か',
				explanation: 'Used to ask “Is it A or B?”\n\nExample: これは えんぴつですか、ボールペンですか。 (Is this a pencil or a pen?)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Japanese_stationery.jpg/320px-Japanese_stationery.jpg'
			},
			{
				title: 'N1 の N2',
				explanation: 'Used to show possession or relationship.\n\nExample: これは わたしの ほんです。 (This is my book.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Japanese_name_tag.jpg/320px-Japanese_name_tag.jpg'
			},
			{
				title: 'そうですか',
				explanation: 'Used to show understanding or surprise: “Is that so?” or “I see.”\n\nExample: A: これは にほんの くるまです。 B: そうですか。 (A: This is a Japanese car. B: I see.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Japanese_car.jpg/320px-Japanese_car.jpg'
			}
		]
	},
	{
		lesson: 3,
		title: 'Lesson 3',
		description: 'Learning how to describe locations, ask where things are, and use particles like ここ, そこ, あそこ, and の for possession and location.',
		grammarPoints: [
			{
				title: 'ここ / そこ / あそこ / どこ',
				explanation: 'Used to indicate location:\n- ここ: here (near speaker)\n- そこ: there (near listener)\n- あそこ: over there (far from both)\n- どこ: where\n\nExample: トイレは どこですか。 (Where is the toilet?)',
				audio: '',
				video: 'https://www.youtube.com/embed/MnztyhqMvo4',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Japanese_signs.jpg/320px-Japanese_signs.jpg'
			},
			{
				title: 'こちら / そちら / あちら / どちら',
				explanation: 'Polite equivalents of ここ/そこ/あそこ/どこ. Also used to ask “which one.”\n\nExample: こちらは たなかさんです。 (This is Mr. Tanaka.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Japanese_conversation.jpg/320px-Japanese_conversation.jpg'
			},
			{
				title: 'Noun は ここ／そこ／あそこ です',
				explanation: 'Used to say where something is.\n\nExample: じむしょは あそこです。 (The office is over there.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Japanese_office_building.jpg/320px-Japanese_office_building.jpg'
			},
			{
				title: 'Noun の Noun',
				explanation: 'Used to show possession or relationship.\n\nExample: ABCの かいしゃは あそこです。 (ABC’s company is over there.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_company_sign.jpg/320px-Japanese_company_sign.jpg'
			},
			{
				title: '～は どこですか',
				explanation: 'Used to ask where something is.\n\nExample: エレベーターは どこですか。 (Where is the elevator?)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Japanese_elevator_sign.jpg/320px-Japanese_elevator_sign.jpg'
			}
		]
	},
	{
		lesson: 4,
		title: 'Lesson 4',
		description: 'Learning how to express time, describe daily routines, and use particles like に, から, まで, と, and ね. This lesson also introduces polite verb forms and basic sentence patterns for scheduling.',
		grammarPoints: [
			{
				title: '～じ／～ふん（ぷん）',
				explanation: 'Used to express time. ～じ indicates the hour, ～ふん／～ぷん indicates the minutes.\n\nExample: いま ７じ１０ぷんです。 (It is 7:10 now.)',
				audio: '',
				video: 'https://www.youtube.com/embed/A5sj1vKGpU0',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Japanese_clock.jpg/320px-Japanese_clock.jpg'
			},
			{
				title: '～に',
				explanation: 'Particle に is used to indicate the specific time when an action occurs.\n\nExample: ６じに おきます。 (I get up at 6 o’clock.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Japanese_alarm_clock.jpg/320px-Japanese_alarm_clock.jpg'
			},
			{
				title: '～から ～まで',
				explanation: 'Used to express a time range: from ～ to ～.\n\nExample: ９じから ５じまで はたらきます。 (I work from 9 to 5.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_schedule.jpg/320px-Japanese_schedule.jpg'
			},
			{
				title: '～と',
				explanation: 'Used to connect two nouns (A and B).\n\nExample: たなかさんと わたしは かいしゃの ひとです。 (Mr. Tanaka and I are company employees.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Japanese_conversation.jpg/320px-Japanese_conversation.jpg'
			},
			{
				title: '～ね',
				explanation: 'Used at the end of a sentence to seek agreement or confirm information (like “right?”).\n\nExample: たいへんですね。 (That’s tough, isn’t it?)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Japanese_reaction.jpg/320px-Japanese_reaction.jpg'
			},
			{
				title: 'Verb ます／ません／ました／ませんでした',
				explanation: 'Polite verb forms:\n- ます: present/future\n- ません: negative\n- ました: past\n- ませんでした: past negative\n\nExample: きのう べんきょうしました。 (I studied yesterday.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Japanese_study_desk.jpg/320px-Japanese_study_desk.jpg'
			}
		]
	},
	{
		lesson: 5,
		title: 'Lesson 5',
		description: 'Verbs of movement, destinations, and basic direction expressions.',
		grammarPoints: [
			{
				title: 'いきます・きます・かえります',
				explanation: 'These are verbs of movement.\n\nいきます = to go\nきます = to come\nかえります = to return (home)\n\nExample: わたしは うちへ かえります。 (I go home.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_train_station.jpg/320px-Japanese_train_station.jpg',
				video: 'https://www.youtube.com/embed/yWseJskX8hQ',
			},
			{
				title: '～へ',
				explanation: 'Particle へ indicates direction or destination.\n\nExample: がっこうへ いきます。 (I go to school.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Japanese_school.jpg/320px-Japanese_school.jpg',
			},
			{
				title: 'なんで',
				explanation: 'Used to ask “by what means” (transportation).\n\nExample: なんで いきますか。 (How do you go?)\nでんしゃで いきます。 (I go by train.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Japan_train.jpg/320px-Japan_train.jpg',
			},
			{
				title: 'だれと',
				explanation: 'Used to ask “with whom.”\n\nExample: だれと いきますか。 (With whom do you go?)\nともだちと いきます。 (I go with a friend.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Japanese_students_together.jpg/320px-Japanese_students_together.jpg',
			},
			{
				title: 'いつ',
				explanation: 'Used to ask “when.”\n\nExample: いつ いきますか。 (When will you go?)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Japanese_calendar.jpg/320px-Japanese_calendar.jpg',
			}
		],
	},
	{
		lesson: 6,
		title: 'Lesson 6',
		description: 'Using direct objects with を, basic verb usage, and common action phrases.',
		grammarPoints: [
			{
				title: 'Noun + を + Verb',
				explanation: '「を」 marks the direct object of a verb.\n\nExample: ジュースを のみます。 (I drink juice.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Japanese_juice.jpg/320px-Japanese_juice.jpg',
				video: 'https://www.youtube.com/embed/ilp_pN5cpwU',
			},
			{
				title: 'なに / なん',
				explanation: 'Used to ask “what.”\n\nUse 「なに」 before particles like を, が, and で.\nUse 「なん」 before counters or です.\n\nExample: なにを しますか。 (What will you do?)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Japanese_question_mark.jpg/320px-Japanese_question_mark.jpg',
			},
			{
				title: 'なにを + Verb',
				explanation: 'Used to ask what someone is doing.\n\nExample: なにを たべますか。 (What will you eat?)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Japanese_meal.jpg/320px-Japanese_meal.jpg',
			},
			{
				title: 'Verb + ます',
				explanation: 'Polite present/future tense verb ending.\n\nExample: まいにち にほんごを べんきょうします。 (I study Japanese every day.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_study.jpg/320px-Japanese_study.jpg',
			}
		],
	},
	{
		lesson: 7,
		title: 'Lesson 7',
		description: 'Giving and receiving, using tools and means, and offering help politely.',
		grammarPoints: [
			{
				title: 'あげます・もらいます・くれます',
				explanation: 'These verbs express giving and receiving.\n\nあげます = to give (to others)\nもらいます = to receive\nくれます = to give (to me or my in-group)\n\nExample: わたしは ともだちに プレゼントを あげました。 (I gave a present to my friend.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_gift_wrapping.jpg/320px-Japanese_gift_wrapping.jpg',
				video: 'https://www.youtube.com/embed/064DWjvWow8',
			},
			{
				title: 'もう～ました',
				explanation: 'Used to express that something has already been done.\n\nExample: もう しゅくだいを しました。 (I’ve already done my homework.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Japanese_homework.jpg/320px-Japanese_homework.jpg',
			},
			{
				title: '～で',
				explanation: 'Particle で indicates the means or tool used to do something.\n\nExample: はしで たべます。 (I eat with chopsticks.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Japanese_chopsticks.jpg/320px-Japanese_chopsticks.jpg',
			},
			{
				title: '～は～で～を～ます',
				explanation: 'Sentence structure using a tool or means.\n\nExample: わたしは ボールペンで なまえを かきます。 (I write my name with a ballpoint pen.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Japanese_pen.jpg/320px-Japanese_pen.jpg',
			},
			{
				title: '～を かします・かります',
				explanation: 'かします = to lend\nかります = to borrow\n\nExample: ともだちに ほんを かりました。 (I borrowed a book from a friend.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bookshelf_in_Japan.jpg/320px-Bookshelf_in_Japan.jpg',
				audio: '',
			}
		],
	},
	{
		lesson: 8,
		title: 'Lesson 8',
		description: 'Describing things using adjectives, and forming basic opinions.',
		grammarPoints: [
			{
				title: 'い-adjectives',
				explanation: 'Adjectives ending in い are called い-adjectives.\n\nExample: このほんは おもしろいです。 (This book is interesting.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bookshelf_in_Japan.jpg/320px-Bookshelf_in_Japan.jpg',
				audio: '',
				video: 'https://www.youtube.com/embed/SiIZJ8vlDks',
			},
			{
				title: 'な-adjectives',
				explanation: 'Adjectives that need な before a noun are called な-adjectives.\n\nExample: にぎやかな まちです。 (It is a lively town.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Japanese_cityscape.jpg/320px-Japanese_cityscape.jpg',
				audio: '',
			},
			{
				title: '～は どうですか',
				explanation: 'Used to ask for an opinion about something.\n\nExample: にほんの せいかつは どうですか。 (How is life in Japan?)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_study.jpg/320px-Japanese_study.jpg',
				audio: '',
			},
			{
				title: '～が、～',
				explanation: 'Used to contrast two ideas (but).\n\nExample: このへやは ひろいですが、あついです。 (This room is spacious, but hot.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Japanese_room.jpg/320px-Japanese_room.jpg',
				audio: '',
			}
		],
	},
	{
		lesson: 9,
		title: 'Lesson 9',
		description: 'Expressing likes, dislikes, skills, and asking for reasons using が and related expressions.',
		grammarPoints: [
			{
				title: 'Noun が すきです／きらいです',
				explanation: 'Used to express likes and dislikes.\n\nExample: わたしは りんごが すきです。 (I like apples.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Apple_fruit.jpg/320px-Apple_fruit.jpg',
				audio: '',
				video: 'https://www.youtube.com/embed/hjEsznLHEmM',
			},
			{
				title: 'Noun が じょうずです／へたです',
				explanation: 'Used to express skill or lack of skill.\n\nExample: かれは テニスが じょうずです。 (He is good at tennis.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Japanese_tennis.jpg/320px-Japanese_tennis.jpg',
				audio: '',
			},
			{
				title: 'よく／だいたい／たくさん／すこし／あまり／ぜんぜん',
				explanation: 'Adverbs used to express frequency or degree.\n\nExample: にほんごが よく わかります。 (I understand Japanese well.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_study.jpg/320px-Japanese_study.jpg',
				audio: '',
			},
			{
				title: 'どうして／～から',
				explanation: 'Used to ask and give reasons.\n\nExample: どうして きませんでしたか。 (Why didn’t you come?)\nびょうきですから。 (Because I’m sick.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Japanese_clinic.jpg/320px-Japanese_clinic.jpg',
				audio: '',
			},
			{
				title: 'どんな + Noun',
				explanation: 'Used to ask “what kind of.”\n\nExample: どんな たべものが すきですか。 (What kind of food do you like?)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Japanese_meal.jpg/320px-Japanese_meal.jpg',
				audio: '',
			}
		],
	},
	{
		lesson: 10,
		title: 'Lesson 10',
		description: 'Describing existence and location of things using あります／います, and expressing positions.',
		grammarPoints: [
			{
				title: 'あります・います',
				explanation: 'あります is used for inanimate things; います is used for people and animals.\n\nExample: つくえの うえに ほんが あります。 (There is a book on the desk.)\nいぬが にわに います。 (There is a dog in the garden.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Japanese_room_with_dog.jpg/320px-Japanese_room_with_dog.jpg',
				audio: '',
				video: 'https://www.youtube.com/embed/7O_yu4pMQ-U',
			},
			{
				title: 'N (place) に N (thing/person) が あります／います',
				explanation: 'Used to say something exists in a place.\n\nExample: にわに いぬが います。 (There is a dog in the garden.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_garden.jpg/320px-Japanese_garden.jpg',
				audio: '',
			},
			{
				title: 'N は N (place) に あります／います',
				explanation: 'Used to describe where something is.\n\nExample: ほんは つくえの うえに あります。 (The book is on the desk.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bookshelf_in_Japan.jpg/320px-Bookshelf_in_Japan.jpg',
				audio: '',
			},
			{
				title: 'N の うえ／した／まえ／うしろ／なか／そと／となり／あいだ',
				explanation: 'Used to describe positions.\n\nExample: つくえの したに ねこが います。 (There is a cat under the desk.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Japanese_cat_under_desk.jpg/320px-Japanese_cat_under_desk.jpg',
				audio: '',
			},
			{
				title: 'N1 や N2（など）',
				explanation: 'Used to list examples (among others).\n\nExample: つくえの うえに ほんや えんぴつが あります。 (There are books and pencils on the desk.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Japanese_desk_items.jpg/320px-Japanese_desk_items.jpg',
				audio: '',
			}
		],
	},
	{
		lesson: 11,
		title: 'Lesson 11',
		description: 'Counting objects, people, and time; expressing quantity and frequency.',
		grammarPoints: [
			{
				title: '～人（にん）',
				explanation: 'Used to count people.\n\nExample: かぞくは ４人です。 (There are four people in my family.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Japanese_family.jpg/320px-Japanese_family.jpg',
				audio: '',
				video: 'https://www.youtube.com/embed/IQTeJKrkP3k',
			},
			{
				title: '～だい・～まい・～さつ・～ほん・～ひき・～こ',
				explanation: 'Counters for machines, flat objects, books, long objects, small animals, and small items.\n\nExample: くるまが ２だい あります。 (There are two cars.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Toyota_Corolla_Sedan.jpg/320px-Toyota_Corolla_Sedan.jpg',
				audio: '',
			},
			{
				title: 'いくつ',
				explanation: 'Used to ask “how many” for general objects.\n\nExample: りんごを いくつ かいましたか。 (How many apples did you buy?)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Apple_fruit.jpg/320px-Apple_fruit.jpg',
				audio: '',
			},
			{
				title: '～だけ',
				explanation: 'Means “only” or “just.”\n\nExample: ひとりだけ きました。 (Only one person came.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Japanese_homework.jpg/320px-Japanese_homework.jpg',
				audio: '',
			},
			{
				title: '～に ～かい',
				explanation: 'Used to express frequency: how many times per period.\n\nExample: １しゅうかんに ３かい ジムに いきます。 (I go to the gym three times a week.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_gym.jpg/320px-Japanese_gym.jpg',
				audio: '',
			}
		],
	},
	{
		lesson: 12,
		title: 'Lesson 12',
		description: 'Talking about past events, comparisons, and superlatives. Learn how to express past tense, compare things using より, and identify the most preferred item with いちばん.',
		grammarPoints: [
			{
				title: 'Noun / な-adjective でした / じゃありませんでした',
				explanation: 'Use ～でした for the past affirmative and ～じゃありませんでした for the past negative of nouns or な-adjectives.\n\nExample:\nきのうは 雨でした。\n(= It was rainy yesterday.)\n\nにぎやかじゃありませんでした。\n(= It was not lively.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Umbrellas_in_the_rain_-_Tokyo_%2828712912454%29.jpg/320px-Umbrellas_in_the_rain_-_Tokyo_%2828712912454%29.jpg',
				audio: '',
				video: 'https://www.youtube.com/embed/DGG1GtLUMxQ'
			},
			{
				title: 'い-adjective ～かったです / ～くなかったです',
				explanation: 'To express past tense with い-adjectives:\n\nAffirmative: ～かったです\nNegative: ～くなかったです\n\nExample:\nたのしかったです。\n(= It was fun.)\n\nたのしくなかったです。\n(= It was not fun.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Fireworks_Japan.jpg/320px-Fireworks_Japan.jpg',
				audio: '',
			},
			{
				title: '～は～より～です',
				explanation: 'Used when comparing two things, meaning A is more ~ than B.\n\nExample:\nこの車は あの車より 高いです。\n(= This car is more expensive than that one.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Toyota_Alphard_and_Honda_Vezel_in_Japan.jpg/320px-Toyota_Alphard_and_Honda_Vezel_in_Japan.jpg',
				audio: '',
			},
			{
				title: '～と～と どちらが～ですか ／ ～のほうが～です',
				explanation: 'Use to ask which of two things is more something. The answer uses ～のほうが to show preference.\n\nExample:\nやきゅうと サッカーと どちらが おもしろいですか。\n→ サッカーのほうが おもしろいです。',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Baseball_and_soccer_ball.jpg/320px-Baseball_and_soccer_ball.jpg',
				audio: '',
			},
			{
				title: '～の中で [何/どこ/だれ/いつ]が いちばん～ですか ／ ～がいちばん～です',
				explanation: 'This pattern is used to ask which is the most ~ among three or more.\n\nExample:\n日本料理の中で 何が いちばん おいしいですか。\n→ てんぷらが いちばん おいしいです。',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Tendon_by_sukeko.jpg/320px-Tendon_by_sukeko.jpg',
				audio: '',
			}
		]
	},
	{
		lesson: 13,
		title: 'Lesson 13',
		description: 'Talking about wants, desires, and actions involving movement. Covers ～たいです, ～がほしいです, and using Vます-form に 行きます／来ます／帰ります.',
		grammarPoints: [
			{
				title: '～たいです',
				explanation: 'Used to express what you want to do. Attach ～たい to the stem of a verb (ます-form minus ます).\n\nExample: にほんへ いきたいです。 (I want to go to Japan.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Mount_Fuji_and_Shinkansen.jpg/320px-Mount_Fuji_and_Shinkansen.jpg',
				audio: '',
				video: 'https://www.youtube.com/embed/gQlrmeVc2Dk',
			},
			{
				title: '～がほしいです',
				explanation: 'Used to express wanting something (a noun). The desired item is marked with が.\n\nExample: あたらしい くるまが ほしいです。 (I want a new car.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Japanese_car_show.jpg/320px-Japanese_car_show.jpg',
				audio: '',
			},
			{
				title: 'Nへ Vます-form に 行きます／来ます／帰ります',
				explanation: 'Expresses going/coming/returning somewhere to do something. Attach に to the ます-form of the verb.\n\nExample: こうえんへ あそびに いきます。 (I go to the park to play.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Ueno_Park_in_Tokyo.jpg/320px-Ueno_Park_in_Tokyo.jpg',
				audio: '',
			},
			{
				title: 'なにか／どこか',
				explanation: 'Used to mean "something" (なにか) or "somewhere" (どこか), often when the specific item or place isn’t known.\n\nExample: なにか たべたいです。 (I want to eat something.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Japanese_dishes_and_sake.jpg/320px-Japanese_dishes_and_sake.jpg',
				audio: '',
			},
		],
	},
	{
		lesson: 14,
		title: 'Lesson 14',
		description: 'Mastering the て-form for making polite requests, describing ongoing actions, offering help, and chaining multiple actions together. Includes audio and video support.',
		grammarPoints: [
			{
				title: '～てください',
				explanation: 'Used to politely ask someone to do something. Attach ください to the て-form of a verb.\n\nExample: ここに なまえを かいてください。 (Please write your name here.)',
				audio: '',
				video: 'https://www.youtube.com/embed/i8hLRam9_W4',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Japanese_calligraphy.jpg/320px-Japanese_calligraphy.jpg'
			},
			{
				title: '～ています',
				explanation: 'Describes an ongoing action, repeated habit, or resultant state. Formed by attaching います to the て-form.\n\nExample: いま でんわを かけています。 (I am on the phone now.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Japanese_office_worker.jpg/320px-Japanese_office_worker.jpg'
			},
			{
				title: '～ていません',
				explanation: 'Negative of ～ています. Used to express that an action is not happening.\n\nExample: まだ しゅくだいを していません。 (I haven’t done my homework yet.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Japanese_homework.jpg/320px-Japanese_homework.jpg'
			},
			{
				title: '～ましょうか',
				explanation: 'Used to offer help politely or to suggest doing something together.\n\nExample: にもつを もちましょうか。 (Shall I carry your luggage?)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Japanese_train_station_assistance.jpg/320px-Japanese_train_station_assistance.jpg'
			},
			{
				title: '～て、～',
				explanation: 'Used to connect actions in order. The て-form acts like “and then.”\n\nExample: うちへ かえって、ごはんを たべました。 (I went home and ate dinner.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Japanese_home_dinner.jpg/320px-Japanese_home_dinner.jpg'
			},
			{
				title: 'Verb て-form Conjugation (Group 1)',
				explanation: 'Group 1 verbs (う verbs) have multiple て-form endings:\n- う/つ/る → って (あう→あって)\n- む/ぶ/ぬ → んで (よむ→よんで)\n- く → いて (かく→かいて) — Exception: いく → いって\n- ぐ → いで (およぐ→およいで)\n- す → して (はなす→はなして)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Japanese_verb_chart.jpg/320px-Japanese_verb_chart.jpg'
			},
			{
				title: 'Verb て-form Conjugation (Group 2)',
				explanation: 'Group 2 verbs (る verbs): Drop ます and add て.\n\nExample: たべます → たべて (to eat), みます → みて (to see)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Japanese_food_bento.jpg/320px-Japanese_food_bento.jpg'
			},
			{
				title: 'Verb て-form Conjugation (Group 3)',
				explanation: 'Irregular verbs:\n- します → して (to do)\n- きます → きて (to come)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Japanese_students_studying.jpg/320px-Japanese_students_studying.jpg'
			},
			{
				title: 'が (as subject marker for natural phenomena)',
				explanation: 'が marks the subject of an involuntary or natural event.\n\nExample: あめが ふっています。 (It’s raining.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Rain_in_Tokyo.jpg/320px-Rain_in_Tokyo.jpg'
			}
		]
	},
	{
		lesson: 15,
		title: 'Lesson 15',
		description: 'Learning how to give and ask for permission, express prohibition, describe ongoing states, and say what you know or don’t know using the て-form.',
		grammarPoints: [
			{
				title: '～てもいいです',
				explanation: 'Used to give or ask for permission. Attach もいいです to the て-form of a verb.\n\nExample: ここで しゃしんを とってもいいです。 (You may take pictures here.)',
				audio: '',
				video: 'https://www.youtube.com/embed/5gys5SFlFjM',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Japanese_tourists_photo.jpg/320px-Japanese_tourists_photo.jpg'
			},
			{
				title: '～てはいけません',
				explanation: 'Used to prohibit an action. Attach ては いけません to the て-form of a verb.\n\nExample: ここで たばこを すってはいけません。 (You must not smoke here.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/No_Smoking_sign_in_Japan.jpg/320px-No_Smoking_sign_in_Japan.jpg'
			},
			{
				title: '～ています (resultant state)',
				explanation: 'Describes a state that resulted from a past action and continues in the present.\n\nExample: ドアが あいています。 (The door is open.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Open_door_in_Japan.jpg/320px-Open_door_in_Japan.jpg'
			},
			{
				title: 'しっています／しりません',
				explanation: 'Used to express whether you know something or not.\n\nExample: わたしは そのひとを しっています。 (I know that person.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Japanese_people_talking.jpg/320px-Japanese_people_talking.jpg'
			},
			{
				title: 'すんでいます／つとめています／はたらいています',
				explanation: 'Used to describe where someone lives or works. These are resultant states using the て-form + います.\n\nExample: わたしは おおさかに すんでいます。 (I live in Osaka.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Osaka_cityscape.jpg/320px-Osaka_cityscape.jpg'
			}
		]
	},
	{
		lesson: 16,
		title: 'Lesson 16',
		description: 'Connecting multiple actions using the て-form, describing sequences, and asking how to do something.',
		grammarPoints: [
			{
				title: 'Vて、Vて、Vます',
				explanation: 'Used to connect multiple actions in sequence. All verbs except the last are in て-form.\n\nExample: ジョギングをして、シャワーをあびて、会社へ行きます。 (I jog, take a shower, and go to work.)',
				audio: '',
				video: 'https://www.youtube.com/embed/z_9IsgRyotg',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Japanese_morning_routine.jpg/320px-Japanese_morning_routine.jpg'
			},
			{
				title: 'Vてから、Vます',
				explanation: 'Used to express that one action happens after another. The first verb is in て-form + から.\n\nExample: コンサートが終わってから、レストランで食事しました。 (After the concert ended, I had a meal at a restaurant.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Japanese_concert_and_dinner.jpg/320px-Japanese_concert_and_dinner.jpg'
			},
			{
				title: 'い-adjective くて / な-adjective で',
				explanation: 'Used to connect adjectives. い-adjectives drop い and add くて; な-adjectives use で.\n\nExample: 大阪はにぎやかで、おもしろい町です。 (Osaka is a lively and interesting city.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Osaka_Dotonbori.jpg/320px-Osaka_Dotonbori.jpg'
			},
			{
				title: 'Nで',
				explanation: 'Used to indicate means, method, or material for an action.\n\nExample: 日本語でレポートを書きます。 (I write the report in Japanese.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Japanese_report.jpg/320px-Japanese_report.jpg'
			},
			{
				title: 'どうやって',
				explanation: 'Used to ask "how" something is done.\n\nExample: 大学までどうやって行きますか。 (How do you get to the university?)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Japanese_train_map.jpg/320px-Japanese_train_map.jpg'
			},
			{
				title: 'どの / どれ / どんな',
				explanation: 'Used to ask "which" or "what kind of".\n\nExample: どのシャツが好きですか。 (Which shirt do you like?)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Japanese_clothing_shop.jpg/320px-Japanese_clothing_shop.jpg'
			}
		]
	},
	{
		lesson: 17,
		title: 'Lesson 17',
		description: 'Introducing the ない-form of verbs to express prohibition, obligation, and permission. Also covers topic-object shift and deadline expressions.',
		grammarPoints: [
			{
				title: 'Vないでください',
				explanation: 'Used to politely ask someone not to do something.\n\nExample: ここで しゃしんを とらないでください。 (Please don’t take pictures here.)',
				audio: '',
				video: 'https://www.youtube.com/embed/87Q3qH9k-c0',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/No_Smoking_sign_in_Japan.jpg/320px-No_Smoking_sign_in_Japan.jpg'
			},
			{
				title: 'Vなければなりません',
				explanation: 'Used to express obligation or necessity (must do).\n\nExample: くすりを のまなければなりません。 (I must take medicine.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_medicine.jpg/320px-Japanese_medicine.jpg'
			},
			{
				title: 'Vなくてもいいです',
				explanation: 'Used to express that something does not have to be done.\n\nExample: くつを ぬがなくてもいいです。 (You don’t have to take off your shoes.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Japanese_genkan.jpg/320px-Japanese_genkan.jpg'
			},
			{
				title: 'Nは Objectを V',
				explanation: 'Used to shift the object of the sentence into the topic position using は.\n\nExample: くるまは もう なおしました。 (As for the car, I’ve already fixed it.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Japanese_car_repair.jpg/320px-Japanese_car_repair.jpg'
			},
			{
				title: 'までに',
				explanation: 'Used to express a deadline (by a certain time).\n\nExample: ５じまでに かえってください。 (Please come home by 5 o’clock.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Japanese_clock.jpg/320px-Japanese_clock.jpg'
			}
		]
	},
	{
		lesson: 18,
		title: 'Lesson 18',
		description: 'Using the dictionary form of verbs to express ability, hobbies, and sequencing actions. Also introduces expressions like "before doing", "not easily", and "by all means".',
		grammarPoints: [
			{
				title: 'Verb Dictionary Form (Group 1, 2, 3)',
				explanation: 'Verbs are grouped into three categories when converting to dictionary form:\n\nGroup 1 (Godan): Change the final い-sound of the ます-stem to its corresponding う-sound.\nExample: のみます → のむ (to drink)\n\nGroup 2 (Ichidan): Drop ます and add る.\nExample: たべます → たべる (to eat)\n\nGroup 3 (Irregular):\nします → する (to do)\nきます → くる (to come)',
				audio: '',
				video: 'https://www.youtube.com/embed/97U_GGAhJig',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Japanese_verb_chart.jpg/320px-Japanese_verb_chart.jpg'
			},
			{
				title: 'Noun が できます / Verb Dictionary Form + ことが できます',
				explanation: 'Used to express ability or possibility.\n\nExample: ピアノが できます。 (I can play the piano.)\nExample: 日本語を 話すことが できます。 (I can speak Japanese.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_piano_lesson.jpg/320px-Japanese_piano_lesson.jpg'
			},
			{
				title: 'わたしの しゅみは Noun / Verb Dictionary Form + こと です',
				explanation: 'Used to express hobbies.\n\nExample: わたしの しゅみは おんがくを きくこと です。 (My hobby is listening to music.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Japanese_music_hobby.jpg/320px-Japanese_music_hobby.jpg'
			},
			{
				title: 'Verb Dictionary Form / Noun の / Time + まえに、Verb',
				explanation: 'Used to express doing something before another action or time.\n\nExample: ねるまえに、ほんを よみます。 (I read a book before going to bed.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Japanese_bedtime_reading.jpg/320px-Japanese_bedtime_reading.jpg'
			},
			{
				title: 'なかなか + Negative Verb',
				explanation: 'Used to express that something is not easily done.\n\nExample: なかなか 日本語が 上手に なりません。 (I don’t improve at Japanese easily.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Japanese_study_desk.jpg/320px-Japanese_study_desk.jpg'
			},
			{
				title: 'ぜひ',
				explanation: 'Used to strongly encourage or express eagerness (by all means / definitely).\n\nExample: ぜひ あそびに きてください。 (Please come visit us by all means.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Japanese_invitation.jpg/320px-Japanese_invitation.jpg'
			}
		]
	},
	{
		lesson: 19,
		title: 'Lesson 19',
		description: 'Using the た-form of verbs to express past experiences, list actions, and describe changes in state using なります.',
		grammarPoints: [
			{
				title: 'Verb た-form + ことが あります',
				explanation: 'Used to express past experiences — something you have done before.\n\nExample: 日本へ 行ったことが あります。 (I have been to Japan.)',
				audio: '',
				video: 'https://www.youtube.com/embed/U7mK1Q8sb3c',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Japan_travel_photo.jpg/320px-Japan_travel_photo.jpg'
			},
			{
				title: 'Verb た-form + り、Verb た-form + り します',
				explanation: 'Used to list representative actions in no particular order.\n\nExample: 日曜日は テニスを したり、えいがを 見たり します。 (On Sundays, I do things like play tennis and watch movies.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_weekend_activities.jpg/320px-Japanese_weekend_activities.jpg'
			},
			{
				title: 'い-adjective (～く) なります / な-adjective・Noun (～に) なります',
				explanation: 'Used to express change in state — “to become.”\n\nExample: さむく なります。 (It becomes cold.)\nExample: げんきに なります。 (I become healthy.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Japanese_season_change.jpg/320px-Japanese_season_change.jpg'
			}
		]
	},
	{
		lesson: 20,
		title: 'Lesson 20',
		description: 'Introducing informal speech patterns, expressing needs and opinions, and using explanatory tone with ～んです.',
		grammarPoints: [
			{
				title: '～が いります',
				explanation: 'Used to express that something is needed.\n\nExample: ビザが いります。 (I need a visa.)',
				audio: '',
				video: 'https://www.youtube.com/embed/fYBHxGw185A',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Japanese_visa_application.jpg/320px-Japanese_visa_application.jpg'
			},
			{
				title: '～と おもいます / ～と かんがえます',
				explanation: 'Used to express opinions or thoughts.\n\nExample: 日本は 物価が 高いと おもいます。 (I think prices are high in Japan.)',
				audio: '',
				video: 'https://www.youtube.com/embed/41C0KBZNZY4',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Japanese_thinking.jpg/320px-Japanese_thinking.jpg'
			},
			{
				title: '～んです',
				explanation: 'Used to explain a situation or give a reason (explanatory tone).\n\nExample: おなかが いたいんです。 (The thing is, I have a stomachache.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Japanese_explanation.jpg/320px-Japanese_explanation.jpg'
			},
			{
				title: '～けど',
				explanation: 'Used to connect contrasting ideas (like “but”).\n\nExample: すきですけど、たかいです。 (I like it, but it’s expensive.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Japanese_contrast.jpg/320px-Japanese_contrast.jpg'
			},
			{
				title: 'どっち / こっち / そっち / あっち',
				explanation: 'Informal directional pronouns used in casual speech.\n\nExample: どっちが いい？ (Which one do you prefer?)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Japanese_directions.jpg/320px-Japanese_directions.jpg'
			},
			{
				title: 'ぼく / きみ / ～くん',
				explanation: 'Informal pronouns and name suffixes used in casual conversation.\n\nExample: ぼくは きみが すきです。 (I like you.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Japanese_friends.jpg/320px-Japanese_friends.jpg'
			}
		]
	},
	{
		lesson: 21,
		title: 'Lesson 21',
		description: 'Expressing opinions, quoting speech, confirming information, and describing events using the plain form.',
		grammarPoints: [
			{
				title: 'Plain form + と思います',
				explanation: 'Used to express one’s opinion or thoughts.\n\nExample: あした 雨が ふると おもいます。 (I think it will rain tomorrow.)',
				audio: '',
				video: 'https://www.youtube.com/embed/41C0KBZNZY4',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Japanese_thinking.jpg/320px-Japanese_thinking.jpg'
			},
			{
				title: 'Plain form + と言います',
				explanation: 'Used to quote what someone said (direct or indirect speech).\n\nExample: たなかさんは「いきます」と 言いました。 (Mr. Tanaka said, “I’m going.”)',
				audio: '',
				video: 'https://www.youtube.com/embed/AV6x-QsjjyE',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Japanese_conversation.jpg/320px-Japanese_conversation.jpg'
			},
			{
				title: 'Plain form + でしょう',
				explanation: 'Used to express conjecture or seek confirmation (like “probably” or “right?”).\n\nExample: あしたは いい てんきに なるでしょう。 (It will probably be good weather tomorrow.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_weather_forecast.jpg/320px-Japanese_weather_forecast.jpg'
			},
			{
				title: 'Placeで Eventが あります',
				explanation: 'Used to say that an event will take place at a location.\n\nExample: こうえんで おまつりが あります。 (There will be a festival at the park.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Japanese_festival.jpg/320px-Japanese_festival.jpg'
			},
			{
				title: 'Nounでも Verb',
				explanation: 'Used to suggest something casually or give an example.\n\nExample: コーヒーでも のみませんか。 (Would you like to have coffee or something?)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Japanese_cafe.jpg/320px-Japanese_cafe.jpg'
			},
			{
				title: 'Verbないといけません / Verbないと',
				explanation: 'Used to express obligation (must do). The short form ないと is more casual.\n\nExample: はやく いかないと。 (I have to go soon.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Japanese_clock_rush.jpg/320px-Japanese_clock_rush.jpg'
			}
		]
	},
	{
		lesson: 22,
		title: 'Lesson 22',
		description: 'Learning how to modify nouns using plain-form verbs, adjectives, and nouns. This lesson introduces relative clauses and embedded descriptions before nouns.',
		grammarPoints: [
			{
				title: 'Verb (plain form) + noun',
				explanation: 'Used to modify a noun with a verb phrase. The verb comes before the noun it describes.\n\nExample: これは ミラーさんが 作った ケーキです。 (This is the cake Mr. Miller made.)',
				audio: '',
				video: 'https://www.youtube.com/embed/p1Ea31WMCBU',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_cake.jpg/320px-Japanese_cake.jpg'
			},
			{
				title: 'い-adjective + noun',
				explanation: 'Used to modify a noun with an い-adjective.\n\nExample: あたらしい くるま (a new car)',
				audio: '',
				video: 'https://www.youtube.com/embed/L-oDSwx66nE',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Japanese_car.jpg/320px-Japanese_car.jpg'
			},
			{
				title: 'な-adjective + な + noun',
				explanation: 'Used to modify a noun with a な-adjective. な is required between the adjective and noun.\n\nExample: しずかな へや (a quiet room)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Japanese_room.jpg/320px-Japanese_room.jpg'
			},
			{
				title: 'Noun + の + noun',
				explanation: 'Used to modify a noun with another noun.\n\nExample: にほんごの せんせい (a Japanese language teacher)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Japanese_teacher.jpg/320px-Japanese_teacher.jpg'
			},
			{
				title: 'Question word + か わかりません',
				explanation: 'Used to express not knowing something specific.\n\nExample: どこで でんしゃに のるか わかりません。 (I don’t know where to get on the train.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Japanese_train_map.jpg/320px-Japanese_train_map.jpg'
			}
		]
	},
	{
		lesson: 23,
		title: 'Lesson 23',
		description: 'Learning how to describe time-related conditions, natural consequences, and states using とき, と, and が. Also covers movement verbs with を.',
		grammarPoints: [
			{
				title: 'Verb (dictionary/た-form) + とき、～',
				explanation: 'Used to express “when A happens, B happens.”\n- Dictionary form: action not yet completed\n- た-form: action already completed\n\nExample: つかれるとき、コーヒーを のみます。 (When I get tired, I drink coffee.)',
				audio: '',
				video: 'https://www.youtube.com/embed/psYYFbfxxWI',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Japanese_coffee_break.jpg/320px-Japanese_coffee_break.jpg'
			},
			{
				title: 'Verb (dictionary form) + と、～',
				explanation: 'Used to express natural consequences or automatic results.\n\nExample: はるに なると、さくらが さきます。 (When spring comes, cherry blossoms bloom.)',
				audio: '',
				video: 'https://www.youtube.com/embed/HoaHm-z-SS4',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Cherry_blossoms_in_Japan.jpg/320px-Cherry_blossoms_in_Japan.jpg'
			},
			{
				title: 'Noun が adjective/Verb',
				explanation: 'Used to describe a part or feature of something using が.\n\nExample: めが あおいです。 (His eyes are blue.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Japanese_face_features.jpg/320px-Japanese_face_features.jpg'
			},
			{
				title: 'Place を Verb of movement',
				explanation: 'Used to indicate the path or place through which movement occurs.\n\nExample: こうえんを さんぽします。 (I take a walk through the park.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Japanese_park_walk.jpg/320px-Japanese_park_walk.jpg'
			}
		]
	},
	{
		lesson: 24,
		title: 'Lesson 24',
		description: 'Learning how to express giving and receiving actions using あげます, もらいます, and くれます. Also introduces the て-form with these verbs to describe giving/receiving actions.',
		grammarPoints: [
			{
				title: 'N1は N2に N3を あげます',
				explanation: 'Used when the speaker gives something to someone else, or when someone gives something to a third person.\n\nExample: わたしは ともだちに プレゼントを あげました。 (I gave a present to my friend.)',
				audio: '',
				video: 'https://www.youtube.com/embed/ZfwpjIKS08Y',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Japanese_gift.jpg/320px-Japanese_gift.jpg'
			},
			{
				title: 'N1は N2に N3を もらいます',
				explanation: 'Used when the speaker receives something from someone, or when someone receives something from another person.\n\nExample: わたしは せんせいに ほんを もらいました。 (I received a book from my teacher.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_book_gift.jpg/320px-Japanese_book_gift.jpg'
			},
			{
				title: 'N1は わたしに N2を くれます',
				explanation: 'Used when someone gives something to the speaker (わたし). The giver is not the speaker.\n\nExample: ともだちは わたしに プレゼントを くれました。 (My friend gave me a present.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Japanese_friend_gift.jpg/320px-Japanese_friend_gift.jpg'
			},
			{
				title: 'Vて-form + あげます / もらいます / くれます',
				explanation: 'Used to express giving or receiving actions (help, favors, etc.).\n\nExample: わたしは ともだちに にもつを はこんで あげました。 (I carried luggage for my friend.)\nExample: ともだちが わたしに にもつを はこんで くれました。 (My friend carried luggage for me.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Japanese_train_station_assistance.jpg/320px-Japanese_train_station_assistance.jpg'
			}
		]
	},
	{
		lesson: 25,
		title: 'Lesson 25',
		description: 'Learning how to express conditional actions using ～たら, hypothetical situations with ～ても, and emphasizing contrast or limitation using いくら and だけ.',
		grammarPoints: [
			{
				title: '～たら',
				explanation: 'Used to express conditional actions ("if/when") or sequences ("after").\n\nExample: 雨が ふったら、出かけません。 (If it rains, I won’t go out.)\nExample: うちへ 帰ったら、すぐ シャワーを あびます。 (When I get home, I take a shower right away.)',
				audio: '',
				video: 'https://www.youtube.com/embed/61Wq-JxLKrs',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Japanese_rainy_day.jpg/320px-Japanese_rainy_day.jpg'
			},
			{
				title: 'いくら～ても',
				explanation: 'Used to express that something remains unchanged no matter how much effort or condition is applied.\n\nExample: いくら たくさん 食べても、ふとりません。 (No matter how much I eat, I don’t gain weight.)',
				audio: '',
				video: 'https://www.youtube.com/embed/s5c-0Rs8wBg',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Japanese_buffet.jpg/320px-Japanese_buffet.jpg'
			},
			{
				title: '～ても',
				explanation: 'Used to express hypothetical or concessive conditions ("even if").\n\nExample: お金が あっても、買いません。 (Even if I have money, I won’t buy it.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Japanese_wallet.jpg/320px-Japanese_wallet.jpg'
			},
			{
				title: '～だけ',
				explanation: 'Used to express limitation ("only").\n\nExample: 一人だけ 来ました。 (Only one person came.)',
				audio: '',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Japanese_single_guest.jpg/320px-Japanese_single_guest.jpg'
			}
		]
	}
];

const grammarLevels = [
	{
		id: 'n5',
		label: 'N5',
		icon: <BookOpen className="w-8 h-8" />,
		description: 'Beginner grammar for JLPT N5',
		active: true,
	},
	{
		id: 'n4',
		label: 'N4',
		icon: <Star className="w-8 h-8" />,
		description: 'Elementary grammar for JLPT N4',
		active: false,
	},
	{
		id: 'n3',
		label: 'N3',
		icon: <Zap className="w-8 h-8" />,
		description: 'Intermediate grammar for JLPT N3',
		active: false,
	},
	{
		id: 'n2',
		label: 'N2',
		icon: <Target className="w-8 h-8" />,
		description: 'Upper-intermediate grammar for JLPT N2',
		active: false,
	},
	{
		id: 'n1',
		label: 'N1',
		icon: <Pen className="w-8 h-8" />,
		description: 'Advanced grammar for JLPT N1',
		active: false,
	},
];

export default function GrammarN5() {
	const [selectedLevel, setSelectedLevel] = useState('n5');
	const [showVideo, setShowVideo] = useState<{ lesson: number; point: number } | null>(null);
	const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

	// Japanese Themed Background with Wave Animations
	const JapaneseBackground = () => (
		<div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
			<div className="absolute inset-0">
				<svg className="absolute bottom-0 w-full h-24 text-blue-200 dark:text-blue-900" viewBox="0 0 1440 100" preserveAspectRatio="none">
					<path
						d="M0,60 C200,80 300,20 500,40 C700,60 900,20 1100,40 C1300,60 1440,20 1440,60 L1440,100 L0,100 Z"
						fill="currentColor"
						className="animate-wave"
					/>
				</svg>
				<svg className="absolute bottom-0 w-full h-32 text-blue-300 dark:text-blue-800" viewBox="0 0 1440 100" preserveAspectRatio="none">
					<path
						d="M0,40 C150,60 350,10 550,30 C750,50 950,10 1150,30 C1350,50 1440,10 1440,40 L1440,100 L0,100 Z"
						fill="currentColor"
						className="animate-wave animation-delay-2s"
					/>
				</svg>
			</div>
			<div className="sakura-petal left-[10%] top-[-10%]"></div>
			<div className="sakura-petal left-[30%] top-[-20%] animation-delay-2s"></div>
			<div className="sakura-petal left-[50%] top-[-15%] animation-delay-4s"></div>
			<div className="sakura-petal left-[70%] top-[-25%] animation-delay-6s"></div>
			<div className="sakura-petal left-[90%] top-[-10%] animation-delay-8s"></div>
		</div>
	);

	return (
		<div className="min-h-screen bg-blue-50 dark:bg-gray-900 relative overflow-hidden">
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
					@keyframes wave {
						0%, 100% { transform: translateY(0); }
						50% { transform: translateY(-8px); }
					}
					.animate-wave { animation: wave 2s ease-in-out infinite; }
										.animation-delay-2s { animation-delay: 2s; }
					.animation-delay-4s { animation-delay: 4s; }
					.animation-delay-6s { animation-delay: 6s; }
					.animation-delay-8s { animation-delay: 8s; }
				`}
			</style>
			<JapaneseBackground />

			<div className="container mx-auto px-4 py-12 relative z-10">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center mb-12"
				>
					<h1 className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-blue-100">
						JLPT N5 Grammar Lessons
					</h1>
					<p className="mt-4 text-lg text-blue-700 dark:text-blue-300">
						Master beginner-level Japanese grammar with interactive lessons and examples.
					</p>
				</motion.div>

				{/* Level Selection */}
				<div className="flex flex-wrap justify-center gap-4 mb-12">
					{grammarLevels.map((level) => (
						<button
							key={level.id}
							onClick={() => setSelectedLevel(level.id)}
							disabled={!level.active}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
								selectedLevel === level.id
									? 'bg-blue-600 text-white'
									: level.active
									? 'bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-700'
									: 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
							}`}
							aria-label={`Select JLPT ${level.label} level`}
						>
							{level.icon}
							<span>{level.label}</span>
						</button>
					))}
				</div>

				{/* Back Button (Visible when a lesson is selected) */}
				{selectedLesson !== null && (
					<motion.button
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3 }}
						onClick={() => setSelectedLesson(null)}
						className="flex items-center gap-2 mb-8 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
						aria-label="Back to lesson selection"
					>
						<ArrowLeft className="w-5 h-5" />
						<span>Back to Lessons</span>
					</motion.button>
				)}

				{/* Lesson Selection or Grammar Points */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className="grid gap-8"
				>
					{selectedLesson === null ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{lessons.map((lesson) => (
								<motion.div
									key={lesson.lesson}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => setSelectedLesson(lesson.lesson)}
									className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300"
									role="button"
									tabIndex={0}
									aria-label={`Select ${lesson.title}`}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											setSelectedLesson(lesson.lesson);
										}
									}}
								>
									<h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
										{lesson.title}
									</h2>
									<p className="mt-2 text-blue-600 dark:text-blue-300">
										{lesson.description}
									</p>
								</motion.div>
							))}
						</div>
					) : (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
							<h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
								{lessons.find((l) => l.lesson === selectedLesson)?.title}
							</h2>
							<p className="text-blue-600 dark:text-blue-300 mb-6">
								{lessons.find((l) => l.lesson === selectedLesson)?.description}
							</p>
							<div className="space-y-8">
								{lessons
									.find((l) => l.lesson === selectedLesson)
									?.grammarPoints.map((point, index) => (
										<div
											key={index}
											className="border-l-4 border-blue-500 pl-4"
										>
											<h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
												{point.title}
											</h3>
											<p className="mt-2 text-blue-700 dark:text-blue-200 whitespace-pre-line">
												{point.explanation}
											</p>
											{point.image && (
												<img
													src={point.image}
													alt={`${point.title} example`}
													className="mt-4 rounded-lg max-w-full h-auto"
												/>
											)}
											{point.audio && (
												<audio
													controls
													src={point.audio}
													className="mt-4 w-full"
													aria-label={`Audio for ${point.title}`}
												>
													Your browser does not support the audio element.
												</audio>
											)}
											{point.video && (
												<button
													onClick={() =>
														setShowVideo({
															lesson: selectedLesson,
															point: index,
														})
													}
													className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
													aria-label={`Watch video for ${point.title}`}
												>
													<Video className="w-5 h-5" />
													<span>Watch Explanation Video</span>
												</button>
											)}
										</div>
									))}
							</div>
						</div>
					)}
				</motion.div>

				{/* Video Modal */}
				{showVideo && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
						role="dialog"
						aria-label="Video modal"
					>
						<div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
									{
										lessons
											.find((l) => l.lesson === showVideo.lesson)
											?.grammarPoints[showVideo.point]?.title
									}
								</h3>
								<button
									onClick={() => setShowVideo(null)}
									className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
									aria-label="Close video"
								>
									✕
								</button>
							</div>
							<div className="relative pb-[56.25%]">
								<iframe
									src={
										lessons
											.find((l) => l.lesson === showVideo.lesson)
											?.grammarPoints[showVideo.point]?.video
									}
									className="absolute top-0 left-0 w-full h-full rounded-lg"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
									title="Grammar explanation video"
								/>
							</div>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}