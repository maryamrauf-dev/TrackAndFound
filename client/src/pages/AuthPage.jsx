import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errMsg } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const nav = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/auth/${mode === 'login' ? 'login' : 'register'}`, form);
      signIn(data.token, data.user);
      nav('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="narrow">
      <div className="card pad">
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">
          {mode === 'login' ? 'Sign in to post items and contact people about lost belongings.' : 'Create an account to post lost and found items.'}
        </p>
        <form onSubmit={submit} className="stack">
          {mode === 'register' && (
            <label>Full name<input value={form.name} onChange={set('name')} required /></label>
          )}
          <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
          <label>Password<input type="password" value={form.password} onChange={set('password')} required minLength={6} /></label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'One moment' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <p className="muted switch">
          {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
          <button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </section>
  );
}
