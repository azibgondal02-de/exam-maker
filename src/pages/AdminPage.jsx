import React, { useEffect, useState } from 'react';
import TopBar from '../components/TopBar.jsx';
import { fetchUsers, createUser, updateUser, uploadLogo, fetchBoards, fetchClasses } from '../services/api';
import API_BASE_URL from '../services/config';

const API = API_BASE_URL;
const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'AJK', 'Islamabad'];
const PLANS = ['basic', 'standard', 'premium'];

const defaultForm = {
  username: '', password: '', email: '', school_name: '',
  owner_name: '', phone_number: '', city: '', province: '',
  user_type: 'school_admin', subscription_plan: 'basic',
  subscription_start: '', subscription_end: '', amount_paid: 0,
  class_ids: [], is_active: true,
};

const REQUIRED_CREATE = ['username', 'password', 'email', 'school_name'];

// ── Blog default form ──────────────────────────────────────────────────────────
const defaultBlogForm = {
  title: '', slug: '', excerpt: '', content: '',
  cover_image: '', status: 'draft',
  meta_title: '', meta_description: '',
  author_name: 'PaperCraft Team', reading_time: 0, tag_ids: [],
};

// ── Slug generator ─────────────────────────────────────────────────────────────
function toSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── Auth header ────────────────────────────────────────────────────────────────
function authHeader() {
  return { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, 'Content-Type': 'application/json' };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');

  // ── User state ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [boards, setBoards] = useState([]);
  const [classesByBoard, setClassesByBoard] = useState({});
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Blog state ──────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState('');
  const [postsSuccess, setPostsSuccess] = useState('');
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [blogForm, setBlogForm] = useState(defaultBlogForm);
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogError, setBlogError] = useState('');
  const [tags, setTags] = useState([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagSlug, setNewTagSlug] = useState('');
  const [tagSaving, setTagSaving] = useState(false);

  useEffect(() => { loadUsers(); loadBoards(); }, []);
  useEffect(() => { if (activeTab === 'blog') { loadPosts(); loadTags(); } }, [activeTab]);

  // ── User functions ──────────────────────────────────────────────────────────
  const loadUsers = async () => {
    try { setLoading(true); const data = await fetchUsers(); setUsers(data.users || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const loadBoards = async () => {
    try {
      const data = await fetchBoards();
      setBoards(data.boards || []);
      const classMap = {};
      await Promise.all((data.boards || []).map(async (board) => {
        const cls = await fetchClasses(board.board_id);
        classMap[board.board_id] = cls.classes || [];
      }));
      setClassesByBoard(classMap);
    } catch (err) { console.error('Failed to load boards', err); }
  };

  const openCreate = () => { setEditUser(null); setForm(defaultForm); setLogoFile(null); setLogoPreview(null); setFieldErrors({}); setError(''); setShowModal(true); };
  const openEdit = (user) => {
    setEditUser(user);
    setForm({ username: user.username, password: '', email: user.email, school_name: user.school_name || '', owner_name: user.owner_name || '', phone_number: user.phone_number || '', city: user.city || '', province: user.province || '', user_type: user.user_type, subscription_plan: user.subscription_plan || 'basic', subscription_start: user.subscription_start || '', subscription_end: user.subscription_end || '', amount_paid: user.amount_paid || 0, class_ids: user.class_ids || [], is_active: user.is_active });
    setLogoFile(null); setLogoPreview(null); setFieldErrors({}); setError(''); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setLogoFile(null); setLogoPreview(null); setFieldErrors({}); setError(''); };

  const handleToggleActive = async (user) => {
    try { await updateUser(user.user_code, { is_active: !user.is_active }); setSuccessMsg(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`); setTimeout(() => setSuccessMsg(''), 3000); loadUsers(); }
    catch (err) { setError(err.message); }
  };

  const toggleClass = (classId) => setForm(prev => ({ ...prev, class_ids: prev.class_ids.includes(classId) ? prev.class_ids.filter(id => id !== classId) : [...prev.class_ids, classId] }));
  const toggleAllBoard = (board) => { const ids = (classesByBoard[board.board_id] || []).map(c => c.class_id); const allSel = ids.every(id => form.class_ids.includes(id)); setForm(prev => ({ ...prev, class_ids: allSel ? prev.class_ids.filter(id => !ids.includes(id)) : [...new Set([...prev.class_ids, ...ids])] })); };
  const toggleAllClasses = () => { const ids = Object.values(classesByBoard).flat().map(c => c.class_id); const allSel = ids.every(id => form.class_ids.includes(id)); setForm(prev => ({ ...prev, class_ids: allSel ? [] : ids })); };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setLogoFile(file); setLogoPreview(URL.createObjectURL(file));
    if (editUser) {
      try {
        const reader = new FileReader();
        await new Promise((resolve, reject) => { reader.onload = async () => { try { await uploadLogo(editUser.user_code, reader.result.split(',')[1]); resolve(); } catch (err) { reject(err); } }; reader.readAsDataURL(file); });
      } catch (err) { setError('Logo upload failed: ' + err.message); }
    }
  };

  const validate = () => { if (editUser) return true; const errors = {}; REQUIRED_CREATE.forEach(key => { if (!form[key] || !String(form[key]).trim()) errors[key] = 'Required'; }); setFieldErrors(errors); return Object.keys(errors).length === 0; };

  const handleSave = async () => {
    if (!validate()) return; setSaving(true); setError('');
    try {
      let savedUserCode = null;
      if (editUser) { const payload = { ...form }; delete payload.username; delete payload.password; if (!payload.subscription_start) payload.subscription_start = null; if (!payload.subscription_end) payload.subscription_end = null; await updateUser(editUser.user_code, payload); savedUserCode = editUser.user_code; }
      else { const cp = { ...form }; if (!cp.subscription_start) cp.subscription_start = null; if (!cp.subscription_end) cp.subscription_end = null; const result = await createUser(cp); savedUserCode = result.user_code; }
      if (logoFile && savedUserCode && !editUser) { const reader = new FileReader(); await new Promise((resolve, reject) => { reader.onload = async () => { try { await uploadLogo(savedUserCode, reader.result.split(',')[1]); resolve(); } catch (err) { reject(err); } }; reader.readAsDataURL(logoFile); }); }
      closeModal(); setSuccessMsg(editUser ? 'User updated successfully' : 'User created successfully'); setTimeout(() => setSuccessMsg(''), 3000); loadUsers();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // ── Blog functions ──────────────────────────────────────────────────────────
  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await fetch(`${API}/blog/admin/posts`, { headers: authHeader() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to load posts');
      setPosts(data.posts || []);
    } catch (err) { setPostsError(err.message); }
    finally { setPostsLoading(false); }
  };

  const loadTags = async () => {
    try {
      const res = await fetch(`${API}/blog/tags`);
      const data = await res.json();
      setTags(data.tags || []);
    } catch (err) { console.error('Failed to load tags', err); }
  };

  const openCreatePost = () => { setEditPost(null); setBlogForm(defaultBlogForm); setBlogError(''); setShowBlogModal(true); };
  const openEditPost = async (post) => {
    setEditPost(post);
    setBlogError('');
    setShowBlogModal(true);
    try {
      const res = await fetch(`${API}/blog/posts/${post.slug}`);
      const data = await res.json();
      const full = data.post;
      setBlogForm({
        title: full.title,
        slug: full.slug,
        excerpt: full.excerpt || '',
        content: full.content || '',
        cover_image: full.cover_image || '',
        status: full.status,
        meta_title: full.meta_title || '',
        meta_description: full.meta_description || '',
        author_name: full.author_name,
        reading_time: full.reading_time,
        tag_ids: (full.tags || []).map(t => t.id),
      });
    } catch (err) {
      setBlogError('Failed to load post details');
    }
  };
  const closeBlogModal = () => { setShowBlogModal(false); setBlogError(''); };

  const handleBlogSave = async () => {
    if (!blogForm.title || !blogForm.slug || !blogForm.content) { setBlogError('Title, slug and content are required'); return; }
    setBlogSaving(true); setBlogError('');
    try {
      const url = editPost ? `${API}/blog/admin/posts/${editPost.id}` : `${API}/blog/admin/posts`;
      const method = editPost ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(blogForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save post');
      closeBlogModal();
      setPostsSuccess(editPost ? 'Post updated successfully' : 'Post created successfully');
      setTimeout(() => setPostsSuccess(''), 3000);
      loadPosts();
    } catch (err) { setBlogError(err.message); }
    finally { setBlogSaving(false); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`${API}/blog/admin/posts/${postId}`, { method: 'DELETE', headers: authHeader() });
      if (!res.ok) throw new Error('Failed to delete post');
      setPostsSuccess('Post deleted successfully');
      setTimeout(() => setPostsSuccess(''), 3000);
      loadPosts();
    } catch (err) { setPostsError(err.message); }
  };

  const handleCreateTag = async () => {
    if (!newTagName || !newTagSlug) return;
    setTagSaving(true);
    try {
      const res = await fetch(`${API}/blog/admin/tags`, { method: 'POST', headers: authHeader(), body: JSON.stringify({ name: newTagName, slug: newTagSlug }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to create tag');
      setNewTagName(''); setNewTagSlug('');
      setShowTagModal(false);
      loadTags();
    } catch (err) { alert(err.message); }
    finally { setTagSaving(false); }
  };

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || (u.school_name || '').toLowerCase().includes(search.toLowerCase()) || (u.owner_name || '').toLowerCase().includes(search.toLowerCase()));
  const subColor = (s) => s === 'expired' ? '#d32f2f' : s === 'expiring_soon' ? '#f57c00' : '#2e7d32';
  const subBg = (s) => s === 'expired' ? '#ffebee' : s === 'expiring_soon' ? '#fff3e0' : '#e8f5e9';
  const subLabel = (user) => user.subscription_status === 'expired' ? 'Expired' : user.subscription_status === 'expiring_soon' ? `Expiring in ${user.subscription_days_left}d` : 'Active';
  const allClassIds = Object.values(classesByBoard).flat().map(c => c.class_id);
  const allSelected = allClassIds.length > 0 && allClassIds.every(id => form.class_ids.includes(id));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8, #e8eef5)', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <TopBar />
      <div style={{ maxWidth: '1100px', margin: '80px auto 0', padding: '24px 16px 60px' }}>

        {/* ── Tab switcher ── */}
        <div style={{ display: 'flex', gap: '4px', background: 'white', borderRadius: '12px', padding: '4px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: 'fit-content' }}>
          {[{ key: 'users', label: 'Users', icon: 'ti-users' }, { key: 'blog', label: 'Blog', icon: 'ti-article' }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s', background: activeTab === tab.key ? 'linear-gradient(135deg, #2196f3, #1565c0)' : 'transparent', color: activeTab === tab.key ? 'white' : '#64748b' }}>
              <i className={`ti ${tab.icon}`} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════ USERS TAB ══════════ */}
        {activeTab === 'users' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f1f35', margin: '0 0 4px' }}>User Management</h1>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{users.length} total users</p>
              </div>
              <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: 'linear-gradient(135deg, #2196f3, #1565c0)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                <i className="ti ti-plus" /> New User
              </button>
            </div>

            {successMsg && <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#2e7d32', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="ti ti-check" /> {successMsg}</div>}
            {error && !showModal && <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by username, school or owner..." style={{ width: '100%', padding: '11px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box', marginBottom: '16px' }} />

            {loading ? <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Loading...</div>
              : filteredUsers.length === 0 ? <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>No users found</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredUsers.map(user => (
                  <div key={user.user_code} style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                        {user.school_logo ? <img src={user.school_logo} alt="logo" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                          : <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #2196f3, #1565c0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '700', flexShrink: 0 }}>{(user.school_name || user.username || '?')[0].toUpperCase()}</div>}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f1f35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.school_name || user.username}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>@{user.username} · {user.email}</div>
                          {user.owner_name && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{user.owner_name}{user.phone_number ? ` · ${user.phone_number}` : ''}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                        <span style={{ background: !user.is_active ? '#ffebee' : subBg(user.subscription_status), color: !user.is_active ? '#d32f2f' : subColor(user.subscription_status), borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' }}>{!user.is_active ? 'Inactive' : subLabel(user)}</span>
                        {user.amount_paid > 0 && <span style={{ background: '#f3e5f5', color: '#7b1fa2', borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' }}>Rs. {user.amount_paid}</span>}
                        <button onClick={() => handleToggleActive(user)} style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid', background: user.is_active ? '#ffebee' : '#e8f5e9', color: user.is_active ? '#d32f2f' : '#2e7d32', borderColor: user.is_active ? '#ffcdd2' : '#c8e6c9' }}>{user.is_active ? 'Deactivate' : 'Activate'}</button>
                        <button onClick={() => openEdit(user)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: 'white', border: '1px solid #e0e7ef', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#64748b', cursor: 'pointer' }}><i className="ti ti-edit" /> Edit</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>}
          </>
        )}

        {/* ══════════ BLOG TAB ══════════ */}
        {activeTab === 'blog' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f1f35', margin: '0 0 4px' }}>Blog Management</h1>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{posts.length} total posts</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowTagModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'white', border: '1.5px solid #e2e8f0', color: '#64748b', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  <i className="ti ti-tag" /> Add Tag
                </button>
                <button onClick={openCreatePost} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: 'linear-gradient(135deg, #2196f3, #1565c0)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                  <i className="ti ti-plus" /> New Post
                </button>
              </div>
            </div>

            {postsSuccess && <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#2e7d32', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="ti ti-check" /> {postsSuccess}</div>}
            {postsError && <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px' }}>{postsError}</div>}

            {/* Tags row */}
            {tags.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {tags.map(tag => (
                  <span key={tag.id} style={{ background: '#e3f2fd', color: '#1565c0', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '600' }}>
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {postsLoading ? <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Loading...</div>
              : posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '14px', color: '#94a3b8' }}>
                  <i className="ti ti-article" style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }} />
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>No posts yet</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>Click "New Post" to write your first blog post</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {posts.map(post => (
                    <div key={post.id} style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ background: post.status === 'published' ? '#e8f5e9' : '#fff3e0', color: post.status === 'published' ? '#2e7d32' : '#f57c00', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{post.status}</span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{post.reading_time} min read</span>
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f1f35', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>/{post.slug} · {post.author_name} · {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}</div>
                          {post.tags?.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                              {post.tags.map(t => <span key={t.id} style={{ background: '#e3f2fd', color: '#1565c0', borderRadius: '4px', padding: '2px 6px', fontSize: '11px' }}>#{t.name}</span>)}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button onClick={() => openEditPost(post)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: 'white', border: '1px solid #e0e7ef', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#64748b', cursor: 'pointer' }}>
                            <i className="ti ti-edit" /> Edit
                          </button>
                          <button onClick={() => handleDeletePost(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#d32f2f', cursor: 'pointer' }}>
                            <i className="ti ti-trash" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </>
        )}
      </div>

      {/* ══════════ USER MODAL ══════════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '620px', padding: '24px', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f1f35', margin: 0 }}>{editUser ? 'Edit User' : 'Create New User'}</h2>
              <button onClick={closeModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '15px', color: '#64748b' }}>X</button>
            </div>
            {error && <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', padding: '14px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: '#e2e8f0', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {logoPreview ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : editUser?.school_logo ? <img src={editUser.school_logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="ti ti-building" style={{ fontSize: '22px', color: '#94a3b8' }} />}
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>
                <i className="ti ti-upload" /> {editUser ? 'Change Logo' : 'Upload Logo'}
                <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {!editUser && (<><Field label="Username *" value={form.username} onChange={v => setForm(p => ({ ...p, username: v }))} placeholder="username" error={fieldErrors.username} /><Field label="Password *" value={form.password} onChange={v => setForm(p => ({ ...p, password: v }))} placeholder="password" type="password" error={fieldErrors.password} /><Field label="Email *" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="email@school.com" span error={fieldErrors.email} /></>)}
              <Field label="School Name *" value={form.school_name} onChange={v => setForm(p => ({ ...p, school_name: v }))} placeholder="School name" span error={!editUser ? fieldErrors.school_name : null} />
              <Field label="Owner Name" value={form.owner_name} onChange={v => setForm(p => ({ ...p, owner_name: v }))} placeholder="Owner name" />
              <Field label="Phone" value={form.phone_number} onChange={v => setForm(p => ({ ...p, phone_number: v }))} placeholder="03001234567" />
              <Field label="City" value={form.city} onChange={v => setForm(p => ({ ...p, city: v }))} placeholder="City" />
              <SelectField label="Province" value={form.province} onChange={v => setForm(p => ({ ...p, province: v }))}><option value="">Select</option>{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</SelectField>
              <SelectField label="User Type" value={form.user_type} onChange={v => setForm(p => ({ ...p, user_type: v }))}><option value="school_admin">School Admin</option><option value="admin">Admin</option></SelectField>
              <SelectField label="Plan" value={form.subscription_plan} onChange={v => setForm(p => ({ ...p, subscription_plan: v }))}>{PLANS.map(p => <option key={p} value={p}>{p}</option>)}</SelectField>
              <Field label="Amount Paid (Rs.)" value={form.amount_paid} onChange={v => setForm(p => ({ ...p, amount_paid: v }))} placeholder="0" type="number" />
              <Field label="Subscription Start" value={form.subscription_start} onChange={v => setForm(p => ({ ...p, subscription_start: v }))} type="date" />
              <Field label="Subscription End" value={form.subscription_end} onChange={v => setForm(p => ({ ...p, subscription_end: v }))} type="date" />
              {editUser && <SelectField label="Status" value={form.is_active ? 'true' : 'false'} onChange={v => setForm(p => ({ ...p, is_active: v === 'true' }))}><option value="true">Active</option><option value="false">Inactive</option></SelectField>}
            </div>
            <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Board & Class Permissions</div>
                <button onClick={toggleAllClasses} style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid', background: allSelected ? '#2196f3' : 'white', color: allSelected ? 'white' : '#64748b', borderColor: allSelected ? '#2196f3' : '#e2e8f0' }}>{allSelected ? 'Deselect All' : 'Select All'}</button>
              </div>
              {boards.map(board => { const bids = (classesByBoard[board.board_id] || []).map(c => c.class_id); const bSel = bids.length > 0 && bids.every(id => form.class_ids.includes(id)); return (<div key={board.board_id} style={{ marginBottom: '14px' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}><div style={{ fontSize: '13px', fontWeight: '700', color: '#0f1f35' }}>{board.board_name}</div><button onClick={() => toggleAllBoard(board)} style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid', background: bSel ? '#e3f2fd' : 'white', color: bSel ? '#1565c0' : '#94a3b8', borderColor: bSel ? '#90caf9' : '#e2e8f0' }}>{bSel ? 'Deselect all' : 'Select all'}</button></div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{(classesByBoard[board.board_id] || []).map(cls => (<button key={cls.class_id} onClick={() => toggleClass(cls.class_id)} style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid', background: form.class_ids.includes(cls.class_id) ? '#2196f3' : 'white', color: form.class_ids.includes(cls.class_id) ? 'white' : '#64748b', borderColor: form.class_ids.includes(cls.class_id) ? '#2196f3' : '#e2e8f0' }}>{cls.class_name}</button>))}</div></div>); })}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={closeModal} style={{ padding: '10px 18px', background: 'white', border: '1px solid #e0e7ef', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', color: '#64748b' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #2196f3, #1565c0)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : editUser ? 'Update User' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ BLOG POST MODAL ══════════ */}
      {showBlogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '760px', padding: '28px', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f1f35', margin: 0 }}>{editPost ? 'Edit Post' : 'New Blog Post'}</h2>
              <button onClick={closeBlogModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '15px', color: '#64748b' }}>X</button>
            </div>

            {blogError && <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>{blogError}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Title */}
              <Field label="Title *" value={blogForm.title} onChange={v => setBlogForm(p => ({ ...p, title: v, slug: p.slug || toSlug(v) }))} placeholder="Your blog post title" span />

              {/* Slug */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Slug *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={blogForm.slug} onChange={e => setBlogForm(p => ({ ...p, slug: e.target.value }))} placeholder="your-post-slug" style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={() => setBlogForm(p => ({ ...p, slug: toSlug(p.title) }))} style={{ padding: '10px 14px', background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>Auto generate</button>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>papercraft.pk/blog/{blogForm.slug || 'your-slug'}</div>
              </div>

              {/* Excerpt */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Excerpt</label>
                <textarea value={blogForm.excerpt} onChange={e => setBlogForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short description shown in blog listing..." rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }} />
              </div>

              {/* Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Content * (HTML supported)</label>
                <textarea value={blogForm.content} onChange={e => setBlogForm(p => ({ ...p, content: e.target.value }))} placeholder="<h2>Introduction</h2><p>Your blog content here...</p>" rows={12} style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', fontFamily: 'monospace', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Status */}
                <SelectField label="Status" value={blogForm.status} onChange={v => setBlogForm(p => ({ ...p, status: v }))}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </SelectField>

                {/* Reading time */}
                <Field label="Reading Time (minutes)" value={blogForm.reading_time} onChange={v => setBlogForm(p => ({ ...p, reading_time: parseInt(v) || 0 }))} type="number" placeholder="5" />

                {/* Author */}
                <Field label="Author Name" value={blogForm.author_name} onChange={v => setBlogForm(p => ({ ...p, author_name: v }))} placeholder="PaperCraft Team" />

                {/* Cover image */}
                <Field label="Cover Image URL" value={blogForm.cover_image} onChange={v => setBlogForm(p => ({ ...p, cover_image: v }))} placeholder="https://..." />
              </div>

              {/* SEO */}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>SEO Settings</div>
                <Field label="Meta Title" value={blogForm.meta_title} onChange={v => setBlogForm(p => ({ ...p, meta_title: v }))} placeholder="SEO title (60 chars max)" span />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Meta Description</label>
                  <textarea value={blogForm.meta_description} onChange={e => setBlogForm(p => ({ ...p, meta_description: e.target.value }))} placeholder="SEO description (160 chars max)" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Tags</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tags.map(tag => (
                      <button key={tag.id} onClick={() => setBlogForm(p => ({ ...p, tag_ids: p.tag_ids.includes(tag.id) ? p.tag_ids.filter(id => id !== tag.id) : [...p.tag_ids, tag.id] }))} style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid', background: blogForm.tag_ids.includes(tag.id) ? '#2196f3' : 'white', color: blogForm.tag_ids.includes(tag.id) ? 'white' : '#64748b', borderColor: blogForm.tag_ids.includes(tag.id) ? '#2196f3' : '#e2e8f0' }}>
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={closeBlogModal} style={{ padding: '10px 18px', background: 'white', border: '1px solid #e0e7ef', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', color: '#64748b' }}>Cancel</button>
              <button onClick={() => { setBlogForm(p => ({ ...p, status: 'draft' })); setTimeout(handleBlogSave, 0); }} disabled={blogSaving} style={{ padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#64748b', opacity: blogSaving ? 0.6 : 1 }}>Save Draft</button>
              <button onClick={() => { setBlogForm(p => ({ ...p, status: 'published' })); setTimeout(handleBlogSave, 0); }} disabled={blogSaving} style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #2196f3, #1565c0)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', opacity: blogSaving ? 0.6 : 1 }}>{blogSaving ? 'Saving...' : editPost ? 'Update Post' : 'Publish Post'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAG MODAL ══════════ */}
      {showTagModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f1f35', margin: 0 }}>Create Tag</h2>
              <button onClick={() => setShowTagModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '15px', color: '#64748b' }}>X</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Field label="Tag Name" value={newTagName} onChange={v => { setNewTagName(v); setNewTagSlug(toSlug(v)); }} placeholder="e.g. Exam Tips" span />
              <Field label="Tag Slug" value={newTagSlug} onChange={v => setNewTagSlug(v)} placeholder="e.g. exam-tips" span />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowTagModal(false)} style={{ padding: '10px 18px', background: 'white', border: '1px solid #e0e7ef', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', color: '#64748b' }}>Cancel</button>
              <button onClick={handleCreateTag} disabled={tagSaving} style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #2196f3, #1565c0)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', opacity: tagSaving ? 0.6 : 1 }}>{tagSaving ? 'Creating...' : 'Create Tag'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: 'white',
  color: '#0f1f35', width: '100%', boxSizing: 'border-box',
};

function Field({ label, value, onChange, placeholder, type = 'text', span, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: span ? 'span 2' : undefined }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: error ? '#d32f2f' : '#64748b', textTransform: 'uppercase' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...inputStyle, borderColor: error ? '#f44336' : '#e2e8f0' }} />
      {error && <span style={{ fontSize: '11px', color: '#d32f2f' }}>{error}</span>}
    </div>
  );
}

function SelectField({ label, value, onChange, children, span }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: span ? 'span 2' : undefined }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>{children}</select>
    </div>
  );
}