import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Login = () => {
    const [masterId, setMasterId] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple demo authentication
        if (masterId === 'admin') {
            navigate('/admin/dashboard');
        } else {
            alert('Invalid Master ID (Try "admin")');
        }
    };

    return (
        <div className="container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Lock size={32} color="hsl(var(--accent))" />
                </div>
                <h1 style={{ marginBottom: '10px' }}>Admin Access</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Enter Master ID to view dashboard</p>

                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        placeholder="Master ID"
                        className="input-field"
                        value={masterId}
                        onChange={e => setMasterId(e.target.value)}
                        style={{ textAlign: 'center', letterSpacing: '2px' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Login to Dashboard
                    </button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Hint: Use "admin"
                </p>
            </div>
        </div>
    );
};

export default Login;
