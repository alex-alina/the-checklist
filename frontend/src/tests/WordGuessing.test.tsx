import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WordGuess } from '../components/WordGuessing';
import * as codeWords from '../utils/codeDecodeWords';
import { codeGamePrizes } from '../utils/constants';

const codeRandomWordSpy = jest.spyOn(codeWords, 'codeRandomWord');
const getRandomIntSpy = jest.spyOn(codeWords, 'getRandomInt');

describe('WordGuess', () => {
  beforeEach(() => {
    codeRandomWordSpy.mockReset();
    getRandomIntSpy.mockReset();
  });

  afterAll(() => {
    codeRandomWordSpy.mockRestore();
    getRandomIntSpy.mockRestore();
  });

  it('renders the coded word', () => {
    codeRandomWordSpy.mockReturnValue({ codeWord: 'coded', randomEncodingKey: 2 });
    getRandomIntSpy.mockReturnValue(1);

    render(<WordGuess />);

    expect(screen.getByText('coded')).toBeInTheDocument();
  });

  it('loads the giant word when Final Boss is clicked', () => {
    codeRandomWordSpy.mockReturnValue({ codeWord: 'start', randomEncodingKey: 1 });
    getRandomIntSpy.mockReturnValue(0);
    const expectedBossWord = codeWords.shiftWord('floccinaucinihilipilification', 3);

    render(<WordGuess />);

    fireEvent.click(screen.getByRole('button', { name: /final boss/i }));

    expect(screen.getByText(expectedBossWord)).toBeInTheDocument();
  });

  it('shows the success view when the decoded text matches', async () => {
    const encoded = codeWords.shiftWord('alpha', 4);
    codeRandomWordSpy.mockReturnValue({ codeWord: encoded, randomEncodingKey: 4 });
    getRandomIntSpy.mockReturnValue(2);
    const decoded = codeWords.shiftWordBack(encoded, 4);

    render(<WordGuess />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/start decoding/i), decoded);

    expect(screen.getByText(/Amazing job!/i)).toBeInTheDocument();
    expect(screen.getByText(codeGamePrizes[2].text)).toBeInTheDocument();
  });
});
