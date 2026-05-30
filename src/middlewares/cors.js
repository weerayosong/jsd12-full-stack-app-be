import cors from "cors";

const allowedOrigins = [
    "https://jsd12-full-stack-app-fe.vercel.app",
    "https://jsd12-full-stack-app-fe2.vercel.app",
    "http://localhost:5173",
];

export const corsMiddleware = cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
});
