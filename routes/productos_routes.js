'use strict'
var productController=require('../controllers/product.controller');
var express = require('express');
var router = express.Router();

//Rutas para productos
router.get('/product',(req,res)=> {
    res.status(200).send('<h1>Bienvenido a la API de Productos</h1>');
});
/*
//para crear un producto
router.post('/create-product', productController.crear);
//para actualizar un producto
router.put('/update-product/:id', productController.actualizar);
//para borrar un producto
router.delete('/delete-product/:id', productController.eliminar);
//para ver todos los productos 
//router.get('/get-products', productController.getProductos);
//Para ver un producto por codigo de barra
router.get('/get-product/:codigoBarra', productController.getProduct);
*/

module.exports = router;
/*
//Para ver un producto por nombre
router.get('/get-product-name/:name', productController.getProductName);
//Para ver un producto por categoria
router.get('/get-product-category/:category', productController.getProductCategory);
//Para ver un producto por precio
router.get('/get-product-price/:price', productController.getProductPrice);
//Para ver un producto por stock
router.get('/get-product-stock/:stock', productController.getProductStock);
//Para ver un producto por disponibilidad
router.get('/get-product-availability/:availability', productController.getProductAvailability);
//Para ver un producto por vendido
router.get('/get-product-sold/:sold', productController.getProductSold);
//Para buscar un producto por nombre, categoria, precio, stock o disponibilidad
router.get('/search-product/:search', productController.searchProduct);
//Para filtrar los productos por categoria
router.get('/filter-products/:category', productController.filterProducts);
//Para obtener los productos ordenados por precio
router.get('/sort-products-price', productController.sortProductsPrice);
//Para obtener los productos ordenados por stock
router.get('/sort-products-stock', productController.sortProductsStock);
//Para obtener los productos ordenados por disponibilidad
router.get('/sort-products-availability', productController.sortProductsAvailability);
//Para obtener los productos ordenados por vendido
router.get('/sort-products-sold', productController.sortProductsSold);
//Para obtener los productos con stock mayor a cero
router.get('/get-available-products', productController.getAvailableProducts);
//Para obtener los productos con stock menor a cero
router.get('/get-out-of-stock-products', productController.getOutOfStockProducts);
//Para obtener los productos con precio mayor a cero
router.get('/get-cheap-products', productController.getCheapProducts);
//Para obtener los productos con precio menor a cero
router.get('/get-expensive-products', productController.getExpensiveProducts);
*/