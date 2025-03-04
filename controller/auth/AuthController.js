
const bcrypt = require('bcryptjs')
const prisma = require("../../prisma/client")




const jwt = require('jsonwebtoken')
const { json } = require('body-parser')
const logger = require('../../config/logging')

const login = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: req.body.email
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
                password: true,
                email: true,
            }
        })


        if (!user) {
            throw new Error('user not found')
            // return res.status(404).json({
            //     success: false,
            //     message: "user not found"
            // })
        }

        // compoare password
        const validPassword = await bcrypt.compare(req.body.password, user.password)

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        // generate token
        const token = jwt.sign({ id: user.id, }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        })


        const { password, ...userWithoutPassword } = user

        res.status(200).send({
            success: true,
            message: "Login successfully",
            data: {
                user: userWithoutPassword,
                token: token
            }
        })

    } catch (error) {
        logger.error(`ERROR MESSAGE  ${error.message}`)
        res.status(400).send({
            success: false,
            message: error.message
        })
    }
}


const register = async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    try {
        const user = await prisma.user.create({
            data: {
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                statusenabled: true
            }
        })

        res.status(201).send({
            success: true,
            message: "user created successfully",
            data: user
        })

    } catch (error) {
        logger.error(`Error ${error.message}`)
        res.status(500).send({
            success: false,
            message: error.message,
        });
    }
}


const tes = (req, res) => {
    res.status(200).send({
        success: true,
        message: "Login successfully",
        data: {
            // user: userWithoutPassword,
            // token: token
        }
    })
}


module.exports = { login, tes, register }