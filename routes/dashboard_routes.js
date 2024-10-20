'use strict'
var dashboardController = require('../controllers/dashboard.controller');
var express = require('express');
var router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');

//Rutas para dashboard
router.get('/dashboard', (req, res) => {
    res.status(200).send('<h1>Bienvenido a la API de dashboard</h1>');
});
//para el dashboard
router.get('/dashboard-ventas',authenticateToken,checkRole(['Super-admin','admin','empleado']),dashboardController.dashboardVenta);
//para ver el top 10 de productos vendidos
router.get('/top-ventas',authenticateToken,checkRole(['Super-admin','admin']),dashboardController.ProductosTop);

module.exports = router;