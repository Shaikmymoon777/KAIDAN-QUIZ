import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Smile, ArrowRightCircle, Video } from 'lucide-react';

// Example data for two lessons. You can expand this for all 25 lessons.
const lessons = [
	{
		lesson: 1,
		title: 'Lesson 1',
		description: 'Introducing yourself, basic sentence structure, and using は, です, and か.',
		grammarPoints: [
			{
				title: '～は～です',
				explanation: '「は」 is the topic marker. 「です」 is the polite ending. Together, they form "A is B".\n\nExample: わたしは がくせいです。 (I am a student.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Maneki_Neko_Japan.jpg/320px-Maneki_Neko_Japan.jpg',
				audio: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Ja-%E3%81%AF%E3%81%84%E3%80%82.ogg',
				video: 'https://www.youtube.com/embed/6p9Il_j0zjc',
			},
			{
				title: '～か',
				explanation: '「か」 is a question marker. Add it to the end of a sentence to make a question.\n\nExample: あなたは がくせいですか。 (Are you a student?)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Japanese_School_Girls_in_Uniform.jpg/320px-Japanese_School_Girls_in_Uniform.jpg',
				audio: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Ja-%E3%82%82.ogg',
				video: 'https://www.youtube.com/embed/6p9Il_j0zjc',
			},
		],
	},
	{
		lesson: 2,
		title: 'Lesson 2',
		description: 'Possession, using の, and demonstratives (これ, それ, あれ).',
		grammarPoints: [
			{
				title: '～の',
				explanation: '「の」 shows possession or connection between nouns.\n\nExample: せんせいの ほんです。 (It is the teacher\'s book.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Japanese_bookbinding.jpg/320px-Japanese_bookbinding.jpg',
				audio: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Ja-%E3%81%AE.ogg',
				video: 'https://www.youtube.com/embed/6p9Il_j0zjc',
			},
			{
				title: 'これ・それ・あれ',
				explanation: '「これ」 (this), 「それ」 (that near you), 「あれ」 (that over there) are demonstratives.\n\nExample: これは ほんです。 (This is a book.)',
				image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bookshelf_in_Japan.jpg/320px-Bookshelf_in_Japan.jpg',
				audio: '',
				video: 'https://www.youtube.com/embed/6p9Il_j0zjc',
			},
		],
	},
	// Add more lessons up to 25 as needed
];

const grammarQuiz = [
	{
		question: '「わたし___がくせいです。」Fill in the blank.',
		options: ['は', 'も', 'の'],
		answer: 0,
		explanation: 'The correct answer is は for the topic marker.',
	},
	{
		question: '「せんせい___ほんです。」Fill in the blank.',
		options: ['は', 'も', 'の'],
		answer: 2,
		explanation: 'The correct answer is の for possession.',
	},
	{
		question: '「これ___ほんです。」Fill in the blank.',
		options: ['は', 'も', 'の'],
		answer: 0,
		explanation: 'The correct answer is は for the topic marker.',
	},
];

const grammarLevels = [
	{
		id: 'n5',
		label: 'N5',
		color: 'from-green-300 to-green-500',
		emoji: '🌱',
		description: 'Beginner grammar for JLPT N5',
		active: true,
	},
	{
		id: 'n4',
		label: 'N4',
		color: 'from-blue-300 to-blue-500',
		emoji: '📘',
		description: 'Elementary grammar for JLPT N4',
		active: false,
	},
	{
		id: 'n3',
		label: 'N3',
		color: 'from-yellow-300 to-yellow-500',
		emoji: '🌟',
		description: 'Intermediate grammar for JLPT N3',
		active: false,
	},
	{
		id: 'n2',
		label: 'N2',
		color: 'from-orange-300 to-orange-500',
		emoji: '🔥',
		description: 'Upper-intermediate grammar for JLPT N2',
		active: false,
	},
	{
		id: 'n1',
		label: 'N1',
		color: 'from-red-300 to-red-500',
		emoji: '🧠',
		description: 'Advanced grammar for JLPT N1',
		active: false,
	},
];

export default function GrammarN5() {
	const [quizIndex, setQuizIndex] = useState(0);
	const [selected, setSelected] = useState<number | null>(null);
	const [showExplanation, setShowExplanation] = useState(false);
	const [score, setScore] = useState(0);
	const [selectedLevel, setSelectedLevel] = useState('n5');
	const [showVideo, setShowVideo] = useState<{ lesson: number; point: number } | null>(null);
	const [selectedLesson, setSelectedLesson] = useState(0);

	const handleSelect = (idx: number) => {
		setSelected(idx);
		setShowExplanation(true);
		if (idx === grammarQuiz[quizIndex].answer) setScore(s => s + 1);
	};

	const nextQuestion = () => {
		setQuizIndex(i => i + 1);
		setSelected(null);
		setShowExplanation(false);
	};

	return (
		<div
			className="w-full min-h-screen flex flex-col items-center justify-center"
			style={{
				background: "linear-gradient(120deg, #f0f9ff 0%, #f3e8ff 100%)",
				minHeight: "100vh",
			}}
		>
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7 }}
				className="w-full max-w-6xl px-2 py-8"
			>
				{/* Header */}
				<div className="flex flex-col items-center mb-10">
					<motion.div
						initial={{ scale: 0.8, rotate: -10 }}
						animate={{ scale: 1, rotate: 0 }}
						transition={{ type: "spring", stiffness: 200 }}
						className="mb-4"
					>
						<Smile className="w-20 h-20 text-pink-400 drop-shadow-lg" />
					</motion.div>
					<motion.h1
						className="text-5xl font-extrabold text-indigo-700 mb-2 drop-shadow"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						JLPT Grammar Fun!
					</motion.h1>
					<motion.p
						className="text-2xl text-indigo-600 text-center"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<span className="font-semibold text-pink-600">Learn and test your Japanese grammar with color and fun!</span>
					</motion.p>
				</div>

				{/* Level Selector */}
				<div className="flex justify-center gap-4 mb-10 flex-wrap">
					{grammarLevels.map(level => (
						<motion.button
							key={level.id}
							whileHover={level.active ? { scale: 1.08, rotate: 3 } : {}}
							whileTap={level.active ? { scale: 0.96 } : {}}
							disabled={!level.active}
							onClick={() => setSelectedLevel(level.id)}
							className={`
                px-6 py-4 rounded-2xl font-bold flex flex-col items-center shadow-md border-2 transition-all duration-200
                ${selectedLevel === level.id
								? 'bg-white ring-2 ring-pink-400 border-pink-200'
								: 'bg-pink-50 hover:bg-white hover:shadow-xl border-transparent'
							}
                ${!level.active ? 'opacity-50 cursor-not-allowed' : ''}
              `}
						>
							<span className={`text-3xl mb-1`}>{level.emoji}</span>
							<span className="text-xl">{level.label}</span>
							<span className="text-xs text-pink-500">{level.description}</span>
							{!level.active && (
								<span className="text-xs text-gray-400 mt-1">Coming soon</span>
							)}
						</motion.button>
					))}
				</div>

				{/* Lesson Selector */}
				{selectedLevel === 'n5' && (
					<div className="flex flex-wrap gap-2 justify-center mb-8">
						{lessons.map((lesson, idx) => (
							<button
								key={lesson.lesson}
								className={`px-4 py-2 rounded-lg font-bold border-2 transition-all duration-200
                  ${selectedLesson === idx
									? 'bg-pink-500 text-white border-pink-600'
									: 'bg-white text-pink-600 border-pink-200 hover:bg-pink-100'
								}
                `}
								onClick={() => setSelectedLesson(idx)}
							>
								{lesson.title}
							</button>
						))}
					</div>
				)}

				{/* Grammar Section for Selected Lesson */}
				{selectedLevel === 'n5' && (
					<section className="mb-12">
						<motion.h2
							className="text-3xl font-bold mb-8 flex items-center gap-2 text-green-700"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
						>
							<Sparkles className="w-8 h-8 text-yellow-400" />
							{lessons[selectedLesson].title} Grammar Points
						</motion.h2>
						<div className="mb-6 text-lg text-indigo-700 text-center">{lessons[selectedLesson].description}</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
							{lessons[selectedLesson].grammarPoints.map((point, i) => (
								<motion.div
									key={i}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 + i * 0.1 }}
									whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)" }}
									className="bg-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center p-6 gap-6 border-4 border-pink-100 hover:border-pink-300 transition-all"
								>
									<div className="flex-shrink-0 flex flex-col items-center">
										<img
											src={point.image}
											alt={point.title}
											className="w-32 h-32 object-contain rounded-2xl border-4 border-pink-200 bg-white shadow-lg mb-2"
											style={{ background: "#fff" }}
											onError={e => (e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Maneki_Neko_Japan.jpg')}
										/>
										<div className="flex gap-2 mt-2">
											{point.audio && (
												<audio controls src={point.audio} className="w-24">
													Your browser does not support the audio element.
												</audio>
											)}
											{point.video && (
												<button
													className="ml-2 p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition"
													title="Show Video"
													onClick={() =>
														setShowVideo(
															showVideo &&
															showVideo.lesson === selectedLesson &&
															showVideo.point === i
																? null
																: { lesson: selectedLesson, point: i }
														)
													}
												>
													<Video className="w-6 h-6 text-pink-500" />
												</button>
											)}
										</div>
									</div>
									<div className="flex-1 flex flex-col justify-center">
										<div className="font-bold text-lg text-pink-700 mb-2">{point.title}</div>
										<div className="text-gray-700 text-lg mb-2 whitespace-pre-line">{point.explanation}</div>
										{showVideo &&
											showVideo.lesson === selectedLesson &&
											showVideo.point === i &&
											point.video && (
												<div className="mt-4">
													<div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg border-2 border-indigo-200">
														<iframe
															src={point.video}
															title="Grammar Video"
															allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
															allowFullScreen
															className="absolute top-0 left-0 w-full h-full"
														/>
													</div>
												</div>
											)}
									</div>
								</motion.div>
							))}
						</div>
					</section>
				)}

				{/* Quiz Section */}
				{selectedLevel === 'n5' && (
					<section>
						<motion.h2
							className="text-3xl font-bold mb-8 flex items-center gap-2 text-indigo-700"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
						>
							<BookOpen className="w-8 h-8 text-pink-400" />
							Mini Grammar Quiz
						</motion.h2>
						<div className="relative flex justify-center">
							<AnimatePresence>
								{quizIndex < grammarQuiz.length ? (
									<motion.div
										key={quizIndex}
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -30 }}
										transition={{ duration: 0.4 }}
										className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-xl"
									>
										<div className="mb-6 font-semibold text-indigo-800 text-xl text-center">{grammarQuiz[quizIndex].question}</div>
										<div className="space-y-4">
											{grammarQuiz[quizIndex].options.map((opt, idx) => (
												<motion.button
													key={idx}
													whileHover={selected === null ? { scale: 1.04, backgroundColor: "#f3e8ff" } : {}}
													whileTap={selected === null ? { scale: 0.97 } : {}}
													className={`block w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 font-semibold text-lg
                            ${
																	selected === idx
																		? idx === grammarQuiz[quizIndex].answer
																			? 'bg-green-100 border-green-400 text-green-700'
																			: 'bg-red-100 border-red-400 text-red-700'
																		: 'bg-indigo-50 border-indigo-200 hover:bg-pink-50'
																}
                          `}
													disabled={selected !== null}
													onClick={() => handleSelect(idx)}
												>
													{opt}
												</motion.button>
											))}
										</div>
										{showExplanation && (
											<motion.div
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												className="mt-6 p-4 rounded-xl bg-pink-50 text-pink-800 text-lg text-center"
											>
												{grammarQuiz[quizIndex].explanation}
											</motion.div>
										)}
										{showExplanation && quizIndex < grammarQuiz.length - 1 && (
											<motion.button
												whileHover={{ scale: 1.05, backgroundColor: "#a5b4fc" }}
												whileTap={{ scale: 0.97 }}
												className="mt-8 px-8 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 flex items-center gap-2 text-lg mx-auto"
												onClick={nextQuestion}
											>
												Next <ArrowRightCircle className="w-6 h-6" />
											</motion.button>
										)}
										{showExplanation && quizIndex === grammarQuiz.length - 1 && (
											<motion.div
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												className="mt-8 font-bold text-indigo-700 flex items-center gap-2 text-xl justify-center"
											>
												<Sparkles className="w-6 h-6 text-yellow-400" />
												Quiz Finished! Your score: {score} / {grammarQuiz.length}
											</motion.div>
										)}
									</motion.div>
								) : (
									<motion.div
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										className="text-2xl font-bold text-indigo-700 bg-white rounded-3xl shadow-2xl p-10 flex items-center gap-2 justify-center"
									>
										<Sparkles className="w-8 h-8 text-yellow-400" />
										Quiz Finished! Your score: {score} / {grammarQuiz.length}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</section>
				)}

				{/* Placeholder for other levels */}
				{selectedLevel !== 'n5' && (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						className="mt-20 text-center"
					>
						<div className="inline-block bg-gradient-to-br from-pink-100 to-indigo-100 rounded-3xl px-16 py-20 shadow-2xl">
							<div className="text-6xl mb-4">{grammarLevels.find(l => l.id === selectedLevel)?.emoji}</div>
							<div className="text-3xl font-bold text-pink-600 mb-2">
								{grammarLevels.find(l => l.id === selectedLevel)?.label} Grammar
							</div>
							<div className="text-xl text-indigo-700 mb-2">
								{grammarLevels.find(l => l.id === selectedLevel)?.description}
							</div>
							<div className="text-pink-400 font-semibold text-lg">Coming soon! 🚧</div>
						</div>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
}