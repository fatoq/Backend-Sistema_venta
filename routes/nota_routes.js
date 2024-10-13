'use strict'
var notaController=require('../controllers/notaVenta.controller');
var express = require('express');
var router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');


//Rutas para notas
router.get('/notas', (req, res) => {
    res.status(200).send('<h1>Bienvenido a la API de Notas</h1>');
});
//para ver si hay cliente
router.get('/verificar-cliente/:ci'
        //, authenticateToken,checkRole(['Super-admin','admin','empleado'])
        ,notaController.existeCliente
);

//para crear una nota
router.post('/create-nota'
    //, authenticateToken,checkRole(['Super-admin','admin','empleado'])
    ,notaController.validatecustomerdata,notaController.createNotaVenta);
//para generar la nota en pdf
router.get('/nota-pdf/:notaVentaId'
    //,authenticateToken,checkRole(['Super-admin','admin','empleado'])
    , notaController.genenNotaventa);
module.exports = router;
