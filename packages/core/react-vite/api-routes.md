---
skill: api-routes
version: 1.0.0
framework: react-vite
category: api
triggers:
  - "API routes"
  - "server endpoints"
  - "API development"
  - "REST endpoints"
author: "@nexus-framework/skills"
status: active
---

# Skill: API Routes (React + Vite)

## When to Read This
Read this skill when implementing API endpoints, server-side routes, or backend functionality in a React + Vite application.

## Context
This project uses Express.js for API routes with proper middleware, error handling, and validation. We follow RESTful conventions with consistent response formats, proper HTTP status codes, and comprehensive error handling. API routes are organized by resource with proper separation of concerns and middleware for authentication, logging, and validation.

## Steps
1. Set up Express server with proper middleware
2. Create route handlers following REST conventions
3. Implement proper error handling and validation
4. Add authentication and authorization middleware
5. Create consistent response formats
6. Implement rate limiting and input sanitization
7. Add comprehensive logging and monitoring
8. Write tests for all API endpoints

## Patterns We Use
- Express.js: Use for server-side API implementation
- REST conventions: Follow standard HTTP methods and status codes
- Middleware: Use for authentication, validation, and error handling
- Validation: Use libraries like Joi or Zod for input validation
- Error handling: Centralized error handling with proper status codes
- Response format: Consistent JSON response structure
- Authentication: JWT tokens or session-based authentication
- Rate limiting: Implement per-IP or per-user rate limits

## Anti-Patterns — Never Do This
- ❌ Do not expose sensitive information in error messages
- ❌ Do not ignore input validation and sanitization
- ❌ Do not hardcode secrets or credentials
- ❌ Do not ignore CORS configuration
- ❌ Do not forget to handle async errors properly
- ❌ Do not create overly complex nested routes
- ❌ Do not ignore security best practices
- ❌ Do not forget to implement proper logging

## Example

```typescript
// src/server/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import { authMiddleware } from './middleware/auth';
import { userRoutes } from './routes/users';
import { authRoutes } from './routes/auth';
import { apiRoutes } from './routes/api';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.originalUrl,
      method: req.method,
    },
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
```

```typescript
// src/server/routes/users.ts
import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { UserService } from '../services/userService';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const userService = new UserService();

// GET /api/users - Get all users (admin only)
router.get(
  '/',
  authMiddleware(['admin']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().trim().escape(),
  query('sortBy').optional().isIn(['name', 'email', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid query parameters',
          details: errors.array(),
        },
      });
    }

    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const result = await userService.getUsers({
        page: Number(page),
        limit: Number(limit),
        search: String(search),
        sortBy: String(sortBy),
        sortOrder: String(sortOrder) as 'asc' | 'desc',
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch users',
        },
      });
    }
  }
);

// GET /api/users/:id - Get user by ID
router.get(
  '/:id',
  param('id').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid user ID',
          details: errors.array(),
        },
      });
    }

    try {
      const user = await userService.getUserById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch user',
        },
      });
    }
  }
);

// POST /api/users - Create new user
router.post(
  '/',
  body('name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }),
  body('role').optional().isIn(['user', 'admin', 'moderator']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    try {
      const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role || 'user',
      };

      const user = await userService.createUser(userData);

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      });
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Email already exists',
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create user',
        },
      });
    }
  }
);

// PUT /api/users/:id - Update user
router.put(
  '/:id',
  param('id').isMongoId(),
  body('name').optional().trim().isLength({ min: 2, max: 50 }).escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['user', 'admin', 'moderator']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    try {
      const updates = { ...req.body };
      const user = await userService.updateUser(req.params.id, updates);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Email already exists',
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update user',
        },
      });
    }
  }
);

// DELETE /api/users/:id - Delete user
router.delete(
  '/:id',
  param('id').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid user ID',
          details: errors.array(),
        },
      });
    }

    try {
      const user = await userService.deleteUser(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete user',
        },
      });
    }
  }
);

export { router as userRoutes };
```

```typescript
// src/server/routes/auth.ts
import express from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/authService';

const router = express.Router();
const authService = new AuthService();

// POST /api/auth/register - User registration
router.post(
  '/register',
  body('name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    try {
      const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      };

      const result = await authService.register(userData);

      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully',
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Email already exists',
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Registration failed',
        },
      });
    }
  }
);

// POST /api/auth/login - User login
router.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      if (!result) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid credentials',
          },
        });
      }

      res.json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Login failed',
        },
      });
    }
  }
);

// POST /api/auth/logout - User logout
router.post('/logout', async (req, res) => {
  try {
    // In a real implementation, this would invalidate the token
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Logout failed',
      },
    });
  }
});

// POST /api/auth/refresh - Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Refresh token required',
        },
      });
    }

    const result = await authService.refreshToken(refreshToken);

    if (!result) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token',
        },
      });
    }

    res.json({
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Token refresh failed',
      },
    });
  }
});

export { router as authRoutes };
```

```typescript
// src/server/services/userService.ts
import { User } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export class UserService {
  async getUsers(params: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = params;
    
    const query = search 
      ? { $text: { $search: search } }
      : {};

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password'); // Exclude password from results

    const total = await User.countDocuments(query);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  async getUserById(id: string) {
    return User.findById(id).select('-password');
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const hashedPassword = await hashPassword(userData.password);
    
    const user = new User({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'user',
    });

    return user.save();
  }

  async updateUser(id: string, updates: Partial<{
    name: string;
    email: string;
    role: string;
  }>) {
    return User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
  }

  async deleteUser(id: string) {
    return User.findByIdAndDelete(id);
  }

  async findByEmail(email: string) {
    return User.findOne({ email });
  }
}
```

```typescript
// src/server/services/authService.ts
import { UserService } from './userService';
import { comparePassword } from '../utils/password';
import { generateToken, verifyToken } from '../utils/jwt';

const userService = new UserService();

export class AuthService {
  async register(userData: { name: string; email: string; password: string }) {
    const existingUser = await userService.findByEmail(userData.email);
    
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const user = await userService.createUser(userData);
    
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await userService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = verifyToken(refreshToken);
      
      // In a real implementation, you'd check if the refresh token is valid
      // and not expired in your database
      
      const user = await userService.getUserById(payload.userId);
      
      if (!user) {
        return null;
      }

      const newToken = generateToken({
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: newToken,
      };
    } catch (error) {
      return null;
    }
  }
}
```

```typescript
// src/server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (allowedRoles: string[] = []) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Access denied. No token provided.',
          },
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const payload = verifyToken(token);

      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      // Check role-based access
      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied. Insufficient permissions.',
          },
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. Invalid token.',
        },
      });
    }
  };
};
```

```typescript
// src/server/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  error: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Don't send error details in production
  const errorResponse = {
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    },
  };

  res.status(status).json(errorResponse);
};
```

```typescript
// src/server/middleware/logger.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  // Add request ID to request object
  (req as any).requestId = requestId;

  // Log request
  console.log(`[${new Date().toISOString()}] ${requestId} ${req.method} ${req.path}`);

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    
    console.log(
      `[${new Date().toISOString()}] ${requestId} ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );

    return originalJson.call(this, body);
  };

  next();
};
```

```typescript
// src/server/utils/jwt.ts
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};
```

```typescript
// src/server/utils/password.ts
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
```

## Notes
- Use proper input validation and sanitization for all endpoints
- Implement consistent error handling with proper HTTP status codes
- Use middleware for authentication, logging, and rate limiting
- Follow REST conventions for API design
- Implement proper CORS configuration for frontend integration
- Use environment variables for configuration
- Add comprehensive logging for debugging and monitoring
- Implement proper security measures (helmet, rate limiting, etc.)
- Use proper database connection management
- Write comprehensive tests for all API endpoints