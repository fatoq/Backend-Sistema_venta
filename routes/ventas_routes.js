'use strict'
var ventasController = require('../controllers/ventas.controller');
var express = require('express');
var router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');

//Rutas para ventas
router.get('/ventas', (req, res) => {
    res.status(200).send('<h1>Bienvenido a la API de Ventas</h1>');
});
//para crear una venta
router.post('/create-venta',authenticateToken,checkRole(['Super-admin','admin','empleado']),ventasController.createVenta);
//para ver todas las ventas
router.get('/get-ventas', authenticateToken,checkRole(['Super-admin','admin','empleado']),ventasController.getVentas);
//para ver los canastos
router.get('/canastos'
    , authenticateToken,checkRole(['Super-admin','admin','empleado'])
    ,ventasController.getcanastos);
//para actualizar una venta
router.put('/update-venta/:ventaId', authenticateToken,checkRole(['Super-admin','admin','empleado']),ventasController.updateVenta);
//para borrar una venta
router.delete('/delete-venta/:ventaId',authenticateToken,checkRole(['Super-admin','admin']),ventasController.deleteVenta);

module.exports = router;