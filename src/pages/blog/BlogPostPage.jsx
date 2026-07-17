import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../services/config';
import AppFooter from '../../components/AppFooter';
import Nav from '../../components/Nav';

const API = API_BASE_URL;
const WA_NUMBER = import.meta.env.VITE_WA_NUMBER || '923287600959';
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi, I want to learn more about PaperCraft.')}`;

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadPost(); }, [slug]);

  useEffect(() => {
    if (post) {
      document.title = post.meta_title || post.title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', post.meta_description || post.excerpt || '');
    }
  }, [post]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/blog/posts/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Post not found');
      setPost(data.post);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      <Nav active="Blog" />

      {loading && (
        <div style={{ maxWidth: '760px', margin: '60px auto', padding: '0 24px' }}>
          <div style={{ height: '40px', background: '#e2e8f0', borderRadius: '8px', marginBottom: '16px', width: '70%', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: '24px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '40px', width: '40%' }} />
          <div style={{ height: '320px', background: '#e2e8f0', borderRadius: '16px', marginBottom: '40px' }} />
          {[90, 100, 85, 95, 70].map((w, i) => <div key={i} style={{ height: '16px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '12px', width: `${w}%` }} />)}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      )}

      {error && (
        <div style={{ maxWidth: '760px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <i className="ti ti-alert-circle" style={{ fontSize: '48px', color: '#d32f2f', display: 'block', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f1f3d', marginBottom: '8px' }}>Post not found</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
          <button onClick={() => navigate('/blog')} style={{ padding: '10px 24px', background: '#0f1f3d', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>← Back to Blog</button>
        </div>
      )}

      {!loading && post && (
        <>
          {post.cover_image && (
            <div style={{ height: '400px', background: `url(${post.cover_image}) center/cover`, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,31,61,0.4)' }} />
            </div>
          )}

          <article style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>

            {post.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {post.tags.map(tag => (
                  <span key={tag.id} style={{ background: '#e3f2fd', color: '#1565c0', borderRadius: '4px', padding: '3px 10px', fontSize: '12px', fontWeight: '600' }}>#{tag.name}</span>
                ))}
              </div>
            )}

            <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '40px', fontWeight: '400', color: '#0f1f3d', margin: '0 0 20px', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
              {post.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#94a3b8', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0f1f3d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8920a', fontSize: '11px', fontWeight: '700' }}>
                  {(post.author_name || 'P')[0]}
                </div>
                <span style={{ fontWeight: '600', color: '#0f1f3d' }}>{post.author_name}</span>
              </div>
              <span>·</span>
              <span>{formatDate(post.published_at || post.created_at)}</span>
              {post.reading_time > 0 && <><span>·</span><span><i className="ti ti-clock" style={{ marginRight: '3px' }} />{post.reading_time} min read</span></>}
            </div>

            {post.excerpt && (
              <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.8', margin: '0 0 32px', fontStyle: 'italic', borderLeft: '3px solid #e8920a', paddingLeft: '20px' }}>
                {post.excerpt}
              </p>
            )}

            <div
              dangerouslySetInnerHTML={{ __html: post.content_html || post.content }}
              style={{ fontSize: '16px', color: '#334155', lineHeight: '1.85' }}
            />

            {/* CTA */}
            <div style={{ marginTop: '60px', padding: '32px', background: '#0f1f3d', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Ready to create board-ready exam papers?</div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>Join thousands of Pakistani teachers using PaperCraft</p>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: '#25d366', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}
              >
                <i className="ti ti-brand-whatsapp" /> Contact us on WhatsApp
              </a>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <button onClick={() => navigate('/blog')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <i className="ti ti-arrow-left" /> Back to all posts
              </button>
            </div>
          </article>

          <style>{`
            article div h1, article div h2, article div h3, article div h4 {
              font-family: 'DM Serif Display', Georgia, serif;
              color: #0f1f3d; margin: 2em 0 0.75em; line-height: 1.3;
            }
            article div h2 { font-size: 28px; }
            article div h3 { font-size: 22px; }
            article div p { margin: 0 0 1.4em; }
            article div ul, article div ol { padding-left: 24px; margin: 0 0 1.4em; }
            article div li { margin-bottom: 0.5em; }
            article div a { color: #1565c0; text-decoration: underline; }
            article div blockquote { border-left: 3px solid #e8920a; margin: 2em 0; padding: 12px 20px; background: #fffbf0; color: #64748b; font-style: italic; border-radius: 0 8px 8px 0; }
            article div code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 14px; }
            article div pre { background: #0f1f3d; color: #e2e8f0; padding: 20px; border-radius: 12px; overflow-x: auto; margin: 1.5em 0; }
            article div img { max-width: 100%; border-radius: 12px; margin: 1.5em 0; }
            article div strong { color: #0f1f3d; }
            article div hr { border: none; border-top: 1px solid #e2e8f0; margin: 2.5em 0; }
            @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
            @media (max-width: 768px) {
              article { padding: 40px 16px 60px !important; }
              article h1 { font-size: 28px !important; }
            }
          `}</style>
        </>
      )}

      <AppFooter />
    </div>
  );
}