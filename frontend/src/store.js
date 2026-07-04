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

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/', { params: filters });
      const payload = response.data.results || response.data;
      return payload;
    } catch (error) {
      return rejectWithValue('Could not load products. Make sure the backend is running.');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (product, { getState }) => {
    const response = await api.post('/products/', product, {
      headers: authHeader(getState),
    });
    return response.data;
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (product, { getState }) => {
    const response = await api.patch(`/products/${product.id}/`, product, {
      headers: authHeader(getState),
    });
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { getState }) => {
    await api.delete(`/products/${id}/`, { headers: authHeader(getState) });
    return id;
  }
);

export const login = createAsyncThunk('auth/login', async (credentials) => {
  const tokenResponse = await api.post('/token/', credentials);
  const token = tokenResponse.data.access;
  const meResponse = await api.get('/me/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { token, user: meResponse.data };
});

export const register = createAsyncThunk('auth/register', async (credentials, { dispatch }) => {
  await api.post('/register/', credentials);
  return dispatch(login({ username: credentials.username, password: credentials.password })).unwrap();
});

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { getState }) => {
  const response = await api.get('/orders/', { headers: authHeader(getState) });
  return response.data.results || response.data;
});

export const placeOrder = createAsyncThunk('orders/placeOrder', async (items, { getState }) => {
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
});

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }, { getState }) => {
    const response = await api.patch(
      `/orders/${id}/`,
      { status },
      { headers: authHeader(getState) }
    );
    return response.data;
  }
);

export const fetchAnalytics = createAsyncThunk('orders/fetchAnalytics', async (_, { getState }) => {
  const response = await api.get('/orders/analytics/', { headers: authHeader(getState) });
  return response.data;
});

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    selected: null,
    status: 'idle',
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
        state.error = action.payload || 'Could not load products.';
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
      .addCase(login.rejected, (state) => {
        state.status = 'failed';
        state.error = 'Login failed. Check your username and password.';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      });
  },
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: [], analytics: null, status: 'idle', error: '' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.items = action.payload;
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
