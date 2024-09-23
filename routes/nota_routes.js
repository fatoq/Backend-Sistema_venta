'use strict'
var notaController=require('../controllers/notaVenta.controller');
var express = require('express');
var router = express.Router();

//Rutas para notas
router.get('/notas', (req, res) => {
    res.status(200).send('<h1>Bienvenido a la API de Notas</h1>');
});
//para crear una nota
router.post('/create-nota', notaController.createNotaVenta);
//para generar la nota en pdf
router.get('/nota-pdf/:notaVentaId', notaController.genenNotaventa);
module.exports = router;
