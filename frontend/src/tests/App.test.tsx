import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { App } from '../App';
import * as api from '../api/checklists';

jest.mock('../api/checklists');

describe('App', () => {
  const mockedFetch = api.fetchChecklists as jest.MockedFunction<typeof api.fetchChecklists>;
  const mockedCreate = api.createChecklist as jest.MockedFunction<typeof api.createChecklist>;

  const renderApp = () =>
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

  beforeEach(() => {
    mockedFetch.mockResolvedValue([]);
    mockedCreate.mockResolvedValue({ id: 'new', name: 'New checklist', items: [] });
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
});
