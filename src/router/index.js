import { createRouter, createWebHistory } from 'vue-router'
import { handleCallback, isSignedIn, login } from '../auth.js'

const Denmark = () => import('../views/DenmarkView.vue')
const Greenland = () => import('../views/GreenlandView.vue')
const About = () => import('../views/AboutView.vue')

const routes = [
  {
    path: '/Denmark',
    name: 'DenmarkView',
    alias: ['/', '/home'],
    meta: { auth: true },
    components: {
      default: Denmark,
    },
  },
  {
    path: '/Greenland',
    name: 'GreenlandView',
    meta: { auth: true },
    components: {
      default: Greenland,
    },
  },
  {
    path: '/About',
    name: 'AboutView',
    components: {
      default: About,
    },
  },
  {
    path: '/callback',
    name: 'Callback',
    async beforeEnter(to) {
      try {
        return await handleCallback(to.query)
      } catch (error) {
        console.error(error)
        // a public page, so a failed sign-in cannot loop through the guard
        return '/About'
      }
    },
  },
  {
    path: '/was',
    beforeEnter () {
      location.href = 'https://www.was.digst.dk/koordinattransformation-dk'
    },
    name: 'Webtilgaengelighed',
    meta: {
      textColor: 'black',
      domain: 'koordinattransformation.dk',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (!(await isSignedIn()) && to.meta.auth) {
    login(to.fullPath).catch(console.error)
    return false
  }
})

export default router