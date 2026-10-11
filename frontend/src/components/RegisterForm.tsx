import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader } from 'lucide-react';
import API from '../api/axios';

export default function RegisterForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await API.post('/auth/register', form);
            localStorage.setItem('token', response.data.token);
            navigate('/agencies');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-100">Create Account</h1>
                        <p className="text-sm text-slate-400 mt-1">Get started in seconds</p>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-sm text-rose-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 size-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Milan"
                                        value={form.first_name}
                                        onChange={(e) => update('first_name', e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Last Name</label>
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    value={form.last_name}
                                    onChange={(e) => update('last_name', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 size-4 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(e) => update('email', e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 size-4 text-slate-500" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => update('password', e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader className="size-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}