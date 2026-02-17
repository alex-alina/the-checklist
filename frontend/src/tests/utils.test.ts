import { shiftWord, shiftWordBack, getRandomInt, codeRandomWord } from '../utils/codeDecodeWords';

describe('codeDecodeWords helpers', () => {
  describe('shiftWord', () => {
    it('shifts a lowercase word forward by the provided key', () => {
      expect(shiftWord('abc', 2)).toBe('cde');
    });

    it('wraps characters from z back to a', () => {
      expect(shiftWord('xyz', 3)).toBe('abc');
    });

    it('leaves non-lowercase characters untouched', () => {
      expect(shiftWord('hello!', 5)).toBe('mjqqt!');
    });
  });

  describe('shiftWordBack', () => {
    it('reverses the shift applied by shiftWord', () => {
      const coded = shiftWord('giraffe', 5);
      expect(shiftWordBack(coded, 5)).toBe('giraffe');
    });

    it('keeps punctuation unchanged while decoding', () => {
      const coded = shiftWord('sos!', 4);
      expect(shiftWordBack(coded, 4)).toBe('sos!');
    });
  });

  describe('getRandomInt', () => {
    it('returns the floored product of Math.random and the max value', () => {
      // jest.spyOn(global.Math, 'random') replaces Math.random with a spy, and
      // mockReturnValue(0.5) forces it to consistently return 0.5.
      const randomSpy = jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
      expect(getRandomInt(10)).toBe(5);
      expect(randomSpy).toHaveBeenCalled();
      randomSpy.mockRestore();
    });
  });

  describe('codeRandomWord', () => {
    it('uses Math.random to pick a word and encoding key', () => {
      // jest.spyOn(global.Math, 'random') lets the test control sequential
      // Math.random() outputs: first 0.1 (to choose a word index) and then
      // 0.4 (to pick the encoding key).
      const randomSpy = jest.spyOn(global.Math, 'random');
      randomSpy.mockReturnValueOnce(0.1).mockReturnValueOnce(0.4);

      const words = ['alpha', 'bravo', 'charlie'];
      const result = codeRandomWord(words);

      expect(result.randomEncodingKey).toBe(4);
      expect(result.codeWord).toBe(shiftWord('alpha', 4));

      randomSpy.mockRestore();
    });
  });
});
