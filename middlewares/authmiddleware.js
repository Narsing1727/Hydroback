const jwt = require('jsonwebtoken');

exports.IsAuth = async (req, res, next) => {
    try {
        console.log("AUTH HEADER:", req.headers.authorization);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token not found"
            });
        }

        const token = authHeader.split(" ")[1];
        const decode = jwt.verify(token, "123456789");

        req.id = decode.userId;
        next();
    } catch (error) {
        console.error("TOKEN ERROR:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}
