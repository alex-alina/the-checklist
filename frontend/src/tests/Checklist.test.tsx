import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  const originalNavigatorShareDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, 'share');
  const originalNavigatorClipboardDescriptor = Object.getOwnPropertyDescriptor(
    globalThis.navigator,
    'clipboard'
  );
  const sharePath = '/checklist/checklist-1';

  const restoreNavigatorProperty = (
    prop: 'share' | 'clipboard',
    descriptor?: PropertyDescriptor
  ) => {
    if (descriptor) {
      Object.defineProperty(globalThis.navigator, prop, descriptor);
      return;
    }

    Reflect.deleteProperty(globalThis.navigator, prop);
  };

  const setChecklistShareLocation = () => {
    window.history.replaceState({}, '', sharePath);
    return window.location.href;
  };

  const mockedFetchChecklist = api.fetchChecklist as jest.MockedFunction<typeof api.fetchChecklist>;
  const mockedCreateItem = api.createItem as jest.MockedFunction<typeof api.createItem>;
  const mockedToggleItem = api.toggleItem as jest.MockedFunction<typeof api.toggleItem>;
  const mockedDeleteItem = api.deleteChecklistItem as jest.MockedFunction<
    typeof api.deleteChecklistItem
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    window.history.replaceState({}, '', '/');
    mockedCreateItem.mockResolvedValue({
      id: 'item-new',
      name: 'New entry',
      isChecked: false,
      checklist: { id: 'checklist-1' }
    });
    mockedDeleteItem.mockResolvedValue(204);
  });

  afterEach(() => {
    restoreNavigatorProperty('share', originalNavigatorShareDescriptor);
    restoreNavigatorProperty('clipboard', originalNavigatorClipboardDescriptor);
    window.history.replaceState({}, '', '/');
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

    expect(await screen.findByText('Add some items to your checklist.')).toBeInTheDocument();
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

  it('deletes an item when the delete API succeeds', async () => {
    mockedFetchChecklist.mockResolvedValue({
      id: 'checklist-1',
      name: 'Work',
      items: [
        { id: 'item-1', name: 'Write tests', isChecked: false, checklist: { id: 'checklist-1' } }
      ]
    });

    renderChecklist();

    const itemContainer = await screen.findByText('Write tests');
    const button = within(itemContainer.closest('div')!).getByRole('button');
    fireEvent.click(button);

    await waitFor(() => expect(mockedDeleteItem).toHaveBeenCalledWith('item-1'));
    await waitFor(() => expect(screen.queryByText('Write tests')).not.toBeInTheDocument());
  });

  it('keeps the item when the delete API returns a non-204 status', async () => {
    mockedFetchChecklist.mockResolvedValue({
      id: 'checklist-1',
      name: 'Tasks',
      items: [
        { id: 'item-2', name: 'Plan sprint', isChecked: false, checklist: { id: 'checklist-1' } }
      ]
    });
    mockedDeleteItem.mockResolvedValue(404);

    renderChecklist();

    const itemContainer = await screen.findByText('Plan sprint');
    fireEvent.click(within(itemContainer.closest('div')!).getByRole('button'));

    await waitFor(() => expect(mockedDeleteItem).toHaveBeenCalledWith('item-2'));
    expect(screen.getByText('Plan sprint')).toBeInTheDocument();
  });

  describe('sharing the checklist URL', () => {
    const shareButton = () => screen.getByRole('button', { name: /share checklist/i });

    const prepareShareFlow = async (checklistName = 'Daily') => {
      const shareUrl = setChecklistShareLocation();
      mockedFetchChecklist.mockResolvedValue({
        id: 'checklist-1',
        name: checklistName,
        items: []
      });
      renderChecklist();
      await screen.findByRole('heading', { name: checklistName });
      return shareUrl;
    };

    it('opens the native share dialog when available', async () => {
      const shareMock = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(globalThis.navigator, 'share', {
        configurable: true,
        value: shareMock
      });

      const shareUrl = await prepareShareFlow('Daily');
      fireEvent.click(shareButton());

      await waitFor(() =>
        expect(shareMock).toHaveBeenCalledWith({
          title: 'Daily',
          text: 'Take a look at this checklist named Daily.',
          url: shareUrl
        })
      );
      expect(await screen.findByText('Share dialog opened.')).toBeInTheDocument();
    });

    it('copies the URL to clipboard when share is unavailable', async () => {
      Reflect.deleteProperty(globalThis.navigator, 'share');
      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(globalThis.navigator, 'clipboard', {
        configurable: true,
        value: { writeText }
      });

      const shareUrl = await prepareShareFlow('Work');
      fireEvent.click(shareButton());

      await waitFor(() => expect(writeText).toHaveBeenCalledWith(shareUrl));
      expect(await screen.findByText('Checklist URL copied to clipboard.')).toBeInTheDocument();
    });

    it('shows a message when clipboard support is unavailable', async () => {
      Reflect.deleteProperty(globalThis.navigator, 'share');
      Reflect.deleteProperty(globalThis.navigator, 'clipboard');

      await prepareShareFlow('Tasks');
      fireEvent.click(shareButton());

      expect(await screen.findByText('Clipboard support is unavailable.')).toBeInTheDocument();
    });

    it('displays an error message when sharing fails', async () => {
      const shareMock = jest.fn().mockRejectedValue(new Error('share failed'));
      Object.defineProperty(globalThis.navigator, 'share', {
        configurable: true,
        value: shareMock
      });

      await prepareShareFlow('Work');
      fireEvent.click(shareButton());

      expect(await screen.findByText('Unable to share the checklist right now.')).toBeInTheDocument();
    });
  });
});
