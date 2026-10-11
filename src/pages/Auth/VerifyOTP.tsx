import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, AlertCircle } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { Button, Card } from '../../components/ui';
import { authService } from '../../services/api';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Missing email — please restart signup.');
      return;
    }
    if (otp.some((digit) => !digit)) {
      setError('Please enter all 6 digits.');
      return;
    }
    setIsLoading(true);
    const res = await authService.verifyOTP(email, otp.join(''), 'signup');
    setIsLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Invalid or expired code.');
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setNotice(null);
    const res = await authService.sendOtp(email, 'signup');
    setResending(false);
    setNotice(res.success ? 'A new code has been sent.' : res.error || 'Could not resend the code.');
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
              <p className="text-gray-600 mt-2">
                {email ? <>We sent a 6-digit code to <span className="font-medium">{email}</span></> : 'Enter the 6-digit code we sent you'}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {notice && !error && (
              <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg px-3 py-2.5 mb-4 text-center">
                {notice}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Enter code</label>
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      inputMode="numeric"
                      maxLength={1}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive it?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || !email}
                    className="text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
                  >
                    {resending ? 'Sending…' : 'Resend code'}
                  </button>
                </p>
              </div>

              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                Verify
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default VerifyOTP;
