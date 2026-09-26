import React, { useState, useEffect } from 'react';
import { IoMdArrowRoundBack } from "react-icons/io";
import { BsThreeDotsVertical, BsPencilSquare, BsKey } from "react-icons/bs";
import { FaCamera, FaTimes, FaLock, FaUserEdit } from "react-icons/fa";
import { AiOutlineHeart, AiFillHeart, AiOutlineMessage, AiOutlineShareAlt, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { useNavigate, Link } from 'react-router-dom';
import { message, Modal, Input, ConfigProvider, theme } from 'antd';
import { store } from '../store/states';
import axios from 'axios';
import { baseURL } from '../core';
import { useParams } from 'react-router-dom';

function Profile() {
  const params = useParams();
  const userId = params.userId;
  const { user, globalLogin } = store();
  const navigate = useNavigate();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otheruser, setotheruser] = useState(null);
  const [otheruserprofileposts, setotheruserprofileposts] = useState([]);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [loading, setLoading] = useState(false);

  const isMyProfile = !userId || userId === user?._id || otheruser?._id === user?._id;

  const backOn = () => {
    navigate(-1);
  };

  const handleImageChange = async (file) => {
    if (!file) return;

    message.info("Uploading profile picture...");

    const formData = new FormData();
    formData.append("my-file", file);

    try {
      const response = await axios.put(`${baseURL}/api/v1/profile-picture`, formData, {
        headers: {
          token: localStorage.getItem("token")
        }
      });

      message.success("Profile picture updated successfully!");

      const newPictureUrl = response.data.url || response.data.profilePicture || response.data.data?.profilePicture;

      globalLogin({
        ...user,
        profilePicture: newPictureUrl
      });

      setotheruser(prev => ({ ...prev, profilePicture: newPictureUrl }));

    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || error.message);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!firstname.trim() || !lastname.trim()) {
      message.error("First name and Last name cannot be empty!");
      return;
    }

    try {
      setLoading(true);

      await axios.put(
        `${baseURL}/api/v1/profile`,
        {
          firstname: firstname,
          lastname: lastname
        },
        {
          headers: {
            token: localStorage.getItem("token")
          }
        }
      );

      message.success("Profile updated successfully!");

      globalLogin({
        ...user,
        firstname: firstname,
        lastname: lastname
      });

      setotheruser(prev => ({ ...prev, firstname, lastname }));
      setIsProfileModalOpen(false);

    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      message.error("Please fill in all fields!");
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error("New password and Confirm password do not match!");
      return;
    }

    try {
      setLoading(true);

      await axios.put(
        `${baseURL}/api/v1/password`,
        {
          currentPassword: currentPassword,
          newPassword: newPassword
        },
        {
          headers: {
            token: localStorage.getItem("token")
          }
        }
      );

      message.success("Password Updated Successfully...");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordModalOpen(false);

    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    setNewTitle(post?.title || '');
    setNewDescription(post?.description || post?.content || post?.text || '');
    setIsEditModalOpen(true);
    setOpenMenuIndex(null);
  };

  const handleUpdatePost = async () => {
    if (!newDescription.trim()) {
      message.error("Description cannot be empty");
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
      setotheruserprofileposts(otheruserprofileposts.map(p => p._id === editingPost._id ? (updatedPostData || { ...p, title: newTitle, description: newDescription }) : p));

      message.success("Post updated successfully");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`${baseURL}/api/v1/post/${postId}`, {
        headers: {
          token: localStorage.getItem("token")
        }
      });
      message.success("Post deleted successfully");
      setotheruserprofileposts(prev => prev.filter(post => post._id !== postId));
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Failed to delete post");
    }
    setOpenMenuIndex(null);
  };

  const handleLike = async (postId) => {
    try {
      setotheruserprofileposts(prevPosts =>
        prevPosts.map(post => {
          if (post._id === postId) {
            const likesArray = post.likes || [];
            const hasLiked = likesArray.includes(user?._id);
            const newLikes = hasLiked
              ? likesArray.filter(id => id !== user?._id)
              : [...likesArray, user?._id];

            return { ...post, likes: newLikes };
          }
          return post;
        })
      );

      const response = await axios.post(`${baseURL}/api/v1/post/likes/${postId}`, {}, {
        headers: {
          token: localStorage.getItem("token")
        }
      });

      message.success(response?.data?.message || "Success");

    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Failed to like post");
      getotheruserprofileposts();
    }
  };

  const handleShare = async (postId) => {
    const shareUrl = `${window.location.origin}/singlepost/${postId}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        message.success("Post link copied successfully!");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        message.success("Post link copied successfully!");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to copy link");
    }
  };

  useEffect(() => {
    getotheruserprofile();
    getotheruserprofileposts();
  }, [userId]);

  const getotheruserprofile = async () => {
    try {
      const targetId = userId || user?._id;
      if (!targetId) return;

      const response = await axios.get(`${baseURL}/api/v1/profile/${targetId}`, {
        headers: {
          token: localStorage.getItem("token")
        }
      });

      setotheruser(response.data.data);
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || 'Failed to fetch user profile');
    }
  };

  const getotheruserprofileposts = async () => {
    try {
      const targetId = userId || user?._id;
      if (!targetId) return;

      const response = await axios.get(`${baseURL}/api/v1/profile/posts/${targetId}`, {
        headers: {
          token: localStorage.getItem("token")
        }
      });

      setotheruserprofileposts(response.data.data || []);
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || 'Failed to fetch user posts');
    }
  };

  const joinedDate = otheruser?.createdAt ? new Date(otheruser.createdAt).toLocaleDateString() : '';

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative flex flex-col items-center overflow-x-hidden">

      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl flex items-center justify-between mb-6 relative z-10 px-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-200 bg-clip-text text-transparent tracking-tight">
            {isMyProfile ? "My Profile" : `${otheruser?.firstname || "User"}'s Profile`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            {isMyProfile ? "Manage your account details and view your posts" : "View user information and shared posts"}
          </p>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl shadow-black/80 p-6 sm:p-8 relative z-10 transition-all duration-300 mb-8">

        <div className="flex items-center justify-between mb-8">
          <button
            onClick={backOn}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/40 transition-all duration-300 active:scale-95 group shadow-inner cursor-pointer"
          >
            <IoMdArrowRoundBack className="text-xl transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-sm font-semibold">Back</span>
          </button>

          {isMyProfile ? (
            <div className="relative group">
              <button className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-all duration-300 shadow-inner flex items-center justify-center cursor-pointer">
                <BsThreeDotsVertical className="text-xl" />
              </button>

              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl shadow-black/90 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50 p-2 overflow-hidden">
                <button
                  onClick={() => {
                    setFirstname(otheruser?.firstname || '');
                    setLastname(otheruser?.lastname || '');
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:bg-indigo-600/15 hover:text-indigo-400 transition-all duration-200 text-left cursor-pointer"
                >
                  <BsPencilSquare className="text-base text-indigo-400 shrink-0" />
                  <span>Edit your name</span>
                </button>

                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:bg-indigo-600/15 hover:text-indigo-400 transition-all duration-200 text-left cursor-pointer"
                >
                  <BsKey className="text-base text-indigo-400 shrink-0" />
                  <span>Change password</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5 group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-xl shadow-indigo-500/10 bg-slate-950 transition-transform duration-300 group-hover:scale-105">
              <img
                src={otheruser?.profilePicture || "https://via.placeholder.com/150"}
                alt="ProfilePicture"
                className="w-full h-full object-cover"
              />
            </div>

            {isMyProfile ? (
              <>
                <input
                  type="file"
                  id="changedp"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files[0])}
                />

                <label
                  htmlFor="changedp"
                  className="absolute inset-0 rounded-full bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-indigo-300 border-2 border-indigo-500/50"
                  title="Change Profile Picture"
                >
                  <FaCamera className="text-2xl mb-1 text-indigo-400 animate-bounce" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Change DP</span>
                </label>
              </>
            ) : null}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-wide">
            {otheruser?.firstname || "User"} {otheruser?.lastname || ""}
          </h2>

          <p className="text-sm text-slate-400 mt-1 font-medium">
            {otheruser?.email || "user@example.com"}
          </p>

          {joinedDate && (
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Joined on: {joinedDate}
            </p>
          )}

          <div className="w-full mt-6 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 shadow-inner">
            <b className="text-sm sm:text-base font-semibold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {isMyProfile ? "Welcome to your Profile..." : `Welcome to ${otheruser?.firstname || 'User'}'s Profile...`}
            </b>
          </div>
        </div>

      </div>

      <div className="w-full max-w-2xl relative z-10">
        <h3 className="text-lg font-bold text-slate-200 mb-4 px-2">
          {isMyProfile ? "Your Posts" : `${otheruser?.firstname || "User"}'s Posts`}
        </h3>

        {otheruserprofileposts.length === 0 ? (
          <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500 text-sm">
            No posts found.
          </div>
        ) : (
          <div className="space-y-6">
            {otheruserprofileposts.map((post, index) => {
              const postUser = otheruser || {};
              const fullName = `${postUser?.firstname || 'User'} ${postUser?.lastname || ''}`;
              const profilePic = postUser?.profilePicture || 'https://via.placeholder.com/150';
              const postDate = post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : '';

              const isMyPost = user?._id === postUser?._id || post?.createdBy === user?._id || post?.userId === user?._id;
              
              const likesArray = post?.likes || [];
              const isLiked = likesArray.includes(user?._id);

              return (
                <div
                  key={post?._id || index}
                  className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-xl overflow-hidden group/post"
                >
                  <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <img
                        src={profilePic}
                        alt={fullName}
                        className="w-10 h-10 rounded-full object-cover border border-indigo-500/40"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">
                          {fullName}
                        </h3>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {postDate}
                        </span>
                      </div>
                    </div>

                    {isMyPost ? (
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
                        >
                          <BsThreeDotsVertical className="text-lg" />
                        </button>

                        {openMenuIndex === index && (
                          <div className="absolute right-0 mt-2 w-36 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-20 py-1 overflow-hidden">
                            <button
                              onClick={() => handleEditClick(post)}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-400 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <AiOutlineEdit className="text-sm" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post?._id)}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <AiOutlineDelete className="text-sm" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <Link to={`/singlepost/${post?._id}`} className="block group cursor-pointer">
                    {post?.title && (
                      <div className="px-5 pt-4 text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors duration-300">
                        {post.title}
                      </div>
                    )}

                    {(post?.description || post?.content || post?.text) && (
                      <div className="px-5 pt-2 pb-2 text-sm text-slate-300 group-hover:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap transition-colors duration-300">
                        {post.description || post.content || post.text}
                      </div>
                    )}
                  </Link>

                  {(post?.imageUrl || post?.image || post?.postImage) && (
                    <Link to={`/singlepost/${post?._id}`} className="block mt-3 w-full bg-slate-950 overflow-hidden">
                      <img
                        src={post.imageUrl || post.image || post.postImage}
                        alt="Post content"
                        className="w-full max-h-[500px] object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </Link>
                  )}

                  <div className="p-3 flex items-center justify-around border-t border-slate-800/60 text-slate-400 text-xs font-semibold">
                    <button 
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-800/50 ${isLiked ? 'text-rose-500' : 'hover:text-indigo-400'}`}
                    >
                      {isLiked ? <AiFillHeart className="text-base text-rose-500" /> : <AiOutlineHeart className="text-base" />} 
                      <span>{likesArray.length > 0 ? likesArray.length : ''} Like</span>
                    </button>
                    
                    <Link 
                      to={`/singlepost/${post?._id}`}
                      className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-800/50"
                    >
                      <AiOutlineMessage className="text-base" /> Comment
                    </Link>

                    <button 
                      onClick={() => handleShare(post._id)}
                      className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-800/50"
                    >
                      <AiOutlineShareAlt className="text-base" /> Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <FaUserEdit className="text-lg" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Edit Name</h3>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">First Name</label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <FaLock className="text-lg" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Change Password</h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
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

export default Profile;