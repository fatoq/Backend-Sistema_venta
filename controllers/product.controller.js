'use strict'
var Product = require('../models/products');

var controller ={
    //Crear un nuevo producto
    createProduct: async function(req, res){
        var product = new Product();
        var params = req.body;
        product.nombre = params.nombre;
        product.codigoBarra = params.codigoBarra;
        product.categoria = params.categoria;
        product.stock = params.stock;
        product.precio = params.precio;
        product.disponible = params.disponible;
        product.vendidos = params.vendidos;



    },
    //borrar producto
    deleteProducto: function (req,res) {
        
    },
    //Actualizar producto
    updateProducto: function (req,res) {
        
    },
    //Listar productos
    getProductos: function (req,res) {
        
    },
    //Obtener producto por ID
    getProducto: function (req,res) {
        
    }

};

module.exports = controller;