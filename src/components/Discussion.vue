<template>
  <div class="container mt-5">
    <h2>Discussions</h2>

    <!-- Category and Subcategory Selection -->
    <div v-if="user">
      <h3>Create a Discussion</h3>
      <form @submit.prevent="createDiscussion" class="mb-3">
        <input v-model="title" class="form-control mb-2" placeholder="Discussion Title" />
        <textarea v-model="content" class="form-control mb-2" placeholder="Discussion Content"></textarea>
        <select v-model="selectedCategory" class="form-select mb-2">
          <option disabled value="">Select Category</option>
          <option v-for="category in categories" :key="category">{{ category }}</option>
        </select>
        <select v-model="selectedSubcategory" class="form-select mb-2">
          <option disabled value="">Select Subcategory</option>
          <option v-for="subcategory in subcategories[selectedCategory] || []" :key="subcategory">{{ subcategory }}</option>
        </select>
        <button type="submit" class="btn btn-primary">Create Discussion</button>
      </form>
    </div>
    <div v-else>
      <p>Please log in to create a discussion.</p>
    </div>

    <!-- Search and Filter Section -->
    <div class="mb-4">
      <input v-model="searchQuery" class="form-control mb-2" placeholder="Search discussions by keywords..." />
      <select v-model="filterCategory" class="form-select mb-2">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category">{{ category }}</option>
      </select>
      <select v-model="sortOption" class="form-select mb-2">
        <option value="date">Sort by Date</option>
        <option value="popularity">Sort by Popularity</option>
      </select>
    </div>

    <!-- List of Discussions -->
    <div v-for="discussion in filteredDiscussions" :key="discussion.id" class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">{{ discussion.title }}</h5>
        <p class="card-text">{{ discussion.content }}</p>
        <p class="card-text">
          <small class="text-muted">By {{ discussion.owner }} on {{ discussion.timestamp }}</small>
        </p>

        <!-- Report counter and button -->
        <p v-if="discussion.reports && discussion.reports.length > 0" class="text-danger">Reports: {{ discussion.reports.length }}</p>
        <button v-if="user" class="btn btn-warning" @click="reportDiscussion(discussion.id)" :disabled="discussion.reports?.includes(user.uid)">
          {{ discussion.reports?.includes(user.uid) ? 'Reported' : 'Report Discussion' }}
        </button>

        <!-- Edit and Delete Buttons (for post owner only) -->
        <div v-if="user && user.email === discussion.ownerEmail">
          <button class="btn btn-secondary me-2" @click="startEditDiscussion(discussion)">Edit</button>
          <button class="btn btn-danger" @click="deleteDiscussion(discussion.id)">Delete</button>
        </div>

        <!-- Edit Form -->
        <div v-if="isEditing && editingDiscussionId === discussion.id" class="mt-3">
          <input v-model="editTitle" class="form-control mb-2" placeholder="Edit Title" />
          <textarea v-model="editContent" class="form-control mb-2" placeholder="Edit Content"></textarea>
          <button @click="submitEdit" class="btn btn-primary">Submit Edit</button>
          <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
        </div>

        <!-- Reply Button (visible only to logged-in users) -->
        <button class="btn btn-link" v-if="user" @click="toggleReply(discussion.id)">Reply</button>

        <!-- Reply Form -->
        <div v-if="replyingTo === discussion.id" class="mt-2">
          <textarea v-model="replyContent" class="form-control mb-2" placeholder="Write your reply..."></textarea>
          <button @click="submitReply(discussion.id)" class="btn btn-primary">Submit Reply</button>
        </div>

        <!-- Display Replies with report button -->
        <div v-if="discussion.replies && discussion.replies.length > 0">
          <h6>Replies:</h6>
          <div v-for="reply in discussion.replies" :key="reply.timestamp" class="card card-body bg-light mb-2">
            <p>{{ reply.content }}</p>
            <small class="text-muted">By {{ reply.owner }} on {{ reply.timestamp }}</small>

           
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, addDoc, getDocs, arrayUnion, query, orderBy, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default {
  data() {
    return {
      title: '',
      content: '',
      selectedCategory: '',
      selectedSubcategory: '',
      discussions: [],
      user: null,
      error: null,
      searchQuery: '',
      filterCategory: '',
      sortOption: 'date', // Sort by 'date' or 'popularity'
      categories: ['Technology', 'Sports', 'Health'], // Example categories
      subcategories: {
        'Technology': ['Mobile Development', 'AI', 'Web Development'],
        'Sports': ['Soccer', 'Basketball', 'Tennis'],
        'Health': ['Nutrition', 'Exercise', 'Mental Health']
      },
      isEditing: false,
      editTitle: '',
      editContent: '',
      editingDiscussionId: null,
      replyingTo: null,
      replyContent: '',
    };
  },
  computed: {
    filteredDiscussions() {
      let filtered = this.discussions;

      if (this.searchQuery) {
        filtered = filtered.filter(discussion => 
          discussion.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          discussion.content.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      if (this.filterCategory) {
        filtered = filtered.filter(discussion => discussion.category === this.filterCategory);
      }

      if (this.sortOption === 'date') {
        return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } else if (this.sortOption === 'popularity') {
        return filtered.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
      }

      return filtered;
    }
  },

  async mounted() {
    this.fetchDiscussions();
    
    // Track user authentication state
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
      }
    });
  },
  
  methods: {
    async fetchDiscussions() {
      const discussionsQuery = query(collection(db, "discussions"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(discussionsQuery);
      this.discussions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async createDiscussion() {
      if (this.title && this.content && this.selectedCategory && this.selectedSubcategory) {
        try {
          const timestamp = new Date();
          const owner = this.user.email;

          
          await addDoc(collection(db, "discussions"), {
            title: this.title,
            content: this.content,
            owner: owner,
            ownerEmail: this.user.email,
            timestamp: timestamp.toLocaleString(),
            category: this.selectedCategory,
            subcategory: this.selectedSubcategory,
            replies: [],
            reports: [] // Initialize reports as an empty array
            });


          this.title = '';
          this.content = '';
          this.selectedCategory = '';
          this.selectedSubcategory = '';
          this.fetchDiscussions();
        } catch (error) {
          this.error = error.message;
        }
      } else {
        this.error = "Please fill out all fields.";
      }
    },

    toggleReply(discussionId) {
      this.replyingTo = this.replyingTo === discussionId ? null : discussionId;
    },

    async submitReply(discussionId) {
      if (this.replyContent) {
        try {
          const timestamp = new Date();
          const owner = this.user.email;
          const discussionRef = doc(db, "discussions", discussionId);
          const discussionSnapshot = await getDoc(discussionRef);
          const currentReplies = discussionSnapshot.data().replies || [];

          const newReply = {
            content: this.replyContent,
            owner: owner,
            timestamp: timestamp.toLocaleString(),
            reports: [] // Initialize reports array for reply
          };

          await updateDoc(discussionRef, {
            replies: [...currentReplies, newReply],
          });

          this.replyContent = '';
          this.replyingTo = null;
          this.fetchDiscussions();
        } catch (error) {
          console.error("Error replying to discussion:", error);
        }
      }
    },

    async reportDiscussion(discussionId) {
      try {
        const discussionRef = doc(db, "discussions", discussionId);
        const discussionSnap = await getDoc(discussionRef);

        if (discussionSnap.exists()) {
          const currentReports = discussionSnap.data().reports || [];
          if (!currentReports.includes(this.user.uid)) {
            await updateDoc(discussionRef, {
              reports: arrayUnion(this.user.uid),
            });
          }
          this.fetchDiscussions();
        }
      } catch (error) {
        console.error("Error reporting discussion:", error);
      }
    },

    async reportReply(discussionId, reply) {
      try {
        const discussionRef = doc(db, "discussions", discussionId);
        const discussionSnap = await getDoc(discussionRef);
        const currentReplies = discussionSnap.data().replies || [];

        const updatedReplies = currentReplies.map(r => {
          if (r.timestamp === reply.timestamp && !r.reports.includes(this.user.uid)) {
            return {
              ...r,
              reports: arrayUnion(this.user.uid),
            };
          }
          return r;
        });

        await updateDoc(discussionRef, {
          replies: updatedReplies,
        });

        this.fetchDiscussions();
      } catch (error) {
        console.error("Error reporting reply:", error);
      }
    },

    // Edit functionality
    startEditDiscussion(discussion) {
      this.isEditing = true;
      this.editTitle = discussion.title;
      this.editContent = discussion.content;
      this.editingDiscussionId = discussion.id;
    },

    async submitEdit() {
      try {
        const discussionRef = doc(db, "discussions", this.editingDiscussionId);
        await updateDoc(discussionRef, {
          title: this.editTitle,
          content: this.editContent,
        });
        this.isEditing = false;
        this.editTitle = '';
        this.editContent = '';
        this.editingDiscussionId = null;
        this.fetchDiscussions();
      } catch (error) {
        console.error("Error editing discussion:", error);
      }
    },

    cancelEdit() {
      this.isEditing = false;
      this.editTitle = '';
      this.editContent = '';
      this.editingDiscussionId = null;
    },

    async deleteDiscussion(id) {
      try {
        await deleteDoc(doc(db, "discussions", id));
        this.fetchDiscussions();
      } catch (error) {
        console.error("Error deleting discussion:", error);
      }
    }
  }
};
</script>