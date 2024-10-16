import { createRouter, createWebHashHistory } from 'vue-router';
import Forum from '../components/Forum.vue';
import Login from '../components/Login.vue';
import SignUp from '../components/SignUp.vue';
import AddDiscussion from '../components/AddDiscussion.vue';
import Profile from '../components/Profile.vue';
import Discussion from '../components/Discussion.vue';

const routes = [
  {
    path: '/',
    name: 'Forum',
    component: Forum,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUp,
  },
  {
    path: '/add-discussion',
    name: 'AddDiscussion',
    component: AddDiscussion,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
  },
  {
    path: '/',
    name: 'Forum',
    component: Discussion, // This will be the main discussion page
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;