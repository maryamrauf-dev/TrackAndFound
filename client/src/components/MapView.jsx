import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { CAMPUS, catOf, fmtDate } from '../config.js';
import Icon from './Icon.jsx';

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

const pin = (type) =>
  L.divIcon({
    className: 'custom-pin-wrapper',
    html: `<div class="pin pin-${type}"><span class="pin-symbol"><span class="material-symbols-outlined" style="font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center;">${
      type === 'lost' ? 'radio_button_checked' : 'check_circle'
    }</span></span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

export default function MapView({ items = [], center, zoom = 16, single }) {
  const c = center || [CAMPUS.lat, CAMPUS.lng];
  const validItems = (items || []).filter(
    (i) => i.location && typeof i.location.lat === 'number' && typeof i.location.lng === 'number'
  );

  return (
    <div className={`map-wrapper ${single ? 'map-single' : ''}`}>
      <MapContainer center={c} zoom={zoom} scrollWheelZoom className="map">
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validItems.map((i) => {
          const cat = catOf(i.category);
          const isLost = i.type === 'lost';
          return (
            <Marker key={i._id} position={[i.location.lat, i.location.lng]} icon={pin(i.type)}>
              {!single && (
                <Popup className="item-popup">
                  <div className="popup-card">
                    {i.imageUrl && (
                      <div className="popup-thumb">
                        <img src={i.imageUrl} alt={i.title} />
                      </div>
                    )}
                    <div className="popup-body">
                      <span className={`chip chip-${i.type}`}>
                        <Icon name={isLost ? 'radio_button_checked' : 'check_circle'} size={13} />
                        <span>{isLost ? 'Lost' : 'Found'}</span>
                      </span>
                      <strong className="popup-title">{i.title}</strong>
                      <p className="popup-meta muted">
                        <Icon name={cat.icon} size={15} />
                        <span>{i.location?.label || 'Campus'} · {fmtDate(i.eventDate)}</span>
                      </p>
                      <Link to={`/items/${i._id}`} className="popup-link">
                        View item & contact →
                      </Link>
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
