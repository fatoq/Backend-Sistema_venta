'use strict'
var productController=require('../controllers/product.controller');
var userController=require('../controllers/user.controller');
const { authenticateToken , checkRole } = require('../middleware/auth');
var express = require('express');
var router = express.Router();

//Rutas para productos
router.get('/product',(req,res)=> {
    res.status(200).send('<h1>Bienvenido a la API de Productos</h1>');
});

//para crear un producto
router.post('/create-product',authenticateToken,checkRole(['admin','empleado']), productController.createProduct);
//para borrar un producto
router.delete('/delete-product/:codigoBarra',authenticateToken,checkRole(['admin']), productController.deleteProduct);
//para actualizar un producto
router.put('/update-product/:codigoBarra',authenticateToken,checkRole(['admin','empleado']), productController.updateProduct);
//para ver todos los productos
router.get('/get-products/',authenticateToken,checkRole(['admin','empleado']), productController.getAllProducts);
//Para ver un producto por codigo de barra
router.get('/get-product-barra/:codigoBarra',authenticateToken,checkRole(['admin','empleado']), productController.getProductByCode);



module.exports = router;
