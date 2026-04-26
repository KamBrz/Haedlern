import json, os, re, html as html_mod
from datetime import datetime
import markdown as md_lib

BASE = 'https://haedlern.com'

try:
    data = json.loads(open('content/blog.json', encoding='utf-8').read())
except FileNotFoundError:
    raise SystemExit('ERROR: content/blog.json not found. Run from the site root.')

posts = data['posts']

os.makedirs('blog', exist_ok=True)

def esc(s):
    return html_mod.escape(str(s or ''), quote=True)

def safe_slug(s):
    return re.sub(r'[^a-zA-Z0-9\-_]', '', str(s or ''))

def sanitize_html(h):
    h = re.sub(r'<script[\s\S]*?</script>', '', h, flags=re.IGNORECASE)
    h = re.sub(r'<(iframe|object|embed|form|base)[^>]*>[\s\S]*?</\1>', '', h, flags=re.IGNORECASE)
    h = re.sub(r'\s+on\w+="[^"]*"', '', h, flags=re.IGNORECASE)
    return h

def reading_time(body):
    words = len(re.split(r'\s+', (body or '').strip()))
    return max(1, round(words / 220))

def fmt_date(iso):
    dt = datetime.fromisoformat(iso.replace('Z', '+00:00'))
    return dt.strftime('%d %B %Y').lstrip('0')

def build_post(post):
    title    = post.get('title', '')
    slug     = safe_slug(post.get('slug', ''))
    date     = post.get('date', '')
    author   = post.get('author', 'Kamil Brzezinski')
    role     = post.get('authorRole', 'Microsoft 365 Trainer & Adoption Specialist')
    excerpt  = post.get('excerpt', '')
    tags     = post.get('tags', [])
    body     = post.get('body', '')
    image    = post.get('image', '')
    iso_date = date[:10]
    og_image = f'https://haedlern.com{image}' if image else f'{BASE}/img/og-default.png'
    mins     = reading_time(body)
    f_date   = fmt_date(date)
    rendered = sanitize_html(md_lib.markdown(body, extensions=['extra']))
    tags_og  = '\n'.join(f'<meta property="article:tag" content="{esc(t)}">' for t in tags)
    tags_html= ''.join(f'<span class="blog-tag">{esc(t)}</span>' for t in tags)

    return f'''<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)} | Haedlern</title>
<meta name="description" content="{esc(excerpt)}">
<link rel="canonical" href="{BASE}/blog/{slug}.html">
<link rel="icon" type="image/svg+xml" href="../img/haedlern-ladder-iso-cobalt.svg">
<link rel="stylesheet" href="../styles.css">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(excerpt)}">
<meta property="og:url" content="{BASE}/blog/{slug}.html">
<meta property="og:image" content="{og_image}">
<meta property="og:site_name" content="Haedlern">
<meta property="article:author" content="{esc(author)}">
<meta property="article:published_time" content="{date}">
{tags_og}

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(excerpt)}">
<meta name="twitter:image" content="{og_image}">

<!-- JSON-LD: BlogPosting -->
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": {json.dumps(title)},
  "description": {json.dumps(excerpt)},
  "datePublished": "{iso_date}",
  "dateModified": "{iso_date}",
  "author": {{
    "@type": "Person",
    "name": {json.dumps(author)},
    "jobTitle": {json.dumps(role)},
    "url": "https://haedlern.com/about.html"
  }},
  "publisher": {{
    "@type": "Organization",
    "name": "Haedlern",
    "logo": {{"@type": "ImageObject", "url": "https://haedlern.com/img/haedlern-ladder-iso-cobalt.svg"}}
  }},
  "mainEntityOfPage": {{"@type": "WebPage", "@id": "{BASE}/blog/{slug}.html"}},
  "image": "{og_image}",
  "keywords": {json.dumps(', '.join(tags))}
}}
</script>
<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{{"@type":"ListItem","position":1,"name":"Home","item":"https://haedlern.com/"}},{{"@type":"ListItem","position":2,"name":"Blog","item":"https://haedlern.com/blog.html"}},{{"@type":"ListItem","position":3,"name":{json.dumps(title)},"item":"{BASE}/blog/{slug}.html"}}]}}
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
      <button class="nav-hamburger" id="navHamburger" onclick="toggleMobileNav()" aria-label="Open navigation"><span></span><span></span><span></span></button>
      <button class="nav-cta" onclick="window.location.href=\'../index.html#signup\'">Book a Call</button>
    </div>
  </nav>
</div>

<article class="blog-post">
  <header class="blog-post-header">
    <a href="../blog.html" class="blog-post-back">← All posts</a>
    <div class="blog-post-meta">
      <time datetime="{date}">{f_date}</time>
      <span> &middot; </span>
      <span>{mins} min read</span>
    </div>
    <h1>{esc(title)}</h1>
    <p class="blog-post-excerpt">{esc(excerpt)}</p>
    <div class="blog-post-tags">{tags_html}</div>
  </header>

  <div class="blog-post-body">
    {rendered}
  </div>

  <footer class="blog-post-footer">
    <div class="blog-author">
      <strong>{esc(author)}</strong>
      <span>{esc(role)}</span>
    </div>
    <a href="../index.html#signup" class="nav-cta">Book a call</a>
  </footer>
</article>

<footer>
  <div class="f-logo"><img src="../img/haedlern-ladder-iso-cobalt.svg" style="width:22px;height:22px;" alt=""/>Haedlern.</div>
  <p>&#169; 2026 Haedlern. All rights reserved.</p>
</footer>

<script src="../script.js"></script>
<!-- Microsoft Clarity -->
<script>(function(c,l,a,r,i,t,y){{c[a]=c[a]||function(){{(c[a].q=c[a].q||[]).push(arguments)}};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)}})(window,document,"clarity","script","whovnhgjm9");</script>
</body>
</html>'''

for post in posts:
    html = build_post(post)
    path = os.path.join('blog', safe_slug(post['slug']) + '.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Generated: {path}')

# Sitemap
top = [
    ('',               '1.0', 'monthly', None),
    ('about.html',     '0.7', 'monthly', None),
    ('apps.html',      '0.8', 'monthly', None),
    ('themes.html',    '0.7', 'monthly', None),
    ('calculator.html','0.6', 'monthly', None),
    ('blog.html',      '0.8', 'weekly',  None),
]
apps_files   = sorted(f for f in os.listdir('apps') if f.endswith('.html'))
apps_entries = [(f'apps/{f}', '0.6', 'monthly', None) for f in apps_files]
blog_entries = [(f'blog/{p["slug"]}.html', '0.8', 'yearly', p['date'][:10]) for p in posts]

all_entries = top + apps_entries + blog_entries
url_nodes = []
for path, pri, freq, lastmod in all_entries:
    loc = f'{BASE}/{path}' if path else f'{BASE}/'
    lm  = f'\n    <lastmod>{lastmod}</lastmod>' if lastmod else ''
    url_nodes.append(f'  <url>\n    <loc>{loc}</loc>{lm}\n    <changefreq>{freq}</changefreq>\n    <priority>{pri}</priority>\n  </url>')

sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(url_nodes) + '\n</urlset>\n'
with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(sitemap)
print('Generated: sitemap.xml')
