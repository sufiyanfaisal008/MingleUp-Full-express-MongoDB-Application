import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import { FaPlus, FaImage, FaPaperPlane } from 'react-icons/fa';
import Getpost from '../components/allpost';
import axios from 'axios';
import { baseURL } from '../core';
import { message } from 'antd';

function Posting() {
    const [showForm, setShowForm] = useState(false);
    const [posts, setPosts] = useState([]);
    const titleRef = useRef(null);
    const descRef = useRef(null);
    const fileRef = useRef(null);

    useEffect(() => {
        getPosts();
    }, []);

    const getPosts = async () => {
        try {
            const response = await axios.get(`${baseURL}/api/v1/post`, {
                headers: {
                    token: localStorage.getItem("token")
                }
            });
            setPosts(response?.data?.data || response?.data?.posts || []);
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || error.message);
        }
    };

    const handlecreatepost = async (e) => {
        e.preventDefault();

        if (!titleRef.current.value) {
            alert("title is required");
            return;
        }

        if (!descRef.current.value) {
            alert("description is required");
            return;
        }

        const formData = new FormData();
        formData.append("title", titleRef.current.value);
        formData.append("description", descRef.current.value);
        if (fileRef.current.files.length) {
            formData.append("file", fileRef.current.files[0]);
        }

        try {
            const response = await axios.post(`${baseURL}/api/v1/post`, formData, {
                headers: {
                    token: localStorage.getItem("token")
                }
            });

            message.success(response?.data?.message || "Created Post Successfully");
            
            // Nayi post ko directly posts state ke top par add kardia taake bina refresh ke show hojaye
            const newCreatedPost = response?.data?.data || response?.data?.post;
            if (newCreatedPost) {
                setPosts([newCreatedPost, ...posts]);
            } else {
                getPosts(); // Fallback agar backend direct post object na de
            }

            titleRef.current.value = "";
            descRef.current.value = "";
            fileRef.current.value = "";
            setShowForm(false);

        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || error.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <Header />

            <div className="relative w-full py-20 px-4 flex items-center justify-center overflow-hidden border-b border-slate-900">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop"
                        alt="Hero Background"
                        className="w-full h-full object-cover filter brightness-50"
                    />
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"></div>
                </div>

                <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
                    <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-500 tracking-tight mb-4 drop-shadow-lg">
                        Welcome to Noon-Social-Web
                    </h1>
                    <p className="text-base sm:text-xl text-slate-300 font-medium mb-8 max-w-xl leading-relaxed">
                        Connect, share, and vibe with a community that matches your energy. Express your moments, discover trending stories, and stay closer to the people who matter most.
                    </p>

                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                        }}
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-indigo-400/30"
                    >
                        <FaPlus className={`text-lg transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} />
                        <span>{showForm ? "Close Form" : "Create Post"}</span>
                    </button>
                </div>
            </div>

            <div className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-12">
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showForm ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 pointer-events-none'}`}>
                    <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl shadow-2xl shadow-black/80 p-6 sm:p-10">

                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                Create New Post
                            </h2>
                            <span className="text-xs text-slate-400 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800">Draft mode</span>
                        </div>

                        <form className="space-y-6">

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Post Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter a title..."
                                    className="w-full bg-slate-950/60 text-slate-100 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3 px-4 outline-none shadow-inner transition-all duration-300 placeholder:text-slate-600"
                                    ref={titleRef}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                                <textarea
                                    rows="5"
                                    placeholder="What's on your mind? Write your description here..."
                                    className="w-full bg-slate-950/60 text-slate-100 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3 px-4 outline-none shadow-inner transition-all duration-300 placeholder:text-slate-600 resize-none"
                                    ref={descRef}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Upload Picture</label>
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/40 rounded-2xl p-6 transition-all duration-300 relative group cursor-pointer">

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        ref={fileRef}
                                    />

                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                                            <FaImage className="text-xl" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-300">Click to upload image</p>
                                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
                                    </div>

                                </div>
                            </div>

                            <button
                                onClick={handlecreatepost}
                                type="submit"
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:opacity-95 active:scale-98 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <FaPaperPlane className="text-sm" />
                                <span>Publish Post</span>
                            </button>

                        </form>
                    </div>
                </div>
                
                <Getpost posts={posts} setPosts={setPosts} />
            </div>
        </div>
    );
}

export default Posting;