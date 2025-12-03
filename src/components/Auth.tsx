import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.signInWithOtp({ email });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage('Check your email for the login link!');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="card max-w-md w-full">
                <h1 className="text-2xl font-bold mb-2 text-center">Welcome to DeepCell Tracker</h1>
                <p className="text-[var(--muted)] text-center mb-6">Sign in to save your progress</p>

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
                        {loading ? 'Sending magic link...' : 'Send Magic Link'}
                    </button>
                </form>

                {message && (
                    <div className="mt-4 p-3 bg-[#1b2144] border border-[#2b3266] rounded-xl text-center text-sm">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
