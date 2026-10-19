import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <header className="nav">
      <Link to="/" className="brand" aria-label="TrackAndFound Home">
        <div className="brand-symbol" aria-hidden="true">
          <span className="brand-dot-coral" />
          <span className="brand-dot-sage" />
        </div>
        <span>TrackAndFound</span>
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>Browse</NavLink>
        <NavLink to="/post">Post an item</NavLink>
        {user && <NavLink to="/activity">My activity</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Moderation</NavLink>}
      </nav>
      <div className="nav-user">
        {user ? (
          <>
            <span className="hello">Hi, {user.name.split(' ')[0]}</span>
            <button className="btn btn-quiet" onClick={() => { signOut(); nav('/'); }}>Sign out</button>
          </>
        ) : (
          <Link className="btn btn-primary" to="/signin">Sign in</Link>
        )}
      </div>
    </header>
  );
}
