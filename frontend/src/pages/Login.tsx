import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await authService.login({ email, password });
      setUser(user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Chyba pri prihlásení');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">FinanceAI</h1>
          <p className="text-gray-600">Prihlásenie do účtu</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Prihlasujem...' : 'Prihlásiť sa'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Nemáte účet?{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            Zaregistrujte sa
          </Link>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
          <strong>Demo prihlasovacie údaje:</strong>
          <br />
          Email: dusan.oravsky@gmail.com
          <br />
          Heslo: password123
        </div>
      </div>
    </div>
  );
}
