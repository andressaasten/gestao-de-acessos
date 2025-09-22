import type { RouteRecordRaw } from 'vue-router';

export const mainRoutes: RouteRecordRaw = {
  path: '/',
  component: () => import('layouts/MainLayout.vue'),
  children: [
    {
      path: '/documents',
      name: 'main/documents',
      component: () => import('pages/DocumentsPage.vue'),
    },
    {
      path: '/permissions',
      component: () => import('pages/PermissoesPage.vue'),
    },
  ],
};
