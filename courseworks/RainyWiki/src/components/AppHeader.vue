<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const emit = defineEmits(['navigate', 'open-article']);
const props = defineProps({
  activeTab: {
    type: String,
    default: 'article',
  },
  searchIndex: {
    type: Array,
    default: () => [],
  },
});

const searchContainer = ref(null);
const searchInput = ref(null);
const searchDropdown = ref(null);
const searchQuery = ref('');
const showResults = ref(false);
const dropdownStyle = ref({});

const searchTerms = computed(() => (
  searchQuery.value
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
));

const searchResults = computed(() => {
  if (!searchTerms.value.length) {
    return [];
  }

  const ranked = props.searchIndex
    .map((article) => {
      let score = 0;
      const lowerTitle = article.title.toLowerCase();

      const allTermsPresent = searchTerms.value.every((term) => lowerTitle.includes(term));
      if (!allTermsPresent) {
        return null;
      }

      searchTerms.value.forEach((term) => {
        if (lowerTitle.includes(term)) {
          score += 6;
        }
      });

      return {
        ...article,
        score,
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));

  return ranked.slice(0, 7);
});

const goTo = (tab) => {
  emit('navigate', tab);
};

const openRandomArticle = () => {
  emit('navigate', 'random-article');
};

const openArticleFromSearch = (articleKey) => {
  emit('open-article', articleKey);
  searchQuery.value = '';
  showResults.value = false;
};

const updateDropdownPosition = () => {
  if (!searchContainer.value) {
    return;
  }

  const rect = searchContainer.value.getBoundingClientRect();
  dropdownStyle.value = {
    top: `${rect.bottom + 6}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  };
};

const submitSearch = () => {
  if (!searchResults.value.length) {
    showResults.value = true;
    updateDropdownPosition();
    return;
  }

  openArticleFromSearch(searchResults.value[0].key);
};

const handleSearchKeydown = (event) => {
  if (event.key === 'Escape') {
    showResults.value = false;
  }
};

const openSearchResults = () => {
  showResults.value = true;
  updateDropdownPosition();
};

const handleOutsideClick = (event) => {
  if (searchContainer.value?.contains(event.target)) {
    return;
  }

  if (searchDropdown.value?.contains(event.target)) {
    return;
  }

  if (showResults.value) {
    showResults.value = false;
  }
};

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsideClick);
  window.addEventListener('resize', updateDropdownPosition);
  window.addEventListener('scroll', updateDropdownPosition, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsideClick);
  window.removeEventListener('resize', updateDropdownPosition);
  window.removeEventListener('scroll', updateDropdownPosition, true);
});
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <a class="logo" href="#"> 
        <span class="logo-text">Rainy<strong>Wiki</strong></span>
      </a>

      <div ref="searchContainer" class="header-search">
        <form class="search-controls" @submit.prevent="submitSearch">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="search"
            class="search-input"
            placeholder="Search articles..."
            @focus="openSearchResults"
            @input="updateDropdownPosition"
            @keydown="handleSearchKeydown"
          />
          <button class="search-btn" aria-label="Search" type="submit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

      </div>

      <teleport to="body">
        <ul
          v-if="showResults && searchTerms.length"
          ref="searchDropdown"
          class="search-results"
          :style="dropdownStyle"
          role="listbox"
          aria-label="Search results"
        >
          <li v-if="!searchResults.length" class="search-empty">No matches found.</li>
          <li v-for="result in searchResults" :key="result.key">
            <button
              type="button"
              class="search-result-btn"
              @click="openArticleFromSearch(result.key)"
            >
              <span class="result-title">{{ result.title }}</span>
            </button>
          </li>
        </ul>
      </teleport>

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
  z-index: 1000;
  isolation: isolate;
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
  position: relative;
  z-index: 1100;
}

.search-controls {
  display: flex;
  background: #ede5e6;
  border: 1px solid #cfc5c6;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-controls:focus-within {
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

.search-results {
  position: fixed;
  list-style: none;
  margin: 0;
  padding: 0.3rem;
  border: 1px solid #cfc5c6;
  border-radius: 8px;
  background: #f7f1f2;
  box-shadow: 0 8px 20px rgba(39, 32, 32, 0.14);
  z-index: 2000;
  max-height: 320px;
  overflow-y: auto;
}

.search-empty {
  color: #6f5f5f;
  font-size: 0.84rem;
  padding: 0.55rem 0.65rem;
}

.search-result-btn {
  width: 100%;
  border: none;
  border-radius: 6px;
  text-align: left;
  background: transparent;
  color: #272020;
  cursor: pointer;
  padding: 0.5rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.search-result-btn:hover {
  background: #e6ddde;
}

.result-title {
  font-size: 0.86rem;
  font-weight: 600;
}
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

@media (max-width: 1040px) {
  .header-inner {
    height: auto;
    padding: 0.8rem 1rem;
    flex-wrap: wrap;
  }

  .header-search {
    order: 3;
    max-width: none;
    width: 100%;
  }

  .header-nav {
    margin-left: 0;
    flex-wrap: wrap;
  }
}
</style>
