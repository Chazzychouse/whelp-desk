<template>
  <div class="ticket-create">
    <h2 class="heading">Create Ticket</h2>
    <form @submit.prevent="submit" class="card form">
      <div class="field">
        <label>Title</label>
        <input v-model="form.title" required />
      </div>
      <div class="field">
        <label>Description</label>
        <textarea v-model="form.body" required rows="4" />
      </div>
      <div class="row">
        <div class="field">
          <label>Team</label>
          <select v-model="form.teamId" required>
            <option value="" disabled>Select team</option>
            <option v-for="team in teamsStore.teams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Priority</label>
          <select v-model="form.priority">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>
      <button type="submit" class="btn-primary">Submit</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTicketsStore } from '../stores/tickets';
import { useTeamsStore } from '../stores/teams';

const router = useRouter();
const ticketsStore = useTicketsStore();
const teamsStore = useTeamsStore();

const form = reactive({ title: '', body: '', teamId: '', priority: 'MEDIUM' });

onMounted(() => teamsStore.fetchTeams());

async function submit() {
  const ticket = await ticketsStore.createTicket(form);
  router.push(`/tickets/${ticket.id}`);
}
</script>

<style scoped>
.ticket-create {
  max-width: 36rem;
}

.heading {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.field label {
  font-size: 0.875rem;
  font-weight: 500;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.5rem 0.75rem;
  background: var(--bg-card);
}

.row {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  cursor: pointer;
  align-self: flex-start;
}

.btn-primary:hover {
  background: var(--accent-hover);
}
</style>
