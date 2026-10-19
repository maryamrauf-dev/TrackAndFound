import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { api, errMsg } from '../api.js';
import { useAuth } from '../auth.jsx';
import { catOf, fmtDate, createWhatsAppLink } from '../config.js';
import ItemCard from '../components/ItemCard.jsx';
import MapView from '../components/MapView.jsx';
import Icon from '../components/Icon.jsx';

function WhatsAppIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.36 7.34 9.09 7.4 8.87 7.65C8.65 7.89 8.02 8.48 8.02 9.7C8.02 10.91 8.91 12.08 9.03 12.24C9.15 12.41 10.74 14.86 13.18 15.91C13.76 16.16 14.21 16.31 14.57 16.42C15.15 16.61 15.68 16.58 16.1 16.52C16.57 16.45 17.55 15.93 17.75 15.36C17.96 14.79 17.96 14.3 17.9 14.2C17.84 14.1 17.67 14.04 17.42 13.92C17.17 13.79 15.94 13.19 15.71 13.1C15.48 13.02 15.32 12.98 15.15 13.22C14.98 13.47 14.51 14.04 14.37 14.2C14.22 14.36 14.08 14.38 13.83 14.26C13.58 14.13 12.78 13.87 11.83 13.02C11.09 12.36 10.59 11.54 10.45 11.29C10.3 11.04 10.43 10.91 10.56 10.79C10.67 10.67 10.81 10.49 10.93 10.34C11.06 10.19 11.1 10.09 11.18 9.92C11.26 9.75 11.22 9.61 11.16 9.49C11.1 9.36 10.61 8.16 10.4 7.67C10.2 7.18 10 7.25 9.85 7.25C9.7 7.24 9.53 7.34 9.53 7.34Z" />
    </svg>
  );
}

function ClaimPanel({ item, onClaimed, claimed }) {
  const { user } = useAuth();
  const finderName = item.owner?.name || 'the finder';
  const rawPhone = item.whatsapp || item.contactPhone || item.owner?.phone;
  const locationText = item.location?.label ? ` at ${item.location.label}` : '';
  const message = `Hi ${finderName}! I saw your listing for "${item.title}" on FoundNearMe (found${locationText}). This is mine! Can we arrange a time to meet on campus?`;
  const whatsappUrl = createWhatsAppLink(rawPhone, message);

  const handleClaim = () => {
    onClaimed(true);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (claimed) {
    return (
      <div className="card pad claim ok stack">
        <div className="claim-header-badge">
          <span className="wa-status-pill">
            <Icon name="check_circle" size={16} /> Claim Initiated
          </span>
        </div>
        <h2>Contact {finderName}</h2>
        <p className="wa-claim-desc">
          We opened WhatsApp chat with <strong>{finderName}</strong>. If it didn&apos;t open automatically, click the button below to connect directly:
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp"
        >
          <WhatsAppIcon size={24} />
          <span>Chat on WhatsApp</span>
        </a>
        {rawPhone && (
          <p className="hint">
            <strong>Direct Contact:</strong> {rawPhone}
          </p>
        )}
        <div className="handover-tips">
          <strong>Safe Campus Handover Tip:</strong>
          <p>Agree to meet at a populated campus location such as the library desk, cafeteria, or security office.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card pad claim stack">
      <h2>Is this yours?</h2>
      <p className="muted">
        Click below to claim this item. You will be connected directly with <strong>{finderName}</strong> on WhatsApp to verify and arrange a safe handover.
      </p>
      <button className="btn btn-primary btn-claim" onClick={handleClaim}>
        <Icon name="check" size={18} /> This is mine
      </button>
      <p className="hint">
        Direct WhatsApp chat enables fast coordination with the finder.
      </p>
    </div>
  );
}

function LostItemContactPanel({ item, onClaimed }) {
  const ownerName = item.owner?.name || 'the owner';
  const rawPhone = item.whatsapp || item.contactPhone || item.owner?.phone;
  const locationText = item.location?.label ? ` near ${item.location.label}` : '';
  const message = `Hi ${ownerName}! I saw your post on FoundNearMe about your lost "${item.title}" (${locationText}). I found it! Can we arrange to return it to you?`;
  const whatsappUrl = createWhatsAppLink(rawPhone, message);

  const handleContact = () => {
    onClaimed(true);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="card pad claim stack">
      <h2>Found this item?</h2>
      <p className="muted">
        Connect directly with <strong>{ownerName}</strong> on WhatsApp to let them know their item is safe.
      </p>
      <button className="btn btn-whatsapp" onClick={handleContact}>
        <WhatsAppIcon size={22} />
        <span>Contact {ownerName} on WhatsApp</span>
      </button>
      <Link className="btn btn-quiet" to="/post?type=found">
        Post as found item
      </Link>
    </div>
  );
}

function OwnerPanel({ item, reload }) {
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    api.get(`/items/${item._id}/matches`).then((r) => setMatches(r.data.matches)).catch(() => setMatches([]));
  }, [item._id]);

  const markReturned = async () => {
    await api.patch(`/items/${item._id}/returned`);
    reload();
  };

  return (
    <div className="card pad stack">
      <h2>Your listing</h2>
      {item.hiddenDetails && (
        <div className="private-box">
          <strong>Private proof details</strong>
          <p>{item.hiddenDetails}</p>
        </div>
      )}
      {(item.whatsapp || item.contactPhone) && (
        <p className="hint">
          <strong>Your WhatsApp Contact:</strong> {item.whatsapp || item.contactPhone}
        </p>
      )}
      <h3>Possible matches</h3>
      {matches === null && <p className="muted">Looking for matches...</p>}
      {matches?.length === 0 && <p className="muted">No close matches yet. We check again whenever you open this page.</p>}
      <div className="matches">
        {matches?.map((m) => (
          <div key={m.item._id} className="match">
            <span className="score">{m.score}%</span>
            <ItemCard item={m.item} />
          </div>
        ))}
      </div>
      {item.status === 'open' && (
        <button className="btn btn-quiet" onClick={markReturned}>
          {item.type === 'found' ? 'Mark as handed over' : 'Mark as recovered'}
        </button>
      )}
    </div>
  );
}

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [claimed, setClaimed] = useState(false);

  const load = () =>
    api.get(`/items/${id}`).then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, [id]);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      nav(-1);
    } else {
      nav('/');
    }
  };

  if (error) {
    return (
      <div className="stack">
        <button className="btn btn-quiet back-btn" onClick={handleBack} aria-label="Go back">
          <Icon name="arrow_back" size={18} /> Go back
        </button>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!data) return <p className="muted">Loading listing details...</p>;
  const { item, isOwner } = data;
  const cat = catOf(item.category);
  const contactPerson = item.owner?.name || (item.type === 'found' ? 'Finder' : 'Owner');
  const rawPhone = item.whatsapp || item.contactPhone || item.owner?.phone;
  const waMessage = `Hi ${contactPerson}! I saw your post "${item.title}" on FoundNearMe. ${item.type === 'found' ? 'This is mine!' : 'I found this!'} Can we chat to coordinate?`;
  const whatsappUrl = createWhatsAppLink(rawPhone, waMessage);

  return (
    <div className="stack gap">
      <div>
        <button className="btn btn-quiet back-btn" onClick={handleBack} aria-label="Go back">
          <Icon name="arrow_back" size={18} /> Go back
        </button>
      </div>

      <div className="detail">
        <div className="detail-main stack">
          <div className="card item-detail-card">
            {item.imageUrl ? (
              <div className="detail-hero-wrap">
                <img className="hero-img" src={item.imageUrl} alt={item.title} />
              </div>
            ) : (
              <div className="detail-no-img">
                <Icon name={cat.icon} size={64} className="no-img-icon" />
                <span className="no-img-label">{cat.label}</span>
              </div>
            )}
            <div className="pad stack">
              <div className="row between">
                <div className="row" style={{ gap: '8px' }}>
                  <span className={`chip chip-${item.type}`}>
                    <span className="chip-icon" aria-hidden="true">
                      <Icon name={item.type === 'lost' ? 'radio_button_checked' : 'check_circle'} size={14} />
                    </span>
                    {item.type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                  {item.status === 'returned' && (
                    <span className="chip chip-done">
                      <Icon name="check" size={14} /> Resolved
                    </span>
                  )}
                </div>
                <span className="detail-cat-pill">
                  <Icon name={cat.icon} size={16} /> {cat.label}
                </span>
              </div>

              <h1>{item.title}</h1>
              <p className="muted item-detail-meta">
                <span><Icon name="location_on" size={16} /> {item.location?.label || 'On campus'}</span>
                <span>·</span>
                <span><Icon name="calendar_today" size={16} /> {fmtDate(item.eventDate)}</span>
                <span>·</span>
                <span>Posted by {item.owner?.name || 'Student'}</span>
              </p>
              <div className="detail-description">
                <p>{item.description}</p>
              </div>

              {item.aiTags?.summary && (
                <p className="tags muted">
                  Photo details: {[item.aiTags.color, item.aiTags.brand !== 'unknown' && item.aiTags.brand, ...(item.aiTags.features || [])].filter(Boolean).join(', ')}
                </p>
              )}
              {item.custodyNote && (
                <p className="custody">
                  <Icon name="place" size={18} />
                  <span>Where it is now: {item.custodyNote}</span>
                </p>
              )}
            </div>
          </div>

          {/* Campus Location Map */}
          {item.location && typeof item.location.lat === 'number' && typeof item.location.lng === 'number' && (
            <div className="card pad stack">
              <h3>
                <Icon name="map" size={22} /> Campus Location
              </h3>
              <p className="muted">
                <Icon name="location_on" size={16} /> {item.location.label || 'Campus'} — {item.type === 'lost' ? 'Where it was lost' : 'Where it was found'}
              </p>
              <MapView single items={[item]} center={[item.location.lat, item.location.lng]} zoom={17} />
            </div>
          )}
        </div>

        <aside className="detail-side">
          {isOwner && <OwnerPanel item={item} reload={load} />}
          {!isOwner && item.type === 'found' && item.status === 'open' && (
            <ClaimPanel item={item} onClaimed={setClaimed} claimed={claimed} />
          )}
          {!isOwner && item.type === 'lost' && item.status === 'open' && (
            <LostItemContactPanel item={item} onClaimed={setClaimed} />
          )}
          {item.status === 'returned' && (
            <div className="card pad stack">
              <h2>Listing Resolved</h2>
              <p className="muted">This item has been safely reunited with its owner.</p>
            </div>
          )}
        </aside>
      </div>

      {/* Floating WhatsApp Action Icon on Bottom Right */}
      {!isOwner && item.status === 'open' && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`floating-wa-btn ${claimed ? 'wa-pulse' : ''}`}
          aria-label={`Chat with ${contactPerson} on WhatsApp`}
          title={`Chat with ${contactPerson} on WhatsApp`}
          onClick={() => setClaimed(true)}
        >
          <WhatsAppIcon size={32} />
          <span className="floating-wa-label">
            Contact {contactPerson}
          </span>
          <span className="floating-wa-badge" aria-hidden="true">1</span>
        </a>
      )}
    </div>
  );
}
