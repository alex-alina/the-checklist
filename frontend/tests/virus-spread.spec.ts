import { test, expect } from '@playwright/test';
import { absorbColor, buildComponentGraph, buildTestGame, CELL_COUNT, colors } from '../src/pages/virus-spread/utils';


const buildSeededBoard = (seed: number) => {
  let state = seed >>> 0;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };

  return Array.from({ length: CELL_COUNT }, () => colors[Math.floor(next() * colors.length)]);
};

const buildSeededGame = (seed: number) => ({
  board: buildSeededBoard(seed),
  startingPoint: 0
});

const buildOptimalSequence = (board: string[], startIndex: number) => {
  const graph = buildComponentGraph(board, startIndex);
  if (!graph) {
    throw new Error('Expected a valid component graph');
  }

  const startMask = graph.componentBits[graph.startComponent];
  if (startMask === graph.allMask) {
    return [] as number[];
  }

  const toKey = (mask: bigint, color: number) => `${mask.toString(16)}:${color}`;
  const startKey = toKey(startMask, graph.startColor);

  const queue: Array<{ mask: bigint; color: number }> = [
    { mask: startMask, color: graph.startColor }
  ];
  const parent = new Map<string, { prev: string | null; color: number }>();
  parent.set(startKey, { prev: null, color: graph.startColor });

  let targetKey: string | null = null;

  for (let head = 0; head < queue.length && !targetKey; head += 1) {
    const current = queue[head];
    const currentKey = toKey(current.mask, current.color);

    for (let colorIndex = 0; colorIndex < colors.length; colorIndex += 1) {
      if (colorIndex === current.color) {
        continue;
      }

      const nextMask = absorbColor(current.mask, colorIndex, graph);
      if (nextMask === current.mask) {
        continue;
      }

      const nextKey = toKey(nextMask, colorIndex);
      if (parent.has(nextKey)) {
        continue;
      }

      parent.set(nextKey, { prev: currentKey, color: colorIndex });

      if (nextMask === graph.allMask) {
        targetKey = nextKey;
        break;
      }

      queue.push({ mask: nextMask, color: colorIndex });
    }
  }

  if (!targetKey) {
    throw new Error('No solution found for test game');
  }

  const sequence: number[] = [];
  let cursor = targetKey;

  while (cursor !== startKey) {
    const entry = parent.get(cursor);
    if (!entry || !entry.prev) {
      throw new Error('Failed to reconstruct solution path');
    }
    sequence.push(entry.color);
    cursor = entry.prev;
  }

  return sequence.reverse();
};

test('solves virus spread in test mode using the optimal number of steps', async ({ page }) => {
  await page.goto('/virus-spread?test=1');
  await expect(page.locator('[data-cell-index]')).toHaveCount(CELL_COUNT);

  const optimalStepsLocator = page.getByTestId('optimal-steps');
  await expect(optimalStepsLocator).toHaveText(/^[0-9]+$/);

  const optimalSteps = Number((await optimalStepsLocator.innerText()).trim());
  const testGame = buildTestGame();
  const solution = buildOptimalSequence(testGame.board, testGame.startingPoint);

  expect(solution.length).toBe(optimalSteps);

  for (const colorIndex of solution) {
    await page.locator(`button[data-color="${colors[colorIndex]}"]`).click();
  }

  await expect(page.getByTestId('game-completed')).toBeVisible();
  await expect(page.getByTestId('steps-taken')).toHaveText(String(optimalSteps));
});


test('solves virus spread on a complex seeded board using the optimal number of steps', async ({ page }) => {
  const seededGame = buildSeededGame(1337);
  const solution = buildOptimalSequence(seededGame.board, seededGame.startingPoint);

  await page.addInitScript(({ board, startIndex }) => {
    window.localStorage.setItem(
      'virus-spread-seeded',
      JSON.stringify({ board, startIndex })
    );
  }, { board: seededGame.board, startIndex: seededGame.startingPoint });

  await page.goto('/virus-spread?test=1');
  await expect(page.locator('[data-cell-index]')).toHaveCount(CELL_COUNT);

  const optimalStepsLocator = page.getByTestId('optimal-steps');
  await expect(optimalStepsLocator).toHaveText(/^[0-9]+$/);

  const optimalSteps = Number((await optimalStepsLocator.innerText()).trim());
  expect(solution.length).toBe(optimalSteps);

  for (const colorIndex of solution) {
    await page.locator(`button[data-color="${colors[colorIndex]}"]`).click();
  }

  await expect(page.getByTestId('game-completed')).toBeVisible();
  await expect(page.getByTestId('steps-taken')).toHaveText(String(optimalSteps));
});
