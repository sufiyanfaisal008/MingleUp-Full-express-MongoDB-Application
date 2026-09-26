import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { message, Modal, Input, ConfigProvider, theme } from 'antd';
import axios from 'axios';
import { baseURL } from '../core';
import { AiOutlineHeart, AiOutlineMessage, AiOutlineShareAlt, AiOutlineMore, AiOutlineEdit, AiOutlineDelete, AiOutlineSearch } from 'react-icons/ai';
import { FaHeart } from "react-icons/fa";
import { store } from '../store/states';

function AllPost({ posts, setPosts, showSearch = true, showLoadMore = true }) {
    const { user } = store();
    const navigate = useNavigate();
    const [openMenuIndex, setOpenMenuIndex] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const handleEditClick = (post) => {
        setEditingPost(post);
        setNewTitle(post?.title || '');
        setNewDescription(post?.description || '');
        setIsEditModalOpen(true);
        setOpenMenuIndex(null);
    };

    const handleUpdatePost = async () => {
        if (!newTitle.trim() || !newDescription.trim()) {
            message.error("Title and description cannot be empty");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.put(`${baseURL}/api/v1/post/${editingPost._id}`, {
                title: newTitle,
                description: newDescription
            }, {
                headers: {
                    token: localStorage.getItem("token")
                }
            });

            const updatedPostData = response?.data?.data || response?.data?.post;
            setPosts(posts.map(p => p._id === editingPost._id ? (updatedPostData || { ...p, title: newTitle, description: newDescription }) : p));

            message.success("Post updated successfully");
            setIsEditModalOpen(false);
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        try {
            await axios.delete(`${baseURL}/api/v1/post/${postId}`, {
                headers: {
                    token: localStorage.getItem("token")
                }
            });

            setPosts(posts.filter(p => p._id !== postId));
            message.success("Post deleted successfully");
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || error.message);
        }
        setOpenMenuIndex(null);
    };

    const sharepoast = async (postId) => {
        try {
            const url = `${window.location.origin}/singlepost/${postId}`;
            await navigator.clipboard.writeText(url);
            message.success("Link copied successfully!");
        } catch (err) {
            console.error("Failed to copy text: ", err);
            message.error("Failed to copy link");
        }
    };

    const likePost = async (postId) => {
        try {
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    const isAlreadyLiked = post.likes.includes(user?._id);
                    let updatedLikes;

                    if (isAlreadyLiked) {
                        updatedLikes = post.likes.filter(id => id.toString() !== user?._id.toString());
                    } else {
                        updatedLikes = [user?._id, ...post.likes];
                    }

                    return { ...post, likes: updatedLikes };
                }
                return post;
            }));

            const response = await axios.post(`${baseURL}/api/v1/post/likes/${postId}`, {}, {
                headers: {
                    token: localStorage.getItem("token")
                }
            });

            message.success(response?.data?.message);

        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || error.message);
        }
    };

    const commentnow = (postId) => {
        navigate(`/singlepost/${postId}`);
    };

    const loadMorePosts = async () => {
        if (loadingMore || !hasMore) return;
        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            
            await new Promise(resolve => setTimeout(resolve, 1500));

            const response = await axios.get(`${baseURL}/api/v1/post?page=${nextPage}`, {
                headers: {
                    token: localStorage.getItem("token")
                }
            });

            const newPosts = response?.data?.data || [];
            if (newPosts.length === 0) {
                setHasMore(false);
                message.info("No more posts available");
            } else {
                setPosts(prev => [...prev, ...newPosts]);
                setPage(nextPage);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to load more posts");
        } finally {
            setLoadingMore(false);
        }
    };

    const filteredPosts = posts?.filter(post => {
        const titleMatch = post?.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = post?.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || descMatch;
    });

    return (
        <div className="w-full flex flex-col items-center py-6 px-4">
            {showSearch && (
                <div className="w-full max-w-2xl mb-8 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <AiOutlineSearch className="text-xl" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search posts by title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-lg transition-all"
                    />
                </div>
            )}

            <div className="w-full max-w-2xl space-y-6">
                {!filteredPosts || filteredPosts.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-medium">
                        No posts found.
                    </div>
                ) : (
                    filteredPosts.map((post, index) => {
                        const postUser = post?.userId || {};
                        const fullName = `${postUser?.firstname || postUser?.firstName || 'User'} ${postUser?.lastname || postUser?.lastName || ''}`;
                        const profilePic = postUser?.profilePicture || 'https://via.placeholder.com/150';
                        const postDate = post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : '';

                        return (
                            <div
                                key={post?._id || index}
                                className="bg-slate-900/85 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-xl shadow-black/60 overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-indigo-500/50 hover:shadow-indigo-500/10 relative"
                            >
                                <div className="p-5 flex items-center justify-between border-b border-slate-800/60">
                                    <Link
                                        to={`/profile/${postUser?._id || ''}`}
                                        className="flex items-center gap-3.5 group"
                                    >
                                        <img
                                            src={profilePic}
                                            alt={fullName}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40 group-hover:border-indigo-400 transition-colors"
                                        />
                                        <div>
                                            <h3 className="text-base font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                                                {fullName}
                                            </h3>
                                            <span className="text-xs text-slate-500 font-medium">
                                                {postDate}
                                            </span>
                                        </div>
                                    </Link>

                                    {user?._id === postUser?._id ? (
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                                                className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
                                            >
                                                <AiOutlineMore className="text-xl" />
                                            </button>

                                            {openMenuIndex === index && (
                                                <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 py-1.5 overflow-hidden backdrop-blur-xl">
                                                    <button
                                                        onClick={() => handleEditClick(post)}
                                                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                                                    >
                                                        <AiOutlineEdit className="text-base" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post?._id)}
                                                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                                                    >
                                                        <AiOutlineDelete className="text-base" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                <Link to={`/singlepost/${post?._id}`} className="block group">
                                    {post?.title && (
                                        <div className="px-6 pt-5 text-lg sm:text-xl font-bold text-slate-100 tracking-wide group-hover:text-indigo-400 transition-colors">
                                            {post.title}
                                        </div>
                                    )}

                                    {post?.description && (
                                        <div className="px-6 pt-2 text-base text-slate-300 leading-relaxed font-normal">
                                            {post.description}
                                        </div>
                                    )}
                                </Link>

                                {post?.imageUrl && (
                                    <div className="mt-4 w-full bg-slate-950/40">
                                        <img
                                            src={post.imageUrl}
                                            alt="Post content"
                                            className="w-full max-h-[550px] object-cover"
                                        />
                                    </div>
                                )}

                                <div className="p-4 flex items-center justify-around border-t border-slate-800/60 text-slate-400 text-sm font-semibold">
                                    <button onClick={() => likePost(post?._id)} className="flex items-center gap-2 hover:text-indigo-400 transition-colors cursor-pointer py-1 px-3 rounded-xl hover:bg-slate-800/50">
                                        {post.likes.includes(user?._id) ? (
                                            <FaHeart className="text-xl text-rose-500" />
                                        ) : (
                                            <AiOutlineHeart className="text-xl" />
                                        )}
                                        <span>{post.likes.length} Likes</span>
                                    </button>
                                    <button onClick={() => commentnow(post?._id)} className="flex items-center gap-2 hover:text-indigo-400 transition-colors cursor-pointer py-1 px-3 rounded-xl hover:bg-slate-800/50">
                                        <AiOutlineMessage className="text-xl" />
                                        <span>Comment</span>
                                    </button>
                                    <button onClick={() => sharepoast(post?._id)} className="flex items-center gap-2 hover:text-indigo-400 transition-colors cursor-pointer py-1 px-3 rounded-xl hover:bg-slate-800/50">
                                        <AiOutlineShareAlt className="text-xl" />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {hasMore && searchQuery === '' && showLoadMore && (
                <div className="mt-8">
                    <button
                        onClick={loadMorePosts}
                        disabled={loadingMore}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                        {loadingMore ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Loading more posts...
                            </>
                        ) : (
                            "Load More Posts"
                        )}
                    </button>
                </div>
            )}

            <ConfigProvider
                theme={{
                    algorithm: theme.darkAlgorithm,
                    token: {
                        colorPrimary: '#6366f1',
                        colorBgContainer: '#0f172a',
                        colorText: '#f8fafc',
                        colorTextPlaceholder: '#64748b',
                        colorBorder: '#1e293b',
                    },
                }}
            >
                <Modal
                    title={<span className="text-slate-100 font-bold text-lg">Edit Post</span>}
                    open={isEditModalOpen}
                    onCancel={() => setIsEditModalOpen(false)}
                    onOk={handleUpdatePost}
                    confirmLoading={loading}
                    okText="Update"
                    okButtonProps={{ className: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-4 py-2 h-auto cursor-pointer border-none' }}
                    cancelButtonProps={{ className: 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-semibold rounded-xl px-4 py-2 h-auto border-none cursor-pointer' }}
                    className="rounded-3xl overflow-hidden"
                >
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">New Title</label>
                            <Input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Enter new title..."
                                className="bg-slate-950/60 text-slate-100 border-slate-800 hover:border-indigo-500 focus:border-indigo-500 rounded-xl py-2.5 px-3.5 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">New Description</label>
                            <Input.TextArea
                                rows={4}
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Enter new description..."
                                className="bg-slate-950/60 text-slate-100 border-slate-800 hover:border-indigo-500 focus:border-indigo-500 rounded-xl p-3.5 text-sm resize-none"
                            />
                        </div>
                    </div>
                </Modal>
            </ConfigProvider>
        </div>
    );
}

export default AllPost;