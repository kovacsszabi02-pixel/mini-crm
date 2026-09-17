import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mini-crm-44xt.onrender.com';

const STATUSES = [
  '1. Új lead',
  '2. Kapcsolatfelvétel alatt',
  '3. Időpontegyeztetés alatt',
  '4. Tárgyalás',
  '5. Ajánlat kiküldés',
  '6. Szerződésírás',
  '7. Döntésre vár',
  '8. Díjbekérő',
  '9. Fizetésre vár',
  '10. Számlaírás',
  '11. Sablonírás',
  '12. Átadásra vár',
  '13. Teljesített',
  '14. Elveszített '
];

function AddPartnerForm({ onPartnerAdded }) {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    revenue: '',
    tax_number: '',
    billing_address: '',
    manager: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleanValue = value.replace(/[^0-9+\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormData({
          company_name: '', contact_person: '', phone: '', email: '', revenue: '', tax_number: '', billing_address: '', manager: ''
        });
        onPartnerAdded();
      } else {
        alert('Hiba történt a partner rögzítésekor.');
      }
    } catch (err) {
      console.error('Hiba a partner mentésekor:', err);
    }
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
      <h3>Új partner rögzítése</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Cégnév *</label><br/>
            <input name="company_name" value={formData.company_name} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Kapcsolattartó *</label><br/>
            <input name="contact_person" value={formData.contact_person} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Telefonszám *</label><br/>
            <input name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email</label><br/>
            <input name="email" type="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Kezelő</label><br/>
            <input name="manager" value={formData.manager} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Árbevétel</label><br/>
            <input name="revenue" value={formData.revenue} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Adószám</label><br/>
            <input name="tax_number" value={formData.tax_number} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ flex: '1 1 48%', minWidth: '300px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Számlázási cím</label><br/>
            <input name="billing_address" value={formData.billing_address} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
          </div>
        </div>
        <div style={{ marginTop: '15px' }}>
          <button type="submit" style={{ padding: '10px 24px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Partner Rögzítése</button>
        </div>
      </form>
    </div>
  );
}

function App() {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);
  
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [plainNote, setPlainNote] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const fetchPartners = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/partners`);
      const data = await response.json();
      setPartners(data);
    } catch (err) {
      console.error('Hiba a partnerek lekérésekor:', err);
    }
  };

  const fetchLogs = async (partnerId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/partners/${partnerId}/logs`);
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error('Hiba a logok lekérésekor:', err);
    }
  };

  const fetchTasks = async (partnerId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/partners/${partnerId}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Hiba a feladatok lekérésekor:', err);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner);
    setNewStatus(partner.status);
    setStatusNote('');
    setPlainNote('');
    setNewTaskDesc('');
    fetchLogs(partner.id);
    fetchTasks(partner.id);
  };

  const handleUpdateStatus = async () => {
    if (!selectedPartner) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: statusNote })
      });
      if (response.ok) {
        const updated = await response.json();
        setSelectedPartner(updated);
        setStatusNote('');
        fetchPartners();
        fetchLogs(selectedPartner.id);
      }
    } catch (err) {
      console.error('Hiba a státusz frissítésekor:', err);
    }
  };

  const handleAddPlainNote = async () => {
    if (!plainNote.trim() || !selectedPartner) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: plainNote })
      });
      if (response.ok) {
        setPlainNote('');
        fetchLogs(selectedPartner.id);
      }
    } catch (err) {
      console.error('Hiba a megjegyzés mentésekor:', err);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskDesc.trim() || !selectedPartner) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newTaskDesc })
      });
      if (response.ok) {
        setNewTaskDesc('');
        fetchTasks(selectedPartner.id);
        fetchLogs(selectedPartner.id);
      }
    } catch (err) {
      console.error('Hiba feladat hozzáadásakor:', err);
    }
  };

  const handleCompleteTaskItem = async (taskId) => {
    const isConfirmed = window.confirm("Biztosan készre jelented a feladatot? Ezt később nem módosíthatod!");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/tasks/${taskId}/complete`, {
        method: 'PUT'
      });
      if (response.ok) {
        fetchTasks(selectedPartner.id);
        fetchLogs(selectedPartner.id);
      }
    } catch (err) {
      console.error('Hiba a feladat lezárásakor:', err);
    }
  };

  const handleDeletePartner = async (partnerId) => {
    const isConfirmed = window.confirm("Biztosan törölni akarod ezt a partnert?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/partners/${partnerId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        if (selectedPartner?.id === partnerId) setSelectedPartner(null);
        if (editingPartner?.id === partnerId) setEditingPartner(null);
        fetchPartners();
      }
    } catch (err) {
      console.error('Hiba a törléskor:', err);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPartner) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/partners/${editingPartner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPartner)
      });

      if (response.ok) {
        const updated = await response.json();
        if (selectedPartner?.id === updated.id) {
          setSelectedPartner(updated);
        }
        setEditingPartner(null);
        fetchPartners();
      } else {
        alert('Hiba történt a szerkesztés során.');
      }
    } catch (err) {
      console.error('Hiba a szerkesztéskor:', err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Mini CRM</h1>

      <AddPartnerForm onPartnerAdded={fetchPartners} />

      {editingPartner && (
        <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeeba' }}>
          <h3>Partner szerkesztése: {editingPartner.company_name}</h3>
          <form onSubmit={handleSaveEdit}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Cégnév *</label><br/>
                <input value={editingPartner.company_name} onChange={(e) => setEditingPartner({...editingPartner, company_name: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
              </div>
              <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Kapcsolattartó *</label><br/>
                <input value={editingPartner.contact_person} onChange={(e) => setEditingPartner({...editingPartner, contact_person: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
              </div>
              <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Telefonszám *</label><br/>
                <input value={editingPartner.phone} onChange={(e) => setEditingPartner({...editingPartner, phone: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
              </div>
              <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email</label><br/>
                <input type="email" value={editingPartner.email || ''} onChange={(e) => setEditingPartner({...editingPartner, email: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
              </div>
              <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Kezelő</label><br/>
                <input value={editingPartner.manager || ''} onChange={(e) => setEditingPartner({...editingPartner, manager: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
              </div>
              <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Árbevétel</label><br/>
                <input value={editingPartner.revenue || ''} onChange={(e) => setEditingPartner({...editingPartner, revenue: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
              </div>
              <div style={{ flex: '1 1 22%', minWidth: '200px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Adószám</label><br/>
                <input value={editingPartner.tax_number || ''} onChange={(e) => setEditingPartner({...editingPartner, tax_number: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
              </div>
              <div style={{ flex: '1 1 48%', minWidth: '300px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Számlázási cím</label><br/>
                <input value={editingPartner.billing_address || ''} onChange={(e) => setEditingPartner({...editingPartner, billing_address: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}/>
              </div>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Mentés</button>
              <button type="button" onClick={() => setEditingPartner(null)} style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Mégse</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1.2 1 400px' }}>
          <h2>Partnerek Listája</h2>
          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ background: '#eee' }}>
              <tr>
                <th>Cégnév</th>
                <th>Kapcsolattartó</th>
                <th>Telefon</th>
                <th>Státusz</th>
                <th>Művelet</th>
              </tr>
            </thead>
            <tbody>
              {partners.length === 0 ? (
                <tr><td colSpan="5">Még nincs rögzített partner.</td></tr>
              ) : (
                partners.map((p) => (
                  <tr key={p.id} style={{ background: selectedPartner?.id === p.id ? '#e6f7ff' : 'transparent' }}>
                    <td><strong>{p.company_name}</strong></td>
                    <td>{p.contact_person}</td>
                    <td>{p.phone}</td>
                    <td><span style={{ fontSize: '12px', padding: '3px 6px', background: '#e9ecef', borderRadius: '4px' }}>{p.status}</span></td>
                    <td style={{ display: 'flex', gap: '5px' }}>
                      <button type="button" onClick={() => handleSelectPartner(p)} style={{ cursor: 'pointer', padding: '4px 8px', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px' }}>
                        Kiválasztás
                      </button>
                      <button type="button" onClick={() => setEditingPartner(p)} style={{ cursor: 'pointer', padding: '4px 8px', background: '#ffc107', border: '1px solid #e0a800', borderRadius: '4px', fontWeight: 'bold' }}>
                        Szerkesztés
                      </button>
                      <button type="button" onClick={() => handleDeletePartner(p.id)} style={{ cursor: 'pointer', padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>
                        Törlés
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedPartner && (
          <div style={{ flex: '1 1 350px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fafafa' }}>
            <h2>Partner Fal: {selectedPartner.company_name}</h2>
            <p style={{ margin: '5px 0' }}><strong>Kapcsolattartó:</strong> {selectedPartner.contact_person} ({selectedPartner.phone})</p>
            <p style={{ margin: '5px 0' }}><strong>Email:</strong> {selectedPartner.email || '-'}</p>
            <p style={{ margin: '5px 0' }}><strong>Kezelő:</strong> {selectedPartner.manager || '-'}</p>
            <p style={{ margin: '5px 0' }}><strong>Adószám:</strong> {selectedPartner.tax_number || '-'}</p>
            <p style={{ margin: '5px 0' }}><strong>Számlázási cím:</strong> {selectedPartner.billing_address || '-'}</p>
            <p style={{ margin: '5px 0' }}><strong>Árbevétel:</strong> {selectedPartner.revenue || '-'}</p>
            <hr style={{ margin: '15px 0' }} />

            <div style={{ background: '#e2e3e5', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #d6d8db' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Kiosztott Feladatok</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                <input type="text" placeholder="Új feladat kiírása..." value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}/>
                <button type="button" onClick={handleAddTask} style={{ padding: '8px 14px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hozzáadás</button>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {tasks.length === 0 ? (
                  <li style={{ color: '#6c757d', fontSize: '14px' }}>Nincs aktív feladat.</li>
                ) : (
                  tasks.map(t => (
                    <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <input 
                        type="checkbox" 
                        checked={t.is_completed} 
                        disabled={t.is_completed} 
                        onChange={() => handleCompleteTaskItem(t.id)} 
                        style={{ width: '18px', height: '18px', cursor: t.is_completed ? 'not-allowed' : 'pointer' }} 
                      />
                      <span style={{ textDecoration: t.is_completed ? 'line-through' : 'none', color: t.is_completed ? '#6c757d' : '#000', fontWeight: t.is_completed ? 'normal' : 'bold' }}>
                        {t.description}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #eee', marginBottom: '15px' }}>
              <h4>Státusz módosítása (14 szint)</h4>
              <div style={{ marginBottom: '8px' }}>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}>
                  {STATUSES.map((st) => (<option key={st} value={st}>{st}</option>))}
                </select>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <input type="text" placeholder="Státuszváltás megjegyzése / indoklása..." value={statusNote} onChange={(e) => setStatusNote(e.target.value)} style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}/>
              </div>
              <button type="button" onClick={handleUpdateStatus} style={{ padding: '8px 14px', background: '#ff9900', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Státusz frissítése és rögzítése
              </button>
            </div>

            <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #eee', marginBottom: '15px' }}>
              <h4>Új megjegyzés a falra</h4>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" placeholder="Írj egy megjegyzést..." value={plainNote} onChange={(e) => setPlainNote(e.target.value)} style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}/>
                <button type="button" onClick={handleAddPlainNote} style={{ padding: '8px 14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Rögzítés</button>
              </div>
            </div>

            <h4>Előzmények / Fal bejegyzések</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {logs.length === 0 ? (
                <li style={{ color: '#888' }}>Még nincs bejegyzés ezen a falon.</li>
              ) : (
                logs.map((log) => (
                  <li key={log.id} style={{ background: '#fff', border: '1px solid #eee', padding: '10px', marginBottom: '8px', borderRadius: '4px' }}>
                    <strong>{log.user_name}</strong> <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>{new Date(log.created_at).toLocaleString()}</span>
                    <div style={{ marginTop: '5px' }}>{log.note}</div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;