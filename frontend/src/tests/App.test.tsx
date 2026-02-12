import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { App } from '../App';
import * as api from '../api/checklists';

jest.mock('../api/checklists');

describe('App', () => {
  const mockedFetch = api.fetchChecklists as jest.MockedFunction<typeof api.fetchChecklists>;
  const mockedCreate = api.createChecklist as jest.MockedFunction<typeof api.createChecklist>;
  const mockedDelete = api.deleteChecklist as jest.MockedFunction<typeof api.deleteChecklist>;

  const renderApp = () =>
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

  beforeEach(() => {
    mockedFetch.mockResolvedValue([]);
    mockedCreate.mockResolvedValue({ id: 'new', name: 'New checklist', items: [] });
    mockedDelete.mockResolvedValue(204);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders fetched checklists as links', async () => {
    mockedFetch.mockResolvedValue([{ id: 'checklist-1', name: 'Daily', items: [] }]);
    renderApp();

    expect(await screen.findByRole('link', { name: 'Daily' })).toBeInTheDocument();
  });

  it('creates a checklist with an optional first item', async () => {
    renderApp();

    fireEvent.change(screen.getByPlaceholderText('New checklist name'), {
      target: { value: 'Team launch   ' }
    });
    fireEvent.change(screen.getByPlaceholderText('Optional item'), {
      target: { value: 'Initial task   ' }
    });
    fireEvent.click(screen.getByRole('button', { name: /add checklist/i }));

    expect(mockedCreate).toHaveBeenCalledWith({
      name: 'Team launch',
      items: [{ name: 'Initial task' }]
    });

    expect(await screen.findByRole('link', { name: 'New checklist' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New checklist name')).toHaveValue('');
    expect(screen.getByPlaceholderText('Optional item')).toHaveValue('');
  });

  it('removes a checklist when the delete API succeeds', async () => {
    mockedFetch.mockResolvedValue([{ id: 'checklist-1', name: 'Daily', items: [] }]);
    mockedDelete.mockResolvedValue(204);
    renderApp();

    const checklistLink = await screen.findByRole('link', { name: 'Daily' });
    const listItem = checklistLink.closest('li');
    expect(listItem).not.toBeNull();
    fireEvent.click(within(listItem!).getByRole('button'));

    await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith('checklist-1'));
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Daily' })).not.toBeInTheDocument());
  });
});
