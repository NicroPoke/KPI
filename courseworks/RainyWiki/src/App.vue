<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import AppHeader from './components/AppHeader.vue'
import WikiArticle from './components/WikiArticle.vue'
import RecentChanges from './components/RecentChanges.vue'
import articles from './data/articles.json'

const activeTab = ref('article');
const activeArticleKey = ref('rainyforecast');
const articleKeys = Object.keys(articles);
const allowedTabs = new Set(['article', 'recent-changes']);
const defaultTab = 'article';
const defaultArticleKey = 'rainyforecast';

const searchIndex = articleKeys.map((articleKey) => {
  const article = articles[articleKey] ?? {};

  return {
    key: articleKey,
    title: article.title ?? articleKey,
  };
});

const sanitizeArticleKey = (candidate) => {
  if (candidate && articles[candidate]) {
    return candidate;
  }

  if (articles[defaultArticleKey]) {
    return defaultArticleKey;
  }

  return articleKeys[0] ?? defaultArticleKey;
};

const readStateFromUrl = () => {
  const hash = window.location.hash.replace(/^#/, '');
  const segments = hash.split('/').filter(Boolean);

  if (segments[0] === 'recent-changes') {
    return {
      tab: 'recent-changes',
      articleKey: sanitizeArticleKey(activeArticleKey.value),
    };
  }

  if (segments[0] === 'article') {
    return {
      tab: 'article',
      articleKey: sanitizeArticleKey(decodeURIComponent(segments[1] ?? '')),
    };
  }

  const params = new URLSearchParams(window.location.search);
  const legacyTab = params.get('tab');
  if (allowedTabs.has(legacyTab)) {
    return {
      tab: legacyTab,
      articleKey: sanitizeArticleKey(params.get('article')),
    };
  }

  return {
    tab: defaultTab,
    articleKey: sanitizeArticleKey(defaultArticleKey),
  };
};

const writeStateToUrl = (tab, articleKey, { replace = false } = {}) => {
  const url = new URL(window.location.href);
  const route = tab === 'article'
    ? `/article/${encodeURIComponent(sanitizeArticleKey(articleKey))}`
    : '/recent-changes';

  url.searchParams.delete('tab');
  url.searchParams.delete('article');
  url.hash = route;

  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', `${url.pathname}${url.search}#${route}`);
};

const syncStateFromUrl = () => {
  const { tab, articleKey } = readStateFromUrl();
  activeTab.value = tab;

  if (tab === 'article') {
    activeArticleKey.value = articleKey;
  } else if (!articles[activeArticleKey.value]) {
    activeArticleKey.value = sanitizeArticleKey(activeArticleKey.value);
  }
};

const handleHashChange = () => {
  syncStateFromUrl();
};

const getRandomArticleKey = () => {
  if (articleKeys.length <= 1) {
    return articleKeys[0] ?? defaultArticleKey;
  }

  const availableKeys = articleKeys.filter((key) => key !== activeArticleKey.value);
  const randomIndex = Math.floor(Math.random() * availableKeys.length);
  return availableKeys[randomIndex];
};

const handleNavigate = (tab) => {
  if (tab === 'random-article') {
    activeArticleKey.value = getRandomArticleKey();
    activeTab.value = 'article';
    writeStateToUrl('article', activeArticleKey.value);
    return;
  }

  if (!allowedTabs.has(tab)) {
    return;
  }

  activeTab.value = tab;
  if (tab === 'article') {
    activeArticleKey.value = sanitizeArticleKey(activeArticleKey.value);
  }

  writeStateToUrl(activeTab.value, activeArticleKey.value);
};

const handleOpenArticle = (articleKey) => {
  if (!articles[articleKey]) {
    return;
  }

  activeTab.value = 'article';
  activeArticleKey.value = articleKey;
  writeStateToUrl('article', activeArticleKey.value);
};

onMounted(() => {
  syncStateFromUrl();
  writeStateToUrl(activeTab.value, activeArticleKey.value, { replace: true });
  window.addEventListener('hashchange', handleHashChange);
});

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', handleHashChange);
});

const rainDrops = Array.from({ length: 67 }, (_, index) => {
  const left = (index * 4.9) % 100
  const startTop = -((index % 12) * 10 + 6)
  const duration = 2.8 + (index % 6) * 0.28
  const delay = -((index * 0.32) % 4.8)
  const driftStart = 120 + (index % 4) * 22
  const driftEnd = -360 - (index % 6) * 34
  const fontSize = 1.02 + (index % 3) * 0.12

  return {
    id: index,
    left: `${left.toFixed(2)}%`,
    startTop: `${startTop}vh`,
    duration: `${duration.toFixed(1)}s`,
    delay: `${delay.toFixed(1)}s`,
    driftStart: `${driftStart}px`,
    driftEnd: `${driftEnd}px`,
    fontSize: `${fontSize.toFixed(2)}rem`
  }
})
</script>

<template>
  <div class="app">
    <div class="page-rain" aria-hidden="true">
      <span
        v-for="drop in rainDrops"
        :key="drop.id"
        class="page-rain-drop"
        :style="{
          '--left': drop.left,
          '--start-top': drop.startTop,
          '--duration': drop.duration,
          '--delay': drop.delay,
          '--drift-start': drop.driftStart,
          '--drift-end': drop.driftEnd,
          '--font-size': drop.fontSize
        }"
      >/</span>
    </div>
    <AppHeader
      :active-tab="activeTab"
      :search-index="searchIndex"
      @navigate="handleNavigate"
      @open-article="handleOpenArticle"
    />
    <div class="page-body">
      <main class="page-main">
        <WikiArticle
          v-if="activeTab === 'article'"
          :article="articles[activeArticleKey]"
          @open-article="handleOpenArticle"
        />
        <RecentChanges v-else-if="activeTab === 'recent-changes'" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  isolation: isolate;
}

.app > :not(.page-rain) {
  position: relative;
  z-index: 1;
}

.page-body {
  flex: 1;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  padding: 1.5rem 2rem;
}

.page-main {
  flex: 1;
  min-width: 0;
  padding: 1rem;
}

.page-rain {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.page-rain-drop {
  position: absolute;
  top: 0;
  left: var(--left);
  display: block;
  color: #9e8282;
  font-family: 'Consolas', 'Menlo', monospace;
  font-size: var(--font-size);
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 0 2px rgba(83, 68, 68, 0.12);
  animation: page-rain-fall var(--duration) linear infinite;
  animation-delay: var(--delay);
  opacity: 0.5;
}

@keyframes page-rain-fall {
  from {
    transform: translate3d(var(--drift-start), var(--start-top), 0);
  }
  to {
    transform: translate3d(var(--drift-end), 120vh, 0);
  }
}

@media (max-width: 720px) {
  .page-main {
    padding: 0.5rem;
  }

  .page-rain-drop {
    font-size: 1rem;
  }
}
</style>
