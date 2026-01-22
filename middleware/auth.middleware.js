import Jwt from "jsonwebtoken"

const authorization = async (req, res, next) =>{
    try{
        const authHeader = req.headers.authorization 

        if(!authHeader || !authHeader.startsWith("Bearer"))
            res.status(401).json({
                message:" Token not found!!",
                success:false
        })

        const token = authHeader.split(" ")[1]
        const decodeToken = Jwt.verify(token, process.env.JWT_SECRETKEY)
        req.user = decodeToken
        next();

    }catch(err){
        res.status(401).json({
            message:"unauthorized Access",
            success:false
        })
    }
}

export default authorization
