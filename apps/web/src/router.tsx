import { createRouter } from '@tanstack/solid-router';
import { routeTree } from './routeTree.gen';

export const getRouter = () =>
  createRouter({
    routeTree,
    scrollRestoration: true,
  });
