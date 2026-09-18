import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mini-crm-44xt.onrender.com';

const STATUSES = [
  '1. Új lead', '2. Kapcsolatfelvétel alatt', '3. Tárgyalás', '4. Ajánlat kiküldés',
  '5. Szerződésírás', '6. Döntésre vár', '7. Díjbekérő', '8. Fizetésre vár', '9. Számlaírás',
  '10. Sablonírás', '11. Átadásra vár', '12. Teljesített', '13. Elveszített', '14. Konzílium', '15. Utánkövetés'
];

function AddPartnerForm({ onPartnerAdded }) {
  const [formData, setFormData] = useState({ company_name: '', contact_person: '', phone: '', email: '', website: '', revenue: '', tax_number: '', billing_address: '', headquarters: '', manager: '', accepted_offer: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9+\s]/g, '') }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/partners`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (response.ok) {
        setFormData({ company_name: '', contact_person: '', phone: '', email: '', website: '', revenue: '', tax_number: '', billing_address: '', headquarters: '', manager: '', accepted_offer: '' });
        onPartnerAdded();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
      <h3>Új partner rögzítése</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Cégnév *</label><br/><input name="company_name" value={formData.company_name} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Döntéshozó *</label><br/><input name="contact_person" value={formData.contact_person} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Telefonszám *</label><br/><input name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email</label><br/><input name="email" type="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Weboldal</label><br/><input name="website" placeholder="pl: valami.hu" value={formData.website} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Kezelő</label><br/><input name="manager" value={formData.manager} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Elfogadott árajánlat (összeg/csomag)</label><br/><input name="accepted_offer" value={formData.accepted_offer} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Árbevétel</label><br/><input name="revenue" value={formData.revenue} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Adószám</label><br/><input name="tax_number" value={formData.tax_number} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 48%', minWidth: '300px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Számlázási cím</label><br/><input name="billing_address" value={formData.billing_address} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 48%', minWidth: '300px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Székhely</label><br/><input name="headquarters" value={formData.headquarters} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
        </div>
        <div style={{ marginTop: '15px' }}><button type="submit" style={{ padding: '10px 24px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Partner Rögzítése</button></div>
      </form>
    </div>
  );
}

function App() {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);

  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [plainNote, setPlainNote] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  
  const [newTplTitle, setNewTplTitle] = useState('');
  const [newTplSubject, setNewTplSubject] = useState('');
  const [newTplBody, setNewTplBody] = useState('');
  const [selectedTplId, setSelectedTplId] = useState('');
  const [editingTplId, setEditingTplId] = useState(null);

  const fetchPartners = async () => { const res = await fetch(`${BACKEND_URL}/api/partners`); setPartners(await res.json()); };
  const fetchLogs = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/logs`); setLogs(await res.json()); };
  const fetchTasksAndLogs = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/tasks`); setTasks(await res.json()); fetchLogs(id); fetchTodayTasks(); };
  const fetchDocuments = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/documents`); setDocuments(await res.json()); };
  const fetchTodayTasks = async () => { const res = await fetch(`${BACKEND_URL}/api/tasks/today`); setTodayTasks(await res.json()); };
  const fetchEmailTemplates = async () => { const res = await fetch(`${BACKEND_URL}/api/email-templates`); setEmailTemplates(await res.json()); };

  useEffect(() => { fetchPartners(); fetchTodayTasks(); fetchEmailTemplates(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner); setNewStatus(partner.status); setStatusNote(''); setPlainNote(''); setNewTaskDesc(''); setNewTaskDate(''); setNewDocName(''); setNewDocUrl(''); setSelectedTplId(''); setEditingTplId(null);
    fetchTasksAndLogs(partner.id); fetchDocuments(partner.id);
  };

  const handleUpdateStatus = async () => {
    if (!selectedPartner) return;
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus, note: statusNote }) });
    if (res.ok) { setSelectedPartner(await res.json()); setStatusNote(''); fetchPartners(); fetchLogs(selectedPartner.id); }
  };

  const handleAddPlainNote = async () => {
    if (!plainNote.trim()) return;
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: plainNote, action_type: 'MEGJEGYZÉS' }) });
    if (res.ok) { setPlainNote(''); fetchLogs(selectedPartner.id); }
  };

  const handleAddTask = async () => {
    if (!newTaskDesc.trim()) return;
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: newTaskDesc, due_date: newTaskDate }) });
    if (res.ok) { setNewTaskDesc(''); setNewTaskDate(''); fetchTasksAndLogs(selectedPartner.id); }
  };

  const handleCompleteTaskItem = async (partnerId, taskId) => {
    if (!window.confirm("Biztosan készre jelented?")) return;
    const res = await fetch(`${BACKEND_URL}/api/partners/${partnerId}/tasks/${taskId}/complete`, { method: 'PUT' });
    if (res.ok) { if (selectedPartner && selectedPartner.id === partnerId) fetchTasksAndLogs(partnerId); else fetchTodayTasks(); }
  };

  const handleAddDocument = async (docType) => {
    if (!newDocName.trim() || !newDocUrl.trim()) return alert('Adj meg nevet és linket!');
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doc_type: docType, doc_name: newDocName, doc_url: newDocUrl }) });
    if (res.ok) { setNewDocName(''); setNewDocUrl(''); fetchDocuments(selectedPartner.id); fetchLogs(selectedPartner.id); }
  };
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Törlöd a dokumentum hivatkozást?")) return;
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/documents/${docId}`, { method: 'DELETE' });
    if (res.ok) fetchDocuments(selectedPartner.id);
  };

  // Sablon logika (Mentés/Szerkesztés/Törlés/Küldés)
  const handleSaveTemplate = async () => {
    if (!newTplTitle.trim()) return;
    if (editingTplId) {
        const res = await fetch(`${BACKEND_URL}/api/email-templates/${editingTplId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTplTitle, subject: newTplSubject, body: newTplBody }) });
        if (res.ok) { setEditingTplId(null); setNewTplTitle(''); setNewTplSubject(''); setNewTplBody(''); fetchEmailTemplates(); }
    } else {
        const res = await fetch(`${BACKEND_URL}/api/email-templates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTplTitle, subject: newTplSubject, body: newTplBody }) });
        if (res.ok) { setNewTplTitle(''); setNewTplSubject(''); setNewTplBody(''); fetchEmailTemplates(); }
    }
  };
  const handleEditTemplateInit = () => {
      const tpl = emailTemplates.find(t => t.id.toString() === selectedTplId);
      if (tpl) { setEditingTplId(tpl.id); setNewTplTitle(tpl.title); setNewTplSubject(tpl.subject); setNewTplBody(tpl.body); }
  };
  const handleDeleteTemplate = async () => {
      if (!selectedTplId) return;
      if (!window.confirm("Biztosan törlöd ezt a sablont?")) return;
      const res = await fetch(`${BACKEND_URL}/api/email-templates/${selectedTplId}`, { method: 'DELETE' });
      if (res.ok) { setSelectedTplId(''); fetchEmailTemplates(); }
  };
  const sendEmail = async () => {
      if (!selectedPartner.email) return alert('Nincs email cím megadva a partnernél!');
      if (!selectedTplId) return alert('Válassz sablont!');
      const tpl = emailTemplates.find(t => t.id.toString() === selectedTplId);
      if (tpl) {
          await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: `E-mail küldés indítva: ${tpl.title}`, action_type: 'E-MAIL KÜLDVE' }) });
          fetchLogs(selectedPartner.id);
          const mailtoLink = `mailto:${selectedPartner.email}?subject=${encodeURIComponent(tpl.subject)}&body=${encodeURIComponent(tpl.body)}`;
          window.location.href = mailtoLink;
      }
  };

  const handleDeletePartner = async (partnerId) => {
    if (!window.confirm("Biztosan törölni akarod?")) return;
    const res = await fetch(`${BACKEND_URL}/api/partners/${partnerId}`, { method: 'DELETE' });
    if (res.ok) { if (selectedPartner?.id === partnerId) setSelectedPartner(null); if (editingPartner?.id === partnerId) setEditingPartner(null); fetchPartners(); fetchTodayTasks(); }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BACKEND_URL}/api/partners/${editingPartner.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingPartner) });
    if (res.ok) {
      const updated = await res.json();
      if (selectedPartner?.id === updated.id) setSelectedPartner(updated);
      setEditingPartner(null); fetchPartners();
    }
  };

  const filteredPartners = partners.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = ((p.company_name?.toLowerCase() || '').includes(term) || (p.contact_person?.toLowerCase() || '').includes(term) || (p.phone?.toLowerCase() || '').includes(term) || (p.email?.toLowerCase() || '').includes(term) || (p.tax_number?.toLowerCase() || '').includes(term) || (p.website?.toLowerCase() || '').includes(term));
    const matchesStatus = statusFilter === '' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPartners = filteredPartners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1600px', margin: '0 auto' }}>
      <h1>Mini CRM</h1>

      <AddPartnerForm onPartnerAdded={fetchPartners} />

      {editingPartner && (
        <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeeba' }}>
          <h3>Partner szerkesztése: {editingPartner.company_name}</h3>
          <form onSubmit={handleSaveEdit}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Cégnév *</label><br/><input value={editingPartner.company_name} onChange={(e) => setEditingPartner({...editingPartner, company_name: e.target.value})} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Döntéshozó *</label><br/><input value={editingPartner.contact_person} onChange={(e) => setEditingPartner({...editingPartner, contact_person: e.target.value})} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Telefonszám *</label><br/><input value={editingPartner.phone} onChange={(e) => setEditingPartner({...editingPartner, phone: e.target.value})} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email</label><br/><input type="email" value={editingPartner.email || ''} onChange={(e) => setEditingPartner({...editingPartner, email: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Weboldal</label><br/><input value={editingPartner.website || ''} onChange={(e) => setEditingPartner({...editingPartner, website: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Kezelő</label><br/><input value={editingPartner.manager || ''} onChange={(e) => setEditingPartner({...editingPartner, manager: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Elfogadott árajánlat</label><br/><input value={editingPartner.accepted_offer || ''} onChange={(e) => setEditingPartner({...editingPartner, accepted_offer: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Árbevétel</label><br/><input value={editingPartner.revenue || ''} onChange={(e) => setEditingPartner({...editingPartner, revenue: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Adószám</label><br/><input value={editingPartner.tax_number || ''} onChange={(e) => setEditingPartner({...editingPartner, tax_number: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 48%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Számlázási cím</label><br/><input value={editingPartner.billing_address || ''} onChange={(e) => setEditingPartner({...editingPartner, billing_address: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 48%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Székhely</label><br/><input value={editingPartner.headquarters || ''} onChange={(e) => setEditingPartner({...editingPartner, headquarters: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Mentés</button>
              <button type="button" onClick={() => setEditingPartner(null)} style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Mégse</button>
            </div>
          </form>
        </div>
      )}

      {/* PROFI 3-HASÁBOS LAYOUT */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'nowrap', overflowX: 'auto', alignItems: 'flex-start' }}>
        
        {/* BAL OSZLOP (LISTÁK) */}
        <div style={{ flex: '0 0 450px', minWidth: '400px' }}>
          
          {/* Mai / Lejárt globális feladatok blokk */}
          <div style={{ background: '#fff5f5', border: '1px solid #ffcccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#d9534f' }}>🔥 Mai & Lejárt Feladatok</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {todayTasks.length === 0 ? (
                      <li style={{ color: '#666', fontSize: '14px' }}>Szép munka, nincs aktív mára eső vagy lejárt feladat!</li>
                  ) : (
                      todayTasks.map(t => {
                          const isOverdue = t.due_date < todayStr;
                          return (
                              <li key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px', background: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #f5c6cb' }}>
                                  <input type="checkbox" onChange={() => handleCompleteTaskItem(t.partner_id, t.id)} style={{ cursor: 'pointer', marginTop: '4px' }} />
                                  <div>
                                      <strong style={{ display: 'block', fontSize: '14px' }}>{t.company_name}</strong>
                                      <span style={{ fontSize: '13px' }}>{t.description}</span><br />
                                      <span style={{ fontSize: '11px', color: isOverdue ? 'red' : '#d9534f', fontWeight: 'bold' }}>
                                          {isOverdue ? '⚠️ LEJÁRT: ' : 'MAI: '} {t.due_date}
                                      </span>
                                  </div>
                              </li>
                          )
                      })
                  )}
              </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input type="text" placeholder="🔍 Keresés..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}/>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}>
              <option value="">Összes státusz</option>
              {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead style={{ background: '#eee' }}><tr><th>Cégnév / Döntéshozó</th><th>Művelet</th></tr></thead>
            <tbody>
              {currentPartners.length === 0 ? (<tr><td colSpan="2">Nincs találat.</td></tr>) : (
                currentPartners.map((p, index) => (
                  <tr key={p.id} style={{ background: selectedPartner?.id === p.id ? '#e6f7ff' : 'transparent' }}>
                    <td>
                        <strong>{indexOfFirstItem + index + 1}. {p.company_name}</strong><br/>
                        <span style={{ color: '#555' }}>{p.contact_person}</span><br/>
                        <span style={{ fontSize: '11px', padding: '2px 4px', background: '#e9ecef', borderRadius: '3px' }}>{p.status}</span>
                    </td>
                    <td style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <button onClick={() => handleSelectPartner(p)} style={{ cursor: 'pointer', padding: '4px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>Kiválaszt</button>
                      <button onClick={() => setEditingPartner(p)} style={{ cursor: 'pointer', padding: '4px', background: '#ffc107', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Szerkeszt</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', fontSize: '13px' }}>
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '6px 12px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>← Előző</button>
              <span><strong>{currentPage}</strong> / {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ padding: '6px 12px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Következő →</button>
            </div>
          )}
        </div>

        {/* KÖZÉPSŐ OSZLOP (HA KIVÁLASZTOTTUNK EGY PARTNERT) -> ADATOK ÉS FUNKCIÓK SZIGORÚ SORRENDBEN */}
        {selectedPartner && (
          <div style={{ flex: '0 0 500px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fafafa', minWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
               <h2 style={{ margin: 0 }}>{selectedPartner.company_name}</h2>
               <button onClick={() => handleDeletePartner(selectedPartner.id)} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Törlés</button>
            </div>
            
            <div style={{ background: '#e6f2ff', padding: '10px', borderRadius: '6px', border: '1px solid #b3d7ff', marginBottom: '15px', fontSize: '13px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                    <p style={{ margin: 0 }}><strong>Döntéshozó:</strong> {selectedPartner.contact_person}</p>
                    <p style={{ margin: 0 }}><strong>Telefon:</strong> {selectedPartner.phone}</p>
                    <p style={{ margin: 0 }}><strong>Email:</strong> {selectedPartner.email || '-'}</p>
                    <p style={{ margin: 0 }}><strong>Weboldal:</strong> {selectedPartner.website ? (<a href={selectedPartner.website.startsWith('http') ? selectedPartner.website : `https://${selectedPartner.website}`} target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>Link</a>) : '-'}</p>
                    <p style={{ margin: 0 }}><strong>Kezelő:</strong> {selectedPartner.manager || '-'}</p>
                    <p style={{ margin: 0 }}><strong>Adószám:</strong> {selectedPartner.tax_number || '-'}</p>
                </div>
                <hr style={{ margin: '8px 0', borderColor: '#b3d7ff' }}/>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#004085' }}>Elfogadott árajánlat: {selectedPartner.accepted_offer || 'Nincs rögzítve'}</p>
            </div>

            {/* 1. STÁTUSZMÓDOSÍTÁS */}
            <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #eee', marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>1. Státusz módosítása</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                  {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
                <button onClick={handleUpdateStatus} style={{ padding: '8px 14px', background: '#ff9900', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Frissítés</button>
              </div>
              <input type="text" placeholder="Státuszváltás megjegyzése..." value={statusNote} onChange={(e) => setStatusNote(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
            </div>

            {/* 2. ÚJ BEJEGYZÉS */}
            <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #eee', marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>2. Új megjegyzés a falra</h4>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" placeholder="Írj egy megjegyzést..." value={plainNote} onChange={(e) => setPlainNote(e.target.value)} style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}/>
                <button onClick={handleAddPlainNote} style={{ padding: '8px 14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Rögzítés</button>
              </div>
            </div>

            {/* 3. KIOSZTOTT FELADAT */}
            <div style={{ background: '#e2e3e5', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #d6d8db' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>3. Kiosztott Feladatok</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                <input type="text" placeholder="Új feladat..." value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} style={{ flex: 2, padding: '8px', boxSizing: 'border-box' }}/>
                <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}/>
                <button onClick={handleAddTask} style={{ padding: '8px 14px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hozzáad</button>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
                {tasks.map(t => {
                  const isToday = t.due_date === todayStr;
                  const isOverdue = t.due_date < todayStr;
                  let dateColor = 'black';
                  if (!t.is_completed) { if (isToday || isOverdue) dateColor = 'red'; }
                  return (
                    <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <input type="checkbox" checked={t.is_completed} disabled={t.is_completed} onChange={() => handleCompleteTaskItem(t.partner_id, t.id)} style={{ cursor: t.is_completed ? 'not-allowed' : 'pointer' }} />
                      <span style={{ textDecoration: t.is_completed ? 'line-through' : 'none', color: t.is_completed ? '#6c757d' : '#000' }}>
                        {t.description} {t.due_date && <strong style={{ color: dateColor, marginLeft: '8px' }}>({t.due_date})</strong>}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* 4. E-MAIL */}
            <div style={{ background: '#eef9f0', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #c3e6cb' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>4. E-mail küldés (Sablonok)</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                  <select value={selectedTplId} onChange={(e) => { setSelectedTplId(e.target.value); setEditingTplId(null); }} style={{ flex: 1, padding: '8px' }}>
                      <option value="">Válassz sablont...</option>
                      {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                  <button onClick={sendEmail} style={{ padding: '8px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Küldés</button>
                  {selectedTplId && (
                      <>
                        <button onClick={handleEditTemplateInit} style={{ padding: '8px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                        <button onClick={handleDeleteTemplate} style={{ padding: '8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✖</button>
                      </>
                  )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px', background: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <strong style={{ fontSize: '12px' }}>{editingTplId ? 'Sablon szerkesztése' : 'Új sablon rögzítése'}</strong>
                  <input type="text" placeholder="Sablon neve" value={newTplTitle} onChange={e => setNewTplTitle(e.target.value)} style={{ padding: '6px' }}/>
                  <input type="text" placeholder="E-mail tárgya" value={newTplSubject} onChange={e => setNewTplSubject(e.target.value)} style={{ padding: '6px' }}/>
                  <textarea placeholder="E-mail szövege..." value={newTplBody} onChange={e => setNewTplBody(e.target.value)} style={{ padding: '6px', minHeight: '60px' }}></textarea>
                  <div style={{ display: 'flex', gap: '5px' }}>
                     <button onClick={handleSaveTemplate} style={{ flex: 1, padding: '6px', background: editingTplId ? '#ffc107' : '#6c757d', color: editingTplId ? '#000' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{editingTplId ? 'Módosítás mentése' : 'Mentés újként'}</button>
                     {editingTplId && <button onClick={() => { setEditingTplId(null); setNewTplTitle(''); setNewTplSubject(''); setNewTplBody(''); }} style={{ padding: '6px', background: '#ddd', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Mégse</button>}
                  </div>
              </div>
            </div>

            {/* 5. DOKUMENTUMOK */}
            <div style={{ background: '#e8f4f8', padding: '12px', borderRadius: '6px', border: '1px solid #b8daff' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>5. Dokumentumok (URL)</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                <input type="text" placeholder="Fájl név..." value={newDocName} onChange={(e) => setNewDocName(e.target.value)} style={{ flex: 1, padding: '6px' }}/>
                <input type="text" placeholder="URL Link..." value={newDocUrl} onChange={(e) => setNewDocUrl(e.target.value)} style={{ flex: 2, padding: '6px' }}/>
              </div>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                <button onClick={() => handleAddDocument('offer')} style={{ flex: 1, padding: '6px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Ajánlat</button>
                <button onClick={() => handleAddDocument('contract')} style={{ flex: 1, padding: '6px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Szerződés</button>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
                <div style={{ flex: 1 }}>
                  <strong>Ajánlatok:</strong>
                  <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                    {documents.filter(d => d.doc_type === 'offer').map(d => (
                      <li key={d.id} style={{ marginBottom: '5px' }}><a href={d.doc_url} target="_blank" rel="noreferrer">{d.doc_name}</a> <button onClick={() => handleDeleteDocument(d.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>✖</button></li>
                    ))}
                  </ul>
                </div>
                <div style={{ flex: 1 }}>
                  <strong>Szerződések:</strong>
                  <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                    {documents.filter(d => d.doc_type === 'contract').map(d => (
                      <li key={d.id} style={{ marginBottom: '5px' }}><a href={d.doc_url} target="_blank" rel="noreferrer">{d.doc_name}</a> <button onClick={() => handleDeleteDocument(d.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>✖</button></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* JOBB OSZLOP / KÖZÉPSŐ OSZLOP -> VIZUÁLIS IDŐVONAL (FAL) */}
        {selectedPartner && (
            <div style={{ flex: '1 1 500px', minWidth: '400px', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
               <h3 style={{ margin: '0 0 20px 0' }}>Előzmények (Partner Fal)</h3>
               
               {logs.length === 0 ? (
                   <p style={{ color: '#888' }}>Még nincs esemény.</p>
               ) : (
                   <div style={{ position: 'relative', paddingLeft: '24px', margin: '10px 0' }}>
                     {/* Vizuális vonal */}
                     <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '7px', width: '2px', background: '#ccc' }}></div>
                     
                     {logs.map((log) => {
                       let dotColor = '#6c757d'; // alap szürke
                       if (log.action_type === 'FELADAT KÉSZ') dotColor = '#28a745'; // Zöld
                       if (log.action_type === 'LEJÁRT FELADAT') dotColor = '#dc3545'; // Piros
                       if (log.action_type === 'STÁTUSZVÁLTÁS') dotColor = '#ffc107'; // Sárga
                       if (log.action_type === 'E-MAIL KÜLDVE') dotColor = '#17a2b8'; // Kék
                       if (log.action_type === 'ÚJ FELADAT') dotColor = '#007bff'; // Kék
                       if (log.action_type === 'ÚJ DOKUMENTUM') dotColor = '#6610f2'; // Lila

                       return (
                         <div key={log.id} style={{ position: 'relative', marginBottom: '15px', padding: '12px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                           {/* Pötty az idővonalon */}
                           <div style={{ position: 'absolute', left: '-22px', top: '16px', width: '12px', height: '12px', background: dotColor, borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 0 0 1px #ccc' }}></div>
                           
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '5px' }}>
                              <span style={{ fontWeight: 'bold', color: dotColor, textTransform: 'uppercase' }}>{log.action_type}</span>
                              <span>{new Date(log.created_at).toLocaleString()}</span>
                           </div>
                           <div style={{ fontSize: '13px', color: '#333', fontWeight: log.action_type === 'LEJÁRT FELADAT' ? 'bold' : 'normal' }}>
                              {log.note}
                           </div>
                         </div>
                       );
                     })}
                   </div>
               )}
            </div>
        )}
      </div>
    </div>
  );
}

export default App;