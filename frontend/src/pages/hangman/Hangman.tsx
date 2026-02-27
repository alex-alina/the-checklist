import { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Link } from 'react-router';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ArrowLeft, Play, CircleQuestionMark } from 'lucide-react';

const MAX_PENALTY_POINTS = 8;

export const Hangman = () => {
  const [word, setWord] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [letters, setLetters] = useState<Array<string | '?'>>([]);

  const [currentGuess, setCurrentGuess] = useState('');
  const [penaltyPoints, setPenaltyPoints] = useState(0);
  // keep track / history of all guesses and show them to the player
  const handleGameStart = () => {
    const normalizedWord = wordInput.trim().toLowerCase();
    if (!normalizedWord) {
      return;
    }

    setWord(normalizedWord);
    setLetters(Array(normalizedWord.length).fill('?'));
    setPenaltyPoints(0);
    setCurrentGuess('');
    setWordInput('');
  };

  const handleCheckGuess = () => {
    const guess = currentGuess.trim().toLowerCase().charAt(0);
    if (!word || !guess) {
      return;
    }

    const isCorrect = word.includes(guess);
    if (isCorrect) {
      const index = word.indexOf(guess);
      setLetters((currentLetters) => {
        const newLetters = [...currentLetters];
        newLetters[index] = guess;
        return newLetters;
      });
    } else {
      setPenaltyPoints((currentPoints) => currentPoints + 1);
    }

    setCurrentGuess('');
  };

  return (
    <div className="mx-auto max-w-xl my-6 flex flex-col items-center justify-center">
      <Link to="/">
        <PrimaryButton className="w-33 md:w-40">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </PrimaryButton>
      </Link>

      <div className="flex items-center">
        <Input
          value={wordInput}
          placeholder="Choose word"
          onChange={(event) => setWordInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleGameStart();
            }
          }}
        />
        <PrimaryButton
          type="button"
          className="w-44 ml-4 text-xl"
          onClick={() => handleGameStart()}
        >
          <Play className="w-6 h-6 mr-4" />
          Start game
        </PrimaryButton>
      </div>
      <div className="flex items-center">
        <Input
          value={currentGuess}
          placeholder="Guess letter"
          onChange={(event) => setCurrentGuess(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleCheckGuess();
            }
          }}
        />
        <PrimaryButton
          type="button"
          className="w-44 ml-4 text-xl"
          onClick={() => handleCheckGuess()}
        >
          <CircleQuestionMark className="w-6 h-6 mr-2" />
          Check guess
        </PrimaryButton>
      </div>
      <div>
        <p>The game ends when you reach 5 penalty points</p>
        <p>{penaltyPoints}</p>
      </div>
      {penaltyPoints === MAX_PENALTY_POINTS && <div>Game Over</div>}
      {word && (
        <div className="flex text-4xl mt-10">
          {letters.map((letter, index) => {
            return (
              <div
                key={`${letter}-${index}`}
                className="flex items-center justify-center w-14 h-14 border-b-2 border-b-blue-800 mx-3 "
              >
                <span>{letter}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
