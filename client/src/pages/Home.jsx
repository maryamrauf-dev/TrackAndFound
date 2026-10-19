import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errMsg } from '../api.js';
import { CATEGORIES, CAMPUS } from '../config.js';
import ItemCard from '../components/ItemCard.jsx';
import MapView from '../components/MapView.jsx';
import Icon from '../components/Icon.jsx';

export default function Home() {
  const [filters, setFilters] = useState({ q: '', type: '', category: '', from: '' });
  const [items, setItems] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  useEffect(() => {
    setState('loading');
    const t = setTimeout(async () => {
      try {
        const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
        const { data } = await api.get('/items', { params });
        setItems(data.items);
        setState('ready');
      } catch (e) {
        setError(errMsg(e));
        setState('error');
      }
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const mappedCount = items.filter((i) => i.location && typeof i.location.lat === 'number').length;

  return (
    <div className="home stack gap">
      {/* Hero Section */}
      <section className="card home-hero">
        <div className="stack" style={{ gap: '12px' }}>
          <h1>Reunite what went missing on {CAMPUS.name}.</h1>
          <p className="hero-subtitle">
            Making our campus a place where lost things find their way home. Because every lost item has a story, and every reunion matters.
          </p>
          <div className="row" style={{ marginTop: '8px' }}>
            <Link className="btn btn-primary" to="/post?type=lost">
              <Icon name="radio_button_checked" size={18} /> I lost something
            </Link>
            <Link className="btn btn-quiet" to="/post?type=found">
              <Icon name="check_circle" size={18} /> I found something
            </Link>
          </div>
        </div>
      </section>

      {/* Filter and Discovery Bar */}
      <section className="filters card">
        <div className="search-wrap">
          <Icon name="search" size={20} className="search-icon" />
          <input
            className="search"
            placeholder="Search keys, hydro flask, AirPods, library..."
            value={filters.q}
            onChange={(e) => set('q', e.target.value)}
            aria-label="Search items"
          />
        </div>

        <div className="seg" role="group" aria-label="Filter by item status">
          <button
            type="button"
            className={filters.type === '' ? 'on' : ''}
            onClick={() => set('type', '')}
          >
            All Items
          </button>
          <button
            type="button"
            className={filters.type === 'lost' ? 'on' : ''}
            onClick={() => set('type', 'lost')}
          >
            <Icon name="radio_button_checked" size={15} /> Lost
          </button>
          <button
            type="button"
            className={filters.type === 'found' ? 'on' : ''}
            onClick={() => set('type', 'found')}
          >
            <Icon name="check_circle" size={15} /> Found
          </button>
        </div>

        <select
          value={filters.category}
          onChange={(e) => set('category', e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>

        <label className="date-filter">
          <span>Since</span>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => set('from', e.target.value)}
            aria-label="Items posted since date"
          />
        </label>

        {/* View Switcher: Grid vs Map */}
        <div className="view-toggle seg" role="group" aria-label="View toggle">
          <button
            type="button"
            className={viewMode === 'grid' ? 'on' : ''}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <Icon name="grid_view" size={17} /> Grid
          </button>
          <button
            type="button"
            className={viewMode === 'map' ? 'on' : ''}
            onClick={() => setViewMode('map')}
            title="Campus map view"
          >
            <Icon name="map" size={17} /> Map {mappedCount > 0 && `(${mappedCount})`}
          </button>
        </div>
      </section>

      {/* Content View: Grid or Map */}
      <section className="home-content stack">
        {state === 'loading' && <p className="muted">Scanning campus listings...</p>}
        {state === 'error' && <p className="error" role="alert">{error}</p>}
        {state === 'ready' && items.length === 0 && (
          <div className="empty card pad">
            <h3>No listings found</h3>
            <p className="muted">
              Be the first to post a lost or found item. People who recognize a listing can contact its poster on WhatsApp.
            </p>
            <div className="row">
              <Link className="btn btn-primary" to="/post?type=lost">
                <Icon name="radio_button_checked" size={18} /> Post lost item
              </Link>
              <Link className="btn btn-quiet" to="/post?type=found">
                <Icon name="check_circle" size={18} /> Post found item
              </Link>
            </div>
          </div>
        )}

        {state === 'ready' && items.length > 0 && viewMode === 'map' && (
          <div className="map-section stack">
            <div className="row between">
              <h3>
                <Icon name="place" size={22} /> Campus Map Listings ({items.length})
              </h3>
              <span className="muted">Click pins to view details & contact on WhatsApp</span>
            </div>
            <MapView items={items} />
          </div>
        )}

        {state === 'ready' && items.length > 0 && viewMode === 'grid' && (
          <div className="grid">
            {items.map((i) => (
              <ItemCard key={i._id} item={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
