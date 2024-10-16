<template>
  <div class="container mt-5">
    <h2>Profile</h2>
    <h3>Username</h3>
    <p>Current Username: {{ username }}</p>
    <form @submit.prevent="updateUsername" class="mb-3">
      <input v-model="newUsername" class="form-control mb-2" placeholder="New Username" />
      <button type="submit" class="btn btn-primary">Update Username</button>
    </form>

    <h3>Change Password</h3>
    <form @submit.prevent="changePassword" class="mb-3">
      <input v-model="newPassword" type="password" class="form-control mb-2" placeholder="New Password" />
      <button type="submit" class="btn btn-primary">Change Password</button>
    </form>

    <p v-if="error" class="text-danger">{{ error }}</p>
    <p v-if="success" class="text-success">{{ success }}</p>
  </div>
</template>

<script>
import { updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export default {
  data() {
    return {
      newPassword: '',
      newUsername: '',
      username: '',
      error: null,
      success: null,
    };
  },
  async mounted() {
    // Fetch the user's username from Firestore
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (userDoc.exists()) {
      this.username = userDoc.data().username;
    }
  },
  methods: {
    async changePassword() {
      try {
        if (this.newPassword) {
          await updatePassword(auth.currentUser, this.newPassword);
          this.success = "Password updated successfully!";
          this.error = null;
        } else {
          this.error = "Please enter a new password.";
        }
      } catch (error) {
        this.error = error.message;
        this.success = null;
      }
    },
    async updateUsername() {
      try {
        if (this.newUsername) {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            username: this.newUsername,
          });
          this.username = this.newUsername;
          this.success = "Username updated successfully!";
          this.error = null;
        } else {
          this.error = "Please enter a new username.";
        }
      } catch (error) {
        this.error = error.message;
        this.success = null;
      }
    }
  }
};
</script>