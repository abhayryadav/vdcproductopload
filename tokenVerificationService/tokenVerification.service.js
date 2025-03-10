const jwt = require("jsonwebtoken");


module.exports.tokenVerification = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // Attach decoded token to request object
        console.log(decoded,"_______________message from product upload service this route of get all item should be implimented in userservice too as it wont work when productupload service will be down");
        next(); // Move to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
