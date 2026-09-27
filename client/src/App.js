import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

const STATUSES = ['1. Új lead', '2. Kapcsolatfelvétel alatt', '3. Tárgyalás', '4. Ajánlat kiküldés', '5. Szerződésírás', '6. Döntésre vár', '7. Díjbekérő', '8. Fizetésre vár', '9. Számlaírás', '10. Sablonírás', '11. Átadásra vár', '12. Teljesített', '13. Elveszített', '14. Konzílium', '15. Utánkövetés'];
const PERSONALITIES = ['Nincs megadva', 'Driver', 'Analitikus', 'Biztonsági játékos', 'Státuszvadász', 'Empatha', 'Innovátor', 'Költségérzékeny', 'Hatékonyságmániás', 'Szkeptikus', 'Örökségépítő', 'Belső Szabotőr', 'Egyéb'];
const LEAD_SOURCES = ['Válassz...', 'Networking', 'Üzleti klub', 'Ajánlás', 'Facebook Ads', 'LinkedIn', 'Cold Lead', 'Egyéb'];
const LOST_REASONS = ['Túl drága', 'Eltűnt', 'Konkurenciát választotta', 'Rossz időzítés', 'Egyéb'];

const getTodayStr = () => new Date().toISOString().split('T')[0];
const addDays = (dateStr, days) => { const d = new Date(dateStr); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0]; };
const getWorkingDaysLater = (days) => { let d = new Date(); let count = 0; while(count < days) { d.setDate(d.getDate() + 1); if(d.getDay() !== 0 && d.getDay() !== 6) count++; } return d.toISOString().split('T')[0]; };
const getDaysSince = (dateString) => { if (!dateString) return 0; return Math.floor(Math.abs(new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24)); };

// ==================== LOGIN COMPONENT ====================
function LoginView({ onLogin, theme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba a belépéskor');
      onLogin(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, boxSizing: 'border-box', marginBottom: '15px' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: theme.bg }}>
      <div style={{ background: theme.cardBg, padding: '40px', borderRadius: '8px', border: `1px solid ${theme.border}`, width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#007bff', textAlign: 'center', marginTop: 0 }}>🔐 SaaS CRM Bejelentkezés</h2>
        {error && <p style={{ color: '#dc3545', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>E-mail cím</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="admin@saas.com" />
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Jelszó</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="••••••••" />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Bejelentkezés</button>
        </form>
        <div style={{ marginTop: '20px', fontSize: '12px', opacity: 0.7, textAlign: 'center' }}>
          Teszt Szuperadmin: <strong>admin@saas.com</strong> / <strong>admin123</strong>
        </div>
      </div>
    </div>
  );
}

// ==================== SUPERADMIN VIEW ====================
function SuperAdminView({ user, onLogout, theme }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'manager', tenant_name: '' });

  const fetchUsers = async () => {
    const res = await fetch(`${BACKEND_URL}/api/users`);
    setUsers(await res.json());
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setForm({ name: '', email: '', password: '', role: 'manager', tenant_name: '' });
      fetchUsers();
      alert('Fiók sikeresen létrehozva!');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Törlöd ezt a felhasználót?')) return;
    await fetch(`${BACKEND_URL}/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, boxSizing: 'border-box', marginBottom: '10px' };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', color: theme.text }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #007bff', paddingBottom: '15px', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>👑 Szuperadmin (Rendszergazda) Központ</h1>
        <button onClick={onLogout} style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Kijelentkezés</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
          <h3 style={{ marginTop: 0, color: '#007bff' }}>➕ Új Fiók / Tenant Generálása</h3>
          <form onSubmit={handleCreateUser}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Név</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={inputStyle} />
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>E-mail</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required style={inputStyle} />
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Jelszó</label>
            <input type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required style={inputStyle} />
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Jogosultság</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={inputStyle}>
              <option value="manager">Vezető (Manager)</option>
              <option value="trader">Munkatárs (Értékesítő)</option>
            </select>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Partnercég (Tenant Neve)</label>
            <input value={form.tenant_name} onChange={e => setForm({...form, tenant_name: e.target.value})} required style={inputStyle} placeholder="pl. Partner 1 Kft." />
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Fiók Létrehozása</button>
          </form>
        </div>

        <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
          <h3 style={{ marginTop: 0 }}>🏢 Rendszerszintű Partnercégek & Munkatársak</h3>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', borderColor: theme.border }}>
            <thead style={{ background: theme.tableHeadBg, color: '#fff' }}>
              <tr><th>Név</th><th>E-mail</th><th>Cég / Tenant</th><th>Szerepkör</th><th>Művelet</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><strong>{u.tenant_name}</strong></td>
                  <td><span style={{ padding: '2px 6px', background: u.role === 'superadmin' ? '#dc3545' : u.role === 'manager' ? '#007bff' : '#6c757d', color: '#fff', borderRadius: '4px', fontSize: '11px' }}>{u.role}</span></td>
                  <td>{u.role !== 'superadmin' && <button onClick={() => handleDeleteUser(u.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Törlés</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN CRM APP ====================
function App() {
  const [user, setUser] = useState(null);
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');
  const [triggerData, setTriggerData] = useState({ next_interaction: '', reason: '', details: '', meeting_date: '', expected_decision: '', expected_payment: '', payment_type: '', offer_validity: '', contract_deadline: '', proforma_validity: '', handover_deadline: '' });
  
  const [plainNote, setPlainNote] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocNote, setNewDocNote] = useState('');
  const [newConsilDate, setNewConsilDate] = useState('');
  const [newConsilNote, setNewConsilNote] = useState('');

  const theme = {
    bg: darkMode ? '#121212' : '#f4f6f9', cardBg: darkMode ? '#1e1e1e' : '#fff', subBg: darkMode ? '#2a2a2a' : '#e9ecef',
    text: darkMode ? '#e0e0e0' : '#333', border: darkMode ? '#444' : '#ccc', inputBg: darkMode ? '#252525' : '#fff',
    inputText: darkMode ? '#fff' : '#000', tableHeadBg: darkMode ? '#222' : '#343a40',
  };

  const fetchPartners = async () => {
    if (!user) return;
    let url = `${BACKEND_URL}/api/partners?role=${user.role}`;
    if (user.role === 'manager') url += `&tenant=${encodeURIComponent(user.tenant_name)}`;
    if (user.role === 'trader') url += `&manager=${encodeURIComponent(user.name)}`;
    const res = await fetch(url);
    setPartners(await res.json());
  };

  const fetchLogs = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/logs`); setLogs(await res.json()); };
  const fetchTasksAndLogs = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/tasks`); setTasks(await res.json()); fetchLogs(id); fetchTodayTasks(); };
  const fetchDocuments = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/documents`); setDocuments(await res.json()); };
  const fetchConsultations = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/consultations`); setConsultations(await res.json()); };
  const fetchTodayTasks = async () => { const res = await fetch(`${BACKEND_URL}/api/tasks/today`); setTodayTasks(await res.json()); };

  useEffect(() => { if (user && user.role !== 'superadmin') { fetchPartners(); fetchTodayTasks(); } }, [user]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  if (!user) return <LoginView onLogin={u => setUser(u)} theme={theme} />;
  if (user.role === 'superadmin') return <SuperAdminView user={user} onLogout={() => setUser(null)} theme={theme} />;

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner); 
    setPlainNote(''); 
    fetchTasksAndLogs(partner.id); fetchDocuments(partner.id); fetchConsultations(partner.id);
    setTimeout(() => { document.getElementById('partner-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
  };

  const handleStatusChangeInit = (e) => {
    const targetStatus = e.target.value;
    if(targetStatus === selectedPartner.status) return;
    setPendingStatus(targetStatus);
    setTriggerData({ next_interaction: '', reason: '', details: '', meeting_date: '', expected_decision: '', expected_payment: '', payment_type: '', offer_validity: '', contract_deadline: '', proforma_validity: '', handover_deadline: '' });
    setShowStatusModal(true);
  };

  const executeStatusChange = async (e) => {
    e.preventDefault();
    let finalNote = triggerData.details;
    if (pendingStatus === '13. Elveszített') finalNote = `${triggerData.reason} - ${triggerData.details}`;
    if (pendingStatus === '3. Tárgyalás') finalNote = `Dátum: ${triggerData.meeting_date} | ${triggerData.details}`;
    
    const payload = { status: pendingStatus, note: finalNote, userName: user.name, ...triggerData };
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    
    if(res.ok) {
      const updated = await res.json(); setSelectedPartner(updated); setShowStatusModal(false); fetchPartners();
      const postTask = async (desc, date) => { await fetch(`${BACKEND_URL}/api/partners/${updated.id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: desc, due_date: date, userName: user.name }) }); };

      if (pendingStatus === '2. Kapcsolatfelvétel alatt') await postTask('Megkeresés', getWorkingDaysLater(updated.lead_source === 'Cold Lead' ? 2 : 0));
      if (pendingStatus === '3. Tárgyalás' && triggerData.meeting_date) await postTask('Tárgyalás biztosítása', addDays(triggerData.meeting_date, -1));
      if (pendingStatus === '4. Ajánlat kiküldés') await postTask('Ajánlat feltöltése', getTodayStr());
      if (pendingStatus === '5. Szerződésírás') await postTask('Szerződés megírása', getTodayStr());
      if (pendingStatus === '7. Díjbekérő') await postTask('Díjbekérő kiállítása', getTodayStr());
      if (pendingStatus === '9. Számlaírás') await postTask('Számla kiállítása', getTodayStr());
      
      fetchTasksAndLogs(updated.id);
    }
  };

  const handleAddPlainNote = async () => { 
    if (!plainNote.trim()) return; 
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: plainNote, action_type: 'MEGJEGYZÉS', userName: user.name }) }); 
    if (res.ok) { setPlainNote(''); fetchLogs(selectedPartner.id); } 
  };

  const handleAddTask = async () => { 
    if (!newTaskDesc.trim()) return; 
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: newTaskDesc, due_date: newTaskDate, userName: user.name }) }); 
    if (res.ok) { setNewTaskDesc(''); setNewTaskDate(''); fetchTasksAndLogs(selectedPartner.id); } 
  };

  const completeTask = async (taskId) => { 
    await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/tasks/${taskId}/complete`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userName: user.name }) }); 
    fetchTasksAndLogs(selectedPartner.id); fetchTodayTasks(); 
  };

  const handleAddDocument = async (docType) => {
    if (!newDocName.trim() || !newDocUrl.trim()) return alert('Adj meg nevet és linket!');
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doc_type: docType, doc_name: newDocName, doc_url: newDocUrl, doc_note: newDocNote, userName: user.name }) });
    if (res.ok) { setNewDocName(''); setNewDocUrl(''); setNewDocNote(''); fetchDocuments(selectedPartner.id); fetchLogs(selectedPartner.id); }
  };

  const filteredPartners = partners.filter(p => {
    const term = searchTerm.toLowerCase();
    return ((p.company_name?.toLowerCase() || '').includes(term) || (p.contact_person?.toLowerCase() || '').includes(term));
  });

  const activeTaskLines = new Set();
  const processedLogs = logs.map(l => {
      let lineStyle = 'none';
      if (l.action_type === 'FELADAT KÉSZ' && l.related_task_id) {
          activeTaskLines.add(l.related_task_id);
          lineStyle = 'start';
      } else if (l.action_type === 'ÚJ FELADAT' && l.related_task_id && activeTaskLines.has(l.related_task_id)) {
          activeTaskLines.delete(l.related_task_id);
          lineStyle = 'end';
      } else if (activeTaskLines.size > 0) {
          lineStyle = 'middle';
      }
      return { ...l, lineStyle };
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto', background: theme.bg, color: theme.text, minHeight: '100vh' }}>
      
      {/* FEJLÉC ÉS SZEREPKÖR KIJELZÉS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #007bff', paddingBottom: '10px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>🏢 CRM - {user.tenant_name}</h1>
          <span style={{ fontSize: '13px', color: '#007bff', fontWeight: 'bold' }}>Bejelentkezve mint: {user.name} ({user.role === 'manager' ? 'Vezető / Manager' : 'Munkatárs'})</span>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', background: theme.subBg, padding: '5px 10px', borderRadius: '20px', cursor: 'pointer' }}>
            <span onClick={() => setDarkMode(false)} style={{ opacity: !darkMode ? 1 : 0.4 }}>☀️</span>
            <span onClick={() => setDarkMode(true)} style={{ opacity: darkMode ? 1 : 0.4 }}>🌙</span>
          </div>
          <button onClick={() => setUser(null)} style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Kijelentkezés</button>
        </div>
      </div>

      {/* STÁTUSZ MODÁL */}
      {showStatusModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: theme.cardBg, color: theme.text, padding: '30px', borderRadius: '8px', width: '500px', borderTop: '4px solid #ffc107' }}>
            <h2 style={{ marginTop: 0 }}>🔄 Státusz Váltás: {pendingStatus}</h2>
            <form onSubmit={executeStatusChange}>
              {pendingStatus === '3. Tárgyalás' && (
                <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold' }}>Dátum *</label><input type="date" required value={triggerData.meeting_date} onChange={e => setTriggerData({...triggerData, meeting_date: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '8px', background: theme.inputBg, color: theme.inputText }} /><input type="text" placeholder="Részletek..." required value={triggerData.details} onChange={e => setTriggerData({...triggerData, details: e.target.value})} style={{ width: '100%', padding: '10px', background: theme.inputBg, color: theme.inputText }} /></div>
              )}
              {pendingStatus === '13. Elveszített' && (
                <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold' }}>Indoklás *</label><select required value={triggerData.reason} onChange={e => setTriggerData({...triggerData, reason: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '8px', background: theme.inputBg, color: theme.inputText }}><option value="">Válassz okot...</option>{LOST_REASONS.map(r => <option key={r} value={r}>{r}</option>)}</select><input type="text" placeholder="Részletek..." required value={triggerData.details} onChange={e => setTriggerData({...triggerData, details: e.target.value})} style={{ width: '100%', padding: '10px', background: theme.inputBg, color: theme.inputText }} /></div>
              )}
              {!['3. Tárgyalás', '13. Elveszített'].includes(pendingStatus) && (
                <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold' }}>Következő interakció határideje *</label><input type="date" required value={triggerData.next_interaction} onChange={e => setTriggerData({...triggerData, next_interaction: e.target.value})} style={{ width: '100%', padding: '10px', background: theme.inputBg, color: theme.inputText }} /></div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#28a745', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✓ Végrehajtás</button>
                <button type="button" onClick={() => setShowStatusModal(false)} style={{ padding: '12px', background: '#6c757d', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Mégse</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PARTNEREK LISTÁJA */}
      <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2 style={{ marginTop: 0 }}>📋 Céges Partnerek ({partners.length})</h2>
        <input type="text" placeholder="🔍 Keresés..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, marginBottom: '15px' }}/>
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', borderColor: theme.border }}>
          <thead style={{ background: theme.tableHeadBg, color: '#fff' }}><tr><th>Cégnév</th><th>Döntéshozó</th><th>Státusz</th><th>Művelet</th></tr></thead>
          <tbody>
            {filteredPartners.map(p => (
              <tr key={p.id}>
                <td><strong>{p.company_name}</strong></td>
                <td>{p.contact_person}</td>
                <td><span style={{ padding: '4px 8px', background: theme.subBg, borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>{p.status}</span></td>
                <td><button onClick={() => handleSelectPartner(p)} style={{ background: '#007bff', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>📂 Munkaterület Nyitása</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MUNKATERÜLET */}
      {selectedPartner && (
        <div id="partner-workspace" style={{ borderTop: '4px solid #007bff', paddingTop: '30px', background: theme.cardBg, padding: '25px', borderRadius: '8px' }}>
          <h2>Munkaterület: {selectedPartner.company_name}</h2>

          <div style={{ background: theme.subBg, padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
            <h4>🔄 Státusz Váltás & Gyors Megjegyzés</h4>
            <select value={selectedPartner.status} onChange={handleStatusChangeInit} style={{ width: '100%', padding: '12px', fontWeight: 'bold', marginBottom: '10px', background: theme.inputBg, color: theme.inputText }}>{STATUSES.map(st => <option key={st} value={st}>{st}</option>)}</select>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input type="text" placeholder="💬 Gyors megjegyzés..." value={plainNote} onChange={(e) => setPlainNote(e.target.value)} style={{ flex: 1, padding: '10px', background: theme.inputBg, color: theme.inputText }}/>
              <button onClick={handleAddPlainNote} style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Rögzítés</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 500px' }}>
              <div style={{ background: theme.subBg, padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
                <h4>📌 Kötelező Feladatok</h4>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                  <input type="text" placeholder="Új feladat..." value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} style={{ flex: 2, padding: '10px', background: theme.inputBg, color: theme.inputText }}/>
                  <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} style={{ flex: 1, padding: '10px', background: theme.inputBg, color: theme.inputText }}/>
                  <button onClick={handleAddTask} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Hozzáad</button>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {tasks.map(t => (
                    <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: theme.cardBg, borderRadius: '4px', marginBottom: '8px' }}>
                      <input type="checkbox" checked={t.is_completed} disabled={t.is_completed} onChange={() => completeTask(t.id)} style={{ transform: 'scale(1.4)' }} />
                      <div>
                        <strong style={{ display: 'block', textDecoration: t.is_completed ? 'line-through' : 'none', color: t.is_completed ? '#888' : theme.text }}>{t.description}</strong>
                        <span style={{ fontSize: '12px', color: '#dc3545', fontWeight: 'bold' }}>Határidő: {t.due_date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dokumentumok */}
              <div style={{ background: theme.subBg, padding: '15px', borderRadius: '6px' }}>
                <h4>📂 Dokumentumok & Playbook</h4>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Név..." value={newDocName} onChange={e => setNewDocName(e.target.value)} style={{ flex: 1, padding: '10px', background: theme.inputBg, color: theme.inputText }}/>
                  <input type="text" placeholder="Link..." value={newDocUrl} onChange={e => setNewDocUrl(e.target.value)} style={{ flex: 2, padding: '10px', background: theme.inputBg, color: theme.inputText }}/>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <button onClick={() => handleAddDocument('offer')} style={{ flex: 1, padding: '10px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>+ Ajánlat</button>
                  <button onClick={() => handleAddDocument('contract')} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>+ Szerződés</button>
                  <button onClick={() => handleAddDocument('playbook')} style={{ flex: 1, padding: '10px', background: '#6f42c1', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>+ Playbook</button>
                </div>
              </div>
            </div>

            {/* Interakciós Napló */}
            <div style={{ flex: '1 1 400px', background: theme.cardBg, padding: '20px', borderRadius: '6px' }}>
              <h3 style={{ marginTop: 0 }}>📜 Interakciós Napló</h3>
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {processedLogs.map(l => (
                  <div key={l.id} style={{ borderBottom: `1px dashed ${theme.border}`, padding: '10px 0', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.8 }}>
                      <strong>{l.action_type} ({l.user_name || 'Rendszer'})</strong>
                      <span>{new Date(l.created_at).toLocaleString()}</span>
                    </div>
                    <span style={{ fontSize: '14px', display: 'block', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{l.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;