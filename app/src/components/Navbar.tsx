import { Link } from 'react-router-dom';

export const Navbar = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  return (
    <nav className="flex justify-between p-4 bg-gray-100">
      <div className="flex gap-4">
        <Link to="/">Home</Link>
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
      </div>
      {user && (
        <button onClick={onLogout} className="text-red-500">
          Logout
        </button>
      )}
    </nav>
  );
}
