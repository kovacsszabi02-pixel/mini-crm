import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mini-crm-44xt.onrender.com';

const STATUSES = [
  '1. Új lead', '2. Kapcsolatfelvétel alatt', '3. Tárgyalás', '4. Ajánlat kiküldés',
  '5. Szerződésírás', '6. Döntésre vár', '7. Díjbekérő', '8. Fizetésre vár', '9. Számlaírás',
  '10. Sablonírás', '11. Átadásra vár', '12. Teljesített', '13. Elveszített', '14. Konzílium', '15. Utánkövetés'
];

function AddPartnerForm({ onPartnerAdded }) {
  const [formData, setFormData] = useState({ company_name: '', contact_person: '', phone: '', email: '', website: '', revenue: '', tax_number: '', billing_address: '', headquarters: '', manager: '', accepted_offer: '', chosen_package: '', addons: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') { setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9+\s]/g, '') })); return; }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/partners`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (response.ok) {
        setFormData({ company_name: '', contact_person: '', phone: '', email: '', website: '', revenue: '', tax_number: '', billing_address: '', headquarters: '', manager: '', accepted_offer: '', chosen_package: '', addons: '' });
        onPartnerAdded();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
      <h3 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>Új partner rögzítése</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Cégnév *</label><br/><input name="company_name" value={formData.company_name} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Döntéshozó *</label><br/><input name="contact_person" value={formData.contact_person} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Telefonszám *</label><br/><input name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email</label><br/><input name="email" type="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Weboldal</label><br/><input name="website" placeholder="pl: valami.hu" value={formData.website} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Kezelő</label><br/><input name="manager" value={formData.manager} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Székhely</label><br/><input name="headquarters" value={formData.headquarters} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
        </div>

        <div style={{ background: '#e9ecef', padding: '15px', borderRadius: '6px', display: 'flex', flexWrap: 'wrap', gap: '10px', border: '1px solid #ced4da' }}>
            <div style={{ flex: '1 1 100%', marginBottom: '5px' }}><strong style={{ fontSize: '14px', color: '#495057' }}>Pénzügyi és Csomag adatok</strong></div>
            <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0056b3' }}>Számlázási cím</label><br/><input name="billing_address" value={formData.billing_address} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #80bdff' }}/></div>
            <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0056b3' }}>Adószám</label><br/><input name="tax_number" value={formData.tax_number} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #80bdff' }}/></div>
            <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0056b3' }}>Éves Árbevétel</label><br/><input name="revenue" value={formData.revenue} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #80bdff' }}/></div>
            <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#28a745' }}>Elfogadott Árajánlat (összeg)</label><br/><input name="accepted_offer" value={formData.accepted_offer} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #28a745' }}/></div>
            <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#28a745' }}>Választott Csomag</label><br/><input name="chosen_package" placeholder="pl. Prémium" value={formData.chosen_package} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #28a745' }}/></div>
            <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#28a745' }}>Kiegészítők (Add-ons)</label><br/><input name="addons" placeholder="pl. +1 Hónap hirdetés" value={formData.addons} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #28a745' }}/></div>
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
    setTimeout(() => { document.getElementById('partner-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
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

  const handleSaveTemplate = async () => {
    if (!newTplTitle.trim()) return;
    const endpoint = editingTplId ? `${BACKEND_URL}/api/email-templates/${editingTplId}` : `${BACKEND_URL}/api/email-templates`;
    const method = editingTplId ? 'PUT' : 'POST';
    const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTplTitle, subject: newTplSubject, body: newTplBody }) });
    if (res.ok) { setEditingTplId(null); setNewTplTitle(''); setNewTplSubject(''); setNewTplBody(''); fetchEmailTemplates(); }
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
    const matchesSearch = (
      (p.company_name?.toLowerCase() || '').includes(term) || 
      (p.contact_person?.toLowerCase() || '').includes(term) || 
      (p.phone?.toLowerCase() || '').includes(term) || 
      (p.email?.toLowerCase() || '').includes(term) || 
      (p.tax_number?.toLowerCase() || '').includes(term) || 
      (p.website?.toLowerCase() || '').includes(term) ||
      (p.chosen_package?.toLowerCase() || '').includes(term) ||
      (p.addons?.toLowerCase() || '').includes(term) ||
      (p.billing_address?.toLowerCase() || '').includes(term)
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
          <h3 style={{ borderBottom: '2px solid #ffeeba', paddingBottom: '10px' }}>Partner szerkesztése: {editingPartner.company_name}</h3>
          <form onSubmit={handleSaveEdit}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Cégnév *</label><br/><input value={editingPartner.company_name} onChange={(e) => setEditingPartner({...editingPartner, company_name: e.target.value})} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Döntéshozó *</label><br/><input value={editingPartner.contact_person} onChange={(e) => setEditingPartner({...editingPartner, contact_person: e.target.value})} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Telefonszám *</label><br/><input value={editingPartner.phone} onChange={(e) => setEditingPartner({...editingPartner, phone: e.target.value})} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email</label><br/><input type="email" value={editingPartner.email || ''} onChange={(e) => setEditingPartner({...editingPartner, email: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Weboldal</label><br/><input value={editingPartner.website || ''} onChange={(e) => setEditingPartner({...editingPartner, website: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Kezelő</label><br/><input value={editingPartner.manager || ''} onChange={(e) => setEditingPartner({...editingPartner, manager: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Székhely</label><br/><input value={editingPartner.headquarters || ''} onChange={(e) => setEditingPartner({...editingPartner, headquarters: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/></div>
            </div>

            <div style={{ background: '#ffeeba', padding: '15px', borderRadius: '6px', display: 'flex', flexWrap: 'wrap', gap: '10px', border: '1px solid #ffdf7e' }}>
                <div style={{ flex: '1 1 100%', marginBottom: '5px' }}><strong style={{ fontSize: '14px', color: '#856404' }}>Pénzügyi és Csomag adatok</strong></div>
                <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#856404' }}>Számlázási cím</label><br/><input value={editingPartner.billing_address || ''} onChange={(e) => setEditingPartner({...editingPartner, billing_address: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ffdf7e' }}/></div>
                <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#856404' }}>Adószám</label><br/><input value={editingPartner.tax_number || ''} onChange={(e) => setEditingPartner({...editingPartner, tax_number: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ffdf7e' }}/></div>
                <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#856404' }}>Árbevétel</label><br/><input value={editingPartner.revenue || ''} onChange={(e) => setEditingPartner({...editingPartner, revenue: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ffdf7e' }}/></div>
                <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#28a745' }}>Elfogadott árajánlat (összeg)</label><br/><input value={editingPartner.accepted_offer || ''} onChange={(e) => setEditingPartner({...editingPartner, accepted_offer: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #28a745' }}/></div>
                <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#28a745' }}>Választott Csomag</label><br/><input value={editingPartner.chosen_package || ''} onChange={(e) => setEditingPartner({...editingPartner, chosen_package: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #28a745' }}/></div>
                <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#28a745' }}>Kiegészítők</label><br/><input value={editingPartner.addons || ''} onChange={(e) => setEditingPartner({...editingPartner, addons: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #28a745' }}/></div>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Mentés</button>
              <button type="button" onClick={() => setEditingPartner(null)} style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Mégse</button>
            </div>
          </form>
        </div>
      )}

      {/* GLOBÁLIS NAPI FELADATOK */}
      <div style={{ background: '#fff5f5', border: '1px solid #ffcccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#d9534f' }}>🔥 Mai & Lejárt Feladatok ({todayTasks.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {todayTasks.length === 0 ? (
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Szép munka, nincs aktív mára eső vagy lejárt feladat!</p>
              ) : (
                  todayTasks.map(t => {
                      const isOverdue = t.due_date < todayStr;
                      return (
                          <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #f5c6cb', flex: '1 1 300px', maxWidth: '400px' }}>
                              <input type="checkbox" onChange={() => handleCompleteTaskItem(t.partner_id, t.id)} style={{ cursor: 'pointer', marginTop: '4px' }} title="Készre jelentés" />
                              <div>
                                  <strong style={{ display: 'block', fontSize: '14px' }}>{t.company_name}</strong>
                                  <span style={{ fontSize: '13px' }}>{t.description}</span><br />
                                  <span style={{ fontSize: '11px', color: isOverdue ? 'red' : '#d9534f', fontWeight: 'bold' }}>{isOverdue ? '⚠️ LEJÁRT: ' : 'MAI: '} {t.due_date}</span>
                              </div>
                          </div>
                      )
                  })
              )}
          </div>
      </div>

      {/* PARTNEREK LISTÁJA */}
      <div style={{ background: '#fff', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2 style={{ margin: '0 0 15px 0' }}>Partnerek Listája</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input type="text" placeholder="🔍 Keresés (cégnév, csomag, kiegészítők, cím, telefon, email)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}/>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}>
            <option value="">Összes státusz</option>
            {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>

        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ background: '#eee' }}>
            <tr><th>#</th><th>Cégnév / Csomag</th><th>Döntéshozó</th><th>Telefon</th><th>Státusz</th><th>Művelet</th></tr>
          </thead>
          <tbody>
            {currentPartners.length === 0 ? (<tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Nincs találat.</td></tr>) : (
              currentPartners.map((p, index) => (
                <tr key={p.id} style={{ background: selectedPartner?.id === p.id ? '#e6f7ff' : 'transparent', transition: 'background 0.2s' }}>
                  <td>{indexOfFirstItem + index + 1}.</td>
                  <td>
                    <strong style={{ fontSize: '15px' }}>{p.company_name}</strong>
                    {(p.chosen_package || p.addons) && (
                        <div style={{ fontSize: '12px', color: '#28a745', marginTop: '4px', fontWeight: 'bold' }}>
                           {p.chosen_package && <span>📦 {p.chosen_package}</span>}
                           {p.addons && <span style={{ marginLeft: '10px' }}>➕ {p.addons}</span>}
                        </div>
                    )}
                  </td>
                  <td>{p.contact_person}</td><td>{p.phone}</td>
                  <td><span style={{ fontSize: '12px', padding: '3px 6px', background: '#e9ecef', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'bold' }}>{p.status}</span></td>
                  <td style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleSelectPartner(p)} style={{ cursor: 'pointer', padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Munkaterület</button>
                    <button onClick={() => setEditingPartner(p)} style={{ cursor: 'pointer', padding: '6px 12px', background: '#ffc107', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Szerkeszt</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>← Előző</button>
            <span>Oldal: <strong>{currentPage}</strong> / {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Következő →</button>
          </div>
        )}
      </div>

      {/* SELECTED PARTNER MUNKATERÜLET */}
      {selectedPartner && (
        <div id="partner-workspace" style={{ borderTop: '4px solid #007bff', paddingTop: '30px', marginTop: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
             <h2 style={{ margin: 0, fontSize: '28px' }}>{selectedPartner.company_name} <span style={{ fontSize: '16px', color: '#666', fontWeight: 'normal' }}>- Munkaterület</span></h2>
             <button onClick={() => handleDeletePartner(selectedPartner.id)} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Partner végleges törlése</button>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '25px' }}>
              <div style={{ flex: '1 1 45%', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                  <h4 style={{ margin: '0 0 15px 0', borderBottom: '2px solid #ccc', paddingBottom: '5px' }}>Alap Információk</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                      <div><strong style={{ color: '#495057' }}>Döntéshozó:</strong> <br/>{selectedPartner.contact_person}</div>
                      <div><strong style={{ color: '#495057' }}>Telefon:</strong> <br/>{selectedPartner.phone}</div>
                      <div><strong style={{ color: '#495057' }}>Email:</strong> <br/>{selectedPartner.email || '-'}</div>
                      <div><strong style={{ color: '#495057' }}>Weboldal:</strong> <br/>{selectedPartner.website ? (<a href={selectedPartner.website.startsWith('http') ? selectedPartner.website : `https://${selectedPartner.website}`} target="_blank" rel="noreferrer" style={{ color: '#007bff', fontWeight: 'bold' }}>Megnyitás ↗</a>) : '-'}</div>
                      <div><strong style={{ color: '#495057' }}>Székhely:</strong> <br/>{selectedPartner.headquarters || '-'}</div>
                      <div><strong style={{ color: '#495057' }}>Kezelő:</strong> <br/>{selectedPartner.manager || '-'}</div>
                  </div>
              </div>

              <div style={{ flex: '1 1 45%', background: '#e6f2ff', padding: '20px', borderRadius: '8px', border: '2px solid #b3d7ff' }}>
                  <h4 style={{ margin: '0 0 15px 0', borderBottom: '2px solid #b3d7ff', paddingBottom: '5px', color: '#004085' }}>Pénzügyek és Csomag</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                      <div><strong style={{ color: '#0056b3' }}>Számlázási cím:</strong> <br/><span style={{ fontSize: '15px', fontWeight: 'bold' }}>{selectedPartner.billing_address || '-'}</span></div>
                      <div><strong style={{ color: '#0056b3' }}>Adószám:</strong> <br/>{selectedPartner.tax_number || '-'}</div>
                      <div><strong style={{ color: '#0056b3' }}>Árbevétel:</strong> <br/>{selectedPartner.revenue || '-'}</div>
                      <div><strong style={{ color: '#28a745' }}>Elfogadott ajánlat:</strong> <br/><span style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>{selectedPartner.accepted_offer || 'Nincs'}</span></div>
                      <div style={{ background: '#d4edda', padding: '8px', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
                          <strong style={{ color: '#155724' }}>Választott Csomag:</strong> <br/><span style={{ fontSize: '15px', fontWeight: 'bold' }}>{selectedPartner.chosen_package || '-'}</span>
                      </div>
                      <div style={{ background: '#d4edda', padding: '8px', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
                          <strong style={{ color: '#155724' }}>Kiegészítők (Addons):</strong> <br/><span style={{ fontSize: '15px', fontWeight: 'bold' }}>{selectedPartner.addons || '-'}</span>
                      </div>
                  </div>
              </div>
          </div>

          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 500px' }}>
              
              <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>1. Státusz módosítása</h4>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>{STATUSES.map(st => <option key={st} value={st}>{st}</option>)}</select>
                  <button onClick={handleUpdateStatus} style={{ padding: '10px 20px', background: '#ff9900', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Frissítés</button>
                </div>
                <input type="text" placeholder="Státuszváltás indoklása (opcionális)..." value={statusNote} onChange={(e) => setStatusNote(e.target.value)} style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #eee', borderRadius: '4px' }}/>
              </div>

              <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>2. Új megjegyzés a falra</h4>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input type="text" placeholder="Írj egy gyors megjegyzést..." value={plainNote} onChange={(e) => setPlainNote(e.target.value)} style={{ flex: 1, padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}/>
                  <button onClick={handleAddPlainNote} style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Rögzítés</button>
                </div>
              </div>

              <div style={{ background: '#e2e3e5', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #d6d8db' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>3. Kiosztott Feladatok</h4>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                  <input type="text" placeholder="Új feladat..." value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}/>
                  <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}/>
                  <button onClick={handleAddTask} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hozzáad</button>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
                  {tasks.map(t => {
                    const isOverdue = t.due_date < todayStr;
                    return (
                      <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', background: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <input type="checkbox" checked={t.is_completed} disabled={t.is_completed} onChange={() => handleCompleteTaskItem(t.partner_id, t.id)} style={{ cursor: t.is_completed ? 'not-allowed' : 'pointer', transform: 'scale(1.2)' }} />
                        <span style={{ textDecoration: t.is_completed ? 'line-through' : 'none', color: t.is_completed ? '#aaa' : '#000', flex: 1 }}>
                          {t.description} {t.due_date && <strong style={{ color: (!t.is_completed && (t.due_date === todayStr || isOverdue)) ? 'red' : '#555', marginLeft: '10px', fontSize: '12px', background: '#f8f9fa', padding: '2px 6px', borderRadius: '4px' }}>📅 {t.due_date}</strong>}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* 4. EMAIL & SABLONOK (ITT HASZNÁLJUK A FÜGGVÉNYEKET, HOGY NE LEGYEN ESLINT HIBA) */}
              <div style={{ background: '#eef9f0', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #c3e6cb' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#155724' }}>4. E-mail küldés (Sablonok)</h4>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                    <select value={selectedTplId} onChange={(e) => { setSelectedTplId(e.target.value); setEditingTplId(null); }} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">Válassz sablont...</option>
                        {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                    <button onClick={sendEmail} style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✉ Küldés</button>
                    {selectedTplId && (
                        <>
                          <button onClick={handleEditTemplateInit} style={{ padding: '10px 15px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="Szerkesztés">✏️</button>
                          <button onClick={handleDeleteTemplate} style={{ padding: '10px 15px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="Törlés">✖</button>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <strong style={{ fontSize: '13px', color: '#555' }}>{editingTplId ? 'Sablon szerkesztése' : 'Új sablon rögzítése az adatbázisba'}</strong>
                    <input type="text" placeholder="Sablon neve" value={newTplTitle} onChange={e => setNewTplTitle(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}/>
                    <input type="text" placeholder="E-mail tárgya" value={newTplSubject} onChange={e => setNewTplSubject(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}/>
                    <textarea placeholder="E-mail szövege..." value={newTplBody} onChange={e => setNewTplBody(e.target.value)} style={{ padding: '8px', minHeight: '80px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}></textarea>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                       <button onClick={handleSaveTemplate} style={{ flex: 1, padding: '10px', background: editingTplId ? '#ffc107' : '#6c757d', color: editingTplId ? '#000' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{editingTplId ? 'Módosítás mentése' : 'Mentés új sablonként'}</button>
                       {editingTplId && <button onClick={() => { setEditingTplId(null); setNewTplTitle(''); setNewTplSubject(''); setNewTplBody(''); }} style={{ padding: '10px', background: '#ddd', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}>Mégse</button>}
                    </div>
                </div>
              </div>

              {/* 5. DOKUMENTUMOK & PLAYBOOK */}
              <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '6px', border: '2px solid #b8daff' }}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#0c5460', borderBottom: '2px solid #b8daff', paddingBottom: '5px' }}>5. Dokumentumok & Playbook</h4>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                  <input type="text" placeholder="Fájl megnevezése..." value={newDocName} onChange={(e) => setNewDocName(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}/>
                  <input type="text" placeholder="URL Link..." value={newDocUrl} onChange={(e) => setNewDocUrl(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}/>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button onClick={() => handleAddDocument('offer')} style={{ flex: 1, padding: '10px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>+ Ajánlat</button>
                  <button onClick={() => handleAddDocument('contract')} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>+ Szerződés</button>
                  <button onClick={() => handleAddDocument('playbook')} style={{ flex: 1, padding: '10px', background: '#6f42c1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 5px rgba(111, 66, 193, 0.4)' }}>📘 + Playbook</button>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '14px' }}>
                  <div style={{ flex: '1 1 30%', background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #b8daff' }}>
                    <strong style={{ color: '#0c5460', display: 'block', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>📄 Ajánlatok</strong>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                      {documents.filter(d => d.doc_type === 'offer').length === 0 && <li style={{ color: '#aaa', listStyle: 'none', marginLeft: '-20px' }}>-</li>}
                      {documents.filter(d => d.doc_type === 'offer').map(d => (<li key={d.id} style={{ marginBottom: '8px' }}><a href={d.doc_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>{d.doc_name}</a> <button onClick={() => handleDeleteDocument(d.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}>✖</button></li>))}
                    </ul>
                  </div>
                  <div style={{ flex: '1 1 30%', background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #b8daff' }}>
                    <strong style={{ color: '#0c5460', display: 'block', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>🤝 Szerződések</strong>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                      {documents.filter(d => d.doc_type === 'contract').length === 0 && <li style={{ color: '#aaa', listStyle: 'none', marginLeft: '-20px' }}>-</li>}
                      {documents.filter(d => d.doc_type === 'contract').map(d => (<li key={d.id} style={{ marginBottom: '8px' }}><a href={d.doc_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>{d.doc_name}</a> <button onClick={() => handleDeleteDocument(d.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}>✖</button></li>))}
                    </ul>
                  </div>
                  <div style={{ flex: '1 1 30%', background: '#f3e8ff', padding: '15px', borderRadius: '6px', border: '2px solid #d8b4fe', boxShadow: 'inset 0 0 10px rgba(111, 66, 193, 0.05)' }}>
                    <strong style={{ color: '#6f42c1', display: 'block', marginBottom: '10px', borderBottom: '1px solid #d8b4fe', paddingBottom: '5px', fontSize: '16px' }}>📘 Kész Playbook</strong>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                      {documents.filter(d => d.doc_type === 'playbook').length === 0 && <li style={{ color: '#aaa', listStyle: 'none', marginLeft: '-20px' }}>Nincs feltöltve.</li>}
                      {documents.filter(d => d.doc_type === 'playbook').map(d => (<li key={d.id} style={{ marginBottom: '8px' }}><a href={d.doc_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#6f42c1', fontWeight: 'bold' }}>{d.doc_name}</a> <button onClick={() => handleDeleteDocument(d.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold' }}>✖</button></li>))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* JOBB OSZLOP: IDŐVONAL */}
            <div style={{ flex: '1 1 400px', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '600px' }}>
               <h3 style={{ margin: '0 0 25px 0', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Idővonal / Falbejegyzések</h3>
               {logs.length === 0 ? ( <p style={{ color: '#888', textAlign: 'center' }}>Még nincs esemény.</p> ) : (
                   <div style={{ position: 'relative', paddingLeft: '30px' }}>
                     <div style={{ position: 'absolute', top: '15px', bottom: '15px', left: '10px', width: '3px', background: '#e9ecef', borderRadius: '3px' }}></div>
                     {logs.map((log) => {
                       let dotColor = '#6c757d'; let icon = '💬';
                       if (log.action_type === 'FELADAT KÉSZ') { dotColor = '#28a745'; icon = '✅'; }
                       if (log.action_type === 'LEJÁRT FELADAT') { dotColor = '#dc3545'; icon = '⚠️'; }
                       if (log.action_type === 'STÁTUSZVÁLTÁS') { dotColor = '#ffc107'; icon = '🔄'; }
                       if (log.action_type === 'E-MAIL KÜLDVE') { dotColor = '#17a2b8'; icon = '✉️'; }
                       if (log.action_type === 'ÚJ FELADAT') { dotColor = '#007bff'; icon = '📌'; }
                       if (log.action_type === 'ÚJ DOKUMENTUM') { dotColor = '#6f42c1'; icon = '📄'; }

                       return (
                         <div key={log.id} style={{ position: 'relative', marginBottom: '20px', padding: '15px', background: log.action_type === 'LEJÁRT FELADAT' ? '#fff3cd' : '#fff', border: `1px solid ${log.action_type === 'LEJÁRT FELADAT' ? '#ffeeba' : '#eee'}`, borderRadius: '8px' }}>
                           <div style={{ position: 'absolute', left: '-31px', top: '15px', width: '22px', height: '22px', background: '#fff', borderRadius: '50%', border: `3px solid ${dotColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, fontSize: '10px' }}>{icon}</div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #f8f9fa', paddingBottom: '5px' }}>
                              <span style={{ fontWeight: 'bold', color: dotColor, fontSize: '12px' }}>{log.action_type}</span>
                              <span style={{ fontSize: '12px', color: '#888' }}>{new Date(log.created_at).toLocaleString()}</span>
                           </div>
                           <div style={{ fontSize: '14px', color: '#333', fontWeight: log.action_type === 'LEJÁRT FELADAT' ? 'bold' : 'normal' }}>{log.note}</div>
                         </div>
                       );
                     })}
                   </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;