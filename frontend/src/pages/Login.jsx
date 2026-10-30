import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Welcome Back" subtitle="Sign in to your SaveSphere account">
      {error && <ErrorMessage title="Authentication Error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <Input
          label="Email Address"
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={FiMail}
          required
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={FiLock}
          required
        />
        <div className="flex items-center justify-between text-xs text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded bg-slate-900 border-slate-800 text-emerald-500" />
            <span>Remember me</span>
          </label>
          <a href="#forgot" className="text-emerald-400 hover:underline">
            Forgot password?
          </a>
        </div>
        <Button
          type="submit"
          variant="primary"
          icon={FiLogIn}
          isLoading={isLoading}
          className="w-full"
        >
          Sign In
        </Button>
        <p className="text-xs text-center text-slate-400 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 font-medium hover:underline">
            Create Account
          </Link>
        </p>
      </form>
    </Card>
  );
};

export default Login;
