import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(fullName, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Create Account" subtitle="Join SaveSphere to manage finances & set financial goals">
      {error && <ErrorMessage title="Registration Error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <Input
          label="Full Name"
          id="fullName"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={FiUser}
          required
        />
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
          helperText="Password must be at least 6 characters"
          required
        />
        <Button
          type="submit"
          variant="primary"
          icon={FiUserPlus}
          isLoading={isLoading}
          className="w-full"
        >
          Get Started
        </Button>
        <p className="text-xs text-center text-slate-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </Card>
  );
};

export default Register;
