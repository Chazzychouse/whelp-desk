<template>
  <div>
    <h2 class="heading">Tickets</h2>
    <div v-if="store.loading" class="muted">Loading...</div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Team</th>
          <th>Assignee</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="ticket in store.tickets"
          :key="ticket.id"
          @click="$router.push(`/tickets/${ticket.id}`)"
        >
          <td class="title-cell">{{ ticket.title }}</td>
          <td>
            <span class="badge" :class="`status-${ticket.status.toLowerCase()}`">
              {{ ticket.status }}
            </span>
          </td>
          <td>{{ ticket.priority }}</td>
          <td>{{ ticket.team?.name ?? '—' }}</td>
          <td>{{ ticket.agent?.name ?? 'Unassigned' }}</td>
          <td class="muted">{{ new Date(ticket.createdAt).toLocaleDateString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTicketsStore } from '../stores/tickets';

const store = useTicketsStore();

onMounted(() => store.fetchTickets());
</script>

<style scoped>
.heading {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.muted {
  color: var(--text-muted);
}

.table {
  width: 100%;
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border-collapse: collapse;
}

.table th {
  text-align: left;
  color: var(--text-secondary);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
}

.table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
}

.table tbody tr {
  cursor: pointer;
}

.table tbody tr:hover {
  background: var(--bg-hover);
}

.title-cell {
  font-weight: 500;
}

.badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-open {
  background: var(--status-open-bg);
  color: var(--status-open-text);
}

.status-in_progress {
  background: var(--status-progress-bg);
  color: var(--status-progress-text);
}

.status-resolved {
  background: var(--status-resolved-bg);
  color: var(--status-resolved-text);
}

.status-closed {
  background: var(--status-closed-bg);
  color: var(--status-closed-text);
}
</style>
