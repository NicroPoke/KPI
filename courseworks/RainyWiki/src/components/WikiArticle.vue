<script setup>
import { computed } from 'vue';

const pageViews = 0;
const lastEdited = '15 March 2026';

const props = defineProps({
  article: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['open-article']);

const fallbackArticle = {
  title: 'Article not found',
  badges: [],
  meta: [],
  infobox: null,
  lead: {
    strong: 'Notice:',
    text: ' this article is unavailable. Please open another page from navigation.',
  },
  sections: [],
  footer: {
    categoriesLabel: 'Categories:',
    categories: [],
    viewsText: 'This page has been viewed',
    viewsTextTail: 'times.',
    updatedText: 'Last updated:',
  },
};

const articleData = computed(() => props.article ?? fallbackArticle);

const openArticle = (articleKey) => {
  emit('open-article', articleKey);
};

const scrollToSection = (sectionId) => {
  const sectionElement = document.getElementById(sectionId);
  sectionElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
</script>

<template>
  <article class="wiki-article">
    <div class="article-top">
      <h1 class="article-title">{{ articleData.title }}</h1>
      <div class="article-badges">
        <span
          v-for="(badge, badgeIndex) in articleData.badges"
          :key="badge"
          class="badge"
          :class="badgeIndex === 0 ? 'tech' : 'featured'"
        >
          {{ badge }}
        </span>
      </div>
      <div class="article-meta">
        <template v-for="(metaItem, metaIndex) in articleData.meta" :key="metaItem">
          <span>{{ metaItem }}</span>
          <span v-if="metaIndex < articleData.meta.length - 1" class="meta-sep">•</span>
        </template>
      </div>
    </div>

    <aside v-if="articleData.infobox" class="infobox">
      <div class="infobox-title">{{ articleData.infobox.title }}</div>
      <div class="infobox-img">
        <img class="infobox-logo" :src="articleData.infobox.imageSrc" :alt="articleData.infobox.imageAlt" />
      </div>
      <table class="infobox-table">
        <tbody>
          <tr v-for="row in articleData.infobox.rows" :key="row.label">
            <th>{{ row.label }}</th>
            <td>{{ row.value }}</td>
          </tr>
        </tbody>
      </table>
    </aside>

    <p class="article-lead">
      <strong>{{ articleData.lead.strong }}</strong>{{ articleData.lead.text }}
    </p>

    <nav v-if="articleData.sections?.length" class="toc">
      <div class="toc-header">Contents</div>
      <ol class="toc-list">
        <li v-for="section in articleData.sections" :key="section.id">
          <a href="#" @click.prevent="scrollToSection(section.id)">{{ section.title }}</a>
          <ol v-if="section.subsections?.length">
            <li v-for="subsection in section.subsections" :key="subsection.id">
              <a href="#" @click.prevent="scrollToSection(subsection.id)">{{ subsection.title }}</a>
            </li>
          </ol>
        </li>
      </ol>
    </nav>

    <section
      v-for="section in articleData.sections"
      :id="section.id"
      :key="section.id"
      class="article-section"
    >
      <h2>{{ section.title }}</h2>
      <p v-for="paragraph in section.paragraphs" :key="paragraph">
        {{ paragraph }}
      </p>

      <template v-if="section.subsections?.length">
        <template v-for="subsection in section.subsections" :key="subsection.id">
          <h3 :id="subsection.id">{{ subsection.title }}</h3>
          <p v-for="subParagraph in subsection.paragraphs" :key="subParagraph">
            {{ subParagraph }}
          </p>
          <div v-if="subsection.links?.length" class="section-links">
            <button
              v-for="link in subsection.links"
              :key="`${subsection.id}-${link.text}`"
              class="article-link-btn"
              type="button"
              @click="openArticle(link.articleKey)"
            >
              {{ link.text }}
            </button>
          </div>
        </template>
      </template>

      <ul v-if="section.list?.length" class="article-list">
        <li v-for="listItem in section.list" :key="listItem.label">
          <strong>{{ listItem.label }}</strong> — {{ listItem.text }}
        </li>
      </ul>

      <div v-if="section.links?.length" class="section-links">
        <button
          v-for="link in section.links"
          :key="`${section.id}-${link.text}`"
          class="article-link-btn"
          type="button"
          @click="openArticle(link.articleKey)"
        >
          {{ link.text }}
        </button>
      </div>
    </section>
    <footer class="article-footer">
      <div class="footer-cats">
        <strong>{{ articleData.footer.categoriesLabel }}</strong>
        <a v-for="category in articleData.footer.categories" :key="category" href="#">{{ category }}</a>
      </div>
      <div class="footer-bottom">
        <span class="footer-note">{{ articleData.footer.viewsText }} {{ pageViews.toLocaleString() }} {{ articleData.footer.viewsTextTail }}</span>
        <span class="footer-note">{{ articleData.footer.updatedText }} {{ lastEdited }}.</span>
      </div>
    </footer>

  </article>
</template>

<style scoped>
.wiki-article {
  background: rgba(241, 234, 235, 0.75);
  border: 1px solid rgba(207, 197, 198, 0.92);
  border-radius: 12px;
  padding: 1.75rem 2rem;
  overflow: hidden;
}
.article-top {
  margin-bottom: 0.75rem;
}
.article-title {
  margin: 0 0 0.4rem;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 700;
  color: #272020;
  line-height: 1.2;
}
.article-badges {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}
.badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  letter-spacing: 0.02em;
}
.badge.tech { background: #dcd4d5; color: #272020; }
.badge.featured { background: #fff8e0; color: #a07a00; }

.article-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.83rem;
  color: #4a3a3b;
  flex-wrap: wrap;
}
.meta-sep { color: #bfb5b6; }
.edit-btn {
  margin-left: auto;
  background: none;
  border: 1px solid #cfc5c6;
  border-radius: 5px;
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
  color: #272020;
  cursor: pointer;
}
.edit-btn:hover { background: #ede5e6; }
.infobox {
  float: right;
  clear: right;
  margin: 0 0 1.25rem 1.75rem;
  width: 250px;
  background: #f0eaeb;
  border: 1px solid #cfc5c6;
  border-radius: 10px;
  overflow: hidden;
  font-size: 0.83rem;
}
.infobox-title {
  background: #272020;
  color: #fff;
  text-align: center;
  font-weight: 700;
  padding: 0.5rem;
  font-size: 0.9rem;
}
.infobox-img {
  text-align: center;
  padding: 0.75rem;
  border-bottom: 1px solid #cfc5c6;
}
.img-placeholder {
  height: 80px;
  background: #e6ddde;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9e8e8f;
  font-size: 0.8rem;
}
.infobox-logo {
  max-width: 100%;
  width: auto;
  height: auto;
  display: block;
  margin: 0 auto;
  border-radius: 6px;
}
.infobox-table {
  width: 100%;
  border-collapse: collapse;
}
.infobox-table tr { border-top: 1px solid #e6ddde; }
.infobox-table th {
  padding: 0.35rem 0.6rem;
  font-weight: 600;
  color: #4a3a3b;
  text-align: left;
  width: 45%;
  vertical-align: top;
}
.infobox-table td {
  padding: 0.35rem 0.6rem;
  color: #272020;
}
.article-lead {
  font-size: 1rem;
  line-height: 1.75;
  color: #272020;
  margin-bottom: 1rem;
}
.toc {
  float: left;
  clear: left;
  margin: 0 1.5rem 1rem 0;
  min-width: 200px;
  max-width: 250px;
  background: #f0eaeb;
  border: 1px solid #cfc5c6;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.875rem;
}
.toc-header {
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9e8e8f;
  margin-bottom: 0.5rem;
}
.toc-list {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.toc-list ol {
  padding-left: 1rem;
  margin: 0.2rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.toc-list a {
  color: #272020;
  text-decoration: none;
  font-size: 0.85rem;
  line-height: 1.5;
}
.toc-list a:hover { text-decoration: underline; }
.article-section {
  clear: left;
}
.article-section h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #272020;
  margin: 1.5rem 0 0.6rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #e6ddde;
}
.article-section h3 {
  font-size: 1.05rem;
  font-weight: 600;
  color: #3d2e2e;
  margin: 1.1rem 0 0.4rem;
}
.article-section p {
  line-height: 1.75;
  color: #272020;
  margin-bottom: 0.75rem;
}
.article-list {
  padding-left: 1.5rem;
  margin: 0 0 0.75rem;
}
.article-list li {
  line-height: 1.7;
  margin-bottom: 0.3rem;
  color: #272020;
}
.section-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.3rem 0 0.75rem;
}
.article-link-btn {
  border: 1px solid #cfc5c6;
  background: #ede5e6;
  color: #272020;
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  font-size: 0.82rem;
  cursor: pointer;
}
.article-link-btn:hover {
  background: #dcd4d5;
}
.article-footer {
  clear: both;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e6ddde;
}
.footer-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  font-size: 0.83rem;
  margin-bottom: 0.5rem;
}
.footer-cats strong { color: #4a3a3b; }
.footer-cats a {
  background: #e6ddde;
  color: #272020;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}
.footer-cats a:hover {
  background: #d4c8c9;
  text-decoration: none;
}
.footer-bottom {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.footer-note {
  font-size: 0.78rem;
  color: #9e8e8f;
}

</style>
