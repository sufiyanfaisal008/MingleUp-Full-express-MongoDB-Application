import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { baseURL } from '../core'
import { message, Modal, ConfigProvider, theme } from 'antd'
import axios from 'axios'
import Allpost from '../components/allpost'
import Header from '../components/Header'
import { store } from '../store/states'
import { AiOutlineSend, AiOutlineMessage, AiFillHeart, AiOutlineHeart, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'

function SinglePost() {
  const params = useParams()
  const { user } = store()
  const [singlepost, setsinglepost] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [loadingComment, setLoadingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editText, setEditText] = useState('')

  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false)
  const [postLikesUsers, setPostLikesUsers] = useState([])
  const [loadingLikes, setLoadingLikes] = useState(false)

  useEffect(() => {
    getsinglepost()
  }, [])

  const getsinglepost = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/v1/post/${params.postId}`, {
        headers: {
          token: localStorage.getItem("token")
        }
      })
      setsinglepost(response.data.data)
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || error.message);
    }
  }

  const postOwnerId = typeof singlepost?.userId === 'object' && singlepost?.userId !== null
    ? (singlepost.userId._id || singlepost.userId.id)
    : (singlepost?.userId || singlepost?.createdBy);

  const currentUserId = user?._id || user?.id;
  const isMyPost = currentUserId && postOwnerId && currentUserId.toString() === postOwnerId.toString();

  const handleOpenPostLikesModal = async () => {
    if (!singlepost?.likes || singlepost.likes.length === 0) return

    const firstLike = singlepost.likes[0];
    const isPopulated = typeof firstLike === 'object' && firstLike !== null && (firstLike.firstname || firstLike.firstName || firstLike.profilePicture);

    if (isPopulated) {
      setPostLikesUsers(singlepost.likes)
      setIsLikesModalOpen(true)
    } else {
      try {
        setLoadingLikes(true)
        setIsLikesModalOpen(true)
        const response = await axios.get(`${baseURL}/api/v1/post/likes-users/${params.postId}`, {
          headers: {
            token: localStorage.getItem("token")
          }
        })
        setPostLikesUsers(response.data.data || response.data.users || [])
      } catch (error) {
        console.error(error)
        try {
          const userPromises = singlepost.likes.map(async (id) => {
            const res = await axios.get(`${baseURL}/api/v1/profile/${id}`, {
              headers: { token: localStorage.getItem("token") }
            });
            return res.data.data;
          });
          const usersData = await Promise.all(userPromises);
          setPostLikesUsers(usersData);
        } catch (err) {
          console.error(err);
          setPostLikesUsers(singlepost.likes)
        }
      } finally {
        setLoadingLikes(false)
      }
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) {
      message.error("Comment cannot be empty")
      return
    }

    try {
      setLoadingComment(true)
      const response = await axios.post(`${baseURL}/api/v1/post/comment/${params.postId}`, {
        comment: commentText
      }, {
        headers: {
          token: localStorage.getItem("token")
        }
      })

      message.success(response.data.message || "Comment added successfully")

      const addedComment = response.data.comment

      setsinglepost(prev => ({
        ...prev,
        comments: [addedComment, ...(prev?.comments || [])]
      }))

      setCommentText('')
    } catch (error) {
      console.error(error)
      message.error(error?.response?.data?.message || error.message)
    } finally {
      setLoadingComment(false)
    }
  }

  const handleLikeComment = async (commentId) => {
    try {
      await axios.post(`${baseURL}/api/v1/post/comment/likes/${params.postId}/${commentId}`, {}, {
        headers: {
          token: localStorage.getItem("token")
        }
      })

      setsinglepost(prev => {
        if (!prev || !prev.comments) return prev;
        const updatedComments = prev.comments.map(cmt => {
          if (cmt._id === commentId) {
            const likesArray = cmt.likes || [];
            const isLiked = likesArray.some(id => {
              const idStr = typeof id === 'object' && id !== null ? (id._id || id.id)?.toString() : id?.toString();
              return idStr === currentUserId?.toString();
            });

            let updatedLikes;
            if (isLiked) {
              updatedLikes = likesArray.filter(id => {
                const idStr = typeof id === 'object' && id !== null ? (id._id || id.id)?.toString() : id?.toString();
                return idStr !== currentUserId?.toString();
              });
            } else {
              updatedLikes = [currentUserId, ...likesArray];
            }

            return { ...cmt, likes: updatedLikes }
          }
          return cmt
        })
        return { ...prev, comments: updatedComments }
      })

    } catch (error) {
      console.error(error)
      message.error(error?.response?.data?.message || error.message)
    }
  }

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) {
      message.error("Comment text cannot be empty")
      return
    }

    try {
      const response = await axios.put(`${baseURL}/api/v1/post/comment/${params.postId}/${commentId}`, {
        comment: editText
      }, {
        headers: {
          token: localStorage.getItem("token")
        }
      })

      message.success(response.data.message || "Comment updated successfully")

      setsinglepost(prev => ({
        ...prev,
        comments: prev.comments.map(cmt => cmt._id === commentId ? { ...cmt, comment: editText } : cmt)
      }))

      setEditingCommentId(null)
      setEditText('')
    } catch (error) {
      console.error(error)
      message.error(error?.response?.data?.message || error.message)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axios.delete(`${baseURL}/api/v1/post/comment/${params.postId}/${commentId}`, {
        headers: {
          token: localStorage.getItem("token")
        }
      })

      message.success(response.data.message || "Comment deleted successfully")

      setsinglepost(prev => ({
        ...prev,
        comments: prev.comments.filter(cmt => cmt._id !== commentId)
      }))
    } catch (error) {
      console.error(error)
      message.error(error?.response?.data?.message || error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Header />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <div className="w-full space-y-2">
          <Allpost
            posts={singlepost ? [singlepost] : []}
            showSearch={false}
            showLoadMore={false}  
            setPosts={(updated) => {
              if (typeof updated === 'function') {
                setsinglepost(updated([singlepost])[0] || null);
              } else {
                setsinglepost(updated[0] || null);
              }
            }}
          />

          {isMyPost && singlepost?.likes && singlepost.likes.length > 0 && (
            <div className="px-2">
              <button
                onClick={handleOpenPostLikesModal}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-900/50 px-3 py-1.5 rounded-xl shadow-md"
              >
                <AiFillHeart className="text-rose-500 text-sm" />
                <span>Liked by {singlepost.likes.length} {singlepost.likes.length === 1 ? 'person' : 'people'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-900/85 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-5 shadow-xl">
          <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AiOutlineMessage className="text-indigo-400 text-xl" /> Leave a Comment
          </h3>
          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment here..."
              className="w-full bg-slate-950/60 text-slate-100 border border-slate-800 hover:border-indigo-500 focus:border-indigo-500 focus:outline-none rounded-2xl p-3.5 text-sm resize-none transition-all placeholder-slate-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loadingComment}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl px-5 py-2.5 flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
              >
                <AiOutlineSend className="text-base" />
                {loadingComment ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800/60 pb-3 flex items-center justify-between">
            <span>Comments</span>
            <span className="text-xs bg-indigo-600/20 text-indigo-400 px-2.5 py-1 rounded-full font-semibold">
              {singlepost?.comments?.length || 0} Total
            </span>
          </h3>

          {!singlepost?.comments || singlepost.comments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm font-medium">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {singlepost.comments.map((cmt, idx) => {
                const commentUser = cmt?.userId || {}
                const fullName = `${commentUser?.firstname || commentUser?.firstName || 'User'} ${commentUser?.lastname || commentUser?.lastName || ''}`
                const profilePic = commentUser?.profilePicture || 'https://via.placeholder.com/150'
                const commentDate = cmt?.createdAt ? new Date(cmt.createdAt).toLocaleDateString() : ''

                const commentUserId = commentUser?._id?.toString() || commentUser?.toString()
                const isMyComment = currentUserId && commentUserId && currentUserId.toString() === commentUserId

                const isLikedByMe = cmt?.likes?.some(id => {
                  const idStr = typeof id === 'object' && id !== null ? (id._id || id.id)?.toString() : id?.toString();
                  return idStr === currentUserId?.toString();
                });

                const commentLikesCount = cmt?.likes?.length || 0;

                return (
                  <div key={cmt?._id || idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/50">
                    <Link to={`/profile/${commentUserId}`}>
                      <img
                        src={profilePic}
                        alt={fullName}
                        className="w-10 h-10 rounded-full object-cover border border-indigo-500/40 shrink-0"
                      />
                    </Link>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Link to={`/profile/${commentUserId}`} className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
                          {fullName}
                        </Link>
                        <span className="text-xs text-slate-500">{commentDate}</span>
                      </div>

                      {editingCommentId === cmt._id ? (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => { setEditingCommentId(null); setEditText(''); }}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-300 font-medium cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateComment(cmt._id)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs rounded-lg text-white font-medium cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                          {cmt?.comment || cmt?.text}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-800/40">
                        <button
                          onClick={() => handleLikeComment(cmt._id)}
                          className={`flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${isLikedByMe ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'
                            }`}
                        >
                          {isLikedByMe ? <AiFillHeart className="text-base" /> : <AiOutlineHeart className="text-base" />}
                          <span>{commentLikesCount}</span>
                        </button>

                        {isMyComment && editingCommentId !== cmt._id && (
                          <div className="flex items-center gap-3 ml-auto">
                            <button
                              onClick={() => { setEditingCommentId(cmt._id); setEditText(cmt.comment || cmt.text); }}
                              className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                            >
                              <AiOutlineEdit className="text-sm" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(cmt._id)}
                              className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <AiOutlineDelete className="text-sm" /> Delete
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </main>

      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#6366f1',
            colorBgElevated: '#020617',
            colorText: '#f8fafc',
            colorBorder: '#1e293b',
          },
        }}
      >
        <Modal
          title={<span className="text-slate-100 font-bold text-base">Liked Users</span>}
          open={isLikesModalOpen}
          onCancel={() => setIsLikesModalOpen(false)}
          footer={null}
          centered
          className="rounded-3xl overflow-hidden"
        >
          <div className="max-h-80 overflow-y-auto space-y-3 py-2">
            {loadingLikes ? (
              <div className="text-center py-6 text-slate-400 text-sm">Loading likes...</div>
            ) : !postLikesUsers || postLikesUsers.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">No likes found</div>
            ) : (
              postLikesUsers.map((likeUser, idx) => {
                const uObj = typeof likeUser === 'object' && likeUser !== null ? likeUser : {}
                const uName = `${uObj?.firstname || uObj?.firstName || 'User'} ${uObj?.lastname || uObj?.lastName || ''}`
                const uPic = uObj?.profilePicture || 'https://via.placeholder.com/150'
                const uId = uObj?._id || uObj?.id || (typeof likeUser === 'string' ? likeUser : idx)

                return (
                  <div key={uId || idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <Link to={`/profile/${uId}`} onClick={() => setIsLikesModalOpen(false)}>
                        <img src={uPic} alt={uName} className="w-10 h-10 rounded-full object-cover border border-indigo-500/30" />
                      </Link>
                      <Link to={`/profile/${uId}`} onClick={() => setIsLikesModalOpen(false)} className="text-sm font-semibold text-slate-200 hover:text-indigo-400 transition-colors">
                        {uName}
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Modal>
      </ConfigProvider>
    </div>
  )
}

export default SinglePost