import React, { useState, useRef } from 'react';
import { AiOutlineSafety, AiOutlineLock } from "react-icons/ai";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import axios from 'axios';
import Password from '../components/Passowordinput';
import { baseURL } from '../core';

function ForgotPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    const handleOtpChange = (value, index) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleResendOtp = async () => {
        try {
            if (!email) {
                message.error('Email is missing. Please go back and enter your email.');
                return;
            }
              await axios.post(`${baseURL}/api/v1/forgot-password-otp`, {
                email: email
            });
            message.success("OTP Resent Successfully!");
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || error.message);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const finalOtp = otp.join('');

        try {
            if (finalOtp.length < 6) {
                message.warning("Please enter complete 6-digit OTP");
                return;
            }

            if (!newPassword) {
                message.error("Please enter a new password");
                return;
            }

            if (!email) {
                message.error("Email not found. Please restart the process.");
                return;
            }

            setLoading(true);

            await axios.post(`${baseURL}/api/v1/reset-password`, {
                email: email,
                otp: finalOtp,
                newPassword: newPassword
            });

            message.success("Password Reset Successfully!");
            navigate('/login');

        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || error.message);
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
                        <AiOutlineSafety className="text-4xl text-indigo-400 animate-pulse" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-slate-100">
                        Reset Password
                    </h1>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        Enter the 6-digit OTP sent to <span className="text-indigo-400">{email || 'your email'}</span> and your new password.
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                            Verification OTP
                        </label>
                        <div className="flex justify-between gap-2">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    value={data}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    onChange={(e) => handleOtpChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-12 h-12 text-center bg-slate-950/60 text-slate-100 text-lg font-bold rounded-2xl outline-none border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all duration-300 shadow-inner"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="text-right -mt-3">
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold cursor-pointer underline underline-offset-2"
                        >
                            Resend OTP?
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                            New Password
                        </label>
                        <div className="relative">
                            <Password
                                placeholder='••••••••'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-950/60 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl text-sm outline-none border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all duration-300 shadow-inner"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Updating Password...' : 'Change Password'}
                    </button>

                    <div className="text-center pt-2">
                        <Link
                            to="/login"
                            className="text-xs sm:text-sm text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                        >
                            Remember your password? <span className="text-indigo-400 underline underline-offset-4">Sign In</span>
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;