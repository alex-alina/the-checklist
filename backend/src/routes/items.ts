import { NextFunction, Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';
import { Checklist } from '../entities/Checklist';
import { Item } from '../entities/Item';

type ParamsWithChecklistId = { checklistId?: string };
type ItemParams = ParamsWithChecklistId & { itemId: string };

const router = Router({ mergeParams: true });

const getChecklistId = <T extends ParamsWithChecklistId>(req: Request<T>) => req.params.checklistId;

router.post(
  '/',
  async (
    req: Request<
      ParamsWithChecklistId,
      unknown,
      { name?: string; isChecked?: boolean; url?: string; quantity?: number }
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const checklistId = getChecklistId(req);
      const { name, isChecked = false, url, quantity } = req.body;
      if (!checklistId || !name) {
        return res.status(400).json({ message: 'Checklist ID and name are required' });
      }

      const checklistRepo = AppDataSource.getRepository(Checklist);
      const checklist = await checklistRepo.findOne({ where: { id: checklistId } });
      if (!checklist) {
        return res.status(404).json({ message: 'Checklist not found' });
      }
      const item = new Item();
      item.name = name;
      item.isChecked = isChecked;
      item.url = url ?? null;
      item.quantity = quantity ?? null;
      item.checklist = checklist;

      const repository = AppDataSource.getRepository(Item);
      const saved = await repository.save(item);
      res.status(201).json(saved);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/',
  async (req: Request<ParamsWithChecklistId>, res: Response, next: NextFunction) => {
    try {
      const checklistId = getChecklistId(req);
      if (!checklistId) {
        return res.status(400).json({ message: 'Checklist ID is required' });
      }

      const checklistRepo = AppDataSource.getRepository(Checklist);
      const checklist = await checklistRepo.findOne({ where: { id: checklistId } });
      if (!checklist) {
        return res.status(404).json({ message: 'Checklist not found' });
      }

      const repository = AppDataSource.getRepository(Item);
      await repository.delete({ checklist: { id: checklistId } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:itemId',
  async (
    req: Request<
      ItemParams,
      unknown,
      { name?: string; isChecked?: boolean; url?: string | null; quantity?: number | null }
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const checklistId = getChecklistId(req);
      const { name, isChecked, url, quantity } = req.body;
      const repository = AppDataSource.getRepository(Item);
      const item = await repository.findOne({
        where: { id: req.params.itemId },
        relations: ['checklist']
      });
      if (!item || !item.checklist || item.checklist.id !== checklistId) {
        return res.status(404).json({ message: 'Item not found' });
      }
      if (name !== undefined) {
        item.name = name;
      }
      if (isChecked !== undefined) {
        item.isChecked = isChecked;
      }
      if (url !== undefined) {
        item.url = url ?? null;
      }
      if (quantity !== undefined) {
        item.quantity = quantity ?? null;
      }
      const updated = await repository.save(item);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:itemId', async (req: Request<ItemParams>, res: Response, next: NextFunction) => {
  try {
    const checklistId = getChecklistId(req);
    const repository = AppDataSource.getRepository(Item);
    const item = await repository.findOne({
      where: { id: req.params.itemId },
      relations: ['checklist']
    });
    if (!item || !item.checklist || item.checklist.id !== checklistId) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await repository.delete({ id: req.params.itemId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
