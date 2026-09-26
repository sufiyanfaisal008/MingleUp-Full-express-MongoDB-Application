import jwt from 'jsonwebtoken'
import { UserModel } from '../../models/user/index.mjs'

// bariale
export const authGurdJWT = async (req, res, next) => {
    try {
        // console.log("runing midlware")

        const token = req.headers.token
        // console.log("token===>", token)

        if (!token) {
            return res.status(401).send({
                messsage: 'Unauthorized'
            })
        }

        const varifytoken = jwt.verify(token, process.env.JWT_KEY)
        // console.log(varifytoken)
        const currentUser = await UserModel.findOne({ _id: varifytoken._id })
        // console.log(currentUser)

        req.currentUser = currentUser
        next()

    } catch (error) {
        console.error(error)
        return res.status(401).send({
            message: 'Internal Server Error'
        })
    }
}