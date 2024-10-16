<template>
  <div>
    <h1>Forum</h1>
    <b-button @click="$router.push('/add-discussion')">Add Discussion</b-button>
    <div v-for="discussion in discussions" :key="discussion.id">
      <h3>{{ discussion.title }}</h3>
      <p>{{ discussion.content }}</p>
    </div>
  </div>
</template>

<script>
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export default {
  data() {
    return {
      discussions: []
    };
  },
  async mounted() {
    const querySnapshot = await getDocs(collection(db, "discussions"));
    this.discussions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
</script>