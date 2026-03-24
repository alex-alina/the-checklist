import { useMemo, useState } from 'react';
import clsx from 'clsx';
import happyVirus from '../assets/happy-virus.png';

const GRID_SIZE = 20;
const CELL_SIZE_PX = 40;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const colors = ['bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-violet-400'];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
const getRandomCellIndex = (cellCount: number) => Math.floor(Math.random() * cellCount);
const extractColorName = (colorClass: string) =>
  colorClass.match(/-([^-]+)-/)?.[1] ?? 'Select colour';

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

export const VirusSpread = () => {
  const [cellColors, setCellColors] = useState(() =>
    Array.from({ length: CELL_COUNT }, getRandomColor)
  );
  const [startingPoint, setStartingPoint] = useState(() => getRandomCellIndex(CELL_COUNT));

  const connectedCells = useMemo(
    () => getConnectedCells(cellColors, startingPoint),
    [cellColors, startingPoint]
  );

  const handleColorClick = (nextColor: string) => {
    setCellColors((previousColors) => {
      const currentlyConnected = getConnectedCells(previousColors, startingPoint);
      const updatedColors = [...previousColors];

      currentlyConnected.forEach((cellIndex) => {
        updatedColors[cellIndex] = nextColor;
      });

      return updatedColors;
    });
  };

  const handleNewGame = () => {
    setCellColors(Array.from({ length: CELL_COUNT }, getRandomColor));
    setStartingPoint(getRandomCellIndex(CELL_COUNT));
  };

  return (
    <div className="flex flex-col gap-4 justify-center md:flex-row md:gap-6">
      <div
        className={clsx(
          'inline-grid gap-0.5 rounded-md border border-slate-400 bg-slate-200 p-2 shadow-sm'
        )}
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
                'flex items-center justify-center rounded-sm transition-colors',
                cellColor,
                isConnected ? 'border-2 border-black' : 'border border-slate-700'
              )}
            >
              {index === startingPoint ? <img src={happyVirus} alt="happy computer virus" /> : null}
            </div>
          );
        })}
      </div>

      <div className="w-full rounded-md border border-slate-300 bg-slate-100 p-4 shadow-sm md:w-xl">
        <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
          Controls
        </div>

        <div className="flex flex-col gap-6">
          {colors.map((colorClass) => (
            <button
              key={colorClass}
              type="button"
              onClick={() => handleColorClick(colorClass)}
              className={clsx(
                'h-10 w-40 rounded-full text-xl capitalize text-gray-950',
                colorClass
              )}
            >
              {extractColorName(colorClass)}
            </button>
          ))}
          <button
            type="button"
            onClick={handleNewGame}
            className="h-10 w-40 rounded-full text-xl border-blue-800 border-2 bg-white hover:bg-blue-700 hover:text-white"
          >
            New game
          </button>
        </div>
      </div>
    </div>
  );
};
