<template>
  <div id="app">
    <b-navbar>
      <b-navbar-brand href="/">Forum App</b-navbar-brand>
      <b-navbar-nav v-if="!user">
        <b-nav-item href="#/">Forum</b-nav-item>
        <b-nav-item href="#/login">Login</b-nav-item>
        <b-nav-item href="#/signup">Sign Up</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav v-else>
        <b-nav-item href="#/">Forum</b-nav-item>
        <b-nav-item href="#/profile">Profile</b-nav-item>
        <b-nav-item @click="logout">Logout</b-nav-item>
      </b-navbar-nav>
    </b-navbar>
    <router-view></router-view>
  </div>
</template>

<script>
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/config";

export default {
  data() {
    return {
      user: null,
    };
  },
  mounted() {
    // Track user authentication state
    onAuthStateChanged(auth, (user) => {
      this.user = user;
    });
  },
  methods: {
    // Log the user out
    async logout() {
      await signOut(auth);
      this.$router.push('/login');
    }
  }
};
</script>