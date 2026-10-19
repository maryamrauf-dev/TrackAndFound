import { Link } from 'react-router-dom';
import { catOf, fmtDate } from '../config.js';
import { imageSrc } from '../api.js';
import Icon from './Icon.jsx';

export default function ItemCard({ item }) {
  const cat = catOf(item.category);
  const isLost = item.type === 'lost';

  return (
    <Link
      to={`/items/${item._id}`}
      className="card item-card"
      aria-label={`${isLost ? 'Lost item' : 'Found item'}: ${item.title}`}
    >
      <div className={`thumb thumb-${item.type}`}>
        {item.imageUrl ? (
          <img src={imageSrc(item.imageUrl)} alt={item.title} loading="lazy" />
        ) : (
          <div className="thumb-placeholder">
            <span className="thumb-icon-wrap" aria-hidden="true">
              <Icon name={cat.icon} size={46} />
            </span>
            <span className="thumb-cat-label">{cat.label}</span>
          </div>
        )}

        <div className="thumb-badges">
          <span className={`chip chip-${item.type}`}>
            <span className="chip-icon" aria-hidden="true">
              <Icon name={isLost ? 'radio_button_checked' : 'check_circle'} size={14} />
            </span>
            {isLost ? 'Lost' : 'Found'}
          </span>
          {item.status === 'returned' && (
            <span className="chip chip-done">
              <Icon name="check" size={14} /> Resolved
            </span>
          )}
        </div>
      </div>

      <div className="item-body">
        <div className="item-header-meta">
          <span className="item-cat-tag">
            <Icon name={cat.icon} size={15} /> {cat.label}
          </span>
          <span className="item-date">{fmtDate(item.eventDate)}</span>
        </div>

        <h3 className="item-title">{item.title}</h3>

        {item.description && (
          <p className="item-desc-snippet">{item.description}</p>
        )}

        <div className="item-footer">
          <span className="item-location">
            <Icon name="location_on" size={16} /> {item.location?.label || 'Campus'}
          </span>
          <span className="item-view-action">
            View & Contact →
          </span>
        </div>
      </div>
    </Link>
  );
}
