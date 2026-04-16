<script setup>
import changeLog from '../data/recentChanges.json';
</script>

<template>
  <section class="recent-changes" aria-labelledby="recent-changes-title">
    <header class="recent-header">
      <h2 id="recent-changes-title">Recent Changes</h2>
      <p>Current updates for RainyWiki, including the new header search bar and recent article navigation changes.</p>
    </header>

    <ol class="changes-list">
      <li v-for="entry in changeLog" :key="`${entry.date}-${entry.title}`" class="change-card">
        <div class="change-date">{{ entry.date }}</div>
        <h3 class="change-title">{{ entry.title }}</h3>
        <ul class="change-details">
          <li v-for="item in entry.details" :key="item">{{ item }}</li>
        </ul>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.recent-changes {
  background: rgba(241, 234, 235, 0.75);
  border: 1px solid rgba(207, 197, 198, 0.92);
  border-radius: 12px;
  padding: 1.75rem 2rem;
}

.recent-header {
  margin-bottom: 1rem;
  border-bottom: 1px solid #e6ddde;
  padding-bottom: 0.8rem;
}

.recent-header h2 {
  margin: 0;
  font-size: 1.45rem;
  color: #272020;
}

.recent-header p {
  margin: 0.4rem 0 0;
  color: #4a3a3b;
  line-height: 1.6;
}

.changes-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
}

.change-card {
  background: #f0eaeb;
  border: 1px solid #cfc5c6;
  border-radius: 10px;
  padding: 0.9rem 1rem;
}

.change-date {
  font-size: 0.78rem;
  color: #9e8e8f;
  margin-bottom: 0.35rem;
}

.change-title {
  margin: 0;
  font-size: 1rem;
  color: #272020;
}

.change-details {
  margin: 0.5rem 0 0;
  padding-left: 1.1rem;
}

.change-details li {
  margin-bottom: 0.25rem;
  line-height: 1.6;
  color: #3d2e2e;
}
</style>
