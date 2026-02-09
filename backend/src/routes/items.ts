import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Checklist } from '../entities/Checklist';
import { Item } from '../entities/Item';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const repository = AppDataSource.getRepository(Item);
    const items = await repository.find({ relations: ['checklist'] });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const repository = AppDataSource.getRepository(Item);
    const item = await repository.findOne({ where: { id: req.params.id }, relations: ['checklist'] });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { checklistId, name, isChecked = false } = req.body;
    if (!checklistId || !name) {
      return res.status(400).json({ message: 'checklistId and name are required' });
    }
    const checklistRepo = AppDataSource.getRepository(Checklist);
    const checklist = await checklistRepo.findOne({ where: { id: checklistId } });
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    const repository = AppDataSource.getRepository(Item);
    const item = new Item();
    item.name = name;
    item.isChecked = isChecked;
    item.checklist = checklist;
    const saved = await repository.save(item);
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, isChecked } = req.body;
    const repository = AppDataSource.getRepository(Item);
    const item = await repository.findOne({ where: { id: req.params.id }, relations: ['checklist'] });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (name !== undefined) {
      item.name = name;
    }
    if (isChecked !== undefined) {
      item.isChecked = isChecked;
    }
    const updated = await repository.save(item);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const repository = AppDataSource.getRepository(Item);
    const result = await repository.delete({ id: req.params.id });
    if (!result.affected) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
