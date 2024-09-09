'use strict'
var Product = require('../models/products');

var controller = {
    // Crear un nuevo producto
    createProduct: async function (req, res) {
        var { codigoBarra, nombre, categoria, stock, precio } = req.body;
        //Log de los datos recibidos
        console.log('Datos recibidos:', { codigoBarra, nombre, categoria, stock, precio });
        // Reemplazar comas por puntos y convertir a número
        if (precio) {
            precio = precio.toString().replace(',', '.');
            const regex = /^[0-9]+(\.[0-9]{1,2})?$/;
            if (!regex.test(precio)) {
                return res.status(400).send({ message: 'El precio debe ser un número válido con hasta dos decimales' });
            }
            precio = parseFloat(precio);
        }
        var product = new Product({ codigoBarra, nombre, categoria, stock, precio });
        try {
            // Verificar si el producto ya existe
            const productExist = await Product.findOne({ codigoBarra });
            if (productExist) {
                return res.status(400).send({ message: 'El producto ya existe' });
            }
            // Guardar el producto en la base de datos
            var productSave = await product.save();
            res.status(200).send({ message: 'Producto creado correctamente', product: productSave });
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: 'Error al crear el producto', error: err.message });
        }
    },
    // Eliminar un producto por su codigoBarra
    deleteProduct: async function (req, res) {
        var { codigoBarra } = req.params;
        try {
            // Buscar y eliminar producto usando el campo codigoBarra
            var productDeleted = await Product.findOneAndDelete({ codigoBarra: codigoBarra });
            if (!productDeleted) {
                return res.status(404).send({ message: 'Producto no encontrado para eliminar' });
            }
            res.status(200).send({ message: 'Producto eliminado correctamente', product: productDeleted });
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: 'Error al eliminar el producto', error: err.message });
        }
    },
    updateProduct: async function (req, res) {
        var { codigoBarra } = req.params;
        var { nombre, categoria, stock, precio } = req.body;
        try {
            if (precio) {
                precio = precio.toString().replace(',', '.');
                const regex = /^[0-9]+(\.[0-9]{1,2})?$/;
                if (!regex.test(precio)) {
                    return res.status(400).send({ message: 'El precio debe ser un número válido con hasta dos decimales' });
                }
                precio = parseFloat(precio);
            }
            const productUpdated = await Product.findOneAndUpdate({ codigoBarra }, { nombre, categoria, stock, precio }, { new: true });
            if (!productUpdated) {
                return res.status(404).send({ message: 'Producto no encontrado para actualizar' });
            }
            res.status(200).send({ message: 'Producto actualizado correctamente', product: productUpdated });
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: 'Error al actualizar el producto', error: err.message });
        }
    },
    // Listar todos los productos
    getAllProducts: async function (req, res) {
        try {
            var products = await Product.find();
            if (!products) {
                return res.status(404).send({ message: 'No hay productos' });
            }
            res.status(200).send({ message: 'Productos obtenidos correctamente', products: products });
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: 'Error al obtener los productos', error: err.message });
        }
    },
    // Obtener un producto por su codigoBarra
    getProductByCode: async function (req, res) {
        var { codigoBarra } = req.params;
        try {
            var product = await Product.findOne({ codigoBarra });
            if (!product) {
                return res.status(404).send({ message: 'Producto no es un producto', error:
                    'El código de barra proporcionado no corresponde a un producto válido' });
            }
            res.status(200).send({ message: 'Producto obtenido correctamente', product: product });
            
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: 'Error al obtener el producto', error: err.message });
        }
    }

};

module.exports = controller;