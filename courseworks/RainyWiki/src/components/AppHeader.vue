<script setup>
defineProps({
  activeTab: {
    type: String,
    default: 'article',
  },
});

const emit = defineEmits(['navigate']);

const goTo = (tab) => {
  emit('navigate', tab);
};

const openRandomArticle = () => {
  emit('navigate', 'random-article');
};
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <a class="logo" href="#"> 
        <span class="logo-text">Rainy<strong>Wiki</strong></span>
      </a>

      <div class="header-search">
        <input
          type="search"
          class="search-input"
          placeholder="Search articles..."
        />
        <button class="search-btn" aria-label="Search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>

      <nav class="header-nav" aria-label="Navigation">
        <a href="#" class="nav-item" :class="{ active: activeTab === 'article' }" @click.prevent="goTo('article')">
          <strong>Main page</strong>
        </a>
        <a href="#" class="nav-item" @click.prevent="openRandomArticle">
          <strong>Random article</strong>
        </a>
        <a href="#" class="nav-item" :class="{ active: activeTab === 'recent-changes' }" @click.prevent="goTo('recent-changes')">
          <strong>Recent changes</strong> 
        </a>
        <a href="#" class="nav-item">
          <strong>Help</strong>
        </a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: #f1eaeb;
  border-bottom: 1px solid #cfc5c6;
  box-shadow: 0 2px 8px rgba(39, 32, 32, 0.07);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 62px;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none;
  color: #272020;
  flex-shrink: 0;
  margin-right: 0.5rem;
}
.logo:hover { text-decoration: none; }
.logo-text { font-size: 1.1rem; letter-spacing: -0.01em; }
.logo-text strong { color: #272020; }
.header-search {
  flex: 1;
  max-width: 420px;
  display: flex;
  background: #ede5e6;
  border: 1px solid #cfc5c6;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.header-search:focus-within {
  border-color: #5c4a4a;
  box-shadow: 0 0 0 3px rgba(39, 32, 32, 0.15);
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 0.5rem 0.8rem;
  font-size: 0.9rem;
  color: #272020;
}
.search-input::placeholder { color: #9e8e8f; }
.search-btn {
  background: none;
  border: none;
  border-left: 1px solid #cfc5c6;
  padding: 0.5rem 0.7rem;
  cursor: pointer;
  color: #272020;
  display: flex;
  align-items: center;
}
.search-btn:hover { background: #dcd4d5; }
.header-nav {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.55rem;
  border-radius: 6px;
  font-size: 0.82rem;
  color: #272020;
  text-decoration: none;
  white-space: nowrap;
}

.nav-item:hover {
  background: #ede5e6;
  text-decoration: none;
}

.nav-item.active {
  background: #dcd4d5;
}
</style>
