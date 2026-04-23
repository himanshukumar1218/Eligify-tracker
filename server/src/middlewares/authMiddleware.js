const jwt = require("jsonwebtoken")
const dotenv = require('dotenv')

dotenv.config()
const protect = (req,res,next) =>{
    const tokenReceived = req.headers.authorization
    if(!tokenReceived) {
        return res.status(403).json({
            message : "Token missing. Access Denied."
        })
    }
    const parts = tokenReceived.split(' ')
    if(parts.length !== 2 || parts[0] !== "Bearer"){
        return res.status(403).json({message:"Invalid token"})
    }
    const token = parts[1] 
    try {
        const decoded = jwt.verify(token,process.env.SECRET_KEY)
        req.user = decoded 
        next()
    } catch (error) {
        return res.status(403).json({message : "Invalid or expired token"})
    }

}

module.exports = {protect}