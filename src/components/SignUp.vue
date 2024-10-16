<template>
  <div>
    <h2>Sign Up</h2>
    <form @submit.prevent="signUp">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <input v-model="username" placeholder="Username" />
      <button type="submit">Sign Up</button>
      <p v-if="error">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

export default {
  data() {
    return {
      email: '',
      password: '',
      username: '',
      error: null
    };
  },
  methods: {
    async signUp() {
      try {
        // Register the user
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        
        // Save the user's username in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          username: this.username,
          email: this.email,
        });

        // Automatically log the user in and redirect to main page
        this.$router.push('/');
      } catch (error) {
        this.error = error.message;
      }
    }
  }
};
</script>