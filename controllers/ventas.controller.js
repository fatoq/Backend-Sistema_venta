var Venta = require('../models/ventas');
var Product = require('../models/products');

var controller = {
    createVenta: async function (req, res) {
        const { productos } = req.body;
        let total = 0;
        let ventaProductos = [];
        try {
            for (let i = 0; i < productos.length; i++) {
                let { codigoBarra, cantidad } = productos[i];
                let product = await Product.findOne({ codigoBarra });
                if (!product) {
                    return res.status(404).send({ message: 'Producto no encontrado', error: `El producto con el código de barras ${codigoBarra} no existe` });
                }
                // Verifica si el stock del producto es suficiente para la cantidad pedida
                console.log('Stock actual del producto:', product.stock); 
                if (product.stock < cantidad) {
                    return res.status(400).send({ message: `Stock insuficiente para el producto ${product.nombre}` });
                }
                // Restar la cantidad del stock
                product.stock -= cantidad;
                await product.save();
                total += product.precio * cantidad;
                ventaProductos.push({ producto: product._id, cantidad });
            }
            // Crear la venta con el usuario autenticado
            var venta = new Venta({
                usuario: '66cd108b6e16fdb1fc912be6',  // El usuario autenticado
                productos: ventaProductos,
                total
            });

            var ventaGuardada = await venta.save();
            return res.status(200).send({ message: 'Venta registrada exitosamente', venta: ventaGuardada });

        } catch (err) {
            return res.status(500).send({ message: 'Error al registrar la venta', error: err.message });
        }
    },
};

module.exports = controller;
