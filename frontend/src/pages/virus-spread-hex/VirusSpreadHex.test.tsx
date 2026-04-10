import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VirusSpreadHex } from './VirusSpreadHex';
import { CELL_COUNT, colors, extractColorName } from './utils';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

const seedTestGame = () => {
  const board = Array.from({ length: CELL_COUNT }, (_, index) =>
    index === 0 ? colors[0] : colors[1]
  );
  window.localStorage.setItem(
    'virus-spread-seeded',
    JSON.stringify({ board, startIndex: 0 })
  );

  return board;
};

const enableTestMode = () => {
  window.history.pushState({}, '', '/?test=1');
};

afterEach(() => {
  window.localStorage.clear();
  window.history.pushState({}, '', '/');
});

describe('VirusSpreadHex replay game', () => {
  it('restores the initial board when replaying', async () => {
    seedTestGame();
    enableTestMode();

    const { container } = render(<VirusSpreadHex />);
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const startCell = container.querySelector('[data-cell-index="0"]');
    expect(startCell).toHaveAttribute('data-color', extractColorName(colors[0]));

    await user.click(
      screen.getByRole('button', { name: new RegExp(extractColorName(colors[1]), 'i') })
    );
    expect(startCell).toHaveAttribute('data-color', extractColorName(colors[1]));

    await user.click(screen.getByRole('button', { name: /replay game/i }));
    expect(startCell).toHaveAttribute('data-color', extractColorName(colors[0]));
  });
});
