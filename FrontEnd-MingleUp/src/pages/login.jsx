import React, { useState } from 'react';
import { AiOutlineAlipayCircle } from "react-icons/ai";
import { Link, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import axios from 'axios';
import Password from '../components/Passowordinput';
import { baseURL } from '../core';

import { store } from '../store/states';

function Login() {
    const { globalLogin } = store();
    const navigate = useNavigate();

    const [email, set_email] = useState('');
    const [password, set_password] = useState('');
    const [loading, setLoading] = useState(false);

    const handlesubmit = async (e) => {
        e.preventDefault();

        try {
            if (!email) {
                message.error('Email is Required...');
                return;
            }

            if (!password) {
                message.error('Password is Required...');
                return;
            }

            setLoading(true);
            const response = await axios.post(`${baseURL}/api/v1/login`, {
                email: email,
                password: password
            });

            message.success('Login Successfully...');
            localStorage.setItem("token", response.data.data.token);

            globalLogin(response.data.data.user);
            navigate('/');

            set_email('');
            set_password('');

        } catch (error) {
            console.error(error);
            if (error?.response?.data?.message === "email is not varified") {
                await axios.post(`${baseURL}/api/v1/send-otp`, {
                    email: email
                });

                navigate('/varify-email', {
                    state: {
                        email: email
                    }
                });
            } else {
                message.error(error?.response?.data?.message || error.message);
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl shadow-black/80 relative z-10 transition-all duration-300">

                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-3 shadow-inner">
                        <AiOutlineAlipayCircle className="text-4xl text-indigo-400 animate-pulse" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-slate-100">
                        Nook-Social
                    </h1>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        Welcome back! Please login to your account.
                    </p>
                </div>

                <form onSubmit={handlesubmit} className="space-y-5">

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder='name@example.com'
                            value={email}
                            onChange={(e) => set_email(e.target.value)}
                            className="w-full bg-slate-950/60 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl text-sm outline-none border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all duration-300 shadow-inner"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                            Password
                        </label>
                        <div className="relative">
                            <Password
                                placeholder='••••••••'
                                value={password}
                                onChange={(e) => set_password(e.target.value)}
                                className="w-full bg-slate-950/60 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl text-sm outline-none border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all duration-300 shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Forget Password Link Fixed */}
                    <div className="flex justify-end pt-1">
                        <Link
                            to="/forget"
                            className="text-xs sm:text-sm text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3 px-4 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>

                    <div className="text-center pt-2">
                        <Link
                            to="/signup"
                            className="text-xs sm:text-sm text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                        >
                            Don't have an account? <span className="text-indigo-400 underline underline-offset-4">Signup now</span>
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default Login;