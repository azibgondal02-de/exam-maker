import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../services/config';
import AppFooter from '../../components/AppFooter';
import Nav from '../../components/Nav';

const API = API_BASE_URL;
const WA_NUMBER = import.meta.env.VITE_WA_NUMBER || '923287600959';
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi, I want to learn more about PaperCraft.')}`;

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const PAGE_SIZE = 9;

  useEffect(() => { loadPosts(); }, [page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/blog/posts?page=${page}&page_size=${PAGE_SIZE}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to load posts');
      setPosts(data.posts || []);
      setTotal(data.total_count || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      <Nav active="Blog" />

      {/* ── Hero ── */}
      <div style={{ background: '#0f1f3d', padding: '64px 48px', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#e8920a', marginBottom: '16px' }}>Blog</div>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '48px', fontWeight: '400', color: 'white', margin: '0 0 16px', letterSpacing: '-1px' }}>
          Tips, guides & resources<br />for Pakistani educators
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', margin: '0 auto 32px', maxWidth: '480px', lineHeight: '1.7' }}>
          Practical advice on exam paper creation, board patterns, and teaching strategies.
        </p>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: '#25d366', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}
        >
          <i className="ti ti-brand-whatsapp" /> Contact us on WhatsApp
        </a>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '60px 24px' }}>

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ height: '200px', background: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
                <div style={{ padding: '20px' }}>
                  <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '12px', width: '60%' }} />
                  <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '8px' }} />
                  <div style={{ height: '16px', background: '#f1f5f9', borderRadius: '6px', width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#d32f2f' }}>
            <i className="ti ti-alert-circle" style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }} />
            {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#94a3b8' }}>
            <i className="ti ti-article" style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }} />
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No posts yet</div>
            <div style={{ fontSize: '14px' }}>Check back soon — we're working on it!</div>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {posts.map(post => (
                <article
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(15,31,61,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ height: '200px', background: post.cover_image ? `url(${post.cover_image}) center/cover` : 'linear-gradient(135deg, #0f1f3d, #243d7a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!post.cover_image && <i className="ti ti-article" style={{ fontSize: '40px', color: 'rgba(255,255,255,0.2)' }} />}
                  </div>
                  <div style={{ padding: '20px' }}>
                    {post.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag.id} style={{ background: '#e3f2fd', color: '#1565c0', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: '600' }}>#{tag.name}</span>
                        ))}
                      </div>
                    )}
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f1f3d', margin: '0 0 8px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.excerpt}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                      <span>{post.author_name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {post.reading_time > 0 && <span><i className="ti ti-clock" style={{ marginRight: '3px' }} />{post.reading_time} min</span>}
                        <span>{formatDate(post.published_at || post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#64748b', fontSize: '13px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>← Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{ padding: '8px 14px', border: '1.5px solid', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: p === page ? '700' : '400', background: p === page ? '#0f1f3d' : 'white', color: p === page ? 'white' : '#64748b', borderColor: p === page ? '#0f1f3d' : '#e2e8f0' }}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '8px 16px', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#64748b', fontSize: '13px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      <AppFooter />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}