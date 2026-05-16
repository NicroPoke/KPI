import { createRouter, createWebHashHistory } from 'vue-router'

const Empty = { template: '<div />' }

const routes = [
  { path: '/', redirect: { name: 'article', params: { key: 'rainyforecast' } } },
  { path: '/article/:key?', name: 'article', component: Empty },
  { path: '/recent-changes', name: 'recent-changes', component: Empty },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
