import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, errMsg } from '../api.js';
import ItemCard from '../components/ItemCard.jsx';
import Icon from '../components/Icon.jsx';

const STATUS_TEXT = {
  awaiting_answers: 'Waiting for your answers',
  review: 'With the finder for confirmation',
  approved: 'Verified',
  rejected: 'Not matched',
};

export default function Activity() {
  const [mine, setMine] = useState([]);
  const [claims, setClaims] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      nav(-1);
    } else {
      nav('/');
    }
  };

  const load = async () => {
    try {
      const [a, b, c] = await Promise.all([
        api.get('/items/mine'), api.get('/claims/mine'), api.get('/claims/incoming'),
      ]);
      setMine(a.data.items);
      setClaims(b.data.claims);
      setIncoming(c.data.claims);
    } catch (e) {
      setError(errMsg(e));
    }
  };
  useEffect(() => { load(); }, []);

  const decide = async (id, approve) => {
    await api.patch(`/claims/${id}/decision`, { approve });
    load();
  };

  const needsMe = incoming.filter((c) => c.status === 'review');
  const open = incoming.filter((c) => c.status === 'approved');

  return (
    <div className="stack gap">
      <div>
        <button className="btn btn-quiet back-btn" onClick={handleBack} aria-label="Go back">
          <Icon name="arrow_back" size={18} /> Go back
        </button>
      </div>
      <h1>My activity</h1>
      {error && <p className="error">{error}</p>}

      {needsMe.length > 0 && (
        <section className="stack">
          <h2>Needs your decision</h2>
          {needsMe.map((c) => (
            <div key={c.id} className="card pad stack">
              <h3>{c.claimant?.name} says your "{c.item?.title}" is theirs</h3>
              <p className="muted">{c.reasoning}</p>
              {c.item?.hiddenDetails && (
                <div className="private-box"><strong>Your private details</strong><p>{c.item.hiddenDetails}</p></div>
              )}
              {c.questions.map((q, i) => (
                <div key={i}><strong>{q}</strong><p>{c.answers[i]}</p></div>
              ))}
              <div className="row">
                <button className="btn btn-primary" onClick={() => decide(c.id, true)}>It matches</button>
                <button className="btn btn-quiet" onClick={() => decide(c.id, false)}>It does not match</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {open.length > 0 && (
        <section className="stack">
          <h2>Verified owners to meet</h2>
          {open.map((c) => (
            <div key={c.id} className="card pad row between">
              <span>{c.claimant?.name} for "{c.item?.title}"</span>
              <Link className="btn btn-primary" to={`/claims/${c.id}/chat`}>Open chat</Link>
            </div>
          ))}
        </section>
      )}

      <section className="stack">
        <h2>My claims</h2>
        {claims.length === 0 && <p className="muted">You have not claimed anything yet.</p>}
        {claims.map((c) => (
          <div key={c.id} className="card pad row between">
            <div>
              <strong>{c.item?.title}</strong>
              <p className="muted">{STATUS_TEXT[c.status]}</p>
            </div>
            {c.status === 'approved' && <Link className="btn btn-primary" to={`/claims/${c.id}/chat`}>Open chat</Link>}
            {c.status !== 'approved' && <Link className="btn btn-quiet" to={`/items/${c.item?._id}`}>View item</Link>}
          </div>
        ))}
      </section>

      <section className="stack">
        <h2>My posts</h2>
        {mine.length === 0 && <p className="muted">Nothing posted yet.</p>}
        <div className="grid">{mine.map((i) => <ItemCard key={i._id} item={i} />)}</div>
      </section>
    </div>
  );
}
