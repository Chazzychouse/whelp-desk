import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export interface Team {
  id: string;
  name: string;
  kind: string;
}

export const useTeamsStore = defineStore('teams', () => {
  const teams = ref<Team[]>([]);

  async function fetchTeams() {
    const { data } = await api.get('/teams');
    teams.value = data;
  }

  return { teams, fetchTeams };
});
