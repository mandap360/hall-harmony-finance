import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import mandap360Logo from '@/assets/mandap360-logo.png';

export default function Auth() {
  const { signIn, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Sign in form state
  const [signInData, setSignInData] = useState({
    identifier: '',
    password: ''
  });

  // Forgot password form state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(signInData.identifier, signInData.password);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(forgotPasswordEmail);
      setForgotPasswordEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-200 via-blue-200 to-purple-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <img 
              src={mandap360Logo} 
              alt="Mandap360 Logo" 
              className="w-20 h-20 mb-4"
            />
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Mandap360</h1>
          </div>

          {!showForgotPassword ? (
            <form onSubmit={handleSignIn} className="space-y-5">
              {/* Email Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <Input
                  id="identifier"
                  type="text"
                  value={signInData.identifier}
                  onChange={(e) => setSignInData(prev => ({ ...prev, identifier: e.target.value }))}
                  placeholder="Email"
                  required
                  className="pl-12 h-14 rounded-full shadow-md border-0 bg-white text-base placeholder:text-gray-400"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={signInData.password}
                  onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Password"
                  required
                  className="pl-12 h-14 rounded-full shadow-md border-0 bg-white text-base placeholder:text-gray-400"
                />
              </div>

              {/* Sign In Button */}
              <Button 
                type="submit" 
                className="w-full h-14 rounded-full bg-[#4A90E2] hover:bg-[#357ABD] text-white text-lg font-medium shadow-lg transition-all" 
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-base text-[#4A90E2] hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <p className="text-center text-gray-600 mb-6">
                Enter your email address to receive a reset link
              </p>
              
              {/* Email Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <Input
                  id="reset-email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="pl-12 h-14 rounded-full shadow-md border-0 bg-white text-base placeholder:text-gray-400"
                />
              </div>

              {/* Send Reset Link Button */}
              <Button 
                type="submit" 
                className="w-full h-14 rounded-full bg-[#4A90E2] hover:bg-[#357ABD] text-white text-lg font-medium shadow-lg transition-all" 
                disabled={loading}
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </Button>

              {/* Back to Sign In Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-base text-[#4A90E2] hover:underline font-medium"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
