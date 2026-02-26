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
      items: [
        { name: 'Wash dishes', url: 'https://example.com/dishes', quantity: 2 },
        { name: 'Make bed', isChecked: true }
      ]
    };

    const created = await jsonRequest<Checklist>('/checklists', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    expect(created.status).toBe(201);
    expect(created.body.name).toBe(payload.name);
    expect(created.body.items).toHaveLength(2);
    expect(created.body.items[0].url).toBe('https://example.com/dishes');
    expect(created.body.items[0].quantity).toBe(2);

    const fetched = await jsonRequest<Checklist>(`/checklists/${created.body.id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.items).toHaveLength(2);
    expect(fetched.body.items[0].url).toBe('https://example.com/dishes');
    expect(fetched.body.items[0].quantity).toBe(2);
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
    const payload = { name: 'Task', url: 'https://example.com/task', quantity: 1 };
    const created = await jsonRequest<Item>(`/checklists/${checklist.body.id}/items`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    expect(created.status).toBe(201);
    expect(created.body.isChecked).toBe(false);
    expect(created.body.url).toBe('https://example.com/task');
    expect(created.body.quantity).toBe(1);

    const updated = await jsonRequest<Item>(
      `/checklists/${checklist.body.id}/items/${created.body.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ isChecked: true })
      }
    );
    expect(updated.status).toBe(200);
    expect(updated.body.isChecked).toBe(true);

    const withUrlUpdate = await jsonRequest<Item>(
      `/checklists/${checklist.body.id}/items/${created.body.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ url: 'https://example.com/updated-task' })
      }
    );
    expect(withUrlUpdate.status).toBe(200);
    expect(withUrlUpdate.body.url).toBe('https://example.com/updated-task');

    const withQuantityUpdate = await jsonRequest<Item>(
      `/checklists/${checklist.body.id}/items/${created.body.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ quantity: 5 })
      }
    );
    expect(withQuantityUpdate.status).toBe(200);
    expect(withQuantityUpdate.body.quantity).toBe(5);
  });

  it('deletes all items of a checklist', async () => {
    const checklist = await jsonRequest<Checklist>('/checklists', {
      method: 'POST',
      body: JSON.stringify({ name: 'List' })
    });

    await jsonRequest<Item>(`/checklists/${checklist.body.id}/items`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Task 1' })
    });
    await jsonRequest<Item>(`/checklists/${checklist.body.id}/items`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Task 2' })
    });

    const removeAll = await jsonRequest(`/checklists/${checklist.body.id}/items`, {
      method: 'DELETE'
    });
    expect(removeAll.status).toBe(204);

    const fetched = await jsonRequest<Checklist>(`/checklists/${checklist.body.id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.items).toHaveLength(0);
  });
});
