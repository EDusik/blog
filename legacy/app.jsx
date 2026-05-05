// ---------- helpers ----------
const { useState, useEffect, useMemo, useCallback } = React;

// Parse inline markdown-ish tokens: [[wikilink]] and `code`
function renderInline(text) {
  const parts = [];
  const regex = /(\[\[[^\]]+\]\])|(`[^`]+`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('[[')) {
      const inner = token.slice(2, -2);
      parts.push(
        <span className="wikilink" key={key++} onClick={(e) => e.stopPropagation()}>
          <span className="bracket">[[</span>{inner}<span className="bracket">]]</span>
        </span>
      );
    } else {
      parts.push(<code className="inline-code" key={key++}>{token.slice(1, -1)}</code>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// ---------- icons ----------
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
const ArrowBack = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="arrow">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

// ---------- header ----------
function Header({ lang, setLang, t }) {
  return (
    <header className="site-header">
      <div className="brand">
        <span className="brand-mark" />
        <span className="brand-name">{t.ui.siteTitle}</span>
        <span className="brand-tagline">/ {t.ui.siteTagline}</span>
      </div>
      <div className="header-tools">
        <div className="lang-toggle" role="group" aria-label={t.ui.langLabel}>
          <button className={lang === 'pt-BR' ? 'active' : ''} onClick={() => setLang('pt-BR')}>PT</button>
          <span className="sep" />
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
        </div>
      </div>
    </header>
  );
}

// ---------- post card ----------
function PostCard({ post, t, onOpen, activeTag, onTagClick }) {
  return (
    <article className="post-card" onClick={() => onOpen(post.id)}>
      <div className="post-meta">
        <span>{t.ui.date(post.date)}</span>
        <span className="dot" />
        <span>{post.minutes} {t.ui.readingTime}</span>
      </div>
      <h2 className="post-title">{post.title}</h2>
      <p className="post-excerpt">{post.excerpt}</p>
      <div className="post-tags">
        {post.tags.map(tag => (
          <span
            key={tag}
            className={'tag' + (activeTag === tag ? ' active' : '')}
            onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
          >{tag}</span>
        ))}
      </div>
    </article>
  );
}

// ---------- feed ----------
function Feed({ t, onOpen }) {
  const [activeTag, setActiveTag] = useState(null);

  const filtered = useMemo(() => {
    if (!activeTag) return t.posts;
    return t.posts.filter(p => p.tags.includes(activeTag));
  }, [activeTag, t]);

  // reset tag filter when language changes (tags are language-specific)
  useEffect(() => { setActiveTag(null); }, [t]);

  const handleTagClick = (tag) => {
    setActiveTag(current => current === tag ? null : tag);
  };

  return (
    <div>
      <div className="section-title">
        <span>{t.ui.recent}</span>
        <span className="count">{t.ui.noteCount(filtered.length)}</span>
      </div>

      {activeTag && (
        <div className="filter-bar">
          <span>{t.ui.filterBy}</span>
          <span className="current-tag">#{activeTag}</span>
          <span className="clear" onClick={() => setActiveTag(null)}>× {t.ui.clear}</span>
        </div>
      )}

      <div className="feed">
        {filtered.length === 0 ? (
          <div style={{ color: 'var(--text-mute)', fontFamily: 'var(--mono)', fontSize: 13, padding: '20px 0' }}>
            {t.ui.empty}
          </div>
        ) : (
          filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              t={t}
              onOpen={onOpen}
              activeTag={activeTag}
              onTagClick={handleTagClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---------- post detail ----------
function PostDetail({ post, t, onBack, onTagClick }) {
  return (
    <article className="post-detail">
      <span className="back-link" onClick={onBack}>
        <ArrowBack /> {t.ui.recent}
      </span>
      <h1>{post.title}</h1>
      <div className="post-meta">
        <span>{t.ui.date(post.date)}</span>
        <span className="dot" />
        <span>{post.minutes} {t.ui.readingTime}</span>
      </div>
      <div className="post-body">
        {post.body.map((block, i) => {
          if (block.type === 'p') return <p key={i}>{renderInline(block.text)}</p>;
          if (block.type === 'h2') return <h2 key={i}>{block.text}</h2>;
          if (block.type === 'quote') return <blockquote key={i}>{renderInline(block.text)}</blockquote>;
          if (block.type === 'code') return (
            <pre key={i}><code>{block.text}</code></pre>
          );
          return null;
        })}
      </div>
      <div className="post-tags" style={{ marginTop: 40 }}>
        {post.tags.map(tag => (
          <span key={tag} className="tag" onClick={() => onTagClick(tag)}>{tag}</span>
        ))}
      </div>
    </article>
  );
}

// ---------- tweaks ----------
const ACCENT_OPTIONS = [
  { name: 'lilac',  hue: 300 },
  { name: 'cyan',   hue: 220 },
  { name: 'mint',   hue: 160 },
  { name: 'amber',  hue: 70  },
  { name: 'rose',   hue: 20  },
];

function TweaksPanel({ visible, accent, setAccent, mono, setMono }) {
  return (
    <div className={'tweaks-panel' + (visible ? ' visible' : '')}>
      <h3>tweaks</h3>
      <div className="row">
        <label>accent</label>
        <div className="swatches">
          {ACCENT_OPTIONS.map(opt => (
            <span
              key={opt.name}
              className={'swatch' + (accent === opt.hue ? ' active' : '')}
              style={{ background: `oklch(0.72 0.14 ${opt.hue})` }}
              onClick={() => setAccent(opt.hue)}
              title={opt.name}
            />
          ))}
        </div>
      </div>
      <div className="row">
        <label>mono font</label>
        <select
          value={mono}
          onChange={(e) => setMono(e.target.value)}
          style={{
            background: 'var(--surface-2)',
            color: 'var(--text)',
            border: '1px solid var(--line)',
            borderRadius: 4,
            fontFamily: 'var(--mono)',
            fontSize: 11,
            padding: '2px 6px',
          }}
        >
          <option value="JetBrains Mono">JetBrains Mono</option>
          <option value="Fira Code">Fira Code</option>
          <option value="IBM Plex Mono">IBM Plex Mono</option>
          <option value="Geist Mono">Geist Mono</option>
        </select>
      </div>
    </div>
  );
}

// ---------- app ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 300,
  "monoFont": "JetBrains Mono"
}/*EDITMODE-END*/;

function readSyncQuality() {
  if (typeof navigator === 'undefined') return 'pending';
  if (!navigator.onLine) return 'offline';
  const c = navigator.connection;
  if (!c || !c.effectiveType) return 'good';
  if (c.effectiveType === '4g') {
    const dl = c.downlink;
    if (typeof dl === 'number' && dl > 0 && dl < 0.55) return 'medium';
    return 'good';
  }
  if (c.effectiveType === '3g') return 'medium';
  if (c.effectiveType === '2g' || c.effectiveType === 'slow-2g') return 'bad';
  return 'good';
}

function SyncedGraphDot({ label }) {
  const [quality, setQuality] = useState('pending');
  useEffect(() => {
    setQuality(readSyncQuality());
    const refresh = () => setQuality(readSyncQuality());
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    const conn = navigator.connection;
    conn?.addEventListener?.('change', refresh);
    return () => {
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
      conn?.removeEventListener?.('change', refresh);
    };
  }, []);
  const mod =
    quality === 'pending' ? 'graph-dot--pending' :
    quality === 'offline' ? 'graph-dot--offline' :
    quality === 'good' ? 'graph-dot--good' :
    quality === 'medium' ? 'graph-dot--medium' :
    'graph-dot--bad';
  return <span className={`graph-dot ${mod}`}>{label}</span>;
}

function App() {
  // language
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('blog-lang');
    if (saved === 'pt-BR' || saved === 'en') return saved;
    const urlLang = new URLSearchParams(location.search).get('lang');
    if (urlLang === 'pt-BR' || urlLang === 'en') return urlLang;
    return 'pt-BR';
  });
  useEffect(() => {
    localStorage.setItem('blog-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = window.I18N[lang];

  // routing — which post (by id) is open
  const [openId, setOpenId] = useState(() => localStorage.getItem('blog-open') || null);
  useEffect(() => {
    if (openId) localStorage.setItem('blog-open', openId);
    else localStorage.removeItem('blog-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [openId]);

  const openPost = useMemo(() => {
    if (!openId) return null;
    return t.posts.find(p => p.id === openId) || null;
  }, [openId, t]);

  // tweaks
  const [accentHue, setAccentHue] = useState(TWEAK_DEFAULTS.accentHue);
  const [monoFont, setMonoFont] = useState(TWEAK_DEFAULTS.monoFont);
  const [tweaksVisible, setTweaksVisible] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', `oklch(0.72 0.14 ${accentHue})`);
    document.documentElement.style.setProperty('--accent-dim', `oklch(0.72 0.14 ${accentHue} / 0.18)`);
  }, [accentHue]);

  useEffect(() => {
    document.documentElement.style.setProperty('--mono', `'${monoFont}', ui-monospace, SFMono-Regular, Menlo, monospace`);
  }, [monoFont]);

  // Tweaks host protocol
  useEffect(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === '__activate_edit_mode') setTweaksVisible(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const persistTweak = (edits) => {
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
  };

  const setAccent = (hue) => { setAccentHue(hue); persistTweak({ accentHue: hue }); };
  const setMono   = (f)   => { setMonoFont(f);    persistTweak({ monoFont: f });    };

  // scroll-to-top ref for tag click
  const [pendingTag, setPendingTag] = useState(null);
  const handleTagClick = useCallback((tag) => {
    setOpenId(null);
    setPendingTag(tag);
  }, []);
  // inject pendingTag into Feed via key reset — simpler: pass through
  // We'll just scroll on open changes; tag application happens in the feed by its own state.
  // For cross-view tag click, we set openId to null and let Feed apply filter via a ref mechanism:
  useEffect(() => {
    if (pendingTag !== null && openId === null) {
      // dispatch a custom event the Feed listens to
      window.dispatchEvent(new CustomEvent('apply-tag', { detail: pendingTag }));
      setPendingTag(null);
    }
  }, [pendingTag, openId]);

  return (
    <div className="shell" data-screen-label={openPost ? `post:${openPost.id}` : 'feed'}>
      <Header lang={lang} setLang={setLang} t={t} />

      {openPost ? (
        <PostDetail
          post={openPost}
          t={t}
          onBack={() => setOpenId(null)}
          onTagClick={handleTagClick}
        />
      ) : (
        <FeedWithTagListener t={t} onOpen={setOpenId} />
      )}

      <footer className="site-footer">
        <div className="footer-social">
          <a className="icon-link" href="https://github.com/EDusik" aria-label="GitHub" target="_blank" rel="noopener noreferrer"><GithubIcon /></a>
          <a className="icon-link" href="https://www.linkedin.com/in/eduardo-dos-santos-dusik/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><LinkedInIcon /></a>
        </div>
        {t.ui.footer ? <span className="site-footer-middle">{t.ui.footer}</span> : <span className="site-footer-middle" aria-hidden="true" />}
        <div className="site-footer-right">
          <SyncedGraphDot label={lang === 'pt-BR' ? 'sincronizado' : 'synced'} />
        </div>
      </footer>

      <TweaksPanel
        visible={tweaksVisible}
        accent={accentHue} setAccent={setAccent}
        mono={monoFont}   setMono={setMono}
      />
    </div>
  );
}

// Feed wrapper that listens for apply-tag events
function FeedWithTagListener({ t, onOpen }) {
  const [externalTag, setExternalTag] = useState(null);
  useEffect(() => {
    const handler = (e) => setExternalTag(e.detail);
    window.addEventListener('apply-tag', handler);
    return () => window.removeEventListener('apply-tag', handler);
  }, []);
  return <FeedControlled t={t} onOpen={onOpen} externalTag={externalTag} clearExternal={() => setExternalTag(null)} />;
}

function FeedControlled({ t, onOpen, externalTag, clearExternal }) {
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    if (externalTag !== null && externalTag !== undefined) {
      setActiveTag(externalTag);
      clearExternal();
    }
  }, [externalTag]);

  useEffect(() => { setActiveTag(null); }, [t]);

  const filtered = useMemo(() => {
    if (!activeTag) return t.posts;
    return t.posts.filter(p => p.tags.includes(activeTag));
  }, [activeTag, t]);

  const handleTagClick = (tag) => {
    setActiveTag(current => current === tag ? null : tag);
  };

  return (
    <div>
      <div className="section-title">
        <span>{t.ui.recent}</span>
        <span className="count">{t.ui.noteCount(filtered.length)}</span>
      </div>

      {activeTag && (
        <div className="filter-bar">
          <span>{t.ui.filterBy}</span>
          <span className="current-tag">#{activeTag}</span>
          <span className="clear" onClick={() => setActiveTag(null)}>× {t.ui.clear}</span>
        </div>
      )}

      <div className="feed">
        {filtered.length === 0 ? (
          <div style={{ color: 'var(--text-mute)', fontFamily: 'var(--mono)', fontSize: 13, padding: '20px 0' }}>
            {t.ui.empty}
          </div>
        ) : (
          filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              t={t}
              onOpen={onOpen}
              activeTag={activeTag}
              onTagClick={handleTagClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
