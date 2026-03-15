<template>
  <div v-if="store.loading && !ticket" class="muted">Loading...</div>
  <div v-if="ticket" class="detail-grid">
    <!-- Main content -->
    <div class="main-col">
      <div class="card">
        <h2 class="ticket-title">{{ ticket.title }}</h2>
        <p class="meta">
          Created by {{ ticket.creator.name }} on {{ new Date(ticket.createdAt).toLocaleString() }}
          · Source: {{ ticket.source }}
        </p>
        <p class="body">{{ ticket.body }}</p>
      </div>

      <!-- Comments -->
      <div class="card">
        <h3 class="section-title">Comments</h3>
        <div v-if="!ticket.comments?.length" class="muted">No comments yet.</div>
        <div
          v-for="comment in ticket.comments"
          :key="comment.id"
          class="comment"
          :class="{ internal: comment.internal }"
        >
          <div class="comment-header">
            <span>
              {{ comment.author.name }}
              <span v-if="comment.internal" class="internal-label">Internal Note</span>
            </span>
            <span>{{ new Date(comment.createdAt).toLocaleString() }}</span>
          </div>
          <p>{{ comment.body }}</p>
        </div>

        <!-- Add comment form -->
        <form @submit.prevent="submitComment" class="comment-form">
          <textarea v-model="commentBody" rows="3" required placeholder="Add a comment..." />
          <button type="submit" class="btn-primary">Add Comment</button>
        </form>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="sidebar">
      <div class="card sidebar-card">
        <div class="sidebar-field">
          <span class="sidebar-label">Status</span>
          <select v-model="ticket.status" @change="updateField('status', ticket.status)">
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="sidebar-field">
          <span class="sidebar-label">Priority</span>
          <select v-model="ticket.priority" @change="updateField('priority', ticket.priority)">
            <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div class="sidebar-field">
          <span class="sidebar-label">Team</span>
          <p>{{ ticket.team?.name ?? '—' }}</p>
        </div>
        <div class="sidebar-field">
          <span class="sidebar-label">Assigned Agent</span>
          <p>{{ ticket.agent?.name ?? 'Unassigned' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTicketsStore } from '../stores/tickets';

const route = useRoute();
const store = useTicketsStore();
const ticket = computed(() => store.currentTicket);

const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const commentBody = ref('');

onMounted(() => store.fetchTicket(route.params.id as string));

async function updateField(field: string, value: string) {
  await store.updateTicket(route.params.id as string, { [field]: value });
}

async function submitComment() {
  await store.addComment(route.params.id as string, { body: commentBody.value });
  commentBody.value = '';
}
</script>

<style scoped>
.muted {
  color: var(--text-muted);
}

.detail-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.main-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.ticket-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.body {
  white-space: pre-wrap;
}

.section-title {
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.comment {
  border-bottom: 1px solid var(--border);
  padding: 0.75rem 0;
}

.comment:last-of-type {
  border-bottom: none;
}

.comment.internal {
  background: var(--internal-bg);
  margin: 0 -0.5rem;
  padding: 0.75rem 0.5rem;
  border-radius: var(--radius);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.internal-label {
  margin-left: 0.25rem;
  color: var(--internal-text);
  font-weight: 500;
}

.comment-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-form textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.5rem 0.75rem;
  background: var(--bg-card);
  resize: vertical;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  align-self: flex-start;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.sidebar-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar-label {
  color: var(--text-secondary);
}

.sidebar-field select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.25rem 0.5rem;
  background: var(--bg-card);
}
</style>
