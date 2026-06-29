import { cmMerge } from '@classmatejs/solid';

export const cn = (...inputs: Parameters<typeof cmMerge>) => cmMerge(...inputs);
