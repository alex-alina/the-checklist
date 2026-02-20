import clsx from 'clsx';
import { ArrowLeft, RefreshCwIcon } from 'lucide-react';
import { Card } from './ui/Card';
import { PrimaryButton } from './ui/PrimaryButton';
import { Link } from 'react-router';
import bgPlants from '../assets/bgPlants.jpg';
import { ComponentPropsWithoutRef, useState } from 'react';

let winningIndexes: Array<number>;

function calculateWinner(cells: Array<'X' | 'O' | null>) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      winningIndexes = lines[i];
      return cells[a];
    }
  }

  return null;
}
interface CellProps extends ComponentPropsWithoutRef<'button'> {
  cellValue: string | null;
  isWinnerCell?: boolean;
}

interface RowProps extends ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
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

export const TicTacToe = () => {
  const [xIsNext, setXIsNext] = useState(true);
  const [cells, setCells] = useState<Array<'X' | 'O' | null>>(Array(9).fill(null));
  const [moves, setMoves] = useState(0);

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
    setCells(nextSquares);
    setXIsNext(!xIsNext);
    setMoves((moves) => moves + 1);
  }

  const winner = calculateWinner(cells);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <div
      className="bg-no-repeat bg-center bg-cover w-full h-screen py-10 sm:py-15 flex flex-col"
      style={{ backgroundImage: `url(${bgPlants})` }}
    >
      <div className="w-80 md:w-120 flex justify-between mx-auto xl:ml-30 xl:mx-0">
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
      <Card className="w-80 md:w-120 mx-auto xl:ml-30 xl:mx-0 pt-5 md:pt-10 pb-10 md:pb-20 px-2 md:px-4 mt-10 flex flex-col justify-center items-center">
        <div className="mb-4 text-blue-900 text-2xl">
          {moves === 9 ? <p>Game ended in a draw</p> : <p>{status}</p>}
        </div>
        <div>
          <Row>
            <Cell
              cellValue={cells[0]}
              onClick={() => handleClick(0)}
              isWinnerCell={winningIndexes?.includes(0)}
            />
            <Cell
              cellValue={cells[1]}
              onClick={() => handleClick(1)}
              isWinnerCell={winningIndexes?.includes(1)}
            />
            <Cell
              cellValue={cells[2]}
              onClick={() => handleClick(2)}
              isWinnerCell={winningIndexes?.includes(2)}
            />
          </Row>
          <Row>
            <Cell
              cellValue={cells[3]}
              onClick={() => handleClick(3)}
              isWinnerCell={winningIndexes?.includes(3)}
            />
            <Cell
              cellValue={cells[4]}
              onClick={() => handleClick(4)}
              isWinnerCell={winningIndexes?.includes(4)}
            />
            <Cell
              cellValue={cells[5]}
              onClick={() => handleClick(5)}
              isWinnerCell={winningIndexes?.includes(5)}
            />
          </Row>
          <Row>
            <Cell
              cellValue={cells[6]}
              onClick={() => handleClick(6)}
              isWinnerCell={winningIndexes?.includes(6)}
            />
            <Cell
              cellValue={cells[7]}
              onClick={() => handleClick(7)}
              isWinnerCell={winningIndexes?.includes(7)}
            />
            <Cell
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
