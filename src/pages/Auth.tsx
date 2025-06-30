
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function Auth() {
  const { signUp, signIn, user, sendPhoneOTP, verifyOTP, resendEmailConfirmation } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [verificationPhone, setVerificationPhone] = useState('');
  const [otp, setOTP] = useState('');

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    businessName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  // Sign in form state
  const [signInData, setSignInData] = useState({
    identifier: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      return;
    }

    setLoading(true);
    try {
      await signUp(signUpData.email, signUpData.password, signUpData.businessName, signUpData.phoneNumber);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(signInData.identifier, signInData.password);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOTP = async () => {
    if (!verificationPhone) return;
    setLoading(true);
    try {
      await sendPhoneOTP(verificationPhone);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || !verificationPhone) return;
    setLoading(true);
    try {
      await verifyOTP(verificationPhone, otp);
      setShowOTPVerification(false);
      setOTP('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (email: string) => {
    if (!email) return;
    setLoading(true);
    try {
      await resendEmailConfirmation(email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Hall Harmony Finance
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage your hall bookings and finances
          </p>
        </div>

        {showOTPVerification ? (
          <Card>
            <CardHeader>
              <CardTitle>Phone Verification</CardTitle>
              <CardDescription>
                Enter the OTP sent to {verificationPhone}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOTP}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowOTPVerification(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your email or phone number and password to sign in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="identifier">Email or Phone Number</Label>
                      <Input
                        id="identifier"
                        type="text"
                        value={signInData.identifier}
                        onChange={(e) => setSignInData(prev => ({ ...prev, identifier: e.target.value }))}
                        placeholder="Enter your email or phone number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Sign Up</CardTitle>
                  <CardDescription>
                    Create your account to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="businessName"
                        type="text"
                        value={signUpData.businessName}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, businessName: e.target.value }))}
                        placeholder="Enter your business name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={signUpData.phoneNumber}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword">Password <span className="text-red-500">*</span></Label>
                      <Input
                        id="signupPassword"
                        type="password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your password"
                        required
                      />
                      {signUpData.password !== signUpData.confirmPassword && signUpData.confirmPassword && (
                        <p className="text-sm text-red-600">Passwords do not match</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || signUpData.password !== signUpData.confirmPassword}
                    >
                      {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                  </form>

                  <div className="mt-6 space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-2">Verify Phone Number</h4>
                      <div className="flex space-x-2">
                        <Input
                          type="tel"
                          value={verificationPhone}
                          onChange={(e) => setVerificationPhone(e.target.value)}
                          placeholder="+1234567890"
                        />
                        <Button
                          variant="outline"
                          onClick={handleSendPhoneOTP}
                          disabled={loading || !verificationPhone}
                        >
                          Send OTP
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-2">Resend Email Verification</h4>
                      <div className="flex space-x-2">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          id="resendEmail"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            const email = (document.getElementById('resendEmail') as HTMLInputElement)?.value;
                            if (email) handleResendEmail(email);
                          }}
                          disabled={loading}
                        >
                          Resend
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
