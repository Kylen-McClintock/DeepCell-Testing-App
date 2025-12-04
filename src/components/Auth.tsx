import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage('Check your email for the login link or code!');
            setShowOtpInput(true);
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        });

        if (error) {
            setMessage(error.message);
            setLoading(false);
        } else {
            // Success! The session will be set automatically and Layout will re-render
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="card max-w-md w-full">
                <h1 className="text-2xl font-bold mb-2 text-center">Welcome to DeepCell Tracker</h1>
                <p className="text-[var(--muted)] text-center mb-6">Sign in to save your progress</p>

                {!showOtpInput ? (
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm text-[var(--muted)] mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="Your email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Login Link / Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                        <div className="text-center text-sm text-[var(--accent2)] mb-2">
                            Email sent to {email}
                        </div>
                        <div>
                            <label className="block text-sm text-[var(--muted)] mb-1">Enter 6-Digit Code</label>
                            <input
                                type="text"
                                placeholder="123456"
                                className="input-field text-center text-2xl tracking-widest"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <button
                            type="button"
                            className="text-xs text-[var(--muted)] underline mt-2"
                            onClick={() => setShowOtpInput(false)}
                        >
                            Wrong email? Go back
                        </button>
                    </form>
                )}

                {message && (
                    <div className="mt-4 p-3 bg-[#1b2144] border border-[#2b3266] rounded-xl text-center text-sm">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
