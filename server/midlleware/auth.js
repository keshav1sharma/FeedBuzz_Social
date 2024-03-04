// in this we get the token from the front end part and then check it or verify it 
import jwt  from "jsonwebtoken";
export const verify = async(req,res,next) =>{
    try{
        let token = req.header("Authorization");
        if(!token){
            return res.status(403).send("Access denied");
        }
        if(token.startsWith("Bearer ")){
            token = token.slice(7,token.length).trimLeft();
        }

        // after that we will verify the token 
        const verified = jwt.verify(token,process.env.JWT_SECRET);
        req.user = verified;
        //console.log(req);
        next();

    }catch(error){
        res.status(500).json({
            error:error.message
        })

    };
}

// and we use this when we need to protect our routes 
