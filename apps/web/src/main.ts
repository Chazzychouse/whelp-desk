import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/tickets' },
    { path: '/tickets', component: () => import('./views/TicketList.vue') },
    { path: '/tickets/new', component: () => import('./views/CreateTicket.vue') },
    { path: '/tickets/:id', component: () => import('./views/TicketDetail.vue') },
  ],
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
