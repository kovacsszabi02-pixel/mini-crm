import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mini-crm-44xt.onrender.com';

const STATUSES = [
  '1. Új lead', '2. Kapcsolatfelvétel alatt', '3. Tárgyalás', '4. Ajánlat kiküldés',
  '5. Szerződésírás', '6. Döntésre vár', '7. Díjbekérő', '8. Fizetésre vár', '9. Számlaírás',
  '10. Sablonírás', '11. Átadásra vár', '12. Teljesített', '13. Elveszített', '14. Konzílium', '15. Utánkövetés'
];

function AddPartnerForm({ onPartnerAdded }) {
  const [formData, setFormData] = useState({
    company_name: '', contact_person: '', phone: '', email: '', website: '', revenue: '', tax_number: '', billing_address: '', headquarters: '', manager: '', accepted_offer: ''
  });

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

  const fetchPartners = async () => {
    const res = await fetch(`${BACKEND_URL}/api/partners`);
    setPartners(await res.json());
  };

  const fetchLogs = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/logs`); setLogs(await res.json()); };
  
  const fetchTasksAndLogs = async (id) => { 
    const res = await fetch(`${BACKEND_URL}/api/partners/${id}/tasks`); 
    setTasks(await res.json()); 
    fetchLogs(id); 
    fetchTodayTasks();
  };
  
  const fetchDocuments = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/documents`); setDocuments(await res.json()); };
  
  const fetchTodayTasks = async () => {
    const res = await fetch(`${BACKEND_URL}/api/tasks/today`);
    setTodayTasks(await res.json());
  };

  const fetchEmailTemplates = async () => {
    const res = await fetch(`${BACKEND_URL}/api/email-templates`);
    setEmailTemplates(await res.json());
  };

  useEffect(() => { 
    fetchPartners(); 
    fetchTodayTasks();
    fetchEmailTemplates();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner);
    setNewStatus(partner.status);
    setStatusNote(''); setPlainNote(''); setNewTaskDesc(''); setNewTaskDate(''); setNewDocName(''); setNewDocUrl(''); setSelectedTplId('');
    fetchTasksAndLogs(partner.id); 
    fetchDocuments(partner.id);
  };

  const handleUpdateStatus = async () => {
    if (!selectedPartner) return;
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus, note: statusNote })
    });
    if (res.ok) { setSelectedPartner(await res.json()); setStatusNote(''); fetchPartners(); fetchLogs(selectedPartner.id); }
  };

  const handleAddPlainNote = async () => {
    if (!plainNote.trim()) return;
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/logs`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: plainNote })
    });
    if (res.ok) { setPlainNote(''); fetchLogs(selectedPartner.id); }
  };

  const handleAddTask = async () => {
    if (!newTaskDesc.trim()) return;
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: newTaskDesc, due_date: newTaskDate })
    });
    if (res.ok) { setNewTaskDesc(''); setNewTaskDate(''); fetchTasksAndLogs(selectedPartner.id); }
  };

  const handleCompleteTaskItem = async (partnerId, taskId) => {
    if (!window.confirm("Biztosan készre jelented?")) return;
    const res = await fetch(`${BACKEND_URL}/api/partners/${partnerId}/tasks/${taskId}/complete`, { method: 'PUT' });
    if (res.ok) { 
        if (selectedPartner && selectedPartner.id === partnerId) fetchTasksAndLogs(partnerId);
        else fetchTodayTasks();
    }
  };

  const handleAddDocument = async (docType) => {
    if (!newDocName.trim() || !newDocUrl.trim()) return alert('Adj meg nevet és linket!');
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/documents`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doc_type: docType, doc_name: newDocName, doc_url: newDocUrl })
    });
    if (res.ok) { setNewDocName(''); setNewDocUrl(''); fetchDocuments(selectedPartner.id); fetchLogs(selectedPartner.id); }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Törlöd a dokumentum hivatkozást?")) return;
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/documents/${docId}`, { method: 'DELETE' });
    if (res.ok) fetchDocuments(selectedPartner.id);
  };

  const handleAddTemplate = async () => {
    if (!newTplTitle.trim()) return;
    const res = await fetch(`${BACKEND_URL}/api/email-templates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTplTitle, subject: newTplSubject, body: newTplBody })
    });
    if (res.ok) { setNewTplTitle(''); setNewTplSubject(''); setNewTplBody(''); fetchEmailTemplates(); }
  };

  const sendEmail = () => {
      if (!selectedPartner.email) return alert('Nincs email cím megadva a partnernél!');
      if (!selectedTplId) return alert('Válassz sablont!');
      const tpl = emailTemplates.find(t => t.id.toString() === selectedTplId);
      if (tpl) {
          const mailtoLink = `mailto:${selectedPartner.email}?subject=${encodeURIComponent(tpl.subject)}&body=${encodeURIComponent(tpl.body)}`;
          window.location.href = mailtoLink;
      }
  };

  const handleDeletePartner = async (partnerId) => {
    if (!window.confirm("Biztosan törölni akarod?")) return;
    const res = await fetch(`${BACKEND_URL}/api/partners/${partnerId}`, { method: 'DELETE' });
    if (res.ok) {
      if (selectedPartner?.id === partnerId) setSelectedPartner(null);
      if (editingPartner?.id === partnerId) setEditingPartner(null);
      fetchPartners(); fetchTodayTasks();
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BACKEND_URL}/api/partners/${editingPartner.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingPartner)
    });
    if (res.ok) {
      const updated = await res.json();
      if (selectedPartner?.id === updated.id) setSelectedPartner(updated);
      setEditingPartner(null); fetchPartners();
    }
  };

  const filteredPartners = partners.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (p.company_name?.toLowerCase() || '').includes(term) ||
      (p.contact_person?.toLowerCase() || '').includes(term) ||
      (p.phone?.toLowerCase() || '').includes(term) ||
      (p.email?.toLowerCase() || '').includes(term) ||
      (p.tax_number?.toLowerCase() || '').includes(term) ||
      (p.website?.toLowerCase() || '').includes(term)
    );
    const matchesStatus = statusFilter === '' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPartners = filteredPartners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
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

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Bal vagy Középső Hasáb: Partnerlista */}
        <div style={{ flex: '2 1 500px' }}>
          <h2>Partnerek Listája</h2>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="text" 
              placeholder="🔍 Keresés (cégnév, döntéshozó, telefon, email, weboldal, adószám)..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 2, padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
            />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
            >
              <option value="">Összes státusz</option>
              {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ background: '#eee' }}>
              <tr><th>#</th><th>Cégnév</th><th>Döntéshozó</th><th>Telefon</th><th>Státusz</th><th>Művelet</th></tr>
            </thead>
            <tbody>
              {currentPartners.length === 0 ? (<tr><td colSpan="6">Nincs a keresésnek megfelelő partner.</td></tr>) : (
                currentPartners.map((p, index) => (
                  <tr key={p.id} style={{ background: selectedPartner?.id === p.id ? '#e6f7ff' : 'transparent' }}>
                    <td>{indexOfFirstItem + index + 1}.</td>
                    <td><strong>{p.company_name}</strong></td><td>{p.contact_person}</td><td>{p.phone}</td>
                    <td><span style={{ fontSize: '12px', padding: '3px 6px', background: '#e9ecef', borderRadius: '4px' }}>{p.status}</span></td>
                    <td style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleSelectPartner(p)} style={{ cursor: 'pointer', padding: '4px 8px', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px' }}>Adatlap</button>
                      <button onClick={() => setEditingPartner(p)} style={{ cursor: 'pointer', padding: '4px 8px', background: '#ffc107', border: '1px solid #e0a800', borderRadius: '4px', fontWeight: 'bold' }}>Szerkesztés</button>
                      <button onClick={() => handleDeletePartner(p.id)} style={{ cursor: 'pointer', padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>Törlés</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: '#e9ecef', border: '1px solid #ccc', borderRadius: '4px' }}>← Előző</button>
              <span>Oldal: <strong>{currentPage}</strong> / {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', background: '#e9ecef', border: '1px solid #ccc', borderRadius: '4px' }}>Következő →</button>
            </div>
          )}
        </div>

        {/* Új Oszlop: Mai és lejárt feladatok globális listája */}
        <div style={{ flex: '1 1 300px', background: '#fff5f5', border: '1px solid #ffcccc', padding: '15px', borderRadius: '8px', order: selectedPartner ? 3 : 2 }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#d9534f' }}>🔥 Mai & Lejárt Feladatok</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {todayTasks.length === 0 ? (
                    <li style={{ color: '#666', fontSize: '14px' }}>Nincs aktív mára eső vagy lejárt feladat! Szép munka.</li>
                ) : (
                    todayTasks.map(t => {
                        const isOverdue = t.due_date < todayStr;
                        return (
                            <li key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px', background: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #f5c6cb' }}>
                                <input type="checkbox" onChange={() => handleCompleteTaskItem(t.partner_id, t.id)} style={{ cursor: 'pointer', marginTop: '4px' }} />
                                <div>
                                    <strong style={{ display: 'block', fontSize: '14px' }}>{t.company_name}</strong>
                                    <span style={{ fontSize: '13px' }}>{t.description}</span>
                                    <br />
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

        {/* Adatlap */}
        {selectedPartner && (
          <div style={{ flex: '2 1 400px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fafafa', order: 2 }}>
            <h2>{selectedPartner.company_name} adatlapja</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '15px' }}>
              <div>
                <p style={{ margin: '5px 0' }}><strong>Döntéshozó:</strong> {selectedPartner.contact_person} ({selectedPartner.phone})</p>
                <p style={{ margin: '5px 0' }}><strong>Email:</strong> {selectedPartner.email || '-'}</p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Weboldal:</strong> {selectedPartner.website ? (
                    <a href={selectedPartner.website.startsWith('http') ? selectedPartner.website : `https://${selectedPartner.website}`} target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>{selectedPartner.website}</a>
                  ) : '-'}
                </p>
                <p style={{ margin: '5px 0' }}><strong>Kezelő:</strong> {selectedPartner.manager || '-'}</p>
                <p style={{ margin: '5px 0' }}><strong>Székhely:</strong> {selectedPartner.headquarters || '-'}</p>
                <p style={{ margin: '5px 0' }}><strong>Adószám:</strong> {selectedPartner.tax_number || '-'}</p>
                <p style={{ margin: '5px 0' }}><strong>Árbevétel:</strong> {selectedPartner.revenue || '-'}</p>
              </div>
              <div style={{ background: '#e6f2ff', padding: '10px', borderRadius: '6px', border: '1px solid #b3d7ff' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#004085' }}>Elfogadott árajánlat:</h4>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedPartner.accepted_offer || 'Nincs rögzítve'}</p>
              </div>
            </div>
            
            <hr style={{ margin: '15px 0' }} />

            {/* EMAIL SABLON FÜL */}
            <div style={{ background: '#eef9f0', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #c3e6cb' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>📧 E-mail küldés (Sablonok)</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                  <select value={selectedTplId} onChange={(e) => setSelectedTplId(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                      <option value="">Válassz mentett sablont...</option>
                      {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                  <button onClick={sendEmail} style={{ padding: '8px 14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Kiválasztott küldése</button>
              </div>
              <details style={{ fontSize: '13px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>+ Új sablon rögzítése az adatbázisba</summary>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                      <input type="text" placeholder="Sablon neve (pl: 1. Hideghívás utáni)" value={newTplTitle} onChange={e => setNewTplTitle(e.target.value)} style={{ padding: '6px' }}/>
                      <input type="text" placeholder="E-mail tárgya" value={newTplSubject} onChange={e => setNewTplSubject(e.target.value)} style={{ padding: '6px' }}/>
                      <textarea placeholder="E-mail szövege..." value={newTplBody} onChange={e => setNewTplBody(e.target.value)} style={{ padding: '6px', minHeight: '60px' }}></textarea>
                      <button onClick={handleAddTemplate} style={{ padding: '6px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sablon mentése</button>
                  </div>
              </details>
            </div>

            {/* FELADATOK */}
            <div style={{ background: '#e2e3e5', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #d6d8db' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Kiosztott Feladatok</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                <input type="text" placeholder="Új feladat kiírása..." value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} style={{ flex: 2, padding: '8px', boxSizing: 'border-box' }}/>
                <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }} title="Határidő"/>
                <button onClick={handleAddTask} style={{ padding: '8px 14px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hozzáadás</button>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {tasks.map(t => {
                  const isToday = t.due_date === todayStr;
                  const isOverdue = t.due_date < todayStr;
                  let dateColor = 'black';
                  if (!t.is_completed) {
                      if (isToday) dateColor = 'red';
                      if (isOverdue) dateColor = 'red';
                  }
                  
                  return (
                    <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <input type="checkbox" checked={t.is_completed} disabled={t.is_completed} onChange={() => handleCompleteTaskItem(t.partner_id, t.id)} style={{ cursor: t.is_completed ? 'not-allowed' : 'pointer' }} />
                      <span style={{ textDecoration: t.is_completed ? 'line-through' : 'none', color: t.is_completed ? '#6c757d' : '#000' }}>
                        {t.description} 
                        {t.due_date && <strong style={{ color: dateColor, marginLeft: '8px', fontSize: '12px' }}>(Határidő: {t.due_date})</strong>}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* DOKUMENTUMOK */}
            <div style={{ background: '#e8f4f8', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #b8daff' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Dokumentumok (URL linkek)</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                <input type="text" placeholder="Fájl neve..." value={newDocName} onChange={(e) => setNewDocName(e.target.value)} style={{ flex: 1, padding: '6px' }}/>
                <input type="text" placeholder="Google Drive / Felhő Link..." value={newDocUrl} onChange={(e) => setNewDocUrl(e.target.value)} style={{ flex: 2, padding: '6px' }}/>
                <button onClick={() => handleAddDocument('offer')} style={{ padding: '6px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+ Ajánlat</button>
                <button onClick={() => handleAddDocument('contract')} style={{ padding: '6px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+ Szerződés</button>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <strong>Kiküldött ajánlatok:</strong>
                  <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                    {documents.filter(d => d.doc_type === 'offer').map(d => (
                      <li key={d.id} style={{ marginBottom: '5px' }}><a href={d.doc_url} target="_blank" rel="noreferrer">{d.doc_name}</a> <button onClick={() => handleDeleteDocument(d.id)} style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}>✖</button></li>
                    ))}
                  </ul>
                </div>
                <div style={{ flex: 1 }}>
                  <strong>Szerződések / Számlák:</strong>
                  <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                    {documents.filter(d => d.doc_type === 'contract').map(d => (
                      <li key={d.id} style={{ marginBottom: '5px' }}><a href={d.doc_url} target="_blank" rel="noreferrer">{d.doc_name}</a> <button onClick={() => handleDeleteDocument(d.id)} style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}>✖</button></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* STÁTUSZ ÉS KÖZVETLENÜL ALATTA A MEGJEGYZÉS ROVAT */}
            <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #eee', marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Státusz módosítása</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                  {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
                <button onClick={handleUpdateStatus} style={{ padding: '8px 14px', background: '#ff9900', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Frissítés</button>
              </div>
              <input type="text" placeholder="Státuszváltás megjegyzése..." value={statusNote} onChange={(e) => setStatusNote(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
              
              <hr style={{ margin: '15px 0' }} />
              
              <h4 style={{ margin: '0 0 10px 0' }}>Új megjegyzés a falra</h4>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" placeholder="Írj egy megjegyzést..." value={plainNote} onChange={(e) => setPlainNote(e.target.value)} style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}/>
                <button onClick={handleAddPlainNote} style={{ padding: '8px 14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Rögzítés</button>
              </div>
            </div>

            <h4>Előzmények / Fal bejegyzések</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {logs.map((log) => {
                const isOverdueLog = log.action_type === 'LEJÁRT FELADAT';
                return (
                  <li key={log.id} style={{ background: isOverdueLog ? '#fff3cd' : '#fff', border: isOverdueLog ? '1px solid #ffeeba' : '1px solid #eee', padding: '10px', marginBottom: '8px', borderRadius: '4px' }}>
                    <strong>{log.user_name}</strong> <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>{new Date(log.created_at).toLocaleString()}</span>
                    <div style={{ marginTop: '5px', color: isOverdueLog ? '#856404' : '#000', fontWeight: isOverdueLog ? 'bold' : 'normal' }}>{log.note}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;