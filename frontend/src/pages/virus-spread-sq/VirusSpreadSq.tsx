import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import happyVirus from '../../assets/happy-virus.png';
import {
  buildComponentGraph,
  buildNewGame,
  buildTestGame,
  CELL_COUNT,
  colors,
  extractColorName,
  formatElapsedTime,
  getConnectedCells,
  GRID_SIZE,
  solveExactlyAsync
} from './utils';

const CELL_SIZE_PX = 30;

export const VirusSpreadSq = () => {
  const isTestMode = useMemo(
    () => new URLSearchParams(window.location.search).get('test') === '1',
    []
  );

  const getTestGameFromStorage = () => {
    if (!isTestMode) {
      return null;
    }

    const stored = window.localStorage.getItem('virus-spread-seeded');
    if (!stored) {
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as { board?: string[]; startIndex?: number };
      if (!parsed.board || parsed.startIndex === undefined) {
        return null;
      }

      return {
        board: parsed.board,
        startingPoint: parsed.startIndex
      };
    } catch {
      return null;
    }
  };

  const initialGame = useMemo(() => {
    if (!isTestMode) {
      return buildNewGame();
    }

    return getTestGameFromStorage() ?? buildTestGame();
  }, [isTestMode]);

  const [cellColors, setCellColors] = useState(() => initialGame.board);
  const [startingPoint, setStartingPoint] = useState(() => initialGame.startingPoint);
  const [solverBoard, setSolverBoard] = useState(() => initialGame.board);
  const [solverStart, setSolverStart] = useState(() => initialGame.startingPoint);
  const [optimalSteps, setOptimalSteps] = useState<number | null>(null);
  const [isSolvingOptimal, setIsSolvingOptimal] = useState(true);
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
    setOptimalSteps(null);
    setIsSolvingOptimal(true);

    const graph = buildComponentGraph(solverBoard, solverStart);
    if (!graph) {
      setIsSolvingOptimal(false);
      return;
    }

    const cancel = solveExactlyAsync(graph, (steps) => {
      setOptimalSteps(steps);
      setIsSolvingOptimal(false);
    });

    return cancel;
  }, [solverBoard, solverStart]);

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
    const nextGame = isTestMode ? (getTestGameFromStorage() ?? buildTestGame()) : buildNewGame();

    setCellColors(nextGame.board);
    setStartingPoint(nextGame.startingPoint);
    setSolverBoard(nextGame.board);
    setSolverStart(nextGame.startingPoint);
    setStepsTaken(0);
    setGameStartedAt(Date.now());
    setElapsedSeconds(0);
    setCompletedTimeSeconds(null);
  };

  const handleReplayGame = () => {
    setCellColors(initialGame.board);
    setStartingPoint(initialGame.startingPoint);
    setSolverBoard(initialGame.board);
    setSolverStart(initialGame.startingPoint);
    setStepsTaken(0);
    setGameStartedAt(Date.now());
    setElapsedSeconds(0);
    setCompletedTimeSeconds(null);
  };

  return (
    <div className="flex flex-col justify-center gap-4 md:flex-row md:gap-6">
      <div
        className={clsx('inline-grid gap-0 rounded-md border bg-blue-950 p-2 shadow-sm h-fit')}
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
              data-cell-index={index}
              data-color={extractColorName(cellColor)}
              data-connected={isConnected ? 'true' : 'false'}
            >
              {index === startingPoint ? (
                <img src={happyVirus} alt="happy computer virus" className="h-6 w-6" />
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="w-full flex flex-col justify-between rounded-md border bg-blue-950 p-8 shadow-sm md:w-xl">
        <div>
          <div className="flex">
            <div className="flex flex-col w-1/2">
              <div className="mb-6 text-2xl font-bold uppercase tracking-wide text-white">
                Controls
              </div>
              <div className="flex flex-wrap gap-6">
                {colors.map((colorClass) => (
                  <button
                    key={colorClass}
                    type="button"
                    onClick={() => handleColorClick(colorClass)}
                    disabled={isGameCompleted}
                    data-color={colorClass}
                    className={clsx(
                      'h-10 w-20 rounded-md text-xl capitalize text-gray-950 disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-80',
                      colorClass
                    )}
                  >
                    {extractColorName(colorClass)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col w-1/2">
              <div className="mb-6 text-2xl font-bold uppercase tracking-wide text-white">
                Stats
              </div>
              <div className="mb-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                Time: <span className="font-semibold">{formatElapsedTime(elapsedSeconds)}</span>
              </div>

              <div className="mb-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                Optimum no. of steps:&nbsp;
                {/* (BFS) */}
                <span className="font-semibold" data-testid="optimal-steps">
                  {isSolvingOptimal
                    ? 'calculating...'
                    : optimalSteps === null
                      ? 'N/A'
                      : optimalSteps}
                </span>
              </div>

              <div className="mb-4 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                Steps taken:{' '}
                <span className="font-semibold" data-testid="steps-taken">
                  {stepsTaken}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {isGameCompleted ? (
              <div className="space-y-2">
                <div
                  className="flex justify-center w-full my-6 rounded-md border border-emerald-700 bg-emerald-100 px-3 py-2 text-xl font-semibold text-emerald-900"
                  data-testid="game-completed"
                >
                  Game completed in: {formatElapsedTime(completedTimeSeconds ?? 0)}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReplayGame}
            className="h-10 flex-1 px-2 rounded-md bg-yellow-400 text-xl hover:bg-yellow-400 text-blue-900"
          >
            Replay game
          </button>
          <button
            type="button"
            onClick={handleNewGame}
            className="h-10 flex-1 px-2 rounded-md bg-blue-600 text-xl hover:bg-blue-700 text-white"
          >
            New game
          </button>
        </div>
      </div>
    </div>
  );
};
