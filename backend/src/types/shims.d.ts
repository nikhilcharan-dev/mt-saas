declare module 'bcrypt';
declare module 'jsonwebtoken';
declare module 'cors';

declare module 'dotenv' {
  const config: any;
  export default config;
}

declare module 'express' {
  const e: any;
  export default e;
  export const Router: any;
  export type Request = any;
  export type Response = any;
  export type NextFunction = any;
}

declare module '@prisma/client' {
  export const Prisma: any;
  export type User = any;
  export type Tenant = any;
  export const PrismaClient: any;
}

declare module 'zod';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      tenant?: any;
      tokenPayload?: any;
      ip?: string;
      params?: any;
      body?: any;
      query?: any;
    }
  }
}

export {};
