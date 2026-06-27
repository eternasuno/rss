export type User = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

declare global {
  namespace Vike {
    interface PageContext {
      user: User | null;
    }
  }
}
