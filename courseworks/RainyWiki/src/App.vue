<script setup>
import AppHeader from './components/AppHeader.vue'
import WikiArticle from './components/WikiArticle.vue'

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
    <AppHeader />
    <div class="page-body">
      <main class="page-main">
        <WikiArticle />
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
