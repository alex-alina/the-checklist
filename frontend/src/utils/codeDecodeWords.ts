// will only receive lower case strings
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
export const shiftWordBack = (word: string, key: number) => {
  return word
    .split('')
    .map((char) => {
      if (char < 'a' || char > 'z') {
        return char;
      }

      const base = 'a'.charCodeAt(0);
      const offset = char.charCodeAt(0) - base;
      const adjusted = (26 + offset - key) % 26;

      return String.fromCharCode(base + adjusted);
    })
    .join('');
};

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export const codeRandomWord = (words: Array<string>) => {
  const index = Math.floor(Math.random() * words.length);
  const selectedWord = words[index];
  //the encoding key will be a random number between 1-9
  const randomEncodingKey = getRandomInt(9) + 1;
  const codeWord = shiftWord(selectedWord, randomEncodingKey);
  return { codeWord, randomEncodingKey };
};
