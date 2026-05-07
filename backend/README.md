# 🔐 Auth Project - Backend API

A production-ready authentication and authorization backend built with **Express.js**, **TypeScript**, **PostgreSQL**, and **Redis**. Implements secure JWT-based auth with refresh tokens, rate limiting, IP banning, and role-based access control.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Database](#database)
- [Contributing](#contributing)

---

## ✨ Features

### Authentication & Authorization
- ✅ **JWT-based Authentication** - Access tokens + Refresh tokens
- ✅ **Secure Password Hashing** - Argon2id algorithm
- ✅ **Role-Based Access Control** - Admin and User roles
- ✅ **Session Management** - Redis-backed session tracking
- ✅ **Token Revocation** - Immediate logout support

### Security
- ✅ **Rate Limiting** - User-level, IP-level, and endpoint-specific limits
- ✅ **IP Banning System** - Admin can ban/unban IPs
- ✅ **CORS Protection** - Configurable origin whitelist
- ✅ **Security Headers** - Helmet.js integration
- ✅ **Input Validation** - Zod schema validation
- ✅ **SQL Injection Prevention** - Prisma ORM parameterized queries

### Developer Experience
- ✅ **TypeScript** - Full type safety
- ✅ **Comprehensive Logging** - Winston logger with file rotation
- ✅ **Testing Framework** - Jest with test examples
- ✅ **Code Linting** - ESLint + Prettier
- ✅ **Error Handling** - Centralized global error handler
- ✅ **Docker Support** - Docker Compose for local development

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js (with TypeScript) |
| **Framework** | Express.js 5.x |
| **Database** | PostgreSQL 15+ |
| **ORM** | Prisma 7.x |
| **Cache/Sessions** | Redis |
| **Auth** | JWT (jsonwebtoken) |
| **Password Hashing** | Argon2id |
| **Validation** | Zod |
| **Logging** | Winston |
| **Testing** | Jest + ts-jest |
| **Linting** | ESLint + Prettier |
| **Security** | Helmet, CORS, Rate Limiting |

---

## 📦 Prerequisites

- **Node.js** >= 18.x
- **npm** or **pnpm** >= 9.x
- **PostgreSQL** >= 15.x
- **Redis** >= 6.x
- **Docker** & **Docker Compose** (optional, for containerized setup)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd auth-project/backend
```

### 2. Install Dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Or using npm:
```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure your local database and Redis connection:

```env
NODE_ENV=development
PORT=5001
DATABASE_URL=postgresql://user:password@localhost:5432/auth_project
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
COOKIE_SECRET=your-cookie-secret
```

### 4. Set Up Database

With Docker Compose:
```bash
docker-compose up -d
```

Or manually start PostgreSQL and Redis.

### 5. Run Migrations

```bash
pnpm run prisma migrate deploy
```

Or for development with shadow database:
```bash
pnpm run prisma migrate dev --name "initial migration"
```

---

## ⚙️ Configuration

### Environment Variables

See `.env.example` for all available configuration options:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5001)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret key for access tokens (min 32 chars)
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens (min 32 chars)
- `JWT_EXPIRES_IN` - Access token expiry (default: 15m)
- `COOKIE_SECRET` - Secret for signed cookies (min 32 chars)
- `ALLOWED_ORIGINS` - Comma-separated CORS allowed origins

### Rate Limiting

Configure in `src/config/limiter.config.ts`:

- **Auth Limiter**: 10 requests per hour (per email + IP)
- **IP Rate Limiter**: 20-30 requests per 60 seconds
- **User Rate Limiter**: 5-50 requests per 60 seconds (depending on endpoint)

---

## 🏃 Running the Server

### Development Mode

```bash
pnpm run dev
```

Server runs with hot-reload on http://localhost:5001

### Production Build

```bash
pnpm run build
pnpm run start
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "john_doe"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "ulid123",
      "email": "user@example.com",
      "username": "john_doe",
      "role": "USER",
      "createdAt": "2026-05-07T10:00:00Z"
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note**: Refresh token is sent as a secure HTTP-only cookie.

#### Refresh Token
```http
POST /api/auth/refresh-token
```

**Response** (200 OK):
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```http
GET /api/auth/get-me
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "ulid123",
      "email": "user@example.com",
      "username": "john_doe",
      "role": "USER",
      "createdAt": "2026-05-07T10:00:00Z"
    }
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "status": "success",
  "message": "Logged out"
}
```

### Admin Endpoints

#### Ban IP
```http
POST /api/admin/security/ban-ip
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "ip": "192.168.1.100"
}
```

#### Unban IP
```http
POST /api/admin/security/unban-ip
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "ip": "192.168.1.100"
}
```

---

## 🧪 Testing

### Run All Tests
```bash
pnpm test
```

### Run Tests in Watch Mode
```bash
pnpm test:watch
```

### Generate Coverage Report
```bash
pnpm test:coverage
```

Test files are located in the `tests/` directory and follow the naming convention `*.test.ts` or `*.spec.ts`.

---

## 🎨 Code Quality

### Linting
```bash
# Check for linting errors
pnpm run lint

# Fix linting errors automatically
pnpm run lint:fix
```

### Formatting
```bash
# Check formatting
pnpm run format:check

# Auto-format code
pnpm run format
```

### Pre-commit Hooks

Recommended to add pre-commit hooks using Husky:
```bash
npm install husky lint-staged --save-dev
npx husky install
```

---

## 📁 Project Structure

```
src/
├── @types/                 # TypeScript type definitions
│   └── express.d.ts       # Express Request extensions
├── config/                 # Configuration files
│   ├── auth.config.ts     # Auth constants
│   ├── cookie.config.ts   # Cookie options
│   ├── cors.config.ts     # CORS configuration
│   └── limiter.config.ts  # Rate limiting config
├── controllers/            # Route handlers
│   ├── auth.controller.ts
│   ├── admin.controller.ts
│   └── user.controller.ts
├── middlewares/            # Express middlewares
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   ├── http-logger.middleware.ts
│   ├── ip.ban.middleware.ts
│   ├── ip.rate-limiter.ts
│   ├── redis.rate-limiter.ts
│   ├── role.middleware.ts
│   └── validate.middleware.ts
├── routes/                 # API routes
│   ├── auth.routes.ts
│   └── admin.secury.routes.ts
├── services/               # Business logic
│   ├── auth.service.ts
│   ├── admin.service.ts
│   └── user.service.ts
├── utils/                  # Utility functions
│   ├── catch.async.ts     # Async error wrapper
│   ├── error.util.ts      # Error creation
│   ├── jwt.util.ts        # JWT operations
│   ├── password.util.ts   # Password hashing
│   ├── redisKey.util.ts   # Redis key patterns
│   └── token.util.ts      # Token hashing
├── validators/             # Input validation schemas
│   └── auth.validator.ts
├── lib/                    # External service connections
│   ├── logger.ts          # Winston logger
│   ├── prisma.ts          # Prisma client
│   └── redis.ts           # Redis client
├── app.ts                 # Express app setup
└── index.ts               # Server entry point

prisma/
├── schema.prisma          # Database schema
└── migrations/            # Database migrations

tests/                     # Test files
├── error.util.test.ts
└── token.util.test.ts
```

---

## 🔒 Security Features

### 1. **Password Security**
- Argon2id hashing with high memory cost (2^16)
- Time cost of 3 iterations
- No plain-text passwords stored

### 2. **JWT Tokens**
- Separate access (15min) and refresh (7d) tokens
- Tokens validated on every protected request
- Token revocation supported

### 3. **Rate Limiting**
- **User-level**: Prevents account enumeration
- **IP-level**: Prevents brute force attacks
- **Admin panel**: Stricter limits for sensitive operations

### 4. **IP Management**
- Admin can ban suspicious IPs
- Banned IPs get 403 Forbidden response
- Ban duration configurable (default: 24 hours)

### 5. **CORS Protection**
- Whitelist-based origin validation
- Credentials only sent to allowed origins
- Strict SameSite cookie policy

### 6. **Input Validation**
- All inputs validated with Zod schemas
- Type-safe error messages
- SQL injection prevention via Prisma

### 7. **Error Handling**
- Operational errors: user-friendly messages
- Unhandled errors: generic message in production
- Full stack traces in development

---

## 🗄️ Database

### Schema Overview

**User Model**
- `id`: ULID primary key
- `email`: Unique email address
- `username`: Optional username
- `password`: Hashed password (Argon2id)
- `role`: USER or ADMIN
- `isVerified`: Email verification status
- `createdAt`: Account creation timestamp

**RefreshToken Model**
- `id`: ULID primary key
- `token`: Unique hashed refresh token
- `userId`: Foreign key to User
- `expiresAt`: Token expiration time
- `isRevoked`: Revocation status
- `revokedAt`: Timestamp when revoked
- `userAgent`: Client user agent
- `ipAddress`: Client IP address

### Indexes

Optimized queries with indexes on:
- `User.email` - Fast lookup by email
- `User.role` - Filter by user role
- `RefreshToken.token` - Token validation
- `RefreshToken.userId` - User session lookup
- `RefreshToken.expiresAt` - Cleanup queries
- `RefreshToken.isRevoked` - Revocation status

### Migrations

Run migrations with:
```bash
pnpm prisma migrate dev
```

View database with:
```bash
pnpm prisma studio
```

---

## 🤝 Contributing

### Setting Up Development Environment

1. Fork and clone the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make changes and commit: `git commit -m "feat: add your feature"`
4. Run tests: `pnpm test`
5. Run linting: `pnpm lint:fix`
6. Push and create a Pull Request

### Code Style Guidelines

- Use TypeScript for all new code
- Follow ESLint configuration
- Format code with Prettier
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📝 License

ISC License - see LICENSE file for details

---

## 📞 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

## 🎯 Roadmap

- [ ] Email verification with OTP
- [ ] OAuth2 integration (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] API versioning (/v1/, /v2/)
- [ ] Swagger/OpenAPI documentation
- [ ] GraphQL API alternative
- [ ] Monitoring with Prometheus/Grafana
- [ ] Advanced analytics dashboard
- [ ] Multi-tenancy support

---

**Last Updated**: May 7, 2026  
**Version**: 1.0.0
