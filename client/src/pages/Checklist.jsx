import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Truck } from 'lucide-react';
import API_URL from '../config';

const Checklist = () => {
    const { id } = useParams();
    const [excavator, setExcavator] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        mechanic_name: '',
        status: 'Operational', // Operational, Needs Repair, Critical
        comments: '',
        checks: {
            engine: true,
            hydraulics: true,
            tracks: true,
            coolant: true
        }
    });

    useEffect(() => {
        // Fetch excavator details
        fetch(`${API_URL}/api/excavators/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) setExcavator(data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch", err);
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            excavator_id: id, // In real app, this might be the numeric ID from DB, but using param for now
            mechanic_name: formData.mechanic_name,
            status: formData.status,
            comments: formData.comments,
            // In a real expanded DB, we'd save individual checks too
        };

        try {
            const res = await fetch(`${API_URL}/api/maintenance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error("Error submitting", error);
            alert("Error submitting report");
        }
    };

    if (loading) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    if (submitted) {
        return (
            <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
                <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <CheckCircle size={64} color="hsl(var(--secondary))" style={{ marginBottom: '20px' }} />
                    <h2>Report Submitted!</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                        Thank you for keeping the fleet safe.
                    </p>
                    <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => window.location.reload()}>
                        Submit Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
            <header style={{ marginBottom: '30px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Truck size={32} color="hsl(var(--accent))" />
                    <h1>Maintenance Check</h1>
                </div>
                <p style={{ color: 'var(--text-muted)' }}>
                    Vehicle ID: <span className="text-accent">{excavator ? excavator.name : id}</span>
                </p>
            </header>

            <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="card" style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Mechanic Info</h3>
                    <input
                        type="text"
                        placeholder="Your Name / ID"
                        className="input-field"
                        required
                        value={formData.mechanic_name}
                        onChange={e => setFormData({ ...formData, mechanic_name: e.target.value })}
                    />
                </div>

                <div className="card" style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '20px' }}>System Checks</h3>

                    {['Engine', 'Hydraulics', 'Tracks', 'Coolant'].map(sys => (
                        <div key={sys} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
                            <span>{sys} System</span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.checks[sys.toLowerCase()]}
                                    onChange={e => setFormData({
                                        ...formData,
                                        checks: { ...formData.checks, [sys.toLowerCase()]: e.target.checked }
                                    })}
                                />
                                <span style={{ marginLeft: '10px', color: formData.checks[sys.toLowerCase()] ? 'hsl(var(--secondary))' : 'gray' }}>
                                    {formData.checks[sys.toLowerCase()] ? 'OK' : 'Issue'}
                                </span>
                            </label>
                        </div>
                    ))}
                </div>

                <div className="card" style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Status & Notes</h3>

                    <select
                        className="input-field"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="Operational">Operational</option>
                        <option value="Needs Repair">Needs Repair</option>
                        <option value="Critical">Critical Issue</option>
                    </select>

                    <textarea
                        className="input-field"
                        rows="4"
                        placeholder="Additional comments or issue description..."
                        value={formData.comments}
                        onChange={e => setFormData({ ...formData, comments: e.target.value })}
                    ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Submit Report
                </button>
            </form>
        </div>
    );
};

export default Checklist;
