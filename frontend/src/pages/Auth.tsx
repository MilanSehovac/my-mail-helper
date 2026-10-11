import { useState } from 'react';
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Toggle tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                            isLogin
                                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                            !isLogin
                                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                    >
                        Create Account
                    </button>
                </div>

                {/* Komponente */}
                {isLogin ? <LoginForm /> : <RegisterForm />}
            </div>
        </div>
    );
}