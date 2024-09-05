const jwt = require('jsonwebtoken');
let blacklistedTokens = []; // Lista negra de tokens invalidados

// Middleware para autenticar el token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).send({ message: 'Acceso denegado. No hay token.' });
    }

    const token = authHeader.replace('Bearer ', ''); // Eliminar 'Bearer ' del token

    // Verificar si el token está en la lista negra
    if (blacklistedTokens.includes(token)) {
        return res.status(403).send({ message: 'Token inválido. Ya has cerrado sesión.' });
    }

    try {
        // Verificar el token
        const verified = jwt.verify(token, 'your-secret-key');
        req.user = verified;  // Asignar los datos del usuario
        next();
    } catch (err) {
        return res.status(400).send({ message: 'Token inválido.' });
    }
}
// Middleware para verificar el rol del usuario
function checkRole(roles) {
    return function (req, res, next) {
        if (!roles.includes(req.user.role)) {
            return res.status(403).send({ message: 'Acceso denegado. No tienes permiso.' });
        }
        next();
    };
}

module.exports = {authenticateToken,checkRole,blacklistedTokens};

