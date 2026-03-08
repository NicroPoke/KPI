<template>
  <main class="layout">
    <section class="card">
      <h1 class="badge">RainyWiki</h1>
      <button type="button" @click="count++">Clicked: {{ count }}</button>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>
