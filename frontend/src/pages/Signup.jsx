import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, sendOtp } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendOtp(email);
      setMessage('An OTP has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(username, email, password, otp);
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed. Invalid OTP?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {step === 1 ? 'Create a new account' : 'Verify your email'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={step === 1 ? handleSendOtp : handleSignup}>
           {error && <div className="text-red-500 text-sm text-center">{error}</div>}
           {message && <div className="text-green-500 text-sm text-center">{message}</div>}
          
          {step === 1 ? (
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-md shadow-sm">
              <input
                type="text"
                required
                maxLength="6"
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-lg text-center tracking-[0.5em] font-mono"
                placeholder="6-Digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition`}
            >
              {loading ? 'Processing...' : (step === 1 ? 'Send OTP' : 'Verify & Sign Up')}
            </button>
            {step === 2 && (
               <button 
                 type="button" 
                 disabled={loading}
                 onClick={() => setStep(1)} 
                 className="mt-4 w-full flex justify-center py-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition"
               >
                 Go back to edit details
               </button>
            )}
          </div>
        </form>
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
           Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
