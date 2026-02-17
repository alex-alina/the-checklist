import { useState } from 'react';
import { Input } from './ui/Input';
import { PrimaryButton } from './ui/PrimaryButton';
import { codeRandomWord, getRandomInt, shiftWord, shiftWordBack } from '../utils/codeDecodeWords';
import { codeGamePrizes, FUNNY_WORDS } from '../utils/constants';
import { Card } from './ui/Card';

const THE_BIG_WORD = 'floccinaucinihilipilification';
const BIG_WORD_KEY = 3;
const CODED_BIG_WORD = shiftWord(THE_BIG_WORD, BIG_WORD_KEY);

export const WordGuess = () => {
  const initialCodeSet = codeRandomWord(FUNNY_WORDS);
  const { codeWord, randomEncodingKey } = initialCodeSet;

  const [decodedWord, setDecodedWord] = useState('');
  const [codedWord, setCodedWord] = useState(codeWord);
  const [secretEncodingKey, setSecretEncodyingKey] = useState<number>(randomEncodingKey);

  const isDecodedCorrectly = decodedWord === shiftWordBack(codedWord, secretEncodingKey);

  const randomIndex = getRandomInt(3);
  const { img, text } = codeGamePrizes[randomIndex];

  return (
    <div>
      <Card className="px-10 py-4 m-5">
        Work on to do&apos;s &#128170;... or break the code to win a prize! &#127881;
      </Card>
      <Card className="m-5">
        <div className="flex flex-col justify-center items-center">
          <div className="flex justify-between w-full">
            <PrimaryButton
              onClick={() => {
                setCodedWord(CODED_BIG_WORD);
                setSecretEncodyingKey(BIG_WORD_KEY);
                setDecodedWord('');
              }}
              className="h-10 w-28 sm:w-30 ml-4 text-sm lg:text-lg bg-teal-700"
            >
              Final Boss
            </PrimaryButton>
            <PrimaryButton
              onClick={() => {
                const { codeWord, randomEncodingKey } = codeRandomWord(FUNNY_WORDS);
                setCodedWord(codeWord);
                setSecretEncodyingKey(randomEncodingKey);
                setDecodedWord('');
              }}
              className="h-10 w-28 sm:w-30 ml-4 text-sm lg:text-lg"
            >
              New code
            </PrimaryButton>
          </div>
          <h3 className="w-full flex items-center justify-center text-lg sm:text-2xl mt-4">
            Coded funny word
          </h3>

          <div className="border rounded-xl border-blue-800 px-5 py-2 flex flex-col text-lg my-7">
            {codedWord}
          </div>
          <div className="text-transparent hidden">{secretEncodingKey}</div>
        </div>

        <label className="flex flex-col mt-2">
          Decode the funny word here:
          <Input
            value={decodedWord}
            onChange={(event) => setDecodedWord(event.target.value)}
            placeholder="Start decoding"
          />
        </label>

        {isDecodedCorrectly && (
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-blue-700 text-2xl my-4">Amazing job!&#127881;</h3>
            <p className="text-center">{text}</p>
            <img src={img} className="w-96 h-fit" />
          </div>
        )}
      </Card>
    </div>
  );
};
