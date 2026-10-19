import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, errMsg } from '../api.js';
import { CATEGORIES, CAMPUS } from '../config.js';

import Icon from '../components/Icon.jsx';

const today = () => new Date().toISOString().slice(0, 10);

export default function PostItem() {
  const [params] = useSearchParams();
  const [type, setType] = useState(params.get('type') === 'found' ? 'found' : 'lost');
  const [f, setF] = useState({
    title: '', category: 'other', description: '', hiddenDetails: '',
    eventDate: today(), locationLabel: '', custodyNote: '', whatsapp: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      nav(-1);
    } else {
      nav('/');
    }
  };

  const pick = (e) => {
    const file = e.target.files[0];
    setImage(file || null);
    setPreview(file ? URL.createObjectURL(file) : '');
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('type', type);
      Object.entries(f).forEach(([k, v]) => fd.append(k, v));
      fd.append('lat', CAMPUS.lat);
      fd.append('lng', CAMPUS.lng);
      if (image) fd.append('image', image);
      const { data } = await api.post('/items', fd);
      nav(`/items/${data.id}`);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  const found = type === 'found';

  return (
    <section className="narrow wide stack">
      <div>
        <button className="btn btn-quiet back-btn" onClick={handleBack} aria-label="Go back">
          <Icon name="arrow_back" size={18} /> Go back
        </button>
      </div>
      <h1>Post an item</h1>
      <div className="seg big" role="group" aria-label="Lost or found">
        <button type="button" className={!found ? 'on' : ''} onClick={() => setType('lost')}>
          <Icon name="radio_button_checked" size={18} /> I lost something
        </button>
        <button type="button" className={found ? 'on' : ''} onClick={() => setType('found')}>
          <Icon name="check_circle" size={18} /> I found something
        </button>
      </div>

      <form onSubmit={submit} className="card pad stack">
        <label>What is it?
          <input value={f.title} onChange={set('title')} maxLength={80} placeholder="Black wallet, grey backpack..." required />
        </label>
        <div className="row">
          <label>Category
            <select value={f.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label>{found ? 'Date found' : 'Date lost'}
            <input type="date" max={today()} value={f.eventDate} onChange={set('eventDate')} required />
          </label>
        </div>
        <label>Public description
          <textarea rows={3} value={f.description} onChange={set('description')} maxLength={600} required
            placeholder="Colour, size, condition. Keep identifying details out of here." />
        </label>

        <label>WhatsApp / Contact Phone
          <input type="tel" value={f.whatsapp} onChange={set('whatsapp')} placeholder="e.g. +92 300 1234567 or 03001234567" />
          <span className="hint">
            {found
              ? 'When someone clicks "This is mine", they will be directed to this WhatsApp number for safe handover.'
              : 'When someone finds your item, they can contact you directly on this WhatsApp number to return it.'}
          </span>
        </label>

        {found && (
          <div className="private-box">
            <label>Private proof details (optional)
              <textarea rows={2} value={f.hiddenDetails} onChange={set('hiddenDetails')} maxLength={600}
                placeholder="Something only the owner would know: what is inside, a mark, a keychain, a sticker." />
            </label>
            <p className="hint">Never shown publicly. Kept for you to easily cross-check when claimant contacts you on WhatsApp.</p>
          </div>
        )}

        <label>Photo (optional)
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} />
        </label>
        {preview && <img className="preview" src={preview} alt="Selected item" />}
        <p className="hint">Take a clear picture of the item. Hide ID numbers, card numbers and names before uploading.</p>

        <label>Place name (location)
          <input value={f.locationLabel} onChange={set('locationLabel')} maxLength={100} placeholder="Library steps, Block B..." />
        </label>

        {found && (
          <label>Where is it now? (optional)
            <input value={f.custodyNote} onChange={set('custodyNote')} maxLength={140} placeholder="Left at the security desk" />
          </label>
        )}

        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Posting item...' : 'Post item'}
        </button>
      </form>
    </section>
  );
}
