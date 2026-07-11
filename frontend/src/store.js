import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const authHeader = (getState) => {
  const token = getState().auth.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// DRF returns paginated lists in production, but tests and a few local views use
// plain arrays. Keeping this helper small lets the UI handle both shapes.
const listFromResponse = (data) => data.results || data;

const hasUsableToken = (getState) => Boolean(getState().auth.token);

const apiErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  const status = error.response?.status;

  if (!error.response) {
    return 'We could not connect right now. Check your internet connection and try again.';
  }

  if (status === 401) {
    return 'The username or password you entered is incorrect.';
  }

  if (status === 403) {
    return 'You do not have permission to complete this action.';
  }

  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (status >= 500) {
    return 'Our service is temporarily unavailable. Please try again shortly.';
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data && typeof data === 'object') {
    const fieldLabels = { username: 'Username', email: 'Email', password: 'Password', non_field_errors: '' };
    return Object.entries(data)
      .map(([field, messages]) => {
        const message = Array.isArray(messages) ? messages.join(' ') : messages;
        const label = fieldLabels[field] ?? field.replaceAll('_', ' ');
        return label ? `${label}: ${message}` : message;
      })
      .join(' ');
  }

  return fallback;
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/', { params: filters });
      return listFromResponse(response.data);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, 'We could not load the products. Please try again.'));
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories/');
      return listFromResponse(response.data);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, 'We could not load the categories. Please try again.'));
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (product, { getState, rejectWithValue }) => {
    try {
      const response = await api.post('/products/', product, {
        headers: authHeader(getState),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, 'The product could not be added. Please try again.'));
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (product, { getState, rejectWithValue }) => {
    try {
      const response = await api.patch(`/products/${product.id}/`, product, {
        headers: authHeader(getState),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, 'Your product changes could not be saved. Please try again.'));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { getState, rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}/`, { headers: authHeader(getState) });
      return id;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, 'The product could not be removed. Please try again.'));
    }
  }
);

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const tokenResponse = await api.post('/token/', credentials);
    const token = tokenResponse.data.access;
    const meResponse = await api.get('/me/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { token, user: meResponse.data };
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, 'We could not sign you in. Please try again.'));
  }
});

export const register = createAsyncThunk('auth/register', async (credentials, { dispatch, rejectWithValue }) => {
  try {
    await api.post('/register/', credentials);
    return dispatch(login({ username: credentials.username, password: credentials.password })).unwrap();
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, 'We could not create your account. Please review your details and try again.'));
  }
});

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { getState, rejectWithValue }) => {
  try {
    // Avoid noisy 401s when a guest opens My Orders. The page can show a login
    // prompt without hitting a protected endpoint.
    if (!hasUsableToken(getState)) {
      return rejectWithValue('Login is required to view orders.');
    }
    const response = await api.get('/orders/', { headers: authHeader(getState) });
    return listFromResponse(response.data);
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, 'We could not load your orders. Please try again.'));
  }
});

export const placeOrder = createAsyncThunk('orders/placeOrder', async (items, { getState, rejectWithValue }) => {
  try {
    if (!hasUsableToken(getState)) {
      return rejectWithValue('Login is required before placing an order.');
    }
    // The cart keeps full product objects; the API only needs id + quantity.
    const orderItems = items.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    }));
    const response = await api.post(
      '/orders/',
      { order_items: orderItems },
      { headers: authHeader(getState) }
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, 'Your order was not placed. Please try again.'));
  }
});

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }, { getState, rejectWithValue }) => {
    try {
      if (!hasUsableToken(getState)) {
        return rejectWithValue('Login is required to update orders.');
      }
      const response = await api.patch(
        `/orders/${id}/`,
        { status },
        { headers: authHeader(getState) }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, 'The order status could not be updated. Please try again.'));
    }
  }
);

export const fetchAnalytics = createAsyncThunk('orders/fetchAnalytics', async (_, { getState, rejectWithValue }) => {
  try {
    if (!hasUsableToken(getState)) {
      return rejectWithValue('Login is required to view analytics.');
    }
    const response = await api.get('/orders/analytics/', { headers: authHeader(getState) });
    return response.data;
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, 'The dashboard summary could not be loaded. Please try again.'));
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    categories: [],
    selected: null,
    status: 'idle',
    categoryStatus: 'idle',
    error: '',
    filters: { search: '', category: '', min_price: '', max_price: '' },
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selected = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.items = [];
        state.error = action.payload || 'We could not load the products. Please try again.';
      })
      .addCase(fetchCategories.pending, (state) => {
        state.categoryStatus = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoryStatus = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoryStatus = 'failed';
        state.categories = [];
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (
          item.id === action.payload.id ? action.payload : item
        ));
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      state.items = state.items
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: '', user: null, status: 'idle', error: '' },
  reducers: {
    logout: (state) => {
      state.token = '';
      state.user = null;
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed. Check your username and password.';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'We could not create your account. Please try again.';
      });
  },
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: [], analytics: null, status: 'idle', error: '' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'We could not load your orders. Please try again.';
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.items = state.items.map((order) => (
          order.id === action.payload.id ? { ...order, ...action.payload } : order
        ));
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const { setSelectedProduct, setFilters } = productsSlice.actions;
export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export const { logout } = authSlice.actions;

export const store = configureStore({
  reducer: {
    products: productsSlice.reducer,
    cart: cartSlice.reducer,
    auth: authSlice.reducer,
    orders: ordersSlice.reducer,
  },
});
