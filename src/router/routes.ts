import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/LayoutLogin.vue'),
    children: [{ path: '', component: () => import('pages/RegisterUser.vue')}]
  },
  {
    path: '/documents',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/DocumentsPage.vue')}]
  },
    {
    path: '/permissions',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/PermissoesPage.vue')}]
  },



  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
