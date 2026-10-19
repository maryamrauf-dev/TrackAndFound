import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import { useAuth } from './auth.jsx';
import Home from './pages/Home.jsx';
import PostItem from './pages/PostItem.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import Activity from './pages/Activity.jsx';
import Admin from './pages/Admin.jsx';
import AuthPage from './pages/AuthPage.jsx';

function Protected({ children, admin }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/signin" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/post" element={<Protected><PostItem /></Protected>} />
          <Route path="/activity" element={<Protected><Activity /></Protected>} />
          <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
          <Route path="/signin" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
