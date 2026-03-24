import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import happyVirus from '../assets/happy-virus.png';

const GRID_SIZE = 20;
const CELL_SIZE_PX = 40;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const colors = ['bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-violet-400'];

type GameSetup = {
  board: string[];
  startingPoint: number;
};

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
const getRandomCellIndex = (cellCount: number) => Math.floor(Math.random() * cellCount);
const extractColorName = (colorClass: string) =>
  colorClass.match(/-([^-]+)-/)?.[1] ?? 'Select colour';

const formatElapsedTime = (seconds: number) => {
  const minutesPart = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secondsPart = (seconds % 60).toString().padStart(2, '0');

  return `${minutesPart}:${secondsPart}`;
};

const getNeighborIndices = (index: number) => {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  const neighbors: number[] = [];

  if (row > 0) neighbors.push(index - GRID_SIZE);
  if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE);
  if (col > 0) neighbors.push(index - 1);
  if (col < GRID_SIZE - 1) neighbors.push(index + 1);

  return neighbors;
};

const getConnectedCells = (board: string[], startIndex: number, color = board[startIndex]) => {
  const connected = new Set<number>();
  const stack = [startIndex];

  while (stack.length > 0) {
    const current = stack.pop();

    if (current === undefined || connected.has(current) || board[current] !== color) {
      continue;
    }

    connected.add(current);

    getNeighborIndices(current).forEach((neighbor) => {
      if (!connected.has(neighbor)) {
        stack.push(neighbor);
      }
    });
  }

  return connected;
};

const buildNewGame = (): GameSetup => {
  return {
    board: Array.from({ length: CELL_COUNT }, getRandomColor),
    startingPoint: getRandomCellIndex(CELL_COUNT)
  };
};

export const VirusSpread = () => {
  const initialGame = useMemo(() => buildNewGame(), []);

  const [cellColors, setCellColors] = useState(() => initialGame.board);
  const [startingPoint, setStartingPoint] = useState(() => initialGame.startingPoint);
  const [stepsTaken, setStepsTaken] = useState(0);
  const [gameStartedAt, setGameStartedAt] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedTimeSeconds, setCompletedTimeSeconds] = useState<number | null>(null);

  const connectedCells = useMemo(
    () => getConnectedCells(cellColors, startingPoint),
    [cellColors, startingPoint]
  );
  const isGameCompleted = connectedCells.size === CELL_COUNT;

  useEffect(() => {
    if (isGameCompleted) {
      if (completedTimeSeconds === null) {
        const finalSeconds = Math.floor((Date.now() - gameStartedAt) / 1000);
        setCompletedTimeSeconds(finalSeconds);
      }
      setElapsedSeconds(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - gameStartedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [completedTimeSeconds, gameStartedAt, isGameCompleted]);

  const handleColorClick = (nextColor: string) => {
    if (isGameCompleted) {
      return;
    }

    const currentColor = cellColors[startingPoint];

    if (currentColor === nextColor) {
      return;
    }

    const currentlyConnected = getConnectedCells(cellColors, startingPoint);
    const updatedColors = [...cellColors];

    currentlyConnected.forEach((cellIndex) => {
      updatedColors[cellIndex] = nextColor;
    });

    setCellColors(updatedColors);
    setStepsTaken((previousSteps) => previousSteps + 1);
  };

  const handleNewGame = () => {
    const nextGame = buildNewGame();

    setCellColors(nextGame.board);
    setStartingPoint(nextGame.startingPoint);
    setStepsTaken(0);
    setGameStartedAt(Date.now());
    setElapsedSeconds(0);
    setCompletedTimeSeconds(null);
  };

  return (
    <div className="flex flex-col justify-center gap-4 md:flex-row md:gap-6">
      <div
        className={clsx('inline-grid gap-0 rounded-md border border-slate-400 bg-slate-200 p-2 shadow-sm')}
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE_PX}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE_PX}px)`
        }}
      >
        {cellColors.map((cellColor, index) => {
          const isConnected = connectedCells.has(index);

          return (
            <div
              key={index}
              className={clsx(
                'relative flex items-center justify-center border transition-colors',
                cellColor,
                isConnected ? 'border-2 border-black' : 'border border-slate-700'
              )}
            >
              {index === startingPoint ? (
                <img src={happyVirus} alt="happy computer virus" className="h-6 w-6" />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="w-full rounded-md border border-slate-300 bg-slate-100 p-4 shadow-sm md:w-xl">
        <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
          Controls
        </div>

        <div className="mb-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
          Time: <span className="font-semibold">{formatElapsedTime(elapsedSeconds)}</span>
        </div>

        <div className="mb-4 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
          Steps taken: <span className="font-semibold">{stepsTaken}</span>
        </div>

        <div className="flex flex-col gap-6">
          {colors.map((colorClass) => (
            <button
              key={colorClass}
              type="button"
              onClick={() => handleColorClick(colorClass)}
              disabled={isGameCompleted}
              className={clsx(
                'h-10 w-40 rounded-full text-xl capitalize text-gray-950 disabled:cursor-not-allowed disabled:opacity-60',
                colorClass
              )}
            >
              {extractColorName(colorClass)}
            </button>
          ))}
          <button
            type="button"
            onClick={handleNewGame}
            className="h-10 w-40 rounded-full border-2 border-blue-800 bg-white text-xl hover:bg-blue-700 hover:text-white"
          >
            New game
          </button>

          {isGameCompleted ? (
            <div className="space-y-2">
              <div className="w-fit rounded-md border border-emerald-700 bg-emerald-100 px-3 py-2 text-xl font-semibold text-emerald-900">
                Game completed
              </div>
              <div className="text-sm font-medium text-slate-800">
                Total time: {formatElapsedTime(completedTimeSeconds ?? 0)}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
