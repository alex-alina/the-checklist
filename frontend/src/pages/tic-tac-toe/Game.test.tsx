import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Game from './Game';

const renderGame = () =>
  render(
    <MemoryRouter>
      <Game />
    </MemoryRouter>
  );

describe('tic-tac-toe Game page', () => {
  test('shows next player prompt before anyone plays', () => {
    renderGame();
    expect(screen.getByText('Next player: X')).toBeInTheDocument();
  });

  test('declares X as the winner when the final column closes on the last move', async () => {
    const user = userEvent.setup();
    renderGame();

    const clickOrder = [0, 1, 2, 3, 5, 4, 7, 6, 8];
    for (const index of clickOrder) {
      await act(async () => {
        await user.click(screen.getByTestId(`cell-${index}`));
      });
    }

    await waitFor(() => {
      expect(screen.queryByText('Game ended in a draw')).toBeNull();
      expect(screen.getByText('Winner: X')).toBeInTheDocument();
    });
  });

  test('shows a draw message when the board is full and no one wins', async () => {
    const user = userEvent.setup();
    renderGame();

    const clickOrder = [0, 1, 2, 6, 3, 4, 7, 5, 8];
    for (const index of clickOrder) {
      await act(async () => {
        await user.click(screen.getByTestId(`cell-${index}`));
      });
    }

    await waitFor(() => {
      expect(screen.getByText('Game ended in a draw')).toBeInTheDocument();
      expect(screen.queryByText('Winner:')).toBeNull();
    });
  });
});
