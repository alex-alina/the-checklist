import { useState } from 'react';
import { Input } from './ui/Input';
import { PrimaryButton } from './ui/PrimaryButton';
import capibara from '../assets/capibara.jpg';

export const shiftWord = (word: string, key: number) => {
  const shift = key % 26;

  return word
    .split('')
    .map((char) => {
      if (char < 'a' || char > 'z') {
        return char;
      }

      const base = 'a'.charCodeAt(0);
      const offset = char.charCodeAt(0) - base;
      const adjusted = (offset + shift) % 26;

      return String.fromCharCode(base + adjusted);
    })
    .join('');
};

const FUNNY_WORDS = [
  'satsuma',
  'baboon',
  'hullabaloo',
  'sozzled',
  'bamboozled',
  'flabbergast',
  'blubber',
  'gobbledygook',
  'flummoxed',
  'mollycoddle',
  'gibberish',
  'dingus',
  'squeegee',
  'hoodwink'
];
const CODED_FUNNY_WORDS = FUNNY_WORDS.map((word) => shiftWord(word, 3));

export const randomWordSelector = () => {
  const index = Math.floor(Math.random() * CODED_FUNNY_WORDS.length);
  return CODED_FUNNY_WORDS[index];
};

// const THE_BIG_WORD = 'floccinaucinihilipilification';
// const THE_CODED_BIG_WORD = shiftWord(THE_BIG_WORD, 3);

export const WordGuess = () => {
  const [decodedWord, setDecodedWord] = useState('');
  const [codedWord, setCodedWord] = useState(CODED_FUNNY_WORDS[0]);
  const [wordIndex, setWordIndex] = useState(0);

  const isDecodedCorrectly = decodedWord === FUNNY_WORDS[wordIndex];
  console.log('indexxxx', wordIndex);

  return (
    <div>
      <div className="border rounded-xl border-blue-800 px-10 py-4 flex flex-col text-lg m-5">
        Work on your to do&apos;s... or break the code and win a prize! &#127881;
      </div>
      <div className="border rounded-xl border-blue-800 p-10 flex flex-col text-lg m-5">
        <div className="flex flex-col justify-center items-center">
          <div className="w-full flex items-center justify-between">
            <div className="text-lg sm:text-2xl">Decode the funny word below</div>
            <PrimaryButton
              onClick={() => {
                const newcodedWord = randomWordSelector();
                const newIndex = CODED_FUNNY_WORDS.indexOf(newcodedWord);
                setCodedWord(newcodedWord);
                setWordIndex(newIndex);
              }}
              className="h-10 w-28 sm:w-30 ml-4 text-sm lg:text-lg"
            >
              New code
            </PrimaryButton>
          </div>

          <div className="border rounded-xl border-blue-800 px-5 py-2 flex flex-col text-lg my-7">
            {codedWord}
          </div>
        </div>

        <label className="flex flex-col mt-2">
          Type funny word here:
          <Input
            value={decodedWord}
            onChange={(event) => setDecodedWord(event.target.value)}
            placeholder="Start decoding"
          />
        </label>

        {isDecodedCorrectly && (
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-blue-700 text-2xl my-4">Amazing job! &#127881;</h3>
            <p className="text-center">Have a chuckle and a break with these cute capibaras.</p>
            <img src={capibara} className="w-96 h-fit" />
          </div>
        )}
      </div>
    </div>
  );
};
