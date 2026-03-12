<script setup>
const pageViews = 0;
const lastEdited = '1 January 1970';
</script>

<template>
  <article class="wiki-article">
    <div class="article-top">
      <h1 class="article-title">Blah</h1>
      <div class="article-badges">
      </div>
      <div class="article-meta">
      </div>
    </div>

    <aside class="infobox">
      <div class="infobox-title">Blah</div>
      <div class="infobox-img">
        <div class="img-placeholder">[ Logo ]</div>
      </div>
      <table class="infobox-table">
        <tbody>
          <tr><th>Type</th><td>Blah</td></tr>
          <tr><th>Released</th><td>Blah</td></tr>
          <tr><th>Ability</th><td>Blah</td></tr>
          <tr><th>Locations</th><td>Blah</td></tr>
        </tbody>
      </table>
    </aside>

    <p class="article-lead">
      <strong>Blahblahblah</strong> blahblahblah blahblahblah blahblahblah blahblahblah
      blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah
      blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah.
    </p>

    <nav class="toc">
      <div class="toc-header">Contents</div>
      <ol class="toc-list">
        <li><a href="#s1">Blahblahblah</a></li>
        <li>
          <a href="#s2">Blahblahblah</a>
          <ol>
            <li><a href="#s2-1">Blahblahblah blahblahblah</a></li>
            <li><a href="#s2-2">Blahblahblah blahblahblah</a></li>
          </ol>
        </li>
        <li><a href="#s3">Blahblahblah</a></li>
        <li><a href="#s4">Blahblahblah</a></li>
        <li><a href="#s5">Blahblahblah</a></li>
      </ol>
    </nav>

    <section class="article-section" id="s1">
      <h2>1. Blahblahblah</h2>
      <p>
        Blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah
        blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah.
      </p>
      <p>
        Blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah
        blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah.
      </p>
    </section>

    <section class="article-section" id="s2">
      <h2>2. Blahblahblah</h2>
      <h3 id="s2-1">2.1 Blahblahblah blahblahblah</h3>
      <p>
        Blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah
        blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah.
      </p>
      <h3 id="s2-2">2.2 Blahblahblah blahblahblah</h3>
      <p>
        Blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah
        blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah.
      </p>
    </section>

    <section class="article-section" id="s3">
      <h2>3. Blahblahblah</h2>
      <p>
        Blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah
        blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah blahblahblah.
      </p>
      <ul class="article-list">
        <li><strong>Blahblahblah</strong> — blahblahblah blahblahblah blahblahblah.</li>
        <li><strong>Blahblahblah</strong> — blahblahblah blahblahblah <code>blahblah</code> blahblahblah.</li>
        <li><strong>Blahblahblah</strong> — blahblahblah blahblahblah <code>blah-</code> blahblahblah.</li>
        <li><strong>Blahblahblah</strong> — blahblahblah blahblahblah blahblahblah (blahblah).</li>
        <li><strong>Blahblahblah</strong> — blahblahblah blahblahblah blahblahblah.</li>
      </ul>
    </section>

    <section class="article-section" id="s4">
      <h2>4. Blahblahblah</h2>
      <p>
        Blahblahblah blahblahblah blahblahblah: <strong>Blahblahblah</strong> blahblahblah
        blahblahblah, <strong>Blahblahblah</strong> blahblahblah blahblahblah blahblahblah,
        <strong>Blahblahblah</strong> blahblahblah blahblahblah blahblahblah blahblahblah.
      </p>
    </section>

    <footer class="article-footer">
      <div class="footer-cats">
        <strong>Categories:</strong>
        <a href="#">Blah</a>
      </div>
      <div class="footer-bottom">
        <span class="footer-note">This page has been viewed {{ pageViews.toLocaleString() }} times.</span>
        <span class="footer-note">Last edited: {{ lastEdited }}.</span>
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
.article-section { clear: both; }
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
