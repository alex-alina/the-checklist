import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../App';
import * as api from '../api/checklists';

jest.mock('../api/checklists');

describe('App', () => {
  const mockedFetch = api.fetchChecklists as jest.MockedFunction<typeof api.fetchChecklists>;
  const mockedCreate = api.createChecklist as jest.MockedFunction<typeof api.createChecklist>;
  const mockedAddItem = api.createItem as jest.MockedFunction<typeof api.createItem>;
  const mockedToggle = api.toggleItem as jest.MockedFunction<typeof api.toggleItem>;

  beforeEach(() => {
    mockedFetch.mockResolvedValue([]);
    mockedCreate.mockResolvedValue({ id: 'new', name: 'New checklist', items: [] });
    mockedAddItem.mockResolvedValue({ id: 'item-new', name: 'New item', isChecked: false, checklist: { id: 'new' } });
    mockedToggle.mockResolvedValue({ id: 'item-1', name: 'Todo', isChecked: true, checklist: { id: 'checklist-1' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders fetched checklists and share link', async () => {
    mockedFetch.mockResolvedValue([
      { id: 'checklist-1', name: 'Daily', items: [] }
    ]);
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Daily' })).toBeInTheDocument();
    expect(await screen.findByText(/share:/i)).toBeInTheDocument();
  });

  it('creates a checklist and selects it', async () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText('New checklist'), {
      target: { value: 'Team launch' }
    });
    fireEvent.click(screen.getByRole('button', { name: /create checklist/i }));

    await waitFor(() => {
      expect(mockedCreate).toHaveBeenCalledWith({
        name: 'Team launch',
        items: []
      });
    });
  });

  it('toggles an item when checkbox is clicked', async () => {
    mockedFetch.mockResolvedValue([
      {
        id: 'checklist-1',
        name: 'Daily',
        items: [{ id: 'item-1', name: 'Todo', isChecked: false, checklist: { id: 'checklist-1' } }]
      }
    ]);
    render(<App />);

    const checkbox = await screen.findByLabelText('Todo');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockedToggle).toHaveBeenCalledWith('item-1', true);
    });
  });
});
