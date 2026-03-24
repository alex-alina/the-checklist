import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import happyVirus from '../assets/happy-virus.png';

const GRID_SIZE = 8;
const CELL_SIZE_PX = 40;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const SOLVER_CHUNK_SIZE = 2000;
const colors = ['bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-violet-400'];

type GameSetup = {
  board: string[];
  startingPoint: number;
};

type ComponentGraph = {
  allMask: bigint;
  componentBits: bigint[];
  componentCount: number;
  adjacencyMasks: bigint[];
  colorMasks: bigint[];
  startComponent: number;
  startColor: number;
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

const buildComponentGraph = (board: string[], startIndex: number): ComponentGraph | null => {
  const colorIndexByClass = new Map(colors.map((colorClass, index) => [colorClass, index]));
  const componentIds = new Array<number>(CELL_COUNT).fill(-1);
  const componentColor: number[] = [];
  let componentCount = 0;

  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    if (componentIds[cell] !== -1) {
      continue;
    }

    const baseColor = board[cell];
    const baseColorIndex = colorIndexByClass.get(baseColor);

    if (baseColorIndex === undefined) {
      return null;
    }

    const stack = [cell];
    componentIds[cell] = componentCount;

    while (stack.length > 0) {
      const current = stack.pop();

      if (current === undefined) {
        continue;
      }

      getNeighborIndices(current).forEach((neighbor) => {
        if (componentIds[neighbor] !== -1 || board[neighbor] !== baseColor) {
          return;
        }

        componentIds[neighbor] = componentCount;
        stack.push(neighbor);
      });
    }

    componentColor.push(baseColorIndex);
    componentCount += 1;
  }

  const componentBits = Array.from({ length: componentCount }, (_, index) => 1n << BigInt(index));
  const adjacencyMasks = Array.from({ length: componentCount }, () => 0n);

  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    const component = componentIds[cell];

    getNeighborIndices(cell).forEach((neighbor) => {
      const neighborComponent = componentIds[neighbor];

      if (neighborComponent === component) {
        return;
      }

      adjacencyMasks[component] |= componentBits[neighborComponent];
    });
  }

  const colorMasks = Array.from({ length: colors.length }, () => 0n);

  for (let component = 0; component < componentCount; component += 1) {
    colorMasks[componentColor[component]] |= componentBits[component];
  }

  const startComponent = componentIds[startIndex];

  return {
    allMask: (1n << BigInt(componentCount)) - 1n,
    componentBits,
    componentCount,
    adjacencyMasks,
    colorMasks,
    startComponent,
    startColor: componentColor[startComponent]
  };
};

const getNeighborsOfMask = (mask: bigint, graph: ComponentGraph) => {
  let neighbors = 0n;

  for (let component = 0; component < graph.componentCount; component += 1) {
    if ((mask & graph.componentBits[component]) === 0n) {
      continue;
    }

    neighbors |= graph.adjacencyMasks[component];
  }

  return neighbors;
};

const absorbColor = (mask: bigint, colorIndex: number, graph: ComponentGraph) => {
  let conquered = mask;
  let frontier = getNeighborsOfMask(conquered, graph) & graph.colorMasks[colorIndex] & ~conquered;

  while (frontier !== 0n) {
    conquered |= frontier;
    frontier = getNeighborsOfMask(frontier, graph) & graph.colorMasks[colorIndex] & ~conquered;
  }

  return conquered;
};

const solveExactlyAsync = (
  graph: ComponentGraph,
  onComplete: (steps: number | null) => void
): (() => void) => {
  let cancelled = false;

  const startMask = graph.componentBits[graph.startComponent];
  if (startMask === graph.allMask) {
    onComplete(0);
    return () => {
      cancelled = true;
    };
  }

  const visited = new Set<string>();
  const queueMasks: bigint[] = [startMask];
  const queueColors: number[] = [graph.startColor];
  const queueDepths: number[] = [0];
  let head = 0;

  visited.add(`${startMask.toString(16)}:${graph.startColor}`);

  const processChunk = () => {
    if (cancelled) {
      return;
    }

    let processed = 0;

    while (head < queueMasks.length && processed < SOLVER_CHUNK_SIZE) {
      const currentMask = queueMasks[head];
      const currentColor = queueColors[head];
      const currentDepth = queueDepths[head];
      head += 1;
      processed += 1;

      for (let colorIndex = 0; colorIndex < colors.length; colorIndex += 1) {
        if (colorIndex === currentColor) {
          continue;
        }

        const nextMask = absorbColor(currentMask, colorIndex, graph);

        if (nextMask === currentMask) {
          continue;
        }

        if (nextMask === graph.allMask) {
          onComplete(currentDepth + 1);
          return;
        }

        const key = `${nextMask.toString(16)}:${colorIndex}`;
        if (visited.has(key)) {
          continue;
        }

        visited.add(key);
        queueMasks.push(nextMask);
        queueColors.push(colorIndex);
        queueDepths.push(currentDepth + 1);
      }
    }

    if (head < queueMasks.length) {
      setTimeout(processChunk, 0);
      return;
    }

    onComplete(null);
  };

  setTimeout(processChunk, 0);

  return () => {
    cancelled = true;
  };
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
    const nextGame = buildNewGame();

    setCellColors(nextGame.board);
    setStartingPoint(nextGame.startingPoint);
    setSolverBoard(nextGame.board);
    setSolverStart(nextGame.startingPoint);
    setStepsTaken(0);
    setGameStartedAt(Date.now());
    setElapsedSeconds(0);
    setCompletedTimeSeconds(null);
  };

  return (
    <div className="flex flex-col justify-center gap-4 md:flex-row md:gap-6">
      <div
        className={clsx(
          'inline-grid gap-0 rounded-md border border-slate-400 bg-slate-200 p-2 shadow-sm'
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

        <div className="mb-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
          Optimum steps (BFS):{' '}
          <span className="font-semibold">
            {isSolvingOptimal ? 'Calculating...' : optimalSteps === null ? 'N/A' : optimalSteps}
          </span>
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
