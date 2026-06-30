import { createAuthClient } from 'better-auth/solid';

export const { signIn, signUp, useSession, signOut } = createAuthClient();
