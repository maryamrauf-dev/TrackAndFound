import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, errMsg } from '../api.js';
import ItemCard from '../components/ItemCard.jsx';
import Icon from '../components/Icon.jsx';

export default function Activity() {
  const [mine, setMine] = useState([]);
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
      const { data } = await api.get('/items/mine');
      setMine(data.items);
    } catch (e) {
      setError(errMsg(e));
    }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="stack gap">
      <div>
        <button className="btn btn-quiet back-btn" onClick={handleBack} aria-label="Go back">
          <Icon name="arrow_back" size={18} /> Go back
        </button>
      </div>
      <h1>My activity</h1>
      {error && <p className="error">{error}</p>}

      <section className="stack">
        <h2>My posts</h2>
        {mine.length === 0 && <p className="muted">Nothing posted yet.</p>}
        <div className="grid">{mine.map((i) => <ItemCard key={i._id} item={i} />)}</div>
      </section>
    </div>
  );
}
