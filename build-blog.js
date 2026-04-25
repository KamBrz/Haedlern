#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const { marked } = require('marked');

const BASE = 'https://haedlern.com';
const { posts } = JSON.parse(fs.readFileSync('content/blog.json', 'utf8'));

fs.mkdirSync('blog', { recursive: true });

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function readingTime(body) {
  const words = String(body || '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

function buildPost(post) {
  const { title, slug, date, author, authorRole, excerpt, tags = [], body, image } = post;
  const renderedBody = marked.parse(body || '');
  const mins        = readingTime(body);
  const fDate       = fmtDate(date);
  const isoDate     = date.split('T')[0];
  const ogImage     = image ? `https://haedlern.com${image}` : `${BASE}/img/og-default.png`;
  const tagsOg      = tags.map(t => `<meta property="article:tag" content="${esc(t)}">`).join('\n');
  const tagsHtml    = tags.map(t => `<span class="blog-tag">${esc(t)}</span>`).join('');

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} | Haedlern</title>
<meta name="description" content="${esc(excerpt)}">
<link rel="canonical" href="${BASE}/blog/${slug}.html">
<link rel="icon" type="image/svg+xml" href="../img/haedlern-ladder-iso-cobalt.svg">
<link rel="stylesheet" href="../styles.css">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(excerpt)}">
<meta property="og:url" content="${BASE}/blog/${slug}.html">
<meta property="og:image" content="${ogImage}">
<meta property="og:site_name" content="Haedlern">
<meta property="article:author" content="Kamil Brzezinski">
<meta property="article:published_time" content="${date}">
${tagsOg}

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(excerpt)}">
<meta name="twitter:image" content="${ogImage}">

<!-- JSON-LD: BlogPosting -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": ${JSON.stringify(title)},
  "description": ${JSON.stringify(excerpt)},
  "datePublished": "${isoDate}",
  "dateModified": "${isoDate}",
  "author": {
    "@type": "Person",
    "name": "Kamil Brzezinski",
    "jobTitle": "Microsoft 365 Trainer & Adoption Specialist",
    "url": "https://haedlern.com/about.html"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Haedlern",
    "logo": {
      "@type": "ImageObject",
      "url": "https://haedlern.com/img/haedlern-ladder-iso-cobalt.svg"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "${BASE}/blog/${slug}.html"
  },
  "image": "${ogImage}",
  "keywords": ${JSON.stringify(tags.join(', '))}
}
</script>
</head>
<body>

<div id="progress-bar"></div>

<!-- NAV -->
<div class="nav-wrap">
  <nav id="mainNav">
    <div class="nav-logo"><a href="../index.html" style="text-decoration:none;color:inherit;"><img src="../img/haedlern-ladder-iso-cobalt.svg" style="width:22px;height:22px;" alt=""/>Haedlern.</a></div>
    <ul class="nav-links">
      <li><a href="../index.html">Home</a></li>
      <li><a href="../apps.html">Apps</a></li>
      <li><a href="../themes.html">Themes</a></li>
      <li><a href="../index.html#pricing">Packages</a></li>
      <li><a href="../calculator.html">Package Advisor</a></li>
      <li><a href="../about.html">About</a></li>
      <li><a href="../blog.html" style="color:var(--blue)">Blog</a></li>
    </ul>
    <div class="nav-controls">
      <button class="theme-btn" onclick="toggleTheme()" id="themeBtn">🌙</button>
      <button class="nav-cta" onclick="window.location.href='../index.html#signup'">Book a Call</button>
    </div>
  </nav>
</div>

<article class="blog-post">
  <header class="blog-post-header">
    <a href="../blog.html" class="blog-post-back">← All posts</a>
    <div class="blog-post-meta">
      <time datetime="${date}">${fDate}</time>
      <span> · </span>
      <span>${mins} min read</span>
    </div>
    <h1>${esc(title)}</h1>
    <p class="blog-post-excerpt">${esc(excerpt)}</p>
    <div class="blog-post-tags">${tagsHtml}</div>
  </header>

  <div class="blog-post-body">
    ${renderedBody}
  </div>

  <footer class="blog-post-footer">
    <div class="blog-author">
      <strong>${esc(author)}</strong>
      <span>${esc(authorRole)}</span>
    </div>
    <a href="../index.html#signup" class="nav-cta">Book a call</a>
  </footer>
</article>

<footer>
  <div class="f-logo"><img src="../img/haedlern-ladder-iso-cobalt.svg" style="width:22px;height:22px;" alt=""/>Haedlern.</div>
  <p>© 2026 Haedlern. All rights reserved.</p>
</footer>

<script src="../script.js"></script>
</body>
</html>`;
}

// Generate per-post pages
for (const post of posts) {
  const html = buildPost(post);
  const outPath = path.join('blog', post.slug + '.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Generated:', outPath);
}

// Generate sitemap.xml
const topLevel = [
  { path: '',               priority: '1.0', changefreq: 'monthly' },
  { path: 'about.html',     priority: '0.7', changefreq: 'monthly' },
  { path: 'apps.html',      priority: '0.8', changefreq: 'monthly' },
  { path: 'themes.html',    priority: '0.7', changefreq: 'monthly' },
  { path: 'calculator.html',priority: '0.6', changefreq: 'monthly' },
  { path: 'blog.html',      priority: '0.8', changefreq: 'weekly'  },
];

const appsFiles   = fs.readdirSync('apps').filter(f => f.endsWith('.html'));
const appsEntries = appsFiles.map(f => ({ path: `apps/${f}`, priority: '0.6', changefreq: 'monthly' }));

const blogEntries = posts.map(p => ({
  path:       `blog/${p.slug}.html`,
  priority:   '0.8',
  changefreq: 'yearly',
  lastmod:    p.date.split('T')[0],
}));

const allEntries = [...topLevel, ...appsEntries, ...blogEntries];

const urlNodes = allEntries.map(e => {
  const loc     = e.path ? `${BASE}/${e.path}` : `${BASE}/`;
  const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${loc}</loc>${lastmod}\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`;
}).join('\n');

fs.writeFileSync('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes}\n</urlset>\n`,
  'utf8'
);
console.log('Generated: sitemap.xml');
