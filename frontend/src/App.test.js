import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import App from './App';
import { addToCart, store } from './store';

jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn((url) => {
      const path = String(url || '');

      if (path.includes('/products/')) {
        return Promise.resolve({
          data: {
            results: [
              {
                id: 1,
                name: 'Baby Oil',
                description: 'Gentle baby oil',
                category: 'Beauty',
                category_slug: 'beauty',
                price: '10000.00',
                stock: 20,
                image_url: '',
              },
            ],
          },
        });
      }

      if (path.includes('/categories/')) {
        return Promise.resolve({
          data: {
            results: [
              { id: 1, name: 'Beauty', slug: 'beauty' },
            ],
          },
        });
      }

      return Promise.resolve({ data: { results: [] } });
    }),
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
  userEvent.click(screen.getAllByRole('button', { name: /Enter Shop/i })[0]);
  expect(screen.getByPlaceholderText(/Search maternal essentials/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByText(/Loading products/i)).not.toBeInTheDocument();
  });
});

test('adds products to the cart store', () => {
  store.dispatch(addToCart({
    id: 99,
    name: 'Baby Oil',
    category: 'Beauty',
    price: '10000.00',
    quantity: 1,
  }));

  const item = store.getState().cart.items.find((cartItem) => cartItem.id === 99);

  expect(item).toMatchObject({
    name: 'Baby Oil',
    quantity: 1,
  });
});
