import React, { useState, useEffect } from 'react';
import { LayoutDashboard, History, QrCode, Edit2, Save, X, Printer } from 'lucide-react';
import QRCode from 'react-qr-code';
import API_URL from '../config';

const Dashboard = () => {
    const [excavators, setExcavators] = useState([]);
    const [history, setHistory] = useState([]);

    // Edit State
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', model: '' });

    const fetchData = () => {
        fetch(`${API_URL}/api/excavators`)
            .then(res => res.json())
            .then(data => setExcavators(data.data || []));

        fetch(`${API_URL}/api/history`)
            .then(res => res.json())
            .then(data => setHistory(data.data || []));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const startEditing = (exc) => {
        setEditingId(exc.id);
        setEditForm({ name: exc.name, model: exc.model });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({ name: '', model: '' });
    };

    const saveEdit = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/excavators/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setEditingId(null);
                fetchData(); // Refresh list
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update');
        }
    };

    const printQR = (id) => {
        const printWindow = window.open('', '', 'width=600,height=600');
        const qrContainer = document.getElementById(`qr-${id}`);

        if (printWindow && qrContainer) {
            printWindow.document.write('<html><body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;">');
            printWindow.document.write(qrContainer.innerHTML);
            printWindow.document.write(`<h2 style="font-family:sans-serif; margin-top:20px;">Vehicle ID: ${id}</h2>`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <LayoutDashboard size={32} color="hsl(var(--primary))" />
                    <h1>Master Dashboard</h1>
                </div>
                <button className="btn btn-primary" onClick={() => window.location.href = '/'}>Logout</button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {/* Stats Cards */}
                <div className="card">
                    <h3 style={{ marginBottom: '10px', color: 'var(--text-muted)' }}>Total Fleet</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{excavators.length}</div>
                </div>
                <div className="card">
                    <h3 style={{ marginBottom: '10px', color: 'var(--text-muted)' }}>Recent Reports</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{history.length}</div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <QrCode size={24} color="hsl(var(--secondary))" />
                    <h2>Fleet Management</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {excavators.map(exc => (
                        <div key={exc.id} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            {editingId === exc.id ? (
                                <div style={{ marginBottom: '10px' }}>
                                    <input
                                        className="input-field"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="Name"
                                    />
                                    <input
                                        className="input-field"
                                        value={editForm.model}
                                        onChange={e => setEditForm({ ...editForm, model: e.target.value })}
                                        placeholder="Model"
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn" style={{ background: 'hsl(var(--secondary))', color: 'white', padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => saveEdit(exc.id)}>
                                            <Save size={16} /> Save
                                        </button>
                                        <button className="btn" style={{ background: '#cbd5e1', padding: '8px', fontSize: '0.9rem' }} onClick={cancelEditing}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <strong style={{ fontSize: '1.2rem', color: 'hsl(var(--primary))' }}>{exc.name}</strong>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>{exc.model}</div>
                                        </div>
                                        <button onClick={() => startEditing(exc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'gray' }}>
                                            <Edit2 size={18} />
                                        </button>
                                    </div>

                                    {/* QR Code Section */}
                                    <div style={{ marginTop: '20px', textAlign: 'center', background: 'white', padding: '10px', borderRadius: '8px' }} id={`qr-${exc.id}`}>
                                        <QRCode
                                            value={`${window.location.origin}/maintenance/${exc.id}`}
                                            size={120}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                        <a
                                            href={`/maintenance/${exc.id}`}
                                            target="_blank"
                                            className="btn"
                                            style={{ flex: 1, background: '#e2e8f0', color: 'hsl(var(--text-main))', textDecoration: 'none', fontSize: '0.9rem' }}
                                        >
                                            View
                                        </a>
                                        <button
                                            onClick={() => printQR(exc.id)}
                                            className="btn"
                                            style={{ flex: 1, background: '#e2e8f0', color: 'hsl(var(--text-main))', fontSize: '0.9rem' }}
                                        >
                                            <Printer size={16} style={{ marginRight: '5px' }} /> Print
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <History size={24} color="hsl(var(--secondary))" />
                    <h2>Maintenance History</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px' }}>Date</th>
                                <th style={{ padding: '12px' }}>Vehicle</th>
                                <th style={{ padding: '12px' }}>Mechanic</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px' }}>Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px' }}>{new Date(log.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px', color: 'hsl(var(--primary))' }}>{log.excavator_name}</td>
                                    <td style={{ padding: '12px' }}>{log.mechanic_name}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: log.status === 'Operational' ? 'rgba(0, 200, 100, 0.1)' : 'rgba(255, 50, 50, 0.1)',
                                            color: log.status === 'Operational' ? 'green' : 'red',
                                            fontWeight: '500'
                                        }}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{log.comments}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
