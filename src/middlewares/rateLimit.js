import rateLimit from "express-rate-limit";

export const rateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // 100 req / 1 ip / 15 mins
    // change message to JSON object format like our other message
    message: {
        success: false,
        message:
            "Too many requests from this IP, please try again after 15 minutes",
    },
});
