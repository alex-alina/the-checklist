// import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';
import { Card } from './ui/Card';
import { PrimaryButton } from './ui/PrimaryButton';
import { Link } from 'react-router';
import bgPlants from '../assets/bgPlants.jpg';
import { ComponentPropsWithoutRef, useState } from 'react';

interface CellProps extends ComponentPropsWithoutRef<'button'> {
  cellValue: string | null;
}

interface RowProps extends ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
}

const Cell = ({ cellValue, ...props }: CellProps) => {
  return (
    <button
      className="w-18 h-18 text-3xl text-green-950 border border-blue-900 rounded-sm hover:bg-green-200"
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
  const [squares, setSquares] = useState(Array(9).fill(null));

  function handleClick(i: number) {
    if (squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  const nextPlayer = xIsNext ? 'X' : 'O';

  return (
    <div
      className="bg-no-repeat bg-center bg-cover w-full h-screen p-6 flex flex-col"
      style={{ backgroundImage: `url(${bgPlants})` }}
    >
      <Link to="/">
        <PrimaryButton type="submit" className="w-40">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </PrimaryButton>
      </Link>
      <Card className="w-80 sm:w-120 pt-10 pb-20 px-4 mt-10 flex flex-col justify-center items-center">
        <div className="mb-4">
          <p>Next turn is: {nextPlayer}</p>
          <p>Winner:</p>
        </div>
        <div>
          <Row>
            <Cell cellValue={squares[0]} onClick={() => handleClick(0)} />
            <Cell cellValue={squares[1]} onClick={() => handleClick(1)} />
            <Cell cellValue={squares[2]} onClick={() => handleClick(2)} />
          </Row>
          <Row>
            <Cell cellValue={squares[3]} onClick={() => handleClick(3)} />
            <Cell cellValue={squares[4]} onClick={() => handleClick(4)} />
            <Cell cellValue={squares[5]} onClick={() => handleClick(5)} />
          </Row>
          <Row>
            <Cell cellValue={squares[6]} onClick={() => handleClick(6)} />
            <Cell cellValue={squares[7]} onClick={() => handleClick(7)} />
            <Cell cellValue={squares[8]} onClick={() => handleClick(8)} />
          </Row>
        </div>
      </Card>
    </div>
  );
};
