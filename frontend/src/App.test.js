import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './store';

jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    post: jest.fn(() => Promise.reject(new Error('offline'))),
    patch: jest.fn(() => Promise.reject(new Error('offline'))),
    delete: jest.fn(() => Promise.reject(new Error('offline'))),
  }),
}));

test('renders QuickCart storefront', async () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(screen.getByRole('img', { name: /QuickCart/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Toggle navigation menu/i })).toBeInTheDocument();
  expect(screen.getByText(/Everyday maternal finds/i)).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: /Enter Shop/i }));
  expect(screen.getByPlaceholderText(/Search maternal essentials/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByText(/Loading products/i)).not.toBeInTheDocument();
  });
});
