import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errMsg } from '../api.js';

export default function Admin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/admin/overview').then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const act = async (fn) => { await fn(); load(); };

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading...</p>;
  const s = data.stats;

  return (
    <div className="stack gap">
      <h1>Moderation</h1>
      <div className="stats">
        {[['Open lost', s.lost], ['Open found', s.found], ['Returned', s.returned], ['Verified claims', s.verifiedClaims], ['Claims in review', s.claimsInReview], ['Users', s.users]].map(([l, v]) => (
          <div key={l} className="card stat"><strong>{v}</strong><span className="muted">{l}</span></div>
        ))}
      </div>

      <section className="stack">
        <h2>Open reports</h2>
        {data.reports.length === 0 && <p className="muted">No reports. Nice and quiet.</p>}
        {data.reports.map((r) => (
          <div key={r._id} className="card pad row between">
            <div>
              <Link to={`/items/${r.item?._id}`}><strong>{r.item?.title}</strong></Link>
              <p className="muted">{r.reason} (reported by {r.reporter?.name})</p>
            </div>
            <div className="row">
              <button className="btn btn-quiet" onClick={() => act(() => api.patch(`/admin/reports/${r._id}`))}>Dismiss</button>
              <button className="btn btn-danger" onClick={() => act(async () => {
                await api.patch(`/admin/items/${r.item._id}`, { status: 'removed' });
                await api.patch(`/admin/reports/${r._id}`);
              })}>Remove listing</button>
            </div>
          </div>
        ))}
      </section>

      <section className="stack">
        <h2>Recent listings</h2>
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Type</th><th>Posted by</th><th>Status</th><th /></tr></thead>
            <tbody>
              {data.recent.map((i) => (
                <tr key={i._id}>
                  <td><Link to={`/items/${i._id}`}>{i.title}</Link></td>
                  <td>{i.type}</td>
                  <td>
                    {i.owner?.name}
                    {i.owner?.banned && ' (suspended)'}
                  </td>
                  <td>{i.status}</td>
                  <td className="actions">
                    {i.status === 'removed'
                      ? <button className="link" onClick={() => act(() => api.patch(`/admin/items/${i._id}`, { status: 'open' }))}>Restore</button>
                      : <button className="link" onClick={() => act(() => api.patch(`/admin/items/${i._id}`, { status: 'removed' }))}>Remove</button>}
                    {i.owner && (
                      <button className="link" onClick={() => act(() => api.patch(`/admin/users/${i.owner._id}/ban`, { banned: !i.owner.banned }))}>
                        {i.owner.banned ? 'Unsuspend user' : 'Suspend user'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
