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
/*
//para borrar una venta
router.delete('/delete-venta/:id', ventasController.deleteVenta);
//para actualizar una venta
router.put('/update-venta/:id', ventasController.updateVenta);

//Para ver una venta por id
router.get('/get-venta/:id', ventasController.getVenta);
//Para ver una venta por fecha
router.get('/get-venta-fecha/:fecha', ventasController.getVentasByDate);
//Para ver una venta por usuario
router.get('/get-venta-usuario/:usuario', ventasController.getVentasByUser);
//Para ver una venta por producto
router.get('/get-venta-producto/:producto', ventasController.getVentasByProduct);
//Para ver una venta por total
router.get('/get-venta-total/:total', ventasController.getVentasByTotal);
*/

module.exports = router;