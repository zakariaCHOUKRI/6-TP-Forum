<template>
  <div>
    <h2>Create a New Discussion</h2>
    <form @submit.prevent="addDiscussion">
      <input v-model="title" placeholder="Title" />
      <textarea v-model="content" placeholder="Content"></textarea>
      <button type="submit">Add Discussion</button>
    </form>
  </div>
</template>

<script>
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default {
  data() {
    return {
      title: '',
      content: ''
    };
  },
  methods: {
    async addDiscussion() {
      try {
        await addDoc(collection(db, 'discussions'), {
          title: this.title,
          content: this.content,
          createdAt: new Date(),
        });
        this.title = '';
        this.content = '';
        alert('Discussion added!');
      } catch (error) {
        console.error("Error adding discussion: ", error);
      }
    }
  }
};
</script>