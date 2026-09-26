import React, { useState } from 'react';
import { AiOutlineAlipayCircle } from "react-icons/ai";
import { Link, useNavigate } from 'react-router-dom';
import Password from '../components/Passowordinput';
import { message } from 'antd';
import axios from 'axios';
import { baseURL } from '../core';

function Signup() {
  const navigate = useNavigate();

  const [firstname, set_firstname] = useState('');
  const [lastname, set_lastname] = useState('');
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');
  const [Confirmpassword, set_Confirmpassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlesubmit = async (e) => {
    e.preventDefault();

    try {
      if (!firstname) {
        message.error('First name is Required...');
        return;
      }

      if (!lastname) {
        message.error('Last name is Required...');
        return;
      }

      if (!email) {
        message.error('Email is Required...');
        return;
      }

      if (!password) {
        message.error('Password is Required...');
        return;
      }

      if (password !== Confirmpassword) {
        message.error('Passwords do not match!');
        return;
      }

      setLoading(true);
      const response = await axios.post(`${baseURL}/api/v1/signup`, {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password
      });
      
      await axios.post(`${baseURL}/api/v1/send-otp`, {
        email: email
      });

      message.success('Signup Successfully...');

      navigate('/varify-email', {
        state: {
          email: email
        }
      });

      set_firstname('');
      set_lastname('');
      set_email('');
      set_password('');
      set_Confirmpassword('');

    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 sm:px-6 lg:px-8 relative overflow-hidden py-10">

      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg bg-slate-900/85 backdrop-blur-2xl border border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-black/80 relative z-10 transition-all duration-300">

        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-3 shadow-inner">
            <AiOutlineAlipayCircle className="text-4xl text-indigo-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-slate-100">
            Nook-Social
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Create your account and join the community.
          </p>
        </div>

        <form onSubmit={handlesubmit} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                First Name
              </label>
              <input
                type="text"
                placeholder='FirstName'
                value={firstname}
                onChange={(e) => set_firstname(e.target.value)}
                className="w-full bg-slate-950/60 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl text-sm outline-none border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all duration-300 shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                Last Name
              </label>
              <input
                type="text"
                placeholder='LastName'
                value={lastname}
                onChange={(e) => set_lastname(e.target.value)}
                className="w-full bg-slate-950/60 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl text-sm outline-none border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all duration-300 shadow-inner"
              />
            </div>
          </div>

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
            <Password
              placeholder='••••••••'
              value={password}
              onChange={(e) => set_password(e.target.value)}
              className="w-full bg-slate-950/60 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl text-sm outline-none border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all duration-300 shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
              Confirm Password
            </label>
            <Password
              placeholder='••••••••'
              value={Confirmpassword}
              onChange={(e) => set_Confirmpassword(e.target.value)}
              className="w-full bg-slate-950/60 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl text-sm outline-none border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all duration-300 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 px-4 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div className="text-center pt-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm text-slate-400 hover:text-indigo-400 transition-colors font-medium"
            >
              Already have an account? <span className="text-indigo-400 underline underline-offset-4">Login now</span>
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Signup;