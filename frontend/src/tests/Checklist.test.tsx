import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Checklist } from '../pages/Checklist';
import * as api from '../api/checklists';

jest.mock('../api/checklists');

const renderChecklist = () =>
  render(
    <MemoryRouter initialEntries={['/checklist/checklist-1']}>
      <Routes>
        <Route path="/checklist/:id" element={<Checklist />} />
      </Routes>
    </MemoryRouter>
  );

describe('Checklist', () => {
  const mockedFetchChecklist = api.fetchChecklist as jest.MockedFunction<typeof api.fetchChecklist>;
  const mockedCreateItem = api.createItem as jest.MockedFunction<typeof api.createItem>;
  const mockedToggleItem = api.toggleItem as jest.MockedFunction<typeof api.toggleItem>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateItem.mockResolvedValue({
      id: 'item-new',
      name: 'New entry',
      isChecked: false,
      checklist: { id: 'checklist-1' }
    });
  });

  it('loads the checklist and displays items', async () => {
    mockedFetchChecklist.mockResolvedValue({
      id: 'checklist-1',
      name: 'Daily',
      items: [
        { id: 'item-1', name: 'Morning run', isChecked: false, checklist: { id: 'checklist-1' } }
      ]
    });

    renderChecklist();

    expect(await screen.findByRole('heading', { name: 'Daily' })).toBeInTheDocument();
    expect(await screen.findByText('Morning run')).toBeInTheDocument();
  });

  it('shows a placeholder when no items exist', async () => {
    mockedFetchChecklist.mockResolvedValue({
      id: 'checklist-1',
      name: 'Empty list',
      items: []
    });

    renderChecklist();

    expect(await screen.findByText('No items yet.')).toBeInTheDocument();
  });

  it('adds a new item and resets the input', async () => {
    mockedFetchChecklist.mockResolvedValue({
      id: 'checklist-1',
      name: 'Shopping',
      items: []
    });
    mockedCreateItem.mockResolvedValueOnce({
      id: 'item-1',
      name: 'Buy apples',
      isChecked: false,
      checklist: { id: 'checklist-1' }
    });

    renderChecklist();

    await screen.findByRole('heading', { name: 'Shopping' });

    fireEvent.change(screen.getByPlaceholderText('Add new item'), {
      target: { value: '  Buy apples  ' }
    });
    fireEvent.click(screen.getByRole('button', { name: /add item/i }));

    expect(mockedCreateItem).toHaveBeenCalledWith('checklist-1', 'Buy apples');
    expect(await screen.findByText('Buy apples')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add new item')).toHaveValue('');
  });

  it('toggles an item checkbox and updates the state', async () => {
    mockedFetchChecklist.mockResolvedValue({
      id: 'checklist-1',
      name: 'Work',
      items: [
        { id: 'item-1', name: 'Write tests', isChecked: false, checklist: { id: 'checklist-1' } }
      ]
    });
    mockedToggleItem.mockResolvedValue({
      id: 'item-1',
      name: 'Write tests',
      isChecked: true,
      checklist: { id: 'checklist-1' }
    });

    renderChecklist();

    const checkbox = await screen.findByRole('checkbox', { name: 'Write tests' });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());
    expect(mockedToggleItem).toHaveBeenCalledWith('item-1', true);
  });
});
