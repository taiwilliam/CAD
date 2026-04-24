export interface User {
  id: number | string;
  name?: string;
  username?: string;
  email?: string;
  [key: string]: unknown;
}
