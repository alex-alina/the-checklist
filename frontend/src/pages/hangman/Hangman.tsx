import { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Link } from 'react-router';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import {
  ArrowLeft,
  Play,
  CircleQuestionMark,
  MoveDownLeft,
  MoveDownRight,
  Frown,
  Meh,
  Annoyed
} from 'lucide-react';
import clsx from 'clsx';

const MAX_PENALTY_POINTS = 7;

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
    <div className="pt-10 pl-10 bg-linear-to-r from-teal-200 to-teal-500 h-screen">
      <Link to="/">
        <PrimaryButton className="w-33 md:w-40">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </PrimaryButton>
      </Link>
      <div className="mx-auto max-w-xl my-6 py-20 flex flex-col items-center justify-center bg-white/85 border-blue-900 rounded-xl w-fit min-w-4xl">
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

        {penaltyPoints === 0 ? (
          <p className="text-2xl my-8">You have {MAX_PENALTY_POINTS} incorrect guesses allowed</p>
        ) : (
          <p className="text-2xl my-8">
            Oh no, you have {MAX_PENALTY_POINTS - penaltyPoints} incorrect guesses left!
          </p>
        )}

        <div className="flex flex-col text-red-900 border-l-4 border-l-blue-900 px-8 border-t-4 border-t-blue-900 h-50">
          <div className="w-10 h-8 border-r-4 border-r-blue-900"></div>
          <div className="flex justify-center items-center w-20 h-fit">
            {penaltyPoints > 0 && penaltyPoints <= 3 && <Annoyed className="w-14 h-14" />}
            {penaltyPoints > 3 && penaltyPoints <= 6 && <Meh className="w-14 h-14" />}
            {penaltyPoints > 6 && penaltyPoints <= 7 && <Frown className="w-14 h-14" />}
          </div>
          <div className="flex items-center">
            <div
              className={clsx('w-fit h-fit', { 'border-r-2 border-r-red-900': penaltyPoints >= 2 })}
            >
              {penaltyPoints >= 3 && <MoveDownLeft className="w-10 h-10" />}
            </div>
            <div
              className={clsx('w-fit h-fit', { 'border-l-2 border-r-red-900': penaltyPoints >= 2 })}
            >
              {penaltyPoints >= 4 && <MoveDownRight className="w-10 h-10" />}
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-fit h-fit">
              {penaltyPoints >= 5 && <MoveDownLeft className="w-10 h-10" />}
            </div>
            <div className="w-fit h-fit">
              {penaltyPoints >= 6 && <MoveDownRight className="w-10 h-10" />}
            </div>
          </div>
        </div>
        {penaltyPoints === MAX_PENALTY_POINTS && (
          <div className="text-red-900 text-3xl mt-8">Game Over</div>
        )}
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
    </div>
  );
};
