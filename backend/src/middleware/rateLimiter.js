import ratelimit from "../config/upstash.js";

const rateLimiter = async(req,res,next)=>{
    try{
        const {success,limit,remaining,reset} = await ratelimit.limit("my-rate-limit");
        if(!success){
            return res.status(429).json({message:"Too many requests please try after some time"});
        }
        next();
    }
    catch(error){
        console.log("Rate limiter error",error);
        return res.status(500).json({message:"Internal server error"});
    }
}

export default rateLimiter;