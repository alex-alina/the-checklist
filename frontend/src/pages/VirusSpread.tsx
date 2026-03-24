import { useState } from 'react';
import clsx from 'clsx';
import { SmilePlusIcon } from 'lucide-react';

const CELL_COUNT = 64;
const colors = ['bg-blue-600', 'bg-green-600', 'bg-orange-600', 'bg-violet-600'];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
const getRandomCellIndex = (cellCount: number) => Math.floor(Math.random() * cellCount);
const extractColorName = (colorClass: string) =>
  colorClass.match(/-([^-]+)-/)?.[1] ?? 'Change colour';

export const VirusSpread = () => {
  const [cellColors] = useState(() => Array.from({ length: CELL_COUNT }, getRandomColor));
  const [startingPoint] = useState(() => getRandomCellIndex(CELL_COUNT));

  return (
    <div className="inline-flex flex-col gap-3">
      <div className="my-4 flex justify-around gap-2">
        {colors.map((colorClass) => (
          <button
            key={colorClass}
            type="button"
            className={clsx('h-10 w-30 rounded border border-slate-700 text-white', colorClass)}
          >
            {extractColorName(colorClass)}
          </button>
        ))}
      </div>

      <div className="inline-grid grid-cols-8 grid-rows-8 gap-0.5 rounded-md border border-slate-400 bg-slate-200 p-2 shadow-sm">
        {cellColors.map((cellColor, index) => (
          <div
            key={index}
            className={clsx(
              'flex h-20 w-20 items-center justify-center rounded-sm border border-slate-700 transition-colors',
              cellColor
            )}
          >
            {index === startingPoint ? <SmilePlusIcon className="h-8 w-8 text-white" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
};
