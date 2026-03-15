<template>
  <div class="app">
    <nav class="nav">
      <h1 class="nav-title">WhelpDesk</h1>
      <router-link to="/tickets" class="nav-link">Tickets</router-link>
      <router-link to="/tickets/new" class="nav-link">New Ticket</router-link>
    </nav>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.nav {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.nav-link {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-decoration: none;
}

.nav-link:hover {
  color: var(--text-primary);
}

.main {
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
