<template>
  <div class="container mt-5">
    <h2>Login</h2>
    <form @submit.prevent="login" class="mb-3">
      <input v-model="email" class="form-control mb-2" placeholder="Email" />
      <input v-model="password" type="password" class="form-control mb-2" placeholder="Password" />
      <button type="submit" class="btn btn-primary">Login</button>
    </form>

    <p v-if="error" class="text-danger">{{ error }}</p>

    <h3>Forgot Password?</h3>
    <form @submit.prevent="resetPassword" class="mb-3">
      <input v-model="emailForReset" class="form-control mb-2" placeholder="Enter email to reset password" />
      <button type="submit" class="btn btn-secondary">Reset Password</button>
    </form>

    <p v-if="resetSuccess" class="text-success">{{ resetSuccess }}</p>
    <p v-if="resetError" class="text-danger">{{ resetError }}</p>
  </div>
</template>

<script>
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";

export default {
  data() {
    return {
      email: '',
      password: '',
      emailForReset: '',
      error: null,
      resetSuccess: null,
      resetError: null,
    };
  },
  methods: {
    async login() {
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.$router.push('/');
      } catch (error) {
        this.error = error.message;
      }
    },
    async resetPassword() {
      try {
        if (this.emailForReset) {
          await sendPasswordResetEmail(auth, this.emailForReset);
          this.resetSuccess = "Password reset email sent!";
          this.resetError = null;
        } else {
          this.resetError = "Please enter an email to reset the password.";
          this.resetSuccess = null;
        }
      } catch (error) {
        this.resetError = error.message;
        this.resetSuccess = null;
      }
    }
  }
};
</script>
``