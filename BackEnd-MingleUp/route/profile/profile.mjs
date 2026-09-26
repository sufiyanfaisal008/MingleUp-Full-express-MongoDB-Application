import express from 'express'
import { UserModel } from '../../models/user/index.mjs'
import { postmodel } from '../../models/post/post.mjs'
import bcrypt from 'bcryptjs'
import { multerMiddleware } from '../../libs/multer.mjs'
import { uploadToCloudinary } from '../../libs/cloudnary.mjs'

const router = express.Router()

router.get("/profile", async (req, res, next) => {
  try {

    return res.send({
      message: 'Profile Fetched',
      data: req.currentUser
    })

  } catch (error) {
    console.error(error)
    return res.status(500).send({
      message: "internal server error"
    })
  }
})

router.get("/profile/:userId", async (req, res, next) => {
  try {
    
    const userId = req.params.userId || req.currentUser.userId

    const user = await UserModel.findOne({ _id: userId })


    return res.send({
      message: 'Profile Fetched',
      data: user
    })

  } catch (error) {
    console.error(error)
    return res.status(500).send({
      message: "internal server error"
    })
  }
})


router.get("/profile/posts/:userId", async (req, res) => {
  try {
   
    const userId = req.params.userId || req.currentUser.userId

    const allpost = await postmodel.find({ userId: userId }).populate("userId")

    if (!allpost) {
      return res.status(404).send({
        message: 'User not found'
      });
    }

    return res.status(200).send({
      message: 'Profile posts fetched successfully',
      data: allpost
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});


router.put('/profile', async (req, res, next) => {
  try {
    const firstname = req.body.firstname
    const lastname = req.body.lastname

    const user = await UserModel.findOne({ _id: req.currentUser._id })

    if (!user) {
      return res.status(404).send({
        message: 'Acount not found'
      })
    }

    if (firstname) {
      user.firstname = firstname
    }

    if (lastname) {
      user.lastname = lastname
    }

    await user.save()

    return res.send({
      message: 'Update Profile'
    })

  } catch (error) {
    console.error(error)
    return res.status(500).send({
      message: "internal server error"
    })
  }
})

router.put('/password', async (req, res, next) => {
  try {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    const iscurrentpasswordTrue = await bcrypt.compare(currentPassword, req.currentUser.password);

    if (!iscurrentpasswordTrue) {
      return res.status(400).send({
        message: 'password is invalid'
      });
    }

    const newpasswordhash = await bcrypt.hash(newPassword, 12);

    await UserModel.findByIdAndUpdate({ _id: req.currentUser._id }, {
      $set: {
        password: newpasswordhash
      }
    });

    return res.send({
      message: 'Update Password Successfully'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "internal server error"
    });
  }
});

// profile picture upload
router.put("/profile-picture", multerMiddleware.any(), async (req, res, next) => {
  try {
    const file = req.files[0]

    const isImageMime = file?.mimetype?.startsWith("image/");
    const isImageExt = file?.originalname?.match(/\.(jpg|jpeg|png|gif|webp|jfif|heic)$/i);

    if (!file) {
      return res.status(400).send({
        message: "image file is required"
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

    const fileRespUpload = await uploadToCloudinary(file)
    // console.log(fileRespUpload)

    await UserModel.findByIdAndUpdate({ _id: req.currentUser._id }, {
      $set: {
        profilePicture: fileRespUpload.secure_url
      }
    })

    return res.send({
      message: "profile picture updated",
      url: fileRespUpload.secure_url
    })

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "internal server error"
    })
  }
})

router.put('/email', async (req, res, next) => {
  try {
    const email = req.body.email

    return res.send({
      message: 'Email Update Successfully',
    })

  } catch (error) {
    console.error(error)
    return res.status(500).send({
      message: "internal server error"
    })
  }
})


export default router;
