import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import {
  addToCart,
  clearCart,
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchAnalytics,
  fetchOrders,
  fetchProducts,
  login,
  logout,
  placeOrder,
  register,
  removeFromCart,
  setFilters,
  setSelectedProduct,
  updateOrderStatus,
  updateProduct,
  updateQuantity,
} from './store';

const taxRate = 0.16;
const logoPath = `${process.env.PUBLIC_URL}/quickcart-logo.png`;
const mtnLogoPath = `${process.env.PUBLIC_URL}/mtn-logo.jfif`;
const airtelLogoPath = `${process.env.PUBLIC_URL}/airtel-logo.png`;

const money = (value) => Number(value || 0).toLocaleString('en-UG', {
  style: 'currency',
  currency: 'UGX',
  maximumFractionDigits: 0,
});

// START: Frontend URL setup
// These helpers create/read the customer-facing URLs.
// Example: "shop" becomes "/shop", and "/products/8" opens product 8.
const viewPaths = {
  home: '/',
  shop: '/shop',
  cart: '/cart',
  orders: '/orders',
  auth: '/login',
  admin: '/admin',
};

const pathToRoute = (pathname = window.location.pathname) => {
  if (pathname.startsWith('/products/')) {
    return {
      view: 'detail',
      productId: Number(pathname.split('/')[2]),
    };
  }

  const view = Object.entries(viewPaths).find(([, path]) => path === pathname)?.[0];
  return { view: view || 'home', productId: null };
};

const viewToPath = (view, productId) => {
  if (view === 'detail') {
    return productId ? `/products/${productId}` : '/shop';
  }
  return viewPaths[view] || '/';
};
// END: Frontend URL setup

const emptyProductForm = {
  name: '',
  description: '',
  category_id: '',
  price: '',
  stock: '',
  image_url: '',
};

const errorMessage = (error, fallback) => (
  typeof error === 'string' ? error : error?.message || fallback
);

// START: Shared product image
// Used anywhere a product photo appears: shop cards, details, cart, etc.
function ProductImage({ product }) {
  return (
    <img
      src={product.image_url || product.image || 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQoeehdlofSouUzwYsi4s_cTX12gDYfflil734o3jrqSiBDGsrU8iaRJQKeKntCX6S4Qi5I0qG1L3IMuZf4Ib9NcfAPsCmGyd-c7POHigsVzpQGv0uA6M0z'}
      alt={product.name}
      className="product-image"
    />
  );
}
// END: Shared product image

// START: Main navigation bar
// This navbar appears at the top of every customer-facing page.
function Header({ currentView, setView }) {
  const dispatch = useDispatch();
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const user = useSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (view) => {
    setView(view);
    setMenuOpen(false);
  };

  return (
    <header className="app-header">
      <button className="brand" onClick={() => goTo('home')} type="button">
        <img className="brand-logo" src={logoPath} alt="QuickCart" />
        <span className="brand-copy">
          <strong>QuickCart</strong>
        </span>
      </button>
      <button
        className="menu-toggle"
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={menuOpen ? 'nav-tabs open' : 'nav-tabs'} aria-label="Primary navigation">
        <button
          className={currentView === 'home' ? 'active' : ''}
          onClick={() => goTo('home')}
          type="button"
        >
          Home
        </button>
        {['shop', 'cart', 'orders'].map((view) => (
          <button
            key={view}
            className={currentView === view ? 'active' : ''}
            onClick={() => goTo(view)}
            type="button"
          >
            {view === 'cart' ? `Cart (${cartCount})` : view === 'orders' ? 'My Orders' : view}
          </button>
        ))}
        {user?.is_staff && (
          <button
            className={currentView === 'admin' ? 'active' : ''}
            onClick={() => goTo('admin')}
            type="button"
          >
            Admin
          </button>
        )}
        {user ? (
          <button
            onClick={() => {
              dispatch(logout());
              setMenuOpen(false);
            }}
            type="button"
          >
            Logout
          </button>
        ) : (
          <button
            className={currentView === 'auth' ? 'active' : ''}
            onClick={() => goTo('auth')}
            type="button"
          >
            Login
          </button>
        )}
      </nav>
      <div className="auth-strip">
        {user && <span>{user.username}</span>}
      </div>
    </header>
  );
}
// END: Main navigation bar

// START: Home page
// This is the first page users see at "/".
function SplashView({ setView }) {
  return (
    <main className="splash-screen">
      <section className="splash-content">
        <p className="splash-kicker">Maternal care, beautifully gathered.</p>
        <h1>Everyday maternal finds, one quick cart away.</h1>
        <p className="splash-subtitle">
          Essentials for mothers and babies through every stage, from pregnancy
          to newborn days, toddler years, and every little milestone after.
        </p>
        <div className="splash-actions">
          <button className="splash-action primary-action" onClick={() => setView('shop')} type="button">
            Enter Shop
          </button>
          <button className="splash-action secondary-action" onClick={() => setView('shop')} type="button">
            Learn More
          </button>
        </div>
        <div className="splash-stats" aria-label="QuickCart stats">
          <div><strong>10k+</strong><span>Happy families</span></div>
          <div><strong>500+</strong><span>Curated products</span></div>
          <div><strong>4.8 star</strong><span>Average rating</span></div>
        </div>
      </section>
      <button className="splash-scroll" onClick={() => setView('shop')} type="button">
        <span>Explore shop</span>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>
    </main>
  );
}
// END: Home page

// START: Shop filters
// Search, category, and price filters used inside the shop page.
function Filters() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.products.filters);
  const categories = useSelector((state) => state.products.categories);

  const update = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    dispatch(setFilters({ [key]: value }));
    dispatch(fetchProducts(nextFilters));
  };

  return (
    <section className="shop-filters" aria-label="Product filters">
      <label className="shop-search">
        <span aria-hidden="true">Search</span>
        <input
          value={filters.search}
          onChange={(event) => update('search', event.target.value)}
          placeholder="Search maternal essentials"
        />
      </label>
      <div className="section-title-row">
        <h2>Categories</h2>
        <button type="button" onClick={() => update('category', '')}>View all</button>
      </div>
      <div className="category-scroll">
        <button
          className={!filters.category ? 'active' : ''}
          onClick={() => update('category', '')}
          type="button"
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={filters.category === category.slug ? 'active' : ''}
            onClick={() => update('category', category.slug)}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="price-filters">
        <label>
          Min
        <input
          type="number"
          min="0"
          value={filters.min_price}
          onChange={(event) => update('min_price', event.target.value)}
          placeholder="0"
        />
        </label>
        <label>
          Max
        <input
          type="number"
          min="0"
          value={filters.max_price}
          onChange={(event) => update('max_price', event.target.value)}
          placeholder="100"
        />
        </label>
      </div>
    </section>
  );
}
// END: Shop filters

// START: Shop page
// This page shows the product grid and lets customers open product details.
function ShopView({ setView }) {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.products);
  const user = useSelector((state) => state.auth.user);

  return (
    <main className="shop-screen">
      <section className="shop-app">
        <section className="shop-heading">
          <p><span aria-hidden="true">Love</span> QuickCart Maternal</p>
          <h1>Best maternal finds for <em>every stage</em></h1>
        </section>

        <Filters />

        <div className="section-title-row products-title">
          <h2>Featured products <span>· {items.length} listed</span></h2>
          <button type="button">View all -&gt;</button>
        </div>

        <section className="shop-product-grid" aria-label="Product catalog">
          {status === 'loading' && <p>Loading products...</p>}
          {status === 'failed' && <p className="notice">{error}</p>}
          {status === 'succeeded' && items.length === 0 && (
            <div className="empty-catalog">
              <h2>No products yet</h2>
              <p>Products will appear here after an admin adds them from the dashboard.</p>
              {user?.is_staff ? (
                <button className="primary" onClick={() => setView('admin')} type="button">
                  Add Product
                </button>
              ) : (
                <button className="secondary" onClick={() => setView('auth')} type="button">
                  Admin Login
                </button>
              )}
            </div>
          )}
          {items.map((product) => (
            <article className="shop-product-card" key={product.id}>
              <button
                className="product-thumb"
                onClick={() => {
                  dispatch(setSelectedProduct(product));
                  setView('detail', product.id);
                }}
                type="button"
              >
                <ProductImage product={product} />
              </button>
              <div className="shop-product-body">
                <span>{product.category}</span>
                <h2>{product.name}</h2>
                <strong>{money(product.price)}</strong>
                <div className="shop-rating-row">
                  <span>4.8 rating</span>
                  <button onClick={() => dispatch(addToCart(product))} type="button" aria-label={`Add ${product.name} to cart`}>+</button>
                </div>
              </div>
            </article>
          ))}
        </section>

      </section>
    </main>
  );
}
// END: Shop page

// START: Product details page
// This is the single product page at "/products/:id".
function ProductDetailView({ setView, routeProductId }) {
  const dispatch = useDispatch();
  const product = useSelector((state) => state.products.selected);
  const products = useSelector((state) => state.products.items);
  const productStatus = useSelector((state) => state.products.status);
  const token = useSelector((state) => state.auth.token);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Pink');
  const [paymentMethod, setPaymentMethod] = useState('MTN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyNowOpen, setBuyNowOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    phone: '',
  });

  useEffect(() => {
    // A direct visit like /products/3 starts without a selected product.
    // Once the catalog loads, select the product that matches the URL.
    if (!routeProductId || product?.id === routeProductId) {
      return;
    }
    const routedProduct = products.find((item) => item.id === routeProductId);
    if (routedProduct) {
      dispatch(setSelectedProduct(routedProduct));
    }
  }, [dispatch, product?.id, products, routeProductId]);

  if (!product) {
    if (routeProductId && productStatus === 'loading') {
      return (
        <main className="page-shell empty-state">
          <h1>Loading product...</h1>
        </main>
      );
    }

    return (
      <main className="page-shell empty-state">
        <h1>No product selected</h1>
        <button className="primary" onClick={() => setView('shop')} type="button">Back to shop</button>
      </main>
    );
  }

  const addSelectedQuantity = () => {
    for (let index = 0; index < quantity; index += 1) {
      dispatch(addToCart(product));
    }
    setView('cart');
  };

  const subtotal = Number(product.price) * quantity;
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes;

  const confirmProductCheckout = async (event) => {
    event.preventDefault();
    if (!token) {
      setView('auth');
      return;
    }
    setIsProcessing(true);
    setCheckoutError('');
    try {
      // Buy Now skips the cart and creates a one-product order immediately.
      await dispatch(placeOrder([{ ...product, quantity }])).unwrap();
      dispatch(removeFromCart(product.id));
      dispatch(fetchOrders());
      setView('orders');
    } catch (error) {
      setCheckoutError(errorMessage(error, 'Could not place this order.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="product-detail-screen">
      <section className={buyNowOpen ? 'product-detail-card checkout-open' : 'product-detail-card'}>
        <section className="product-detail-gallery" aria-label={`${product.name} images`}>
          <ProductImage product={product} />
          <div className="product-detail-thumbs" aria-hidden="true">
            <span className="active" />
            <span />
            <span />
          </div>
          <aside className="product-detail-stats">
            <div><span>In stock</span><strong>{product.stock}</strong></div>
            <div><span>Category</span><strong>{product.category}</strong></div>
            <div><span>Rating</span><strong>4.8</strong></div>
          </aside>
        </section>

        <section className="product-detail-info">
          <span className="product-detail-pill">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="product-detail-price">
            <strong>{money(product.price)}</strong>
            <span>4.8 rating</span>
          </div>
          <p className="product-detail-label">Color</p>
          <div className="product-detail-swatches" aria-label="Available colors">
            <button
              className={selectedColor === 'White' ? 'active' : ''}
              onClick={() => setSelectedColor('White')}
              type="button"
              aria-label="Select white"
            />
            <button
              className={selectedColor === 'Pink' ? 'pink active' : 'pink'}
              onClick={() => setSelectedColor('Pink')}
              type="button"
              aria-label="Select pink"
            />
            <button
              className={selectedColor === 'Black' ? 'dark active' : 'dark'}
              onClick={() => setSelectedColor('Black')}
              type="button"
              aria-label="Select black"
            />
          </div>
          <h2>Description</h2>
          <p className="product-detail-description">
            {product.description || 'A simple, well-made everyday item - solid construction and reliable performance for regular use.'}
          </p>
          <div className="product-detail-actions">
            <div className="product-detail-quantity" aria-label="Quantity">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} type="button" aria-label="Decrease quantity">-</button>
              <strong>{quantity}</strong>
              <button onClick={() => setQuantity(quantity + 1)} type="button" aria-label="Increase quantity">+</button>
            </div>
            <button className="product-detail-cart" onClick={addSelectedQuantity} type="button">
              Add to Cart
            </button>
            <button className="product-detail-buy" onClick={() => setBuyNowOpen(true)} type="button">
              Buy Now
            </button>
          </div>
        </section>

        {buyNowOpen && (
        <aside className="product-checkout-panel" aria-label="Buy now checkout">
          <div className="product-checkout-header">
            <div>
              <span>Buy now</span>
              <h2>Complete order</h2>
            </div>
            <button className="checkout-close" onClick={() => setBuyNowOpen(false)} type="button" aria-label="Close buy now checkout">
              X
            </button>
          </div>
          <form className="product-checkout-form" onSubmit={confirmProductCheckout}>
            <div className="product-checkout-item">
              <ProductImage product={product} />
              <div>
                <strong>{product.name}</strong>
                <span>{product.category} / {selectedColor}</span>
                <span>Quantity: {quantity}</span>
              </div>
            </div>
            <div className="product-checkout-line">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <div className="product-checkout-line">
              <span>Tax</span>
              <strong>{money(taxes)}</strong>
            </div>
            <div className="product-checkout-line total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            {checkoutError && <p className="error">{checkoutError}</p>}
            {!token && <p className="product-checkout-note">Login is required before placing the order.</p>}
            <div className="product-payment-methods" aria-label="Payment method">
              <button
                className={paymentMethod === 'MTN' ? 'active' : ''}
                onClick={() => setPaymentMethod('MTN')}
                type="button"
              >
                <img src={mtnLogoPath} alt="MTN" />
                <span>MTN</span>
              </button>
              <button
                className={paymentMethod === 'Airtel' ? 'active' : ''}
                onClick={() => setPaymentMethod('Airtel')}
                type="button"
              >
                <img src={airtelLogoPath} alt="Airtel" />
                <span>Airtel</span>
              </button>
            </div>
            <label>
              Number to bill
              <input
                value={paymentForm.phone}
                onChange={(event) => setPaymentForm({ ...paymentForm, phone: event.target.value })}
                placeholder={paymentMethod === 'MTN' ? 'Enter MTN number' : 'Enter Airtel number'}
                inputMode="numeric"
                required={Boolean(token)}
              />
            </label>
            <button className="product-checkout-submit" disabled={isProcessing} type="submit">
              {!token ? 'Login to Buy Now' : isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </aside>
        )}
      </section>
    </main>
  );
}
// END: Product details page

// START: Cart page
// This page shows cart items, totals, and the cart checkout modal.
function CartView({ setView }) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const token = useSelector((state) => state.auth.token);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('MTN');
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    phone: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes;
  const canPlaceOrder = token && cart.length > 0;

  const openCheckout = () => {
    if (!token) {
      setView('auth');
      return;
    }
    setCheckoutOpen(true);
  };

  const confirmCheckout = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setCheckoutError('');
    try {
      // Payment is simulated, but the order still goes through the real API.
      await new Promise((resolve) => {
        setTimeout(resolve, 900);
      });
      await dispatch(placeOrder(cart)).unwrap();
      dispatch(clearCart());
      dispatch(fetchOrders());
      setCheckoutOpen(false);
      setView('orders');
    } catch (error) {
      setCheckoutError(errorMessage(error, 'Could not place this order.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="cart-screen">
      <section className="cart-shell">
        <div className="cart-topline">
          <button className="cart-brand-mark" onClick={() => setView('home')} type="button" aria-label="Go to home">
            <img src={logoPath} alt="" aria-hidden="true" />
            <span>QuickCart</span>
          </button>
          <nav className="cart-breadcrumb" aria-label="Breadcrumb">
            <button type="button" onClick={() => setView('home')}>Home</button>
            <span>/</span>
            <strong>Cart</strong>
          </nav>
        </div>

        <header className="cart-heading">
          <h1>Shopping cart</h1>
          <span>{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
        </header>

        <div className="cart-layout">
          <section className="cart-items-card" aria-label="Shopping cart items">
            {cart.length === 0 ? (
              <div className="cart-empty-state">
                <div className="cart-empty-icon" aria-hidden="true">Cart</div>
                <h2>Your cart is empty</h2>
                <p>Items you add will appear here. Browse the catalog to get started.</p>
                <button onClick={() => setView('shop')} type="button">Browse products</button>
              </div>
            ) : (
              <div className="cart-list">
                {cart.map((item) => (
                  <article className="cart-line" key={item.id}>
                    <ProductImage product={item} />
                    <div className="cart-line-copy">
                      <h2>{item.name}</h2>
                      <p>{item.category}</p>
                      <strong>{money(item.price)}</strong>
                    </div>
                    <div className="cart-quantity" aria-label={`Quantity for ${item.name}`}>
                      <button
                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        +
                      </button>
                    </div>
                    <strong className="cart-line-total">{money(Number(item.price) * item.quantity)}</strong>
                    <button className="cart-remove" onClick={() => dispatch(removeFromCart(item.id))} type="button">
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="cart-summary-card">
            <h2>Summary</h2>
            <div className="cart-summary-line"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <div className="cart-summary-line"><span>Taxes</span><strong>{money(taxes)}</strong></div>
            <div className="cart-summary-line total"><span>Total</span><strong>{money(total)}</strong></div>
            {!canPlaceOrder && cart.length > 0 && (
              <p className="hint">Login to place your order.</p>
            )}
            <button
              className="cart-checkout-button"
              disabled={cart.length === 0 || (token && !canPlaceOrder)}
              onClick={openCheckout}
              type="button"
            >
              Checkout
            </button>
            <p className="cart-secure-note">Secure checkout</p>
          </aside>
        </div>
      </section>

      {checkoutOpen && (
        <div className="checkout-overlay" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
          <form className="checkout-modal" onSubmit={confirmCheckout}>
            <div className="checkout-header">
              <div>
                <p className="eyebrow">Cart checkout</p>
                <h2 id="checkout-title">Complete checkout</h2>
              </div>
              <button className="checkout-close" onClick={() => setCheckoutOpen(false)} type="button" aria-label="Close checkout">
                X
              </button>
            </div>
            <p className="hint">Pay for all unpaid items in your cart. Payment is simulated for this assessment.</p>
            <div className="product-payment-methods" aria-label="Payment method">
              <button
                className={paymentMethod === 'MTN' ? 'active' : ''}
                onClick={() => setPaymentMethod('MTN')}
                type="button"
              >
                <img src={mtnLogoPath} alt="MTN" />
                <span>MTN</span>
              </button>
              <button
                className={paymentMethod === 'Airtel' ? 'active' : ''}
                onClick={() => setPaymentMethod('Airtel')}
                type="button"
              >
                <img src={airtelLogoPath} alt="Airtel" />
                <span>Airtel</span>
              </button>
            </div>
            <label>
              Number to bill
              <input
                value={paymentForm.phone}
                onChange={(event) => setPaymentForm({ ...paymentForm, phone: event.target.value })}
                placeholder={paymentMethod === 'MTN' ? 'Enter MTN number' : 'Enter Airtel number'}
                inputMode="numeric"
                required
              />
            </label>
            {checkoutError && <p className="error">{checkoutError}</p>}
            <div className="checkout-total">
              <span>Total to pay</span>
              <strong>{money(total)}</strong>
            </div>
            <button className="primary full" disabled={isProcessing} type="submit">
              {isProcessing ? 'Processing...' : 'Confirm Order'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
// END: Cart page

// START: Login and register page
// Customers use this page to create an account or sign in.
function AuthView({ setView }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (mode === 'register') {
        await dispatch(register(form)).unwrap();
      } else {
        await dispatch(login({ username: form.username, password: form.password })).unwrap();
      }
      setView('shop');
    } catch {
      // The auth slice stores a friendly error message for the form.
    }
  };

  return (
    <main className="auth-layout">
      <section className="panel auth-card">
        <div className="auth-logo" aria-hidden="true">
          <img src={logoPath} alt="" />
        </div>
        <div className="auth-heading">
          <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
          <p>{mode === 'login' ? 'Log in to continue to your account' : 'Register to start shopping faster'}</p>
        </div>

        <div className="mode-toggle" aria-label="Authentication mode">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">Login</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">Register</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label className="auth-field">
            Username
            <span className="auth-input-wrap">
              <input
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                placeholder="Enter your username"
                required
              />
            </span>
          </label>
          {mode === 'register' && (
            <label className="auth-field">
              Email
              <span className="auth-input-wrap">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="Enter your email"
                />
              </span>
            </label>
          )}
          <label className="auth-field">
            <span className="auth-label-row">
              <span>Password</span>
              {mode === 'login' && <button type="button">Forgot?</button>}
            </span>
            <span className="auth-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="Enter your password"
                required
              />
              <button
                className="auth-show-password"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>
          {mode === 'login' && (
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me for 30 days</span>
            </label>
          )}
          {error && <p className="error">{error}</p>}
          <button className="auth-submit" disabled={status === 'loading'} type="submit">
            {status === 'loading' ? 'Working...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}
          <button
            type="button"
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
          >
            {mode === 'register' ? 'Login' : 'Create one'}
          </button>
        </p>
      </section>
    </main>
  );
}
// END: Login and register page

// START: My Orders page
// Customers see their order history here after logging in.
function OrdersView({ setView }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const orders = useSelector((state) => state.orders.items);

  useEffect(() => {
    if (token) {
      dispatch(fetchOrders());
    }
  }, [dispatch, token]);

  const orderCount = token ? orders.length : 0;

  return (
    <main className="orders-screen">
      <section className="orders-shell">
        <header className="orders-heading">
          <h1>My Orders</h1>
          <p>
            {token
              ? `${orderCount} ${orderCount === 1 ? 'order' : 'orders'} placed on your account`
              : 'Login to view your order history'}
          </p>
        </header>

        {token && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => {
              const itemCount = order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;
              const placedDate = order.created_at
                ? new Date(order.created_at).toLocaleDateString('en-US')
                : 'Today';

              return (
                <article className="orders-card" key={order.id}>
                  <div className="orders-card-main">
                    <div className="orders-icon">
                      <img src={logoPath} alt="" aria-hidden="true" />
                    </div>
                    <div className="orders-copy">
                      <div>
                        <h2>Order #{order.id}</h2>
                        <span>{order.status}</span>
                      </div>
                      <p>Placed on {placedDate} - {itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                    </div>
                    <strong>{money(order.total_price)}</strong>
                  </div>
                  <div className="orders-card-foot">
                    <p><span />Awaiting confirmation from seller</p>
                    <button type="button">View details &gt;</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {token && (
          <section className="orders-empty-panel">
            <img src={logoPath} alt="" aria-hidden="true" />
            <h2>{orders.length === 0 ? "You don't have any orders yet" : "That's your order history so far"}</h2>
            <p>{orders.length === 0 ? 'Keep shopping to place your first order' : 'Keep shopping to see more orders show up here'}</p>
            {orders.length === 0 && (
              <button type="button" onClick={() => setView('shop')}>Continue Shopping</button>
            )}
          </section>
        )}

        {!token && (
          <section className="orders-empty-panel">
            <img src={logoPath} alt="" aria-hidden="true" />
            <h2>Login to see your orders</h2>
            <p>Your order history will appear here after you sign in.</p>
            <button type="button" onClick={() => setView('auth')}>Login</button>
          </section>
        )}
      </section>
    </main>
  );
}
// END: My Orders page

// START: Frontend admin dashboard
// Admin users can manage products and update order statuses here.
function AdminView() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const categories = useSelector((state) => state.products.categories);
  const orders = useSelector((state) => state.orders.items);
  const analytics = useSelector((state) => state.orders.analytics);
  const token = useSelector((state) => state.auth.token);
  const isAdmin = useSelector((state) => state.auth.user?.is_staff);
  const [form, setForm] = useState(emptyProductForm);
  const [editingId, setEditingId] = useState('');
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    // These endpoints are admin-only, so wait until the JWT and staff flag exist.
    if (!token || !isAdmin) {
      return;
    }

    dispatch(fetchAnalytics());
    dispatch(fetchOrders());
  }, [dispatch, isAdmin, token]);

  const submitProduct = async (event) => {
    event.preventDefault();
    const payload = { ...form, stock: Number(form.stock || 0) };
    setAdminError('');
    try {
      if (editingId) {
        await dispatch(updateProduct({ ...payload, id: editingId })).unwrap();
      } else {
        await dispatch(createProduct(payload)).unwrap();
      }
      setEditingId('');
      setForm(emptyProductForm);
    } catch (error) {
      setAdminError(errorMessage(error, 'Could not save product.'));
    }
  };

  const edit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      category_id: product.category_id || '',
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || '',
    });
  };

  return (
    <main className="page-shell admin-layout">
      <section className="metrics">
        <div><span>Total orders</span><strong>{analytics?.total_orders ?? 0}</strong></div>
        <div><span>Pending</span><strong>{analytics?.pending_orders ?? 0}</strong></div>
        <div><span>Completed</span><strong>{analytics?.completed_orders ?? 0}</strong></div>
        <div><span>Revenue</span><strong>{money(analytics?.revenue ?? 0)}</strong></div>
      </section>

      <section className="panel">
        <h1>{editingId ? 'Edit Product' : 'Add Product'}</h1>
        <form className="admin-form" onSubmit={submitProduct}>
          <input placeholder="Product name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <select value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })} required>
            <option value="">Select category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <input placeholder="Price" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
          <input placeholder="Stock" type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
          <input placeholder="Image URL" value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          {adminError && <p className="error">{adminError}</p>}
          <button className="primary" type="submit">{editingId ? 'Save Changes' : 'Add Product'}</button>
        </form>
      </section>

      <section className="panel">
        <h1>Manage Products</h1>
        <div className="compact-list">
          {products.map((product) => (
            <div className="admin-row" key={product.id}>
              <span>{product.name}</span>
              <strong>{money(product.price)}</strong>
              <button onClick={() => edit(product)} type="button">Edit</button>
              <button onClick={() => dispatch(deleteProduct(product.id))} type="button">Delete</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h1>Order List</h1>
        <div className="compact-list">
          {orders.map((order) => (
            <div className="admin-row" key={order.id}>
              <span>#{order.id} {order.customer}</span>
              <strong>{money(order.total_price)}</strong>
              <select
                value={order.status}
                onChange={(event) => dispatch(updateOrderStatus({ id: order.id, status: event.target.value }))}
              >
                <option value="pending">pending</option>
                <option value="processing">processing</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
// END: Frontend admin dashboard

// START: Main app controller
// This decides which page to show based on the current URL.
function App() {
  const dispatch = useDispatch();
  const [route, setRoute] = useState(() => pathToRoute());
  const filters = useSelector((state) => state.products.filters);
  const isAdmin = useSelector((state) => state.auth.user?.is_staff);
  const view = route.view;

  const setView = (nextView, productId, options = {}) => {
    // START: Change the browser URL
    // All navbar/page clicks come through here.
    // pushState updates localhost:3000/shop, /cart, /orders, /products/:id, etc.
    const nextPath = viewToPath(nextView, productId);
    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (nextPath !== currentPath) {
      if (options.replace) {
        window.history.replaceState(null, '', nextPath);
      } else {
        window.history.pushState(null, '', nextPath);
      }
    }

    setRoute({ view: nextView, productId: productId || null });
    // END: Change the browser URL
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(pathToRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (view === 'admin' && !isAdmin) {
      setView('shop', null, { replace: true });
    }
  }, [isAdmin, view]);

  const currentView = useMemo(() => {
    if (view === 'admin' && !isAdmin) {
      return 'shop';
    }
    return view;
  }, [view, isAdmin]);

  return (
    <div className="app">
      <Header currentView={currentView} setView={setView} />
      {currentView === 'home' && <SplashView setView={setView} />}
      {currentView === 'shop' && <ShopView setView={setView} />}
      {currentView === 'detail' && <ProductDetailView setView={setView} routeProductId={route.productId} />}
      {currentView === 'cart' && <CartView setView={setView} />}
      {currentView === 'auth' && <AuthView setView={setView} />}
      {currentView === 'orders' && <OrdersView setView={setView} />}
      {currentView === 'admin' && <AdminView />}
    </div>
  );
}
// END: Main app controller

export default App;
