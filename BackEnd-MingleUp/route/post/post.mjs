import express from 'express'
import { postmodel } from '../../models/post/post.mjs'
import { isValidObjectId } from "mongoose"
import { multerMiddleware } from '../../libs/multer.mjs'
import { uploadToCloudinary } from '../../libs/cloudnary.mjs'

const router = express.Router()

// CREATE POST
router.post('/post', multerMiddleware.any(), async (req, res, next) => {
  try {
    if (!req.body.title) {
      return res.status(400).send({
        message: "Title is required"
      })
    }

    if (!req.body.description) {
      return res.status(400).send({
        message: "Description is required"
      })
    }

    const file = req.files[0]
    let imageUrl = null

    const isImageMime = file?.mimetype?.startsWith("image/");
    const isImageExt = file?.originalname?.match(/\.(jpg|jpeg|png|gif|webp|jfif|heic)$/i);

    if (file) {

      if (!file.mimetype.startsWith("image")) {
        return res.status(400).send({
          message: "only images are allowed"
        })
      }

      if (file.size > 1000000) {
        return res.status(400).send({
          message: "file upload limit is 1mb"
        })
      }


      if (!isImageMime && !isImageExt) {
        return res.status(400).send({
          message: "only images are allowed"
        });
      }

      if (file.size > 1000000) {
        return res.status(400).send({
          message: "file size should be less than 1MB"
        })
      }


      if (file) {
        const fileresponse = await uploadToCloudinary(file)
        imageUrl = fileresponse?.secure_url
      }
    }

    await postmodel.create({
      title: req.body.title,
      description: req.body.description,
      userId: req.currentUser._id,
      imageUrl: imageUrl
    })

    return res.send({
      message: "Post created Successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({
      message: "Internal server error"
    })
  }
})

// GET ALL POSTS
router.get('/post', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const allpost = await postmodel.find()
      .populate("userId")
      .populate("comments.userId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.send({
      message: "Posts Fetched Successfully",
      data: allpost
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({
      message: "Internal server error"
    })
  }
})

// GET SINGLE POST
router.get('/post/:postId', async (req, res, next) => {
  try {
    const postId = req.params.postId

    if (!postId || !isValidObjectId(postId)) {
      return res.status(400).send({
        message: "Valid postId is required"
      })
    }

    const singlePost = await postmodel.findById(postId)
      .populate("userId")
      .populate("comments.userId");

    if (!singlePost) {
      return res.status(404).send({
        message: "Post Not Found"
      })
    }

    return res.send({
      message: "Single Post Fetched Successfully",
      data: singlePost
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({
      message: "Internal server error"
    })
  }
})

// UPDATE POST 
router.put("/post/:postId", async (req, res, next) => {
  try {
    const postId = req.params.postId

    // id validation
    if (!postId) {
      return res.status(400).send({
        message: "id is required"
      })
    }

    // id validation
    if (!isValidObjectId(postId)) {
      return res.status(400).send({
        message: "id is invalid"
      })
    }

    // title validations
    if (!req.body.title) {
      return res.status(400).send({
        message: "title is required"
      })
    }

    // description validations
    if (!req.body.description) {
      res.status(400).send({
        message: "description is required"
      })
    }

    const post = await postmodel.findOne({ _id: postId })

    if (req.currentUser._id.toString() !== post.userId.toString()) {
      return res.status(401).send({
        message: "you cannot edit this post"
      })
    }

    await postmodel.findByIdAndUpdate({ _id: postId }, {
      $set: {
        title: req.body.title,
        description: req.body.description,
      }
    })

    return res.send({
      message: "updated Post Successfully"
    })

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "internal server error"
    })
  }
})

// DELETE POST 
router.delete('/post/:postId', async (req, res, next) => {
  try {
    const postId = req.params.postId

    if (!postId || !isValidObjectId(postId)) {
      return res.status(400).send({
        message: "Valid Id is required"
      })
    }

    const post = await postmodel.findById(postId)

    if (!post) {
      return res.status(404).send({
        message: "Post not found"
      });
    }

    const postOwnerId = post.userId?._id?.toString() || post.userId?.toString();
    const currentUserId = req.currentUser?._id?.toString() || req.currentUser?.id?.toString();

    if (postOwnerId !== currentUserId) {
      return res.status(403).send({
        message: "You are not authorized to delete this post"
      })
    }

    const ownerpost = await postmodel.findOne({ _id: postId })

    if (req.currentUser._id.toString() !== ownerpost.userId.toString()) {
      return res.status(401).send({
        message: "you cannot delete this post"
      })
    }


    await postmodel.findByIdAndDelete(postId);

    return res.send({
      message: "Single post deleted successfully",
      data: post
    });

  } catch (error) {
    console.error(error)
    return res.status(500).send({
      message: "Internal server error"
    })
  }
})

// Likes Posts
router.post("/post/likes/:postId", async (req, res, next) => {
  try {
    const postId = req.params.postId

    // id validation
    if (!postId) {
      return res.status(400).send({
        message: "id is required"
      })
    }

    // id validation
    if (!isValidObjectId(postId)) {
      return res.status(400).send({
        message: "id is invalid"
      })
    }

    const post = await postmodel.findOne({ _id: postId })

    if (!post) {
      return res.status(404).send({
        message: "post not found"
      })
    }

    let responseMessage = "";

    if (post?.likes.includes(req?.currentUser._id)) {
      // dislike
      const raminingids = post.likes.filter((id) => id.toString() !== req?.currentUser._id.toString())
      post.likes = raminingids
      responseMessage = "Post unliked successfully";
    } else {
      // like 
      post?.likes.unshift(req?.currentUser._id);
      responseMessage = "Post liked successfully";
    }

    await post.save()

    return res.send({
      message: responseMessage
    })

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "internal server error"
    })
  }
})

// ADD COMMENT
router.post("/post/comment/:postId", async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const { comment } = req.body;

    if (!postId) {
      return res.status(400).send({
        message: "Post ID is required"
      });
    }

    if (!isValidObjectId(postId)) {
      return res.status(400).send({
        message: "Post ID is invalid"
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).send({
        message: "Comment text cannot be empty"
      });
    }

    const post = await postmodel.findOne({ _id: postId });

    if (!post) {
      return res.status(404).send({
        message: "Post not found"
      });
    }

    const newComment = {
      userId: req?.currentUser?._id,
      comment: comment.trim(),
      likes: [],
      createdAt: new Date()
    };

    post.comments.unshift(newComment);

    await post.save();

    const updatedPost = await postmodel.findById(postId).populate("comments.userId");
    const addedComment = updatedPost.comments[0];

    return res.send({
      message: "Comment added successfully",
      comment: addedComment
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Internal server error"
    });
  }
});

// GET COMMENTS FOR A POST
router.get("/post/comment/:postId", async (req, res, next) => {
  try {
    const postId = req.params.postId;

    if (!postId || !isValidObjectId(postId)) {
      return res.status(400).send({
        message: "Valid Post ID is required"
      });
    }

    const post = await postmodel.findById(postId).populate("comments.userId");

    if (!post) {
      return res.status(404).send({
        message: "Post not found"
      });
    }

    return res.send({
      message: "Comments fetched successfully",
      data: post.comments
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Internal server error"
    });
  }
});

// LIKE / UNLIKE COMMENT
router.post("/post/comment/likes/:postId/:commentId", async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

    if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
      return res.status(400).send({
        message: "Invalid Post ID or Comment ID"
      });
    }

    const post = await postmodel.findById(postId);
    if (!post) {
      return res.status(404).send({
        message: "Post not found"
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).send({
        message: "Comment not found"
      });
    }

    // Safety check: agar comment mein likes array nahi hai toh initialize kar dein
    if (!comment.likes) {
      comment.likes = [];
    }

    const currentUserId = req.currentUser._id.toString();
    const isLiked = comment.likes.some(id => id.toString() === currentUserId);

    let responseMessage = "";
    if (isLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== currentUserId);
      responseMessage = "Comment unliked successfully";
    } else {
      comment.likes.unshift(req.currentUser._id);
      responseMessage = "Comment liked successfully";
    }

    await post.save();

    return res.send({
      message: responseMessage
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Internal server error"
    });
  }
});

// EDIT COMMENT
router.put("/post/comment/:postId/:commentId", async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const { comment: updatedCommentText } = req.body;

    if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
      return res.status(400).send({
        message: "Invalid Post ID or Comment ID"
      });
    }

    if (!updatedCommentText || !updatedCommentText.trim()) {
      return res.status(400).send({
        message: "Comment text cannot be empty"
      });
    }

    const post = await postmodel.findById(postId);
    if (!post) {
      return res.status(404).send({
        message: "Post not found"
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).send({
        message: "Comment not found"
      });
    }

    if (comment.userId.toString() !== req.currentUser._id.toString()) {
      return res.status(403).send({
        message: "You are not authorized to edit this comment"
      });
    }

    comment.comment = updatedCommentText.trim();
    await post.save();

    return res.send({
      message: "Comment updated successfully",
      comment
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Internal server error"
    });
  }
});

// DELETE COMMENT
router.delete("/post/comment/:postId/:commentId", async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

    if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
      return res.status(400).send({
        message: "Invalid Post ID or Comment ID"
      });
    }

    const post = await postmodel.findById(postId);
    if (!post) {
      return res.status(404).send({
        message: "Post not found"
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).send({
        message: "Comment not found"
      });
    }
    const isPostOwner = post.userId.toString() === req.currentUser._id.toString();
    const isCommentOwner = comment.userId.toString() === req.currentUser._id.toString();

    if (!isPostOwner && !isCommentOwner) {
      return res.status(403).send({
        message: "You are not authorized to delete this comment"
      });
    }

    post.comments.pull(commentId);
    await post.save();

    return res.send({
      message: "Comment deleted successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Internal server error"
    });
  }
});

export default router