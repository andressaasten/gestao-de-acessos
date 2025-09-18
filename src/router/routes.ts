import type { RouteRecordRaw } from 'vue-router';
import { mainRoutes } from './MainRoutes';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/LayoutLogin.vue'),
    children: [
      { path: '', component: () => import('pages/RegisterUser.vue') },
      {
        path: '',
        component: () => import('components/FooterComponent.vue'),
      },
    ],
  },
  mainRoutes,

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
