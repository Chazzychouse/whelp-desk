import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export interface Ticket {
  id: string;
  title: string;
  body: string;
  status: string;
  priority: string;
  source: string;
  team: { id: string; name: string; kind: string } | null;
  creator: { id: string; name: string; email: string };
  agent: { id: string; name: string; email: string } | null;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  body: string;
  internal: boolean;
  author: { id: string; name: string };
  createdAt: string;
}

export const useTicketsStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([]);
  const currentTicket = ref<Ticket | null>(null);
  const loading = ref(false);

  async function fetchTickets(filters?: Record<string, string>) {
    loading.value = true;
    try {
      const { data } = await api.get('/tickets', { params: filters });
      tickets.value = data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchTicket(id: string) {
    loading.value = true;
    try {
      const { data } = await api.get(`/tickets/${id}`);
      currentTicket.value = data;
    } finally {
      loading.value = false;
    }
  }

  async function createTicket(payload: { title: string; body: string; priority?: string; teamId: string }) {
    const { data } = await api.post('/tickets', payload);
    tickets.value.unshift(data);
    return data;
  }

  async function updateTicket(id: string, payload: Record<string, string>) {
    const { data } = await api.patch(`/tickets/${id}`, payload);
    currentTicket.value = data;
    const idx = tickets.value.findIndex((t) => t.id === id);
    if (idx !== -1) tickets.value[idx] = data;
  }

  async function addComment(ticketId: string, payload: { body: string; internal?: boolean }) {
    const { data } = await api.post(`/tickets/${ticketId}/comments`, payload);
    if (currentTicket.value?.comments) {
      currentTicket.value.comments.push(data);
    }
  }

  return { tickets, currentTicket, loading, fetchTickets, fetchTicket, createTicket, updateTicket, addComment };
});
