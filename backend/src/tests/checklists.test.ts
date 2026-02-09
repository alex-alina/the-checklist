import { createServer } from 'http';
import { AddressInfo } from 'net';
import { createApp } from '../app';
import { AppDataSource } from '../data-source';
import { Checklist } from '../entities/Checklist';
import { Item } from '../entities/Item';

let baseUrl = '';
let server: ReturnType<typeof createServer>;

const jsonRequest = async <T>(path: string, init: RequestInit = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(init.headers ?? {}) };
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body: body as T };
};

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const app = createApp();
  server = createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

afterEach(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.getRepository(Item).clear();
    await AppDataSource.getRepository(Checklist).clear();
  }
});

describe('Checklist routes', () => {
  it('creates and retrieves a checklist', async () => {
    const payload = {
      name: 'Daily chores',
      items: [{ name: 'Wash dishes' }, { name: 'Make bed', isChecked: true }]
    };

    const created = await jsonRequest<Checklist>('/checklists', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    expect(created.status).toBe(201);
    expect(created.body.name).toBe(payload.name);
    expect(created.body.items).toHaveLength(2);

    const fetched = await jsonRequest<Checklist>(`/checklists/${created.body.id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.items).toHaveLength(2);
  });

  it('updates checklist and replaces items', async () => {
    const initial = await jsonRequest<Checklist>('/checklists', {
      method: 'POST',
      body: JSON.stringify({ name: 'Plan' })
    });
    const response = await jsonRequest<Checklist>(`/checklists/${initial.body.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated', items: [{ name: 'New item', isChecked: true }] })
    });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated');
    expect(response.body.items).toHaveLength(1);
  });

  it('returns 404 for missing checklist', async () => {
    const response = await jsonRequest('/checklists/non-existent');
    expect(response.status).toBe(404);
  });
});

describe('Item routes', () => {
  it('creates and toggles an item', async () => {
    const checklist = await jsonRequest<Checklist>('/checklists', {
      method: 'POST',
      body: JSON.stringify({ name: 'List' })
    });
    const payload = { checklistId: checklist.body.id, name: 'Task' };
    const created = await jsonRequest<Item>('/items', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    expect(created.status).toBe(201);
    expect(created.body.isChecked).toBe(false);

    const updated = await jsonRequest<Item>(`/items/${created.body.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isChecked: true })
    });
    expect(updated.status).toBe(200);
    expect(updated.body.isChecked).toBe(true);
  });
});
