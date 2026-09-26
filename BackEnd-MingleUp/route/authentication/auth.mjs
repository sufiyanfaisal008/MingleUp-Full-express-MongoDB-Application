import express from 'express'
import { emailPattern } from '../../utilities/core.mjs'
import { UserModel } from '../../models/user/index.mjs'
import { EmailOtp } from '../../models/email-otp/otp.mjs'
import { forgotOtp } from '../../models/forgot-otp/forgot.mjs'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import otpGenerator from 'otp-generator'
import bcrypt from 'bcryptjs'
import { sendEmail } from '../../utilities/function.mjs'

const router = express.Router()

// Signup
router.post("/signup", async (req, res, next) => {
    try {
        const firstname = req.body.firstname
        const lastname = req.body.lastname
        const email = req.body.email
        const password = req.body.password

        // varitation
        if (!firstname) {
            return res.status(400).send({
                message: 'Firstname is Required'
            })
        }

        if (!lastname) {
            return res.status(400).send({
                message: 'Lastname is Required'
            })
        }

        if (!email) {
            return res.status(400).send({
                message: 'Email is Required'
            })
        }

        if (!password) {
            return res.status(400).send({
                message: 'Password is Required'
            })
        }

        // email varitation
        if (!emailPattern.test(email.toLowerCase())) {
            return res.status(400).send({
                message: 'Invalid Email'
            })
        }

        // email exist
        const user = await UserModel.findOne({ email: email.toLowerCase() })

        if (user) {
            return res.status(400).send({
                message: 'Email already taken'
            })
        }

        // convert hash password
        const passwordhash = await bcryptjs.hash(password, 12)

        await UserModel.create({
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: passwordhash
        })

        return res.send({
            message: 'signup Successfully'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

// Login
router.post("/login", async (req, res, next) => {
    try {
        const email = req.body.email
        const password = req.body.password

        // varitation
        if (!password) {
            return res.status(400).send({
                message: 'Password is Required'
            })
        }

        if (!email) {
            return res.status(400).send({
                message: 'Email is Required'
            })
        }

        // varitation
        if (!emailPattern.test(email.toLowerCase())) {
            return res.status(400).send({
                message: 'Email & Password is incorrect'
            })
        }

        const userAcount = await UserModel.findOne({ email: email.toLowerCase() })

        if (!userAcount) {
            return res.status(404).send({
                message: 'Acount Not Found'
            })
        }

        if (!userAcount?.isEmailverified) {
            return res.status(404).send({
                message: 'email is not varified'
            })
        }

        const isPasswordTrue = await bcryptjs.compare(password, userAcount.password)

        if (!isPasswordTrue) {
            return res.status(400).send({
                message: 'Password is Incorrect'
            })
        }
        // console.log(isPasswordTrue)

        // token
        const token = jwt.sign({
            email: userAcount.email,
            _id: userAcount._id,
        },
            process.env.JWT_KEY,
            {
                expiresIn: "15days"
            }
        )

        return res.send({
            message: 'Login Successfully',
            data: {
                token: token,
                user: userAcount
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

// email-otp
router.post("/send-otp", async (req, res, next) => {
    try {
        const email = req.body.email

        // varitation
        if (!email) {
            return res.status(400).send({
                message: 'Email is Required'
            })
        }

        if (!emailPattern.test(email.toLowerCase())) {
            return res.status(400).send({
                message: 'Email & Password is incorrect'
            })
        }

        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return res.status(404).send({
                message: 'Acount not found'
            })
        }

        // create otp 
        const otp = otpGenerator.generate(6,
            {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false
            });

        // otphash 
        const codehashotp = await bcrypt.hash(otp, 12)

        // otp expire 
        //    const otpExpiresAt = new Date(Date.now() + 60 * 1000);

        await EmailOtp.create({
            email: email,
            otphashcode: codehashotp,
            // createdAt: otpExpiresAt
        })

        // send otp to email
        await sendEmail(
            email,
            "Varify Your Email...",
            `Your OTP for email verification is: ${otp}.`
        )

        return res.send({
            message: 'OTP sent Successfully',
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

// varify-otp
router.post("/varify-otp", async (req, res, next) => {
    try {
        const email = req.body.email
        const otp = req.body.otp

        // varitation
        if (!email) {
            return res.status(400).send({
                message: 'Email is Required'
            })
        }

        if (!otp) {
            return res.status(400).send({
                message: 'otp is Required'
            })
        }

        if (!emailPattern.test(email.toLowerCase())) {
            return res.status(400).send({
                message: 'Email & Password is incorrect'
            })
        }

        // check otp valid?
        const existingotp = await EmailOtp.findOne({ email: email }).sort({ createdAt: -1 })

        if (!existingotp) {
            return res.status(400).send({
                message: 'otp is invalid'
            })
        }

        // otp correct ?

        const isOtpValid = await bcrypt.compare(otp, existingotp.otphashcode)
        if (!isOtpValid) {
            return res.status(400).send({
                message: "otp is invalid"
            })
        }

        // email varified
        await UserModel.updateOne({ email: email }, {
            $set: {
                isEmailverified: true,
            }
        })

        return res.send({
            message: 'varification Successfully...',
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

// email forgot password otp
router.post("/forgot-password-otp", async (req, res, next) => {
    try {
        const email = req.body.email

        // varitation
        if (!email) {
            return res.status(400).send({
                message: 'Email is Required'
            })
        }

        if (!emailPattern.test(email.toLowerCase())) {
            return res.status(400).send({
                message: 'Email & Password is incorrect'
            })
        }

        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return res.status(404).send({
                message: 'Acount not found'
            })
        }

        // create otp 
        const otp = otpGenerator.generate(6,
            {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false
            });

        // otphash 
        const codehashotp = await bcrypt.hash(otp, 12)

        // otp expire 
        //    const otpExpiresAt = new Date(Date.now() + 60 * 1000);

        await forgotOtp.create({
            email: email,
            otphashcode: codehashotp,
            // createdAt: otpExpiresAt
        })

        // send otp to email
        await sendEmail(
            email,
            "Varify Your forgot password...",
            `Your OTP for forgot password is: ${otp}.`
        )

        return res.send({
            message: 'OTP sent Successfully',
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

// reset-password
router.post("/reset-password", async (req, res, next) => {
    try {
        const email = req.body.email
        const otp = req.body.otp
        const newPassword = req.body.newPassword

        // varitation
        if (!email) {
            return res.status(400).send({
                message: 'Email is Required'
            })
        }

        if (!newPassword) {
            return res.status(400).send({
                message: 'NewPassword is Required'
            })
        }

        if (!otp) {
            return res.status(400).send({
                message: 'otp is Required'
            }) 
        }


        // check otp valid?
        const existingotp = await forgotOtp.findOne({ email: email }).sort({ createdAt: -1 })

        if (!existingotp) {
            return res.status(400).send({
                message: 'otp is not invalid'
            })
        }

        // otp correct ?

        const isOtpValid = await bcrypt.compare(otp, existingotp.otphashcode)
        if (!isOtpValid) {
            return res.status(400).send({
                message: "otp is invalid"
            })
        }

        const passwordHash = await bcrypt.hash(newPassword, 12)

        // email varified
        await UserModel.updateOne({ email: email }, {
            $set: {
                password: passwordHash,
            }
        })

        return res.send({
            message: 'Updated Password...',
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})


export default router;