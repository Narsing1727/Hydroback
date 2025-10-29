const jwt = require('jsonwebtoken');

exports.IsAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log("AUTH HEADER:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token || token === "null" || token === "undefined") {
            return res.status(401).json({
                success: false,
                message: "Invalid token format"
            });
        }

        const decoded = jwt.verify(token, "123456789");

        req.id = decoded.userId;
        next();

    } catch (error) {
        console.error("TOKEN ERROR:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
