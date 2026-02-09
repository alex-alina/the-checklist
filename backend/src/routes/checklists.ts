import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Checklist } from '../entities/Checklist';
import { Item } from '../entities/Item';

const sanitizeChecklist = (checklist: Checklist) => ({
  ...checklist,
  items: checklist.items.map((item) => {
    const { checklist, ...rest } = item;
    return rest;
  })
});

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const repository = AppDataSource.getRepository(Checklist);
    const checklists = await repository.find();
    res.json(checklists);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const repository = AppDataSource.getRepository(Checklist);
    const checklist = await repository.findOne({ where: { id: req.params.id } });
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    res.json(checklist);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, items = [] } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Checklist name is required' });
    }
    const checklist = new Checklist();
    checklist.name = name;
    checklist.items = (items ?? []).map((item: Partial<Item>) => {
      const entity = new Item();
      entity.name = item.name ?? '';
      entity.isChecked = item.isChecked ?? false;
      return entity;
    });
    const repository = AppDataSource.getRepository(Checklist);
    const saved = await repository.save(checklist);
    res.status(201).json(sanitizeChecklist(saved));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, items } = req.body;
    const repository = AppDataSource.getRepository(Checklist);
    const checklist = await repository.findOne({ where: { id: req.params.id } });
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    if (name) {
      checklist.name = name;
    }
    if (Array.isArray(items)) {
      const itemRepo = AppDataSource.getRepository(Item);
      await itemRepo.delete({ checklist: { id: checklist.id } });
      checklist.items = items.map((item: Partial<Item>) => {
        const entity = new Item();
        entity.name = item.name ?? '';
        entity.isChecked = item.isChecked ?? false;
        entity.checklist = checklist;
        return entity;
      });
    }
    const updated = await repository.save(checklist);
    res.json(sanitizeChecklist(updated));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const repository = AppDataSource.getRepository(Checklist);
    const result = await repository.delete({ id: req.params.id });
    if (!result.affected) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
