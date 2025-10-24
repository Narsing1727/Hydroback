const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

exports.IsAuth = async (req , res , next) => {
    try {
        console.log("Cookies received:", req.cookies);

        const token = req.cookies.token;
        if(!token){
            return res.status(400).json({
                success : false,
                message : "Token not found"
            })
        }
        const decode = await jwt.verify(token , "123456789");
        console.log('Decoded token is : ' , decode);
        if(!decode){
            return res.status(400).json({
                message : "Invalid token",
                success : false
            })
        }
        
        req.id = decode.userId;
        next();
    } catch (error) {
        console.log(error);
        
    }
}