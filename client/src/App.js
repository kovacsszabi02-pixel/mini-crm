import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mini-crm-44xt.onrender.com';

const STATUSES = ['1. Új lead', '2. Kapcsolatfelvétel alatt', '3. Tárgyalás', '4. Ajánlat kiküldés', '5. Szerződésírás', '6. Döntésre vár', '7. Díjbekérő', '8. Fizetésre vár', '9. Számlaírás', '10. Sablonírás', '11. Átadásra vár', '12. Teljesített', '13. Elveszített', '14. Konzílium', '15. Utánkövetés'];
const PERSONALITIES = ['Nincs megadva', 'Driver', 'Analitikus', 'Biztonsági játékos', 'Státuszvadász', 'Empatha', 'Innovátor', 'Költségérzékeny', 'Hatékonyságmániás', 'Szkeptikus', 'Örökségépítő', 'Belső Szabotőr', 'Egyéb'];
const LEAD_SOURCES = ['Válassz...', 'Networking', 'Üzleti klub', 'Ajánlás', 'Facebook Ads', 'LinkedIn', 'Cold Lead', 'Egyéb'];
const LOST_REASONS = ['Túl drága', 'Eltűnt', 'Konkurenciát választotta', 'Rossz időzítés', 'Egyéb'];

const getTodayStr = () => new Date().toISOString().split('T')[0];
const addDays = (dateStr, days) => { const d = new Date(dateStr); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0]; };
const getWorkingDaysLater = (days) => { let d = new Date(); let count = 0; while(count < days) { d.setDate(d.getDate() + 1); if(d.getDay() !== 0 && d.getDay() !== 6) count++; } return d.toISOString().split('T')[0]; };
const getDaysSince = (dateString) => { if (!dateString) return 0; return Math.floor(Math.abs(new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24)); };

function AddPartnerForm({ onPartnerAdded, theme }) {
 const [formData, setFormData] = useState({ company_name: '', contact_person: '', phone: '', email: '', website: '', revenue: '', tax_number: '', billing_address: '', headquarters: '', manager: '', accepted_offer: '', chosen_package: '', addons: '', personality_type: 'Nincs megadva', personality_custom: '', existing_system: '', discount_applied: false, discount_details: '', lead_source: 'Válassz...', lead_source_custom: '' });
 
 const handleChange = (e) => { const { name, value, type, checked } = e.target; if (name === 'phone') { setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9+\s]/g, '') })); return; } setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };

 const handleSubmit = async (e) => { 
     e.preventDefault(); 
     if(formData.lead_source === 'Válassz...') return alert("Kötelező kiválasztani a Lead Forrását!");
     if(formData.lead_source === 'Egyéb' && !formData.lead_source_custom) return alert("Írd be a pontos Lead forrást!");
     await fetch(`${BACKEND_URL}/api/partners`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); 
     setFormData({ company_name: '', contact_person: '', phone: '', email: '', website: '', revenue: '', tax_number: '', billing_address: '', headquarters: '', manager: '', accepted_offer: '', chosen_package: '', addons: '', personality_type: 'Nincs megadva', personality_custom: '', existing_system: '', discount_applied: false, discount_details: '', lead_source: 'Válassz...', lead_source_custom: '' }); 
     onPartnerAdded(); 
 };

 const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText };

 return (
 <div style={{ background: theme.cardBg, color: theme.text, padding: '20px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${theme.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
 <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', color: '#007bff', marginTop: 0 }}>➕ Új Partner Rögzítése</h3>
 <form onSubmit={handleSubmit}>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
 <div style={{ flex: '1 1 100%' }}><strong style={{ fontSize: '13px', color: theme.text, borderBottom: `1px solid ${theme.border}`, display: 'block', paddingBottom: '5px' }}>👤 Alapadatok & Elérhetőségek</strong></div>
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Cégnév *</label><input name="company_name" value={formData.company_name} onChange={handleChange} required style={inputStyle}/></div>
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Döntéshozó *</label><br/><input name="contact_person" value={formData.contact_person} onChange={handleChange} required style={inputStyle}/></div>
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Telefonszám *</label><br/><input name="phone" value={formData.phone} onChange={handleChange} required style={inputStyle}/></div>
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email</label><br/><input name="email" type="email" value={formData.email} onChange={handleChange} style={inputStyle}/></div>
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#dc3545' }}>Lead Forrás *</label><br/><select name="lead_source" value={formData.lead_source} onChange={handleChange} required style={inputStyle}>{LEAD_SOURCES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
 {formData.lead_source === 'Egyéb' && <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#dc3545' }}>Pontos forrás megnevezése *</label><br/><input name="lead_source_custom" value={formData.lead_source_custom} onChange={handleChange} required style={inputStyle}/></div>}
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Értékesítő (Manager)</label><br/><input name="manager" value={formData.manager} onChange={handleChange} style={inputStyle}/></div>
 </div>

 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
 <div style={{ flex: '1 1 100%' }}><strong style={{ fontSize: '13px', color: theme.text, borderBottom: `1px solid ${theme.border}`, display: 'block', paddingBottom: '5px' }}>🏢 Cégadatok & Pénzügy</strong></div>
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Árbevétel</label><br/><input name="revenue" value={formData.revenue} onChange={handleChange} style={inputStyle}/></div>
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Adószám</label><br/><input name="tax_number" value={formData.tax_number} onChange={handleChange} style={inputStyle}/></div>
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Székhely</label><br/><input name="headquarters" value={formData.headquarters} onChange={handleChange} style={inputStyle}/></div>
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Számlázási cím</label><br/><input name="billing_address" value={formData.billing_address} onChange={handleChange} style={inputStyle}/></div>
 </div>

 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
 <div style={{ flex: '1 1 100%' }}><strong style={{ fontSize: '13px', color: theme.text, borderBottom: `1px solid ${theme.border}`, display: 'block', paddingBottom: '5px' }}>🧠 CRM Paraméterek</strong></div>
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Személyiségtípus</label><br/><select name="personality_type" value={formData.personality_type} onChange={handleChange} style={inputStyle}>{PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
 {formData.personality_type === 'Egyéb' && <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Személyiség (Saját) *</label><br/><input name="personality_custom" value={formData.personality_custom} onChange={handleChange} required style={inputStyle}/></div>}
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Meglévő Rendszer</label><br/><input name="existing_system" value={formData.existing_system} onChange={handleChange} style={inputStyle}/></div>
 </div>

 <div style={{ background: theme.subBg, padding: '15px', borderRadius: '6px', display: 'flex', flexWrap: 'wrap', gap: '10px', border: `1px solid ${theme.border}` }}>
 <div style={{ flex: '1 1 100%' }}><strong style={{ fontSize: '13px', color: theme.text }}>📦 Üzleti & Csomag Paraméterek</strong></div>
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0056b3' }}>Választott Csomag</label><br/><input name="chosen_package" value={formData.chosen_package} onChange={handleChange} style={inputStyle}/></div>
 <div style={{ flex: '1 1 22%', minWidth: '200px' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0056b3' }}>Kiegészítők</label><br/><input name="addons" value={formData.addons} onChange={handleChange} style={inputStyle}/></div>
 <div style={{ flex: '1 1 22%', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}><input type="checkbox" name="discount_applied" checked={formData.discount_applied} onChange={handleChange} style={{ transform: 'scale(1.4)' }}/><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#28a745' }}>🏷️ Kedvezmény volt?</label></div>
 {formData.discount_applied && ( <div style={{ flex: '1 1 100%' }}><input name="discount_details" placeholder="Kedvezmény indoklása..." value={formData.discount_details} onChange={handleChange} style={inputStyle}/></div> )}
 </div>
 <div style={{ marginTop: '15px' }}><button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Partner Rögzítése</button></div>
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

 const editInputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, boxSizing: 'border-box' };

 const fetchPartners = async () => { const res = await fetch(`${BACKEND_URL}/api/partners`); setPartners(await res.json()); };
 const fetchLogs = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/logs`); setLogs(await res.json()); };
 const fetchTasksAndLogs = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/tasks`); setTasks(await res.json()); fetchLogs(id); fetchTodayTasks(); };
 const fetchDocuments = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/documents`); setDocuments(await res.json()); };
 const fetchConsultations = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/consultations`); setConsultations(await res.json()); };
 const fetchTodayTasks = async () => { const res = await fetch(`${BACKEND_URL}/api/tasks/today`); setTodayTasks(await res.json()); };

 useEffect(() => { fetchPartners(); fetchTodayTasks(); }, []);
 useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

 const handleSelectPartner = (partner) => {
 setSelectedPartner(partner); setPlainNote(''); setNewTaskDesc(''); setNewTaskDate(''); setNewDocName(''); setNewDocUrl(''); setNewDocNote('');
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
 
 const payload = { status: pendingStatus, note: finalNote, ...triggerData };
 const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
 
 if(res.ok) {
 const updated = await res.json(); setSelectedPartner(updated); setShowStatusModal(false); fetchPartners();
 const postTask = async (desc, date) => { await fetch(`${BACKEND_URL}/api/partners/${updated.id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: desc, due_date: date }) }); };

 if (pendingStatus === '2. Kapcsolatfelvétel alatt') {
     const isCold = updated.lead_source === 'Cold Lead';
     const days = isCold ? 2 : 0;
     const desc = isCold ? 'Megkeresés (2 munkanapon belül)' : 'Megkeresés (2 órán belül!)';
     await postTask(desc, getWorkingDaysLater(days));
 }
 if (pendingStatus === '3. Tárgyalás') {
     if(triggerData.meeting_date) await postTask('Tárgyalás biztosítása (Hívás)', addDays(triggerData.meeting_date, -1));
 }
 if (pendingStatus === '4. Ajánlat kiküldés') {
     await postTask('Ajánlat feltöltése a rendszerbe', getTodayStr());
 }
 if (pendingStatus === '5. Szerződésírás') {
     await postTask('Szerződés megírása és elküldése', getTodayStr());
     await postTask('Szerződés PDF felcsatolása', getTodayStr());
 }
 if (pendingStatus === '6. Döntésre vár') {
     if (updated.contract_deadline) await postTask('Hívás: Segítség / Miért nem döntött?', addDays(updated.contract_deadline, -1));
 }
 if (pendingStatus === '7. Díjbekérő') {
     await postTask('Díjbekérő kiállítása', getTodayStr());
     await postTask('Díjbekérő felcsatolása', getTodayStr());
     await postTask('Díjbekérő elküldése', getTodayStr());
 }
 if (pendingStatus === '8. Fizetésre vár') {
     if (updated.expected_payment) await postTask('Egyeztetés: Mi az elakadás a fizetéssel?', addDays(updated.expected_payment, -1));
 }
 if (pendingStatus === '9. Számlaírás') {
     await postTask('Számla kiállítása', getTodayStr());
     await postTask('Számla felcsatolása', getTodayStr());
     await postTask('Számla elküldése', getTodayStr());
 }
 if (pendingStatus === '11. Átadásra vár') {
     await postTask('Átadás megbeszélése (Hívás)', getTodayStr());
 }
 if (pendingStatus === '15. Utánkövetés') {
     await postTask('Utánkövető hívás (Hogy haladnak?)', addDays(getTodayStr(), 60));
 }
 
 fetchTasksAndLogs(updated.id);
 }
 };

 const handleGhosting = async () => {
 if(!window.confirm("ZOMBIE LEAD SWEEPER: Eltűnt státuszba teszed?")) return;
 const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: '13. Elveszített', lost_reason: 'Eltűnt', note: 'ZOMBIE LEAD - Eltűnt' }) });
 if(res.ok) { await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: 'ÚJRAÉLESZTÉS (Zombie Lead)', due_date: addDays(getTodayStr(), 30) }) }); setSelectedPartner(await res.json()); fetchPartners(); fetchTasksAndLogs(selectedPartner.id); }
 };

 const handleSaveEdit = async (e) => { e.preventDefault(); const res = await fetch(`${BACKEND_URL}/api/partners/${editingPartner.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingPartner) }); if (res.ok) { const updated = await res.json(); if (selectedPartner?.id === updated.id) setSelectedPartner(updated); setEditingPartner(null); fetchPartners(); } };
 const handleDeletePartner = async (id) => { if (!window.confirm("Biztosan törlöd ezt a partnert?")) return; const res = await fetch(`${BACKEND_URL}/api/partners/${id}`, { method: 'DELETE' }); if (res.ok) { if (selectedPartner?.id === id) setSelectedPartner(null); fetchPartners(); fetchTodayTasks(); } };
 const handleAddPlainNote = async () => { if (!plainNote.trim()) return; const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: plainNote, action_type: 'MEGJEGYZÉS' }) }); if (res.ok) { setPlainNote(''); fetchLogs(selectedPartner.id); fetchPartners(); } };
 const handleAddTask = async () => { if (!newTaskDesc.trim()) return; const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: newTaskDesc, due_date: newTaskDate }) }); if (res.ok) { setNewTaskDesc(''); setNewTaskDate(''); fetchTasksAndLogs(selectedPartner.id); } };
 const completeTask = async (taskId) => { await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/tasks/${taskId}/complete`, { method: 'PUT' }); fetchTasksAndLogs(selectedPartner.id); fetchPartners(); fetchTodayTasks(); };
 
 const handleAddDocument = async (docType) => {
 if (!newDocName.trim() || !newDocUrl.trim()) return alert('Adj meg nevet és linket!');
 const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doc_type: docType, doc_name: newDocName, doc_url: newDocUrl, doc_note: newDocNote }) });
 if (res.ok) { setNewDocName(''); setNewDocUrl(''); setNewDocNote(''); fetchDocuments(selectedPartner.id); fetchLogs(selectedPartner.id); }
 };
 const handleDeleteDocument = async (docId) => { if (!window.confirm("Törlöd a dokumentumot?")) return; const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/documents/${docId}`, { method: 'DELETE' }); if (res.ok) fetchDocuments(selectedPartner.id); };

 const handleAddConsilium = async () => {
    if (!newConsilDate || !newConsilNote.trim()) return alert("Dátum és megjegyzés kötelező!");
    const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/consultations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scheduled_date: newConsilDate, notes: newConsilNote }) });
    if (res.ok) { setNewConsilDate(''); setNewConsilNote(''); fetchConsultations(selectedPartner.id); }
 };

 const handleConsiliumNoteChange = (id, value) => {
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, notes: value } : c));
 };

 const saveConsiliumNote = async (id) => {
    const cons = consultations.find(c => c.id === id);
    if (!cons) return;
    await fetch(`${BACKEND_URL}/api/consultations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cons) });
    fetchConsultations(selectedPartner.id);
 };

 const updateConsiliumField = async (id, field, value) => {
    const cons = consultations.find(c => c.id === id);
    const updated = { ...cons, [field]: value };
    setConsultations(prev => prev.map(c => c.id === id ? updated : c));
    await fetch(`${BACKEND_URL}/api/consultations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
    fetchConsultations(selectedPartner.id);
 };

 const deleteConsilium = async (id) => { if(!window.confirm("Törlöd?")) return; await fetch(`${BACKEND_URL}/api/consultations/${id}`, { method: 'DELETE' }); fetchConsultations(selectedPartner.id); };

 const filteredPartners = partners.filter(p => {
 const term = searchTerm.toLowerCase();
 const matchesSearch = ((p.company_name?.toLowerCase() || '').includes(term) || (p.contact_person?.toLowerCase() || '').includes(term) || (p.phone?.toLowerCase() || '').includes(term) || (p.email?.toLowerCase() || '').includes(term) || (p.tax_number?.toLowerCase() || '').includes(term) || (p.website?.toLowerCase() || '').includes(term) || (p.chosen_package?.toLowerCase() || '').includes(term) || (p.addons?.toLowerCase() || '').includes(term) || (p.billing_address?.toLowerCase() || '').includes(term));
 return matchesSearch && (statusFilter === '' || p.status === statusFilter);
 });
 
 const currentPartners = filteredPartners.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
 const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);

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
 <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto', background: theme.bg, color: theme.text, minHeight: '100vh', transition: 'background 0.3s, color 0.3s' }}>
 
 {showStatusModal && (
 <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <div style={{ background: theme.cardBg, color: theme.text, padding: '30px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', width: '500px', borderTop: '4px solid #ffc107' }}>
 <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>🔄 Státusz Váltás: {pendingStatus}</h2>
 <form onSubmit={executeStatusChange}>
 
 {pendingStatus === '3. Tárgyalás' && (
 <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold', fontSize: '13px' }}>🗓️ Tárgyalás pontos dátuma *</label><br/><input type="date" required value={triggerData.meeting_date} onChange={e => setTriggerData({...triggerData, meeting_date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, marginBottom: '8px', boxSizing: 'border-box' }}/><input type="text" placeholder="Mi történt eddig? *" required value={triggerData.details} onChange={e => setTriggerData({...triggerData, details: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, boxSizing: 'border-box' }}/></div>
 )}
 {pendingStatus === '4. Ajánlat kiküldés' && (
 <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold', fontSize: '13px' }}>⏳ Ajánlat érvényessége *</label><br/><input type="date" required value={triggerData.offer_validity} onChange={e => setTriggerData({...triggerData, offer_validity: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, boxSizing: 'border-box' }}/></div>
 )}
 {pendingStatus === '5. Szerződésírás' && (
 <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold', fontSize: '13px' }}>⏳ Meddig várunk az elfogadásra? *</label><br/><input type="date" required value={triggerData.contract_deadline} onChange={e => setTriggerData({...triggerData, contract_deadline: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, boxSizing: 'border-box' }}/></div>
 )}
 {pendingStatus === '7. Díjbekérő' && (
 <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold', fontSize: '13px' }}>⏳ Meddig érvényes a díjbekérő? *</label><br/><input type="date" required value={triggerData.proforma_validity} onChange={e => setTriggerData({...triggerData, proforma_validity: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, boxSizing: 'border-box' }}/></div>
 )}
 {pendingStatus === '8. Fizetésre vár' && (
 <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold', fontSize: '13px' }}>💰 Fizetési Határidő dátuma *</label><br/><input type="date" required value={triggerData.expected_payment} onChange={e => setTriggerData({...triggerData, expected_payment: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, boxSizing: 'border-box' }}/></div>
 )}
 {pendingStatus === '10. Sablonírás' && (
 <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold', fontSize: '13px' }}>🚚 Átadási határidő *</label><br/><input type="date" required value={triggerData.handover_deadline} onChange={e => setTriggerData({...triggerData, handover_deadline: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, boxSizing: 'border-box' }}/></div>
 )}
 {pendingStatus === '13. Elveszített' && (
 <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold', fontSize: '13px', color: '#dc3545' }}>❌ KÖTELEZŐ INDOKLÁS *</label><br/><select required value={triggerData.reason} onChange={e => setTriggerData({...triggerData, reason: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, marginBottom: '8px' }}><option value="">Válassz okot...</option>{LOST_REASONS.map(r => <option key={r} value={r}>{r}</option>)}</select><input type="text" placeholder="Részletek..." required value={triggerData.details} onChange={e => setTriggerData({...triggerData, details: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, boxSizing: 'border-box' }}/></div>
 )}
 
 {!['3. Tárgyalás', '4. Ajánlat kiküldés', '5. Szerződésírás', '7. Díjbekérő', '8. Fizetésre vár', '10. Sablonírás', '12. Teljesített', '13. Elveszített'].includes(pendingStatus) && (
 <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold', fontSize: '13px' }}>📅 Következő interakció határideje *</label><br/><input type="date" required value={triggerData.next_interaction} onChange={e => setTriggerData({...triggerData, next_interaction: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, boxSizing: 'border-box' }}/></div>
 )}

 <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
 <button type="submit" style={{ flex: 1, padding: '12px', background: '#28a745', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✓ Végrehajtás</button>
 <button type="button" onClick={() => setShowStatusModal(false)} style={{ padding: '12px', background: '#6c757d', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Mégse</button>
 </div>
 </form>
 </div>
 </div>
 )}

 {editingPartner && (
 <div style={{ background: theme.subBg, padding: '20px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
 <h3 style={{ borderBottom: '2px solid #ffc107', paddingBottom: '10px', color: '#ffc107', marginTop: 0 }}>✏️ Szerkesztés: {editingPartner.company_name}</h3>
 <form onSubmit={handleSaveEdit}>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Cégnév</label><br/><input value={editingPartner.company_name || ''} onChange={(e) => setEditingPartner({...editingPartner, company_name: e.target.value})} required style={editInputStyle}/></div>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Döntéshozó</label><br/><input value={editingPartner.contact_person || ''} onChange={(e) => setEditingPartner({...editingPartner, contact_person: e.target.value})} required style={editInputStyle}/></div>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Telefon</label><br/><input value={editingPartner.phone || ''} onChange={(e) => setEditingPartner({...editingPartner, phone: e.target.value.replace(/[^0-9+\s]/g, '')})} required style={editInputStyle}/></div>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>E-mail</label><br/><input type="email" value={editingPartner.email || ''} onChange={(e) => setEditingPartner({...editingPartner, email: e.target.value})} style={editInputStyle}/></div>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Lead Forrás *</label><br/><select value={editingPartner.lead_source || 'Válassz...'} onChange={(e) => setEditingPartner({...editingPartner, lead_source: e.target.value})} required style={editInputStyle}>{LEAD_SOURCES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
 {editingPartner.lead_source === 'Egyéb' && <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Lead Forrás (Saját) *</label><br/><input value={editingPartner.lead_source_custom || ''} onChange={(e) => setEditingPartner({...editingPartner, lead_source_custom: e.target.value})} required style={editInputStyle}/></div>}
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Weboldal</label><br/><input value={editingPartner.website || ''} onChange={(e) => setEditingPartner({...editingPartner, website: e.target.value})} style={editInputStyle}/></div>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Árbevétel</label><br/><input value={editingPartner.revenue || ''} onChange={(e) => setEditingPartner({...editingPartner, revenue: e.target.value})} style={editInputStyle}/></div>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Adószám</label><br/><input value={editingPartner.tax_number || ''} onChange={(e) => setEditingPartner({...editingPartner, tax_number: e.target.value})} style={editInputStyle}/></div>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Székhely</label><br/><input value={editingPartner.headquarters || ''} onChange={(e) => setEditingPartner({...editingPartner, headquarters: e.target.value})} style={editInputStyle}/></div>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Számlázási cím</label><br/><input value={editingPartner.billing_address || ''} onChange={(e) => setEditingPartner({...editingPartner, billing_address: e.target.value})} style={editInputStyle}/></div>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Értékesítő (Manager)</label><br/><input value={editingPartner.manager || ''} onChange={(e) => setEditingPartner({...editingPartner, manager: e.target.value})} style={editInputStyle}/></div>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Személyiségtípus</label><br/><select value={editingPartner.personality_type || 'Nincs megadva'} onChange={(e) => setEditingPartner({...editingPartner, personality_type: e.target.value})} style={editInputStyle}>{PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
 {editingPartner.personality_type === 'Egyéb' && <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Személyiség (Saját) *</label><br/><input value={editingPartner.personality_custom || ''} onChange={(e) => setEditingPartner({...editingPartner, personality_custom: e.target.value})} required style={editInputStyle}/></div>}
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Meglévő rendszer</label><br/><input value={editingPartner.existing_system || ''} onChange={(e) => setEditingPartner({...editingPartner, existing_system: e.target.value})} style={editInputStyle}/></div>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Elfogadott árajánlat</label><br/><input value={editingPartner.accepted_offer || ''} onChange={(e) => setEditingPartner({...editingPartner, accepted_offer: e.target.value})} style={editInputStyle}/></div>
 <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Csomag</label><br/><input value={editingPartner.chosen_package || ''} onChange={(e) => setEditingPartner({...editingPartner, chosen_package: e.target.value})} style={editInputStyle}/></div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px' }}><input type="checkbox" checked={editingPartner.discount_applied || false} onChange={(e) => setEditingPartner({...editingPartner, discount_applied: e.target.checked})} style={{ transform: 'scale(1.4)' }}/><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Kedvezmény volt?</label></div>
 {editingPartner.discount_applied && ( <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Kedvezmény oka</label><br/><input value={editingPartner.discount_details || ''} onChange={(e) => setEditingPartner({...editingPartner, discount_details: e.target.value})} style={editInputStyle}/></div> )}
 </div>
 <div style={{ display: 'flex', gap: '10px' }}>
 <button type="submit" style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Mentés</button>
 <button type="button" onClick={() => setEditingPartner(null)} style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Mégse</button>
 </div>
 </form>
 </div>
 )}

 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #007bff', paddingBottom: '10px', marginBottom: '20px' }}>
 <h1 style={{ margin: 0 }}>📊 CRM</h1>
 <div style={{ display: 'flex', gap: '8px', background: theme.subBg, padding: '5px 10px', borderRadius: '20px', border: `1px solid ${theme.border}`, cursor: 'pointer', fontSize: '18px' }}>
 <span onClick={() => setDarkMode(false)} title="Világos mód" style={{ opacity: !darkMode ? 1 : 0.4 }}>☀️</span>
 <span onClick={() => setDarkMode(true)} title="Sötét mód" style={{ opacity: darkMode ? 1 : 0.4 }}>🌙</span>
 </div>
 </div>

 <AddPartnerForm onPartnerAdded={fetchPartners} theme={theme} />

 <div style={{ background: theme.cardBg, border: `1px solid ${darkMode ? '#552222' : '#f5c6cb'}`, padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
 <h3 style={{ marginTop: 0, color: '#dc3545', borderBottom: '2px solid #f5c6cb', paddingBottom: '10px' }}>🔥 Mai & Lejárt Feladatok ({todayTasks.length})</h3>
 {todayTasks.length === 0 ? ( <p style={{ color: '#28a745', fontWeight: 'bold', margin: 0 }}>🎉 Szép munka! Nincs mára esedékes vagy lejárt feladatod.</p> ) : (
 <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
 {todayTasks.map(t => (
 <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', background: theme.subBg, borderRadius: '6px', border: `1px solid ${theme.border}`, marginBottom: '8px' }}>
 <input type="checkbox" onChange={async () => { await fetch(`${BACKEND_URL}/api/partners/${t.partner_id}/tasks/${t.id}/complete`, { method: 'PUT' }); fetchTodayTasks(); fetchPartners(); if (selectedPartner && selectedPartner.id === t.partner_id) { fetchTasksAndLogs(t.partner_id); } }} style={{ transform: 'scale(1.4)', cursor: 'pointer' }} title="Készre jelölés" />
 <div>
 <strong style={{ display: 'block', fontSize: '15px' }}>🏢 {t.company_name}</strong>
 <span style={{ fontSize: '14px' }}>📌 {t.description}</span>
 <span style={{ marginLeft: '15px', fontSize: '12px', color: '#dc3545', fontWeight: 'bold', background: darkMode ? '#3a1111' : '#ffe6e6', padding: '2px 6px', borderRadius: '4px' }}>⏳ Határidő: {t.due_date}</span>
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>

 <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
 <h2 style={{ marginTop: 0 }}>📋 Partnerek Listája</h2>
 <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
 <input type="text" placeholder="🔍 Keresés (cégnév, döntéshozó, csomag, tel, email...)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, fontSize: '14px' }}/>
 <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, fontSize: '14px' }}>
 <option value="">Összes státusz</option>
 {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
 </select>
 </div>
 <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', borderColor: theme.border }}>
 <thead style={{ background: theme.tableHeadBg, color: '#fff' }}><tr><th>Cégnév / Csomag</th><th>Státusz</th><th>SLA / Inaktivitás</th><th>Műveletek</th></tr></thead>
 <tbody>
 {currentPartners.length === 0 ? (<tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Nincs találat.</td></tr>) : (
 currentPartners.map(p => {
 const inactiveDays = getDaysSince(p.last_interaction_at);
 const isActive = !['12. Teljesített', '13. Elveszített'].includes(p.status);
 const isBreach = isActive && inactiveDays >= 3;
 return (
 <tr key={p.id} style={{ background: isBreach ? (darkMode ? '#3a1111' : '#fff5f5') : theme.cardBg, transition: 'background 0.2s' }}>
 <td><strong style={{ fontSize: '15px', color: '#007bff' }}>{p.company_name}</strong><br/><span style={{ fontSize: '12px', opacity: 0.7 }}>📦 {p.chosen_package || 'Nincs csomag'} | 🧠 {p.personality_type === 'Egyéb' ? p.personality_custom : p.personality_type || 'Nincs'}</span></td>
 <td><span style={{ padding: '4px 8px', background: theme.subBg, borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>🏷️ {p.status}</span></td>
 <td style={{ color: isBreach ? '#dc3545' : '#28a745', fontWeight: isBreach ? 'bold' : 'normal' }}>{isBreach ? `⚠️ ${inactiveDays} napja inaktív!` : `✅ ${inactiveDays} napja aktív`}</td>
 <td style={{ display: 'flex', gap: '5px' }}>
 <button onClick={() => handleSelectPartner(p)} style={{ background: '#007bff', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>📂 Munkaterület</button>
 <button onClick={() => setEditingPartner(p)} style={{ background: '#ffc107', color: '#000', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✏️ Szerkeszt</button>
 </td>
 </tr>
 )
 })
 )}
 </tbody>
 </table>
 {totalPages > 1 && (
 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
 <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }}>← Előző</button>
 <span>Oldal: <strong>{currentPage}</strong> / {totalPages}</span>
 <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }}>Következő →</button>
 </div>
 )}
 </div>

 {selectedPartner && (
 <div id="partner-workspace" style={{ borderTop: '4px solid #007bff', paddingTop: '30px', marginTop: '20px', background: theme.cardBg, color: theme.text, padding: '25px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
 
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: `2px solid ${theme.border}`, paddingBottom: '15px' }}>
 <div>
 <h2 style={{ margin: 0, fontSize: '26px' }}>🏢 {selectedPartner.company_name}</h2>
 <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
 <div style={{ background: theme.subBg, padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}` }}><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', opacity: 0.7 }}>⏳ LEAD KORA</span><span style={{ fontSize: '16px', fontWeight: 'bold' }}>{getDaysSince(selectedPartner.created_at)} nap</span></div>
 <div style={{ background: getDaysSince(selectedPartner.last_interaction_at) >= 3 ? (darkMode ? '#3a1111' : '#ffe6e6') : theme.subBg, padding: '8px 12px', borderRadius: '6px', border: `1px solid ${getDaysSince(selectedPartner.last_interaction_at) >= 3 ? '#dc3545' : theme.border}` }}>
 <span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', color: getDaysSince(selectedPartner.last_interaction_at) >= 3 ? '#dc3545' : '' }}>⚡ INAKTÍV IDŐ</span>
 <span style={{ fontSize: '16px', fontWeight: 'bold', color: getDaysSince(selectedPartner.last_interaction_at) >= 3 ? '#dc3545' : '' }}>{getDaysSince(selectedPartner.last_interaction_at)} nap</span>
 </div>
 </div>
 </div>
 <div style={{ display: 'flex', gap: '10px' }}>
 <button onClick={() => handleDeletePartner(selectedPartner.id)} style={{ padding: '10px 15px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>🗑️ Törlés</button>
 <button onClick={handleGhosting} style={{ padding: '10px 15px', background: '#6f42c1', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>☠️ Zombie Lead (Eltűnt)</button>
 </div>
 </div>

 <div style={{ background: theme.subBg, padding: '20px', borderRadius: '8px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
 <h4 style={{ margin: '0 0 15px 0', borderBottom: `2px solid ${theme.border}`, paddingBottom: '8px', color: '#007bff' }}>👤 Partner Adatlap</h4>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
 <div><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', opacity: 0.6 }}>LEAD FORRÁS</span><span style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedPartner.lead_source === 'Egyéb' ? selectedPartner.lead_source_custom : selectedPartner.lead_source || '-'}</span></div>
 <div><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', opacity: 0.6 }}>DÖNTÉSHOZÓ</span><span style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedPartner.contact_person || '-'}</span></div>
 <div><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', opacity: 0.6 }}>TELEFON</span><span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedPartner.phone || '-'}</span></div>
 <div><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', opacity: 0.6 }}>E-MAIL</span><span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedPartner.email || '-'}</span></div>
 <div><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', opacity: 0.6 }}>SZEMÉLYISÉG</span><span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedPartner.personality_type === 'Egyéb' ? selectedPartner.personality_custom : selectedPartner.personality_type || '-'}</span></div>
 <div><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', opacity: 0.6 }}>WEBOLDAL</span><span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedPartner.website || '-'}</span></div>
 <div><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', opacity: 0.6 }}>ÁRBEVÉTEL</span><span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedPartner.revenue || '-'}</span></div>
 <div><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', opacity: 0.6 }}>ADÓSZÁM</span><span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedPartner.tax_number || '-'}</span></div>
 <div><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', opacity: 0.6 }}>SZÉKHELY</span><span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedPartner.headquarters || '-'}</span></div>
 <div><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', opacity: 0.6 }}>ÉRTÉKESÍTŐ</span><span style={{ fontSize: '14px', fontWeight: '500', color: '#28a745' }}>{selectedPartner.manager || '-'}</span></div>
 </div>
 </div>

 <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
 <div style={{ flex: '1 1 500px' }}>
 
 <div style={{ background: theme.subBg, padding: '15px', borderRadius: '6px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
 <h4 style={{ marginTop: 0, borderBottom: `1px solid ${theme.border}`, paddingBottom: '8px' }}>🔄 Státusz Váltás & Gyors Megjegyzés</h4>
 <select value={selectedPartner.status} onChange={handleStatusChangeInit} style={{ width: '100%', padding: '12px', fontSize: '15px', borderRadius: '4px', border: `1px solid ${theme.border}`, fontWeight: 'bold', marginBottom: '10px', background: theme.inputBg, color: theme.inputText }}>{STATUSES.map(st => <option key={st} value={st}>{st}</option>)}</select>
 <div style={{ display: 'flex', gap: '5px' }}>
 <input type="text" placeholder="💬 Írj egy gyors megjegyzést a falra..." value={plainNote} onChange={(e) => setPlainNote(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }}/>
 <button onClick={handleAddPlainNote} style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Rögzítés</button>
 </div>
 </div>

 <div style={{ background: theme.subBg, padding: '15px', borderRadius: '6px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
 <h4 style={{ marginTop: 0, borderBottom: `1px solid ${theme.border}`, paddingBottom: '8px' }}>📌 Kötelező Feladatok</h4>
 <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
 <input type="text" placeholder="Új feladat leírása..." value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} style={{ flex: 2, padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }}/>
 <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }}/>
 <button onClick={handleAddTask} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Hozzáad</button>
 </div>
 <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
 {tasks.map(t => (
 <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: theme.cardBg, borderRadius: '4px', border: `1px solid ${theme.border}`, marginBottom: '8px' }}>
 <input type="checkbox" checked={t.is_completed} disabled={t.is_completed} onChange={() => completeTask(t.id)} style={{ transform: 'scale(1.4)', cursor: t.is_completed ? 'default' : 'pointer' }} />
 <div>
 <strong style={{ display: 'block', fontSize: '15px', textDecoration: t.is_completed ? 'line-through' : 'none', color: t.is_completed ? '#888' : theme.text }}>{t.description}</strong>
 <span style={{ fontSize: '12px', color: (t.due_date < getTodayStr() && !t.is_completed) ? '#dc3545' : '', fontWeight: 'bold' }}>📅 Határidő: {t.due_date}</span>
 </div>
 </li>
 ))}
 </ul>
 </div>

 <div style={{ background: theme.subBg, padding: '15px', borderRadius: '6px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
 <h4 style={{ marginTop: 0, borderBottom: `1px solid ${theme.border}`, paddingBottom: '8px', color: '#17a2b8' }}>🧑‍⚕️ Konzíliumok</h4>
 <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
 <input type="date" value={newConsilDate} onChange={e => setNewConsilDate(e.target.value)} style={{ flex: '1 1 140px', padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }}/>
 <input type="text" placeholder="Kötelező megjegyzés (mi történt?)..." value={newConsilNote} onChange={e => setNewConsilNote(e.target.value)} style={{ flex: '2 1 250px', padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }}/>
 <button onClick={handleAddConsilium} style={{ padding: '8px 15px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>➕</button>
 </div>
 {consultations.length === 0 ? <p style={{ fontSize: '13px', opacity: 0.7 }}>Nincs rögzített konzílium.</p> : (
 <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
 {consultations.map(c => (
 <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: theme.cardBg, borderRadius: '4px', border: `1px solid ${theme.border}`, marginBottom: '8px', flexWrap: 'wrap' }}>
 <input type="checkbox" checked={c.is_completed} disabled={c.is_completed} onChange={(e) => updateConsiliumField(c.id, 'is_completed', e.target.checked)} style={{ transform: 'scale(1.3)' }} title="Lezárás"/>
 <input type="date" value={c.scheduled_date} disabled={c.is_completed} onChange={(e) => updateConsiliumField(c.id, 'scheduled_date', e.target.value)} style={{ padding: '6px', border: `1px solid ${theme.border}`, borderRadius: '4px', background: c.is_completed ? 'transparent' : theme.inputBg, color: theme.inputText }}/>
 <input type="text" value={c.notes} disabled={c.is_completed} onChange={(e) => handleConsiliumNoteChange(c.id, e.target.value)} onBlur={() => saveConsiliumNote(c.id)} style={{ flex: '1 1 200px', minWidth: '180px', padding: '6px', border: `1px solid ${theme.border}`, borderRadius: '4px', textDecoration: c.is_completed ? 'line-through' : 'none', background: c.is_completed ? 'transparent' : theme.inputBg, color: theme.inputText }}/>
 {!c.is_completed && <button onClick={() => deleteConsilium(c.id)} style={{ padding: '6px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>➖</button>}
 </li>
 ))}
 </ul>
 )}
 </div>

 <div style={{ background: theme.subBg, padding: '15px', borderRadius: '6px', border: `1px solid ${theme.border}` }}>
 <h4 style={{ marginTop: 0, borderBottom: `1px solid ${theme.border}`, paddingBottom: '8px' }}>📂 Dokumentumok, PDF-ek & Playbook</h4>
 <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', flexWrap: 'wrap' }}>
 <input type="text" placeholder="Fájl neve..." value={newDocName} onChange={e => setNewDocName(e.target.value)} style={{ flex: 1, minWidth: '130px', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }}/>
 <input type="text" placeholder="Link..." value={newDocUrl} onChange={e => setNewDocUrl(e.target.value)} style={{ flex: 2, minWidth: '150px', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }}/>
 <input type="text" placeholder="Megjegyzés..." value={newDocNote} onChange={e => setNewDocNote(e.target.value)} style={{ flex: 2, minWidth: '150px', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }}/>
 </div>
 <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
 <button onClick={() => handleAddDocument('offer')} style={{ flex: 1, padding: '10px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>+ Ajánlat</button>
 <button onClick={() => handleAddDocument('contract')} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>+ Szerződés</button>
 <button onClick={() => handleAddDocument('playbook')} style={{ flex: 1, padding: '10px', background: '#6f42c1', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>+ Playbook</button>
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
 {['offer', 'contract', 'playbook'].map(type => (
 <div key={type} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '10px', borderRadius: '4px' }}>
 <strong style={{ textTransform: 'uppercase', fontSize: '12px' }}>{type === 'offer' ? '📄 Ajánlatok' : type === 'contract' ? '🤝 Szerződések' : '📘 Playbook'}</strong>
 <ul style={{ paddingLeft: '20px', margin: 0, marginTop: '8px', fontSize: '12px' }}>
 {documents.filter(d => d.doc_type === type).map(d => (
 <li key={d.id} style={{ marginBottom: '6px' }}>
 <a href={d.doc_url} target="_blank" rel="noreferrer" style={{ color: '#007bff', fontWeight: 'bold' }}>{d.doc_name}</a>
 {d.doc_note && <span style={{ display: 'block', fontSize: '11px', opacity: 0.8 }}>💬 {d.doc_note}</span>}
 <button onClick={() => handleDeleteDocument(d.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>✖</button>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 </div>

 </div>
 
 <div style={{ flex: '1 1 400px', background: theme.cardBg, padding: '20px', borderRadius: '6px', border: `1px solid ${theme.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
 <h3 style={{ marginTop: 0, borderBottom: `2px solid ${theme.border}`, paddingBottom: '10px' }}>📜 Interakciós Napló</h3>
 <div style={{ maxHeight: '800px', overflowY: 'auto', paddingLeft: '10px' }}>
 {processedLogs.map(l => {
 const action = (l.action_type || '').toUpperCase();
 const note = (l.note || '').toLowerCase();

 let bg = darkMode ? '#1e1e1e' : '#fff';
 let borderColor = theme.border;
 let icon = '💬';
 let textColor = theme.text;

 if (note.includes('playbook')) { bg = darkMode ? '#2e1065' : '#f3e8ff'; borderColor = '#d8b4fe'; icon = '📘'; textColor = '#9333ea';
 } else if (note.includes('szerződés')) { bg = darkMode ? '#1e293b' : '#f1f5f9'; borderColor = '#cbd5e1'; icon = '✍️'; textColor = '#475569';
 } else if (note.includes('kapcsolatfelvétel') || note.includes('hívás') || note.includes('telefon')) { bg = darkMode ? '#3b250a' : '#fff7e6'; borderColor = '#ffe8cc'; icon = '📞'; textColor = '#d97706';
 } else if (action === 'E-MAIL KÜLDVE' || note.includes('e-mail') || note.includes('email')) { bg = darkMode ? '#113a1a' : '#eef9f0'; borderColor = '#c3e6cb'; icon = '✉️'; textColor = '#28a745';
 } else if (note.includes('ajánlat')) { bg = darkMode ? '#082f49' : '#e0f2fe'; borderColor = '#bae6fd'; icon = '📄'; textColor = '#0284c7';
 } else if (action === 'LEJÁRT FELADAT') { bg = darkMode ? '#3a1111' : '#fff5f5'; borderColor = '#f5c6cb'; icon = '⚠️'; textColor = '#dc3545';
 } else if (action === 'STÁTUSZVÁLTÁS') { bg = darkMode ? '#11223a' : '#e8f4f8'; borderColor = '#b8daff'; icon = '🔄'; textColor = '#007bff';
 } else if (action === 'ÚJ DOKUMENTUM') { bg = darkMode ? '#3a3311' : '#fff3cd'; borderColor = '#ffeeba'; icon = '📁'; textColor = '#d97706';
 } else if (action === 'ÚJ FELADAT') { bg = darkMode ? '#431407' : '#ffedd5'; borderColor = '#fed7aa'; icon = '📌'; textColor = '#c2410c';
 } else if (action === 'FELADAT KÉSZ') { bg = darkMode ? '#052e16' : '#f0fdf4'; borderColor = '#bbf7d0'; icon = '✅'; textColor = '#16a34a';
 } else if (action === 'CREATE') { bg = darkMode ? '#2e1065' : '#ede9fe'; borderColor = '#ddd6fe'; icon = '🚀'; textColor = '#7c3aed';
 } else { bg = darkMode ? '#252525' : '#f8f9fa'; borderColor = theme.border; icon = '💬'; textColor = theme.text; }

 let lineIndicator = null;
 const lineColor = darkMode ? '#666' : '#999';
 if (l.lineStyle === 'start') {
     lineIndicator = <div style={{ position: 'absolute', top: '24px', left: '-20px', bottom: '-8px', width: '15px', borderLeft: `1px dashed ${lineColor}`, borderTop: `1px dashed ${lineColor}`, borderTopLeftRadius: '6px' }}></div>;
 } else if (l.lineStyle === 'middle') {
     lineIndicator = <div style={{ position: 'absolute', top: '-8px', left: '-20px', bottom: '-8px', width: '1px', borderLeft: `1px dashed ${lineColor}` }}></div>;
 } else if (l.lineStyle === 'end') {
     lineIndicator = <div style={{ position: 'absolute', top: '-8px', left: '-20px', height: '30px', width: '15px', borderLeft: `1px dashed ${lineColor}`, borderBottom: `1px dashed ${lineColor}`, borderBottomLeftRadius: '6px' }}></div>;
 }

 return (
 <div key={l.id} style={{ position: 'relative', borderBottom: `1px dashed ${borderColor}`, padding: '12px 0', background: bg, paddingLeft: '12px', paddingRight: '12px', borderRadius: '6px', marginBottom: '8px', borderLeft: `4px solid ${textColor}`, marginLeft: l.lineStyle !== 'none' ? '25px' : '0' }}>
 {lineIndicator}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
 <strong style={{ fontSize: '12px', color: textColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
 <span>{icon}</span> <span>{l.action_type}</span>
 </strong>
 <span style={{ fontSize: '11px', opacity: 0.7 }}>{new Date(l.created_at).toLocaleString()}</span>
 </div>
 <span style={{ fontSize: '14px', display: 'block', wordBreak: 'break-word', color: theme.text }}>
 {l.note}
 </span>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

export default App;