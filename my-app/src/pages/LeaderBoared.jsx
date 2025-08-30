import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "https://opentdb.com/api.php?amount=10&category=18&type=multiple";

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const qz = data.results.map((q) => ({
          ...q,
          answers: shuffleArray([q.correct_answer, ...q.incorrect_answers]),
        }));
        setQuestions(qz);
      });
  }, []);

  const currentQuestion = questions[current];

  const handleAnswer = (answer) => {
    setSelected(answer);
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    setSelected(null);
    setShowAnswer(false);
    setCurrent((prev) => prev + 1);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center text-white text-xl">
        Loading Questions...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center px-4 py-8">
      <motion.div
        className="bg-white/30 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 max-w-2xl w-full text-white"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 160 }}
      >
        <h2 className="text-xl font-semibold mb-6 text-white/90">
          Question {current + 1} of {questions.length}
        </h2>
        <h1
          className="text-lg font-medium mb-6 text-white"
          dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
        />

        <div className="grid gap-4">
          {currentQuestion.answers.map((ans, i) => {
            const isCorrect = ans === currentQuestion.correct_answer;
            const isWrong = selected === ans && !isCorrect;
            return (
              <motion.button
                key={i}
                disabled={showAnswer}
                onClick={() => handleAnswer(ans)}
                className={`py-3 px-4 rounded-xl transition-all text-left
                  ${
                    showAnswer
                      ? isCorrect
                        ? "bg-green-500/80 text-white"
                        : isWrong
                        ? "bg-red-500/80 text-white"
                        : "bg-white/20 text-white/80"
                      : "bg-white/20 hover:bg-white/30 text-white/80"
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                dangerouslySetInnerHTML={{ __html: ans }}
              />
            );
          })}
        </div>

        {showAnswer && (
          <div className="mt-6 flex justify-end">
            <motion.button
              onClick={nextQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {current === questions.length - 1 ? "Finish Quiz" : "Next"}
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
