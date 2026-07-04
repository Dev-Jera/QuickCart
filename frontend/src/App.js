import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import {
  addToCart,
  clearCart,
  createProduct,
  deleteProduct,
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

const categories = ['electronics', 'fashion', 'home', 'beauty', 'sports', 'other'];
const taxRate = 0.16;
const logoPath = `${process.env.PUBLIC_URL}/quickcart-logo.png`;
const splashBgPath = `${process.env.PUBLIC_URL}/bg-image.jpg`;
const mtnLogoPath = `${process.env.PUBLIC_URL}/mtn-logo.jfif`;
const airtelLogoPath = `${process.env.PUBLIC_URL}/airtel-logo.png`;

const money = (value) => Number(value || 0).toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD',
});

function MenuIcon({ name }) {
  const icons = {
    shop: <path d="M4 10.5 5.2 5h13.6L20 10.5M6 10.5V19h12v-8.5M9 19v-5h6v5" />,
    cart: <path d="M5 5h2l1.2 8.2h8.6L18 8H8M9 18h.01M17 18h.01" />,
    orders: <path d="M8 4h8l2 2v14H6V6l2-2ZM9 10h6M9 14h6M9 18h4" />,
    login: <path d="M10 7V5h8v14h-8v-2M4 12h9M10 9l3 3-3 3" />,
    admin: <path d="M12 4 5 7v5c0 4 3 6.5 7 8 4-1.5 7-4 7-8V7l-7-3ZM9 12l2 2 4-4" />,
    logout: <path d="M14 7V5H6v14h8v-2M11 12h9M17 9l3 3-3 3" />,
  };

  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

function ProductImage({ product }) {
  return (
    <img
      src={product.image_url || product.image || 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=900&q=80'}
      alt={product.name}
      className="product-image"
    />
  );
}

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
            {view === 'cart' ? `Cart (${cartCount})` : view}
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

function SplashView({ setView }) {
  const dispatch = useDispatch();
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const user = useSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (view) => {
    setView(view);
    setMenuOpen(false);
  };

  return (
    <main
      className="splash-screen"
      style={{ backgroundImage: `url(${splashBgPath})` }}
    >
      <div className={menuOpen ? 'splash-topbar menu-open' : 'splash-topbar'}>
        <img className="splash-logo" src={logoPath} alt="QuickCart" />
        <button
          className="menu-toggle splash-menu-toggle"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <span className="close-icon">X</span>
          ) : (
            <>
              <span />
              <span />
              <span />
            </>
          )}
        </button>
      </div>
      <nav className={menuOpen ? 'splash-nav open' : 'splash-nav'} aria-label="Splash navigation">
        <button className="splash-nav-item" onClick={() => goTo('shop')} type="button">
          <MenuIcon name="shop" />
          <span>Shop</span>
        </button>
        <button className="splash-nav-item" onClick={() => goTo('cart')} type="button">
          <MenuIcon name="cart" />
          <span>Cart ({cartCount})</span>
        </button>
        <button className="splash-nav-item" onClick={() => goTo('orders')} type="button">
          <MenuIcon name="orders" />
          <span>Orders</span>
        </button>
        {user?.is_staff && (
          <button className="splash-nav-item" onClick={() => goTo('admin')} type="button">
            <MenuIcon name="admin" />
            <span>Admin</span>
          </button>
        )}
        {user ? (
          <button
            className="splash-nav-item"
            onClick={() => {
              dispatch(logout());
              setMenuOpen(false);
            }}
            type="button"
          >
            <MenuIcon name="logout" />
            <span>Logout</span>
          </button>
        ) : (
          <button className="splash-nav-item" onClick={() => goTo('auth')} type="button">
            <MenuIcon name="login" />
            <span>Login</span>
          </button>
        )}
      </nav>
      <section className="splash-content">
        <div className="splash-brand-badge">
          <img src={logoPath} alt="" aria-hidden="true" />
          <strong>QuickCart</strong>
        </div>
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
          <div><strong>4.8★</strong><span>Average rating</span></div>
        </div>
      </section>
      <button className="splash-scroll" onClick={() => setView('shop')} type="button" aria-label="Enter shop">
        ↓
      </button>
    </main>
  );
}

function Filters() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.products.filters);

  const update = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    dispatch(setFilters({ [key]: value }));
    dispatch(fetchProducts(nextFilters));
  };

  return (
    <section className="shop-filters" aria-label="Product filters">
      <label className="shop-search">
        <span aria-hidden="true">⌕</span>
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
            key={category}
            className={filters.category === category ? 'active' : ''}
            onClick={() => update('category', category)}
            type="button"
          >
            {category}
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

function ShopView({ setView }) {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.products);
  const user = useSelector((state) => state.auth.user);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <main className="shop-screen">
      <section className="shop-app">
        <div className="shop-topbar">
          <button className="shop-logo-button" onClick={() => setView('home')} type="button" aria-label="Go to home">
            <img src={logoPath} alt="QuickCart" />
          </button>
          <div className="shop-top-actions">
            <button className="shop-link" onClick={() => setView('home')} type="button">Home</button>
            <button className="shop-link" onClick={() => setView('cart')} type="button">Cart ({cartCount})</button>
            <button className="shop-link" onClick={() => setView('orders')} type="button">Orders</button>
            <button className="shop-link primary-link" onClick={() => setView(user ? 'orders' : 'auth')} type="button">
              {user ? 'Account' : 'Login'}
            </button>
          </div>
        </div>

        <section className="shop-heading">
          <p>QuickCart Maternal</p>
          <h1>Best maternal finds for every stage</h1>
        </section>

        <Filters />

        <div className="section-title-row products-title">
          <h2>Featured Products</h2>
          <button type="button">View all</button>
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
                  setView('detail');
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
                  <span>★ 4.8</span>
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

// eslint-disable-next-line no-unused-vars
function DetailView({ setView }) {
  const dispatch = useDispatch();
  const product = useSelector((state) => state.products.selected);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const [quantity, setQuantity] = useState(1);

  if (!product) {
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

  return (
    <main className="detail-screen">
      <section className="detail-card">
        <header className="detail-topbar">
          <button className="detail-icon" onClick={() => setView('shop')} type="button" aria-label="Back to shop">←</button>
          <h1>Details</h1>
          <button className="detail-icon cart-count" onClick={() => setView('cart')} type="button" aria-label="Open cart">
            🛒
            <span>{cartCount}</span>
          </button>
        </header>

        <section className="detail-stage">
          <aside className="detail-specs">
            <div><strong>{product.stock}</strong><span>In stock</span></div>
            <div><strong>{product.category}</strong><span>Category</span></div>
            <div><strong>4.8</strong><span>Rating</span></div>
          </aside>
          <ProductImage product={product} />
        </section>

        <div className="detail-quantity">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} type="button">−</button>
          <strong>{quantity}</strong>
          <button onClick={() => setQuantity(quantity + 1)} type="button">+</button>
        </div>

        <section className="detail-info">
          <span className="pill">{product.category}</span>
          <h2>{product.name}</h2>
          <strong>{money(product.price)}</strong>
          <p className="detail-rating">★ 4.8</p>
          <div className="detail-swatches" aria-label="Available colors">
            <span className="swatch selected" />
            <span className="swatch pink" />
            <span className="swatch dark" />
          </div>
          <h3>Description</h3>
          <p>{product.description || 'A carefully selected maternal essential for everyday comfort, care, and convenience.'}</p>
          <button className="primary full detail-buy" onClick={addSelectedQuantity} type="button">
            Add to Cart
          </button>
        </section>
      </section>
    </main>
  );
}

function ProductDetailView({ setView }) {
  const dispatch = useDispatch();
  const product = useSelector((state) => state.products.selected);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Pink');
  const [paymentMethod, setPaymentMethod] = useState('MTN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [detailMenuOpen, setDetailMenuOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    phone: '',
  });

  if (!product) {
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
    setOrderPlaced(false);
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
    await dispatch(placeOrder([{ ...product, quantity }])).unwrap();
    dispatch(removeFromCart(product.id));
    dispatch(fetchOrders());
    setIsProcessing(false);
    setOrderPlaced(true);
  };

  const goToDetailMenu = (view) => {
    setView(view);
    setDetailMenuOpen(false);
  };

  return (
    <main className="product-detail-screen">
      <button
        className={detailMenuOpen ? 'product-detail-menu-button open' : 'product-detail-menu-button'}
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={detailMenuOpen}
        onClick={() => setDetailMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={detailMenuOpen ? 'product-detail-mobile-menu open' : 'product-detail-mobile-menu'} aria-label="Product page navigation">
        <button type="button" onClick={() => goToDetailMenu('shop')}>Shop</button>
        <button type="button" onClick={() => goToDetailMenu('cart')}>Cart ({cartCount})</button>
        <button type="button" onClick={() => goToDetailMenu('orders')}>Orders</button>
        {user?.is_staff && <button type="button" onClick={() => goToDetailMenu('admin')}>Admin</button>}
        {user ? (
          <button
            type="button"
            onClick={() => {
              dispatch(logout());
              setDetailMenuOpen(false);
            }}
          >
            Logout
          </button>
        ) : (
          <button type="button" onClick={() => goToDetailMenu('auth')}>Login</button>
        )}
      </nav>
      <section className="product-detail-card checkout-open">
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
            <div><span>Rating</span><strong>★ 4.8</strong></div>
          </aside>
        </section>

        <section className="product-detail-info">
          <span className="product-detail-pill">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="product-detail-price">
            <strong>{money(product.price)}</strong>
            <span>★ 4.8 rating</span>
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
          </div>
        </section>

        <aside className="product-checkout-panel" aria-label="Checkout">
          <div className="product-checkout-header">
            <div>
              <span>Checkout</span>
              <h2>{orderPlaced ? 'Order placed' : 'Complete order'}</h2>
            </div>
          </div>
          {orderPlaced ? (
            <div className="product-checkout-success">
              <p>Your order was placed successfully. We have sent a receipt of your order to your email.</p>
              <button type="button" onClick={() => setView('orders')}>View Orders</button>
            </div>
          ) : (
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
                {!token ? 'Login to Checkout' : isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          )}
        </aside>
      </section>
    </main>
  );
}

function CartView({ setView }) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const token = useSelector((state) => state.auth.token);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    name: '',
    card: '',
    expiry: '',
    cvv: '',
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
    await new Promise((resolve) => {
      setTimeout(resolve, 900);
    });
    await dispatch(placeOrder(cart)).unwrap();
    dispatch(clearCart());
    dispatch(fetchOrders());
    setCheckoutOpen(false);
    setIsProcessing(false);
    setView('orders');
  };

  return (
    <main className="page-shell two-column">
      <section className="panel">
        <h1>Shopping Cart</h1>
        {cart.length === 0 && <p>Your cart is empty.</p>}
        {cart.map((item) => (
          <div className="cart-line" key={item.id}>
            <ProductImage product={item} />
            <div>
              <h2>{item.name}</h2>
              <p>{money(item.price)}</p>
            </div>
            <input
              aria-label={`Quantity for ${item.name}`}
              type="number"
              min="0"
              value={item.quantity}
              onChange={(event) => dispatch(updateQuantity({
                id: item.id,
                quantity: Number(event.target.value),
              }))}
            />
            <button onClick={() => dispatch(removeFromCart(item.id))} type="button">Remove</button>
          </div>
        ))}
      </section>
      <aside className="panel summary">
        <h2>Cart Summary</h2>
        <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
        <div><span>Taxes</span><strong>{money(taxes)}</strong></div>
        <div className="total"><span>Total</span><strong>{money(total)}</strong></div>
        {!canPlaceOrder && cart.length > 0 && (
          <p className="hint">Login to place your order.</p>
        )}
        <button className="primary full" disabled={cart.length === 0 || (token && !canPlaceOrder)} onClick={openCheckout} type="button">
          Checkout
        </button>
      </aside>
      {checkoutOpen && (
        <div className="checkout-overlay" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
          <form className="checkout-modal" onSubmit={confirmCheckout}>
            <div className="checkout-header">
              <div>
                <p className="eyebrow">Mock payment</p>
                <h2 id="checkout-title">Complete checkout</h2>
              </div>
              <button className="checkout-close" onClick={() => setCheckoutOpen(false)} type="button" aria-label="Close checkout">
                X
              </button>
            </div>
            <p className="hint">Payment is simulated for this assessment. No real card is charged.</p>
            <label>
              Name on card
              <input
                value={paymentForm.name}
                onChange={(event) => setPaymentForm({ ...paymentForm, name: event.target.value })}
                placeholder="Jane Doe"
                required
              />
            </label>
            <label>
              Card number
              <input
                value={paymentForm.card}
                onChange={(event) => setPaymentForm({ ...paymentForm, card: event.target.value })}
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                required
              />
            </label>
            <div className="checkout-grid">
              <label>
                Expiry
                <input
                  value={paymentForm.expiry}
                  onChange={(event) => setPaymentForm({ ...paymentForm, expiry: event.target.value })}
                  placeholder="12/30"
                  required
                />
              </label>
              <label>
                CVV
                <input
                  value={paymentForm.cvv}
                  onChange={(event) => setPaymentForm({ ...paymentForm, cvv: event.target.value })}
                  placeholder="123"
                  inputMode="numeric"
                  required
                />
              </label>
            </div>
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

function AuthView({ setView }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (mode === 'register') {
      await dispatch(register(form)).unwrap();
    } else {
      await dispatch(login({ username: form.username, password: form.password })).unwrap();
    }
    setView('shop');
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
          <h1>Past Orders</h1>
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
                    <button type="button">View details -></button>
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

function AdminView() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const orders = useSelector((state) => state.orders.items);
  const analytics = useSelector((state) => state.orders.analytics);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'other',
    price: '',
    stock: '',
    image_url: '',
  });
  const [editingId, setEditingId] = useState('');

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchOrders());
  }, [dispatch]);

  const submitProduct = async (event) => {
    event.preventDefault();
    const payload = { ...form, stock: Number(form.stock || 0) };
    if (editingId) {
      await dispatch(updateProduct({ ...payload, id: editingId })).unwrap();
    } else {
      await dispatch(createProduct(payload)).unwrap();
    }
    setEditingId('');
    setForm({ name: '', description: '', category: 'other', price: '', stock: '', image_url: '' });
  };

  const edit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
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
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <input placeholder="Price" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
          <input placeholder="Stock" type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
          <input placeholder="Image URL" value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
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

function App() {
  const dispatch = useDispatch();
  const [view, setView] = useState('home');
  const filters = useSelector((state) => state.products.filters);
  const isAdmin = useSelector((state) => state.auth.user?.is_staff);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const currentView = useMemo(() => {
    if (view === 'admin' && !isAdmin) {
      return 'shop';
    }
    return view;
  }, [view, isAdmin]);

  return (
    <div className="app">
      {currentView !== 'home' && currentView !== 'shop' && currentView !== 'detail' && currentView !== 'auth' && (
        <Header currentView={currentView} setView={setView} />
      )}
      {currentView === 'home' && <SplashView setView={setView} />}
      {currentView === 'shop' && <ShopView setView={setView} />}
      {currentView === 'detail' && <ProductDetailView setView={setView} />}
      {currentView === 'cart' && <CartView setView={setView} />}
      {currentView === 'auth' && <AuthView setView={setView} />}
      {currentView === 'orders' && <OrdersView setView={setView} />}
      {currentView === 'admin' && <AdminView />}
    </div>
  );
}

export default App;
