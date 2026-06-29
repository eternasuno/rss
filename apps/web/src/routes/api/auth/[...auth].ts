import { toSolidStartHandler } from 'better-auth/solid-start';
import { auth } from '../../../lib/auth';

export const { GET, POST, PATCH, PUT, DELETE } = toSolidStartHandler(auth);
