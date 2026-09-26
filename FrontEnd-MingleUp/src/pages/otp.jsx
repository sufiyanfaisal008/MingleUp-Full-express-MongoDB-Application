import { message } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { baseURL } from '../core';

function Otp() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        let interval = null;
        if (timer > 0 && !canResend) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer, canResend]);

    const handleChange = (value, index) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
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

    const handleResend = async () => {
        try {
            await axios.post(`${baseURL}/api/v1/send-otp`, {
                email: email
            });

            message.success("OTP Resent Successfully!");
            setTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || error.message);
        }
    };

    const handleVerify = async () => {
        try {
            const finalOtp = otp.join('');
            if (finalOtp.length < 6) {
                message.warning("Please enter complete 6-digit OTP");
                return;
            }

            const response = await axios.post(`${baseURL}/api/v1/varify-otp`, {
                email: email,
                otp: finalOtp
            });

            message.success("Your Email Verified...");
            navigate('/login');
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || error.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-slate-900/85 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6">

                <div className="text-center space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Email Verification</h2>
                    <p className="text-sm text-slate-400">
                        Enter the 6-digit verification code sent to:
                    </p>
                    
                    <div className="inline-block bg-indigo-950/60 border border-indigo-500/30 px-4 py-1.5 rounded-full text-xs sm:text-sm text-indigo-300 font-semibold shadow-inner">
                        {email || "No email provided"}
                    </div>
                </div>

                <div className="flex justify-center gap-3">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-12 h-12 text-center text-xl font-semibold bg-slate-950 text-white border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all shadow-inner"
                        />
                    ))}
                </div>

                <button
                    onClick={handleVerify}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                    Verify OTP
                </button>

                <div className="text-center text-sm text-slate-400">
                    Didn't receive the code?{' '}
                    {canResend ? (
                        <button
                            onClick={handleResend}
                            className="text-indigo-400 font-medium hover:underline focus:outline-none cursor-pointer"
                        >
                            Resend Code
                        </button>
                    ) : (
                        <span className="text-slate-500 font-medium">
                            Resend in <span className="text-indigo-400">{timer}s</span>
                        </span>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Otp;