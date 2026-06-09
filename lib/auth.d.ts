import 'better-auth/client';

declare module 'better-auth/client' {
  interface User {
    role?: string;
  }
}

declare module 'better-auth/types' {
  interface User {
    role?: string;
  }
}
