# QuickCart

QuickCart is a mini e-commerce platform built for the developer technical assessment. Customers can browse products, manage a cart, and place simulated orders. Admin users can manage products, view orders, update order status, and see basic order analytics.

## Tech Stack

- Backend: Python, Django, Django REST Framework
- Frontend: React, Redux Toolkit
- Database: PostgreSQL
- Containerization: Docker Compose
- CI/CD: GitHub Actions
- Testing: Django unit tests and React Testing Library

## Local Setup

### 1. Environment

Create a `.env` file in the project root:

```env
POSTGRES_DB=quickcart
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,testserver
DJANGO_SECRET_KEY=quickcart-dev-secret
DJANGO_DEBUG=True
```

Use your own PostgreSQL username and password if different.

### 2. Backend

```powershell
cd D:\UZAZI\quickcart\backend
py -3.12 manage.py migrate
py -3.12 manage.py createsuperuser
py -3.12 manage.py runserver
```

Backend URL:

```text
http://localhost:8000
```

### 3. Frontend

Open a second terminal:

```powershell
cd D:\UZAZI\quickcart\frontend
npm install
npm start
```

Frontend URL:

```text
http://localhost:3000
```

Login with the superuser account to access the admin dashboard and add products. Products are not hardcoded in the frontend; they appear after an admin creates them.

## Docker Setup

Run the full stack:

```powershell
cd D:\UZAZI\quickcart
docker compose up
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

## API Documentation

Base URL:

```text
http://localhost:8000/api
```

### Authentication

- `POST /api/register/` - register a customer
- `POST /api/token/` - get JWT access and refresh tokens
- `POST /api/token/refresh/` - refresh JWT access token
- `GET /api/me/` - get current user profile

### Products

- `GET /api/products/` - list products
- `GET /api/products/?search=bag` - search products
- `GET /api/products/?category=fashion` - filter by category
- `GET /api/products/?min_price=10&max_price=100` - filter by price
- `GET /api/products/{id}/` - product detail
- `POST /api/products/` - admin only, add product
- `PATCH /api/products/{id}/` - admin only, edit product
- `DELETE /api/products/{id}/` - admin only, delete product

### Orders

- `GET /api/orders/` - customers see their own orders, admins see all orders
- `POST /api/orders/` - place order with simulated payment
- `PATCH /api/orders/{id}/` - admin only, update order status
- `GET /api/orders/analytics/` - admin only, order count and revenue

Order payload:

```json
{
  "order_items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

## Testing

Backend:

```powershell
cd D:\UZAZI\quickcart\backend
py -3.12 manage.py test
```

Frontend:

```powershell
cd D:\UZAZI\quickcart\frontend
npm test -- --watchAll=false --runInBand
```

Frontend production build:

```powershell
cd D:\UZAZI\quickcart\frontend
npm run build
```

## CI/CD

GitHub Actions workflow:

```text
.github/workflows/ci.yml
```

The pipeline runs:

- Backend dependency install and tests
- Frontend dependency install
- Frontend tests
- Frontend production build

Deployment can be added to the same workflow after choosing a host such as Render, Railway, Heroku, or DigitalOcean.

## Demo

- Live app: TODO after deployment
- GitHub repository: TODO after pushing to GitHub

## Known Issues and TODOs

- Deployment is not configured yet.
- Product image upload uses an image URL field in the frontend admin form.
- Payment is simulated as required; no real payment provider is integrated.
- Product ratings, reviews, and infinite scroll are optional bonuses and are not implemented.
