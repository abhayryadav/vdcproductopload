const SECURE_KEY = process.env.SECURE_KEY || 'llp';

const adminauth = (req, res, next) => {
    const { securityKey } = req.body;
    if (securityKey === SECURE_KEY) {
        next();
    } else {
        return res.status(403).json({ error: 'Invalid security key' });
    }
};

module.exports = adminauth; // ✅ Properly export the function

