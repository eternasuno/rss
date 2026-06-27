import tailwindcss from '@tailwindcss/vite';
import vike from 'vike/plugin';
import vikeSolid from 'vike-solid/vite';

export default {
  plugins: [vike({ prerender: false }), vikeSolid(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5100,
  },
};
