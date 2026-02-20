import clsx from 'clsx';
import { ArrowLeft, RefreshCwIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';

import { Link } from 'react-router';
import bgPlants from '../../assets/bgPlants.jpg';
import { ComponentPropsWithoutRef, useState } from 'react';
import { calculateWinner, winningIndexes } from './helpers';

interface CellProps extends ComponentPropsWithoutRef<'button'> {
  cellValue: string | null;
  isWinnerCell?: boolean;
}

interface RowProps extends ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
}

type Cells = Array<'X' | 'O' | null>;

interface BoardProps {
  xIsNext: boolean;
  cells: Cells;
  onPlay: (nextCells: Cells) => void;
  totalMoves: number;
}

const Cell = ({ cellValue, isWinnerCell, ...props }: CellProps) => {
  return (
    <button
      className={clsx(
        'w-18 h-18 text-3xl text-green-950 border border-blue-900 rounded-sm',
        isWinnerCell ? 'bg-blue-300 hover:bg-blue-300' : 'bg-none hover:bg-green-200'
      )}
      {...props}
    >
      {cellValue}
    </button>
  );
};

const Row = ({ children, ...props }: RowProps) => {
  return (
    <div className="flex" {...props}>
      {children}
    </div>
  );
};

const Board = ({ xIsNext, cells, onPlay, totalMoves }: BoardProps) => {
  console.log(totalMoves);
  function handleClick(i: number) {
    if (cells[i] || calculateWinner(cells)) {
      return;
    }
    const nextSquares = cells.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(cells);
  let status;

  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const isDraw = !winner && totalMoves === 9;

  return (
    <div className="w-80 md:w-120 flex flex-col mx-auto md:mx-20">
      <div className="flex justify-between">
        <Link to="/">
          <PrimaryButton className="w-33 md:w-40">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </PrimaryButton>
        </Link>
        <PrimaryButton onClick={() => window.location.reload()} className="w-33 md:w-40">
          <RefreshCwIcon className="w-5 h-5 mr-2" />
          New Game
        </PrimaryButton>
      </div>
      <Card className="bg-[#feecd4] pt-5 md:pt-10 pb-10 md:pb-20 px-2 md:px-4 mt-10 flex flex-col justify-center items-center">
        <div className="mb-4 text-blue-900 text-2xl">
          {isDraw ? <p>Game ended in a draw</p> : <p>{status}</p>}
        </div>
        <div>
          <Row>
            <Cell
              data-testid="cell-0"
              cellValue={cells[0]}
              onClick={() => handleClick(0)}
              isWinnerCell={winningIndexes?.includes(0)}
            />
            <Cell
              data-testid="cell-1"
              cellValue={cells[1]}
              onClick={() => handleClick(1)}
              isWinnerCell={winningIndexes?.includes(1)}
            />
            <Cell
              data-testid="cell-2"
              cellValue={cells[2]}
              onClick={() => handleClick(2)}
              isWinnerCell={winningIndexes?.includes(2)}
            />
          </Row>
          <Row>
            <Cell
              data-testid="cell-3"
              cellValue={cells[3]}
              onClick={() => handleClick(3)}
              isWinnerCell={winningIndexes?.includes(3)}
            />
            <Cell
              data-testid="cell-4"
              cellValue={cells[4]}
              onClick={() => handleClick(4)}
              isWinnerCell={winningIndexes?.includes(4)}
            />
            <Cell
              data-testid="cell-5"
              cellValue={cells[5]}
              onClick={() => handleClick(5)}
              isWinnerCell={winningIndexes?.includes(5)}
            />
          </Row>
          <Row>
            <Cell
              data-testid="cell-6"
              cellValue={cells[6]}
              onClick={() => handleClick(6)}
              isWinnerCell={winningIndexes?.includes(6)}
            />
            <Cell
              data-testid="cell-7"
              cellValue={cells[7]}
              onClick={() => handleClick(7)}
              isWinnerCell={winningIndexes?.includes(7)}
            />
            <Cell
              data-testid="cell-8"
              cellValue={cells[8]}
              onClick={() => handleClick(8)}
              isWinnerCell={winningIndexes?.includes(8)}
            />
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default function Game() {
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState<Array<Cells>>([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const currentCells = history[currentMove];

  function handlePlay(nextCells: Cells) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextCells];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setXIsNext(!xIsNext);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
    setXIsNext(nextMove % 2 === 0);
  }

  const moves = history.map((cells, move) => {
    let description;

    if (move > 0) {
      description = `Go to move # ${move}`;
    } else {
      description = 'Go to game start';
    }

    return (
      <li key={move}>
        <SecondaryButton className="w-40 mb-4" onClick={() => jumpTo(move)}>
          {description}
        </SecondaryButton>
      </li>
    );
  });

  return (
    <div
      className="bg-no-repeat bg-center bg-cover w-full h-screen py-10 sm:py-15 px-2 sm:px-10 flex flex-col md:flex-row"
      style={{ backgroundImage: `url(${bgPlants})` }}
    >
      <Board xIsNext={xIsNext} cells={currentCells} onPlay={handlePlay} totalMoves={currentMove} />
      <Card className="bg-[#feecd4] w-80 sm:w-fit h-fit px-2 py-2 mx-auto my-4 sm:mx-10 flex flex-col justify-center items-center">
        <ol>{moves}</ol>
      </Card>
    </div>
  );
}
