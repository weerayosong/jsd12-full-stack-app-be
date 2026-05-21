import jwt from "jsonwebtoken";

export const authUser = async (req, res, next) => {
    let token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: "access denied, no token" });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decodedToken;

        console.log("dec: ", decodedToken, "reqUser: ", req.user);
        next();
    } catch (err) {
        next(err);
    }
};
