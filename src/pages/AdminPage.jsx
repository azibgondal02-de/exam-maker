import React, { useEffect, useState } from 'react';
import TopBar from '../components/TopBar.jsx';
import { fetchUsers, createUser, updateUser, uploadLogo, fetchBoards, fetchClasses } from '../services/api';

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

export default function AdminPage() {
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

  useEffect(() => { loadUsers(); loadBoards(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      console.error('Failed to load boards', err);
    }
  };

  const openCreate = () => {
    setEditUser(null);
    setForm(defaultForm);
    setLogoFile(null);
    setLogoPreview(null);
    setFieldErrors({});
    setError('');
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      username: user.username,
      password: '',
      email: user.email,
      school_name: user.school_name || '',
      owner_name: user.owner_name || '',
      phone_number: user.phone_number || '',
      city: user.city || '',
      province: user.province || '',
      user_type: user.user_type,
      subscription_plan: user.subscription_plan || 'basic',
      subscription_start: user.subscription_start || '',
      subscription_end: user.subscription_end || '',
      amount_paid: user.amount_paid || 0,
      class_ids: user.class_ids || [],
      is_active: user.is_active,
    });
    setLogoFile(null);
    setLogoPreview(null);
    setFieldErrors({});
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setLogoFile(null);
    setLogoPreview(null);
    setFieldErrors({});
    setError('');
  };

  const handleToggleActive = async (user) => {
    try {
      await updateUser(user.user_code, { is_active: !user.is_active });
      setSuccessMsg(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleClass = (classId) => {
    setForm(prev => ({
      ...prev,
      class_ids: prev.class_ids.includes(classId)
        ? prev.class_ids.filter(id => id !== classId)
        : [...prev.class_ids, classId],
    }));
  };

  const toggleAllBoard = (board) => {
    const boardClassIds = (classesByBoard[board.board_id] || []).map(c => c.class_id);
    const allSelected = boardClassIds.every(id => form.class_ids.includes(id));
    if (allSelected) {
      setForm(prev => ({ ...prev, class_ids: prev.class_ids.filter(id => !boardClassIds.includes(id)) }));
    } else {
      setForm(prev => ({ ...prev, class_ids: [...new Set([...prev.class_ids, ...boardClassIds])] }));
    }
  };

  const toggleAllClasses = () => {
    const allClassIds = Object.values(classesByBoard).flat().map(c => c.class_id);
    const allSelected = allClassIds.every(id => form.class_ids.includes(id));
    setForm(prev => ({ ...prev, class_ids: allSelected ? [] : allClassIds }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    if (editUser) {
      try {
        const reader = new FileReader();
        await new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64 = reader.result.split(',')[1];
              await uploadLogo(editUser.user_code, base64);
              resolve();
            } catch (err) { reject(err); }
          };
          reader.readAsDataURL(file);
        });
      } catch (err) {
        setError('Logo upload failed: ' + err.message);
      }
    }
  };

  const validate = () => {
    if (editUser) return true;
    const errors = {};
    REQUIRED_CREATE.forEach(key => {
      if (!form[key] || !String(form[key]).trim()) errors[key] = 'Required';
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError('');
    try {
      let savedUserCode = null;
      if (editUser) {
        const payload = { ...form };
        delete payload.username;
        delete payload.password;
        if (!payload.subscription_start) payload.subscription_start = null;
        if (!payload.subscription_end) payload.subscription_end = null;
        await updateUser(editUser.user_code, payload);
        savedUserCode = editUser.user_code;
      } else {
        const createPayload = { ...form };
        if (!createPayload.subscription_start) createPayload.subscription_start = null;
        if (!createPayload.subscription_end) createPayload.subscription_end = null;
        const result = await createUser(createPayload);
        savedUserCode = result.user_code;
      }

      if (logoFile && savedUserCode && !editUser) {
        const reader = new FileReader();
        await new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64 = reader.result.split(',')[1];
              await uploadLogo(savedUserCode, base64);
              resolve();
            } catch (err) { reject(err); }
          };
          reader.readAsDataURL(logoFile);
        });
      }

      closeModal();
      setSuccessMsg(editUser ? 'User updated successfully' : 'User created successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.school_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.owner_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const subColor = (s) => s === 'expired' ? '#d32f2f' : s === 'expiring_soon' ? '#f57c00' : '#2e7d32';
  const subBg = (s) => s === 'expired' ? '#ffebee' : s === 'expiring_soon' ? '#fff3e0' : '#e8f5e9';
  const subLabel = (user) => user.subscription_status === 'expired' ? 'Expired' : user.subscription_status === 'expiring_soon' ? `Expiring in ${user.subscription_days_left}d` : 'Active';

  const allClassIds = Object.values(classesByBoard).flat().map(c => c.class_id);
  const allSelected = allClassIds.length > 0 && allClassIds.every(id => form.class_ids.includes(id));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8, #e8eef5)', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <TopBar />
      <div style={{ maxWidth: '1100px', margin: '80px auto 0', padding: '24px 16px 60px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f1f35', margin: '0 0 4px' }}>User Management</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{users.length} total users</p>
          </div>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: 'linear-gradient(135deg, #2196f3, #1565c0)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <i className="ti ti-plus" /> New User
          </button>
        </div>

        {successMsg && (
          <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#2e7d32', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <i className="ti ti-check" /> {successMsg}
          </div>
        )}

        {error && !showModal && (
          <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by username, school or owner..."
          style={{ width: '100%', padding: '11px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box', marginBottom: '16px' }}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>No users found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredUsers.map(user => (
              <div key={user.user_code} style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                    {user.school_logo ? (
                      <img src={user.school_logo} alt="logo" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #2196f3, #1565c0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '700', flexShrink: 0 }}>
                        {(user.school_name || user.username || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f1f35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.school_name || user.username}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>@{user.username} · {user.email}</div>
                      {user.owner_name && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{user.owner_name}{user.phone_number ? ` · ${user.phone_number}` : ''}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                    <span style={{
                      background: !user.is_active ? '#ffebee' : subBg(user.subscription_status),
                      color: !user.is_active ? '#d32f2f' : subColor(user.subscription_status),
                      borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: '700'
                    }}>
                      {!user.is_active ? 'Inactive' : subLabel(user)}
                    </span>

                    {user.amount_paid > 0 && (
                      <span style={{ background: '#f3e5f5', color: '#7b1fa2', borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' }}>
                        Rs. {user.amount_paid}
                      </span>
                    )}

                    <button
                      onClick={() => handleToggleActive(user)}
                      style={{
                        padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                        cursor: 'pointer', border: '1.5px solid', whiteSpace: 'nowrap',
                        background: user.is_active ? '#ffebee' : '#e8f5e9',
                        color: user.is_active ? '#d32f2f' : '#2e7d32',
                        borderColor: user.is_active ? '#ffcdd2' : '#c8e6c9',
                      }}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button onClick={() => openEdit(user)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: 'white', border: '1px solid #e0e7ef', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <i className="ti ti-edit" /> Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '620px', padding: '24px', margin: 'auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f1f35', margin: 0 }}>
                {editUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button onClick={closeModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '15px', color: '#64748b' }}>X</button>
            </div>

            {error && (
              <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', padding: '14px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: '#e2e8f0', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : editUser?.school_logo ? (
                  <img src={editUser.school_logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <i className="ti ti-building" style={{ fontSize: '22px', color: '#94a3b8' }} />
                )}
              </div>
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>
                  <i className="ti ti-upload" /> {editUser ? 'Change Logo' : 'Upload Logo'}
                  <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                </label>
                {logoPreview && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Will be saved when you click save</div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {!editUser && (
                <>
                  <Field label="Username *" value={form.username} onChange={v => setForm(p => ({ ...p, username: v }))} placeholder="username" error={fieldErrors.username} />
                  <Field label="Password *" value={form.password} onChange={v => setForm(p => ({ ...p, password: v }))} placeholder="password" type="password" error={fieldErrors.password} />
                  <Field label="Email *" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="email@school.com" span error={fieldErrors.email} />
                </>
              )}
              <Field label="School Name *" value={form.school_name} onChange={v => setForm(p => ({ ...p, school_name: v }))} placeholder="School name" span error={!editUser ? fieldErrors.school_name : null} />
              <Field label="Owner Name" value={form.owner_name} onChange={v => setForm(p => ({ ...p, owner_name: v }))} placeholder="Owner name" />
              <Field label="Phone" value={form.phone_number} onChange={v => setForm(p => ({ ...p, phone_number: v }))} placeholder="03001234567" />
              <Field label="City" value={form.city} onChange={v => setForm(p => ({ ...p, city: v }))} placeholder="City" />

              <SelectField label="Province" value={form.province} onChange={v => setForm(p => ({ ...p, province: v }))}>
                <option value="">Select</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </SelectField>

              <SelectField label="User Type" value={form.user_type} onChange={v => setForm(p => ({ ...p, user_type: v }))}>
                <option value="school_admin">School Admin</option>
                <option value="admin">Admin</option>
              </SelectField>

              <SelectField label="Plan" value={form.subscription_plan} onChange={v => setForm(p => ({ ...p, subscription_plan: v }))}>
                {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
              </SelectField>

              <Field label="Amount Paid (Rs.)" value={form.amount_paid} onChange={v => setForm(p => ({ ...p, amount_paid: v }))} placeholder="0" type="number" />
              <Field label="Subscription Start" value={form.subscription_start} onChange={v => setForm(p => ({ ...p, subscription_start: v }))} type="date" />
              <Field label="Subscription End" value={form.subscription_end} onChange={v => setForm(p => ({ ...p, subscription_end: v }))} type="date" />

              {editUser && (
                <SelectField label="Status" value={form.is_active ? 'true' : 'false'} onChange={v => setForm(p => ({ ...p, is_active: v === 'true' }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </SelectField>
              )}
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Board & Class Permissions</div>
                <button
                  onClick={toggleAllClasses}
                  style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid', background: allSelected ? '#2196f3' : 'white', color: allSelected ? 'white' : '#64748b', borderColor: allSelected ? '#2196f3' : '#e2e8f0' }}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {boards.map(board => {
                const boardClassIds = (classesByBoard[board.board_id] || []).map(c => c.class_id);
                const boardAllSelected = boardClassIds.length > 0 && boardClassIds.every(id => form.class_ids.includes(id));
                return (
                  <div key={board.board_id} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f1f35' }}>{board.board_name}</div>
                      <button
                        onClick={() => toggleAllBoard(board)}
                        style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid', background: boardAllSelected ? '#e3f2fd' : 'white', color: boardAllSelected ? '#1565c0' : '#94a3b8', borderColor: boardAllSelected ? '#90caf9' : '#e2e8f0' }}
                      >
                        {boardAllSelected ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(classesByBoard[board.board_id] || []).map(cls => (
                        <button
                          key={cls.class_id}
                          onClick={() => toggleClass(cls.class_id)}
                          style={{
                            padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                            cursor: 'pointer', border: '1.5px solid',
                            background: form.class_ids.includes(cls.class_id) ? '#2196f3' : 'white',
                            color: form.class_ids.includes(cls.class_id) ? 'white' : '#64748b',
                            borderColor: form.class_ids.includes(cls.class_id) ? '#2196f3' : '#e2e8f0',
                          }}
                        >
                          {cls.class_name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={closeModal} style={{ padding: '10px 18px', background: 'white', border: '1px solid #e0e7ef', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', color: '#64748b' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #2196f3, #1565c0)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
              </button>
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
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, borderColor: error ? '#f44336' : '#e2e8f0' }}
      />
      {error && <span style={{ fontSize: '11px', color: '#d32f2f' }}>{error}</span>}
    </div>
  );
}

function SelectField({ label, value, onChange, children, span }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: span ? 'span 2' : undefined }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
        {children}
      </select>
    </div>
  );
}