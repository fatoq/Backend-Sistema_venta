var Venta = require('../models/ventas');
var Product = require('../models/products');

var controller = {
    createVenta: async function (req, res) {
        console.log('Usuario autenticado:', req.user);
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
                console.log(`Stock actual del producto (${product.nombre}):`, product.stock);
                if (product.stock < cantidad) {
                    return res.status(400).send({ message: `Stock insuficiente para el producto ${product.nombre}` });
                }
                // Restar la cantidad del stock
                let stockini= product.stock;
                product.stock = product.stock - cantidad;
                console.log(`Stock del producto (${product.nombre}) después de la venta: ${stockini} - ${cantidad} = ${product.stock}`);
                await product.save();
                total += product.precio * cantidad;
                ventaProductos.push({ producto: product._id, cantidad });
            }
            // Crear la venta con el usuario autenticado
            var venta = new Venta({
                usuario: req.user.userId,  // El usuario autenticado
                productos: ventaProductos,
                total
            });
            var ventaGuardada = await venta.save();
            return res.status(200).send({ message: 'Venta registrada exitosamente', venta: ventaGuardada });
        } catch (err) {
            return res.status(500).send({ message: 'Error al registrar la venta', error: err.message });
        }
    },
    getVentas: async function (req, res) {
        let ventas;
        try {
            if (req.user.role == 'admin') {
                ventas = await Venta.aggregate([{
                    $lookup: {
                        from: 'users',
                        localField: 'usuario',
                        foreignField: '_id',
                        as: 'usuarioDetalle'
                    }
                },
                {
                    $unwind: '$usuarioDetalle'
                },
                {
                    $group: {
                        _id: '$usuario',
                        nombre: { $first: '$usuarioDetalle.nombre' },
                        apellido: { $first: '$usuarioDetalle.apellido' },
                        ventas: {
                            $push: {
                                productos: '$productos',
                                total: '$total',
                                fecha: '$fecha'
                            }
                        },
                        totalVentas: { $sum: '$total' }
                    }
                }
                ]);
            } else {
                ventas = await Venta.find({ usuario: req.user.userId })
                    .populate('usuario', 'nombre apellido')  // Aquí esta el nombre y apellido del empleado
                    .populate('productos.producto', 'nombre categoria codigoBarra'); // Aquí esta los detalles del producto
            }
            if (!ventas || ventas.length == 0) {
                return res.status(404).send({ message: 'No hay ventas registradas' });  // No hay ventas registradas para este usuario
            }
            return res.status(200).send({ ventas });
        } catch (err) {
            return res.status(500).send({ message: 'Error al obtener las ventas', error: err.message });
        }
    },
    updateVenta: async function (req, res) {
        const {ventaId} = req.params;
        const {productos} = req.body; // Los productos nuevos o actualizados
        let total = 0;
        let ventaProductos = [];
        try {
            // Encontrar la venta por ID
            let venta = await Venta.findById(ventaId);
            console.log('ID de venta recibido:', ventaId);
            if (!venta) {
                return res.status(404).send({message:'Venta no encontrada'});
            }
            //para actualizar solo los que hacen su propias ventas
            if (req.user.userId.toString() !== venta.usuario.toString()) {
                return res.status(403).send({ message: 'No tienes permiso para modificar esta venta' });
            }            
            //para actualizar la cantidad del stock de los productos vendidos
            for (let i = 0; i < venta.productos.length; i++) {
                let ventaProducto = venta.productos[i];
                let product = await Product.findById(ventaProducto.producto);
                if (product) {
                    // para renovar la cantidad del stock del producto
                    product.stock += ventaProducto.cantidad;
                    await product.save();
                    console.log(`Stock restaurado para el producto ${product.nombre}. Stock actual: ${product.stock}`);
                }
            }
            // Iterar sobre los productos enviados para agregar o actualizar en la venta
            for (let i = 0; i < productos.length; i++) {
                let {codigoBarra, cantidad} = productos[i];
                // Encontrar el producto en la base de datos
                let product = await Product.findOne({codigoBarra});
                if (!product) {
                    return res.status(404).send({ message: `Producto con código de barras ${codigoBarra} no encontrado` });
                }
                // Verificar si el stock es suficiente
                if (product.stock < cantidad) {
                    return res.status(400).send({ message:`Stock insuficiente para el producto ${product.nombre}`});
                }               
                // Restar la cantidad del stock del producto
                product.stock -= cantidad;
                await product.save();
                // Actualizar el total de la venta
                total += product.precio * cantidad;
                // Guardar los productos en el array de la venta
                ventaProductos.push({ producto: product._id, cantidad });
            }
            // Actualizar los productos y el total de la venta
            venta.productos = ventaProductos;
            venta.total = total;
            // Guardar la venta actualizada
            let ventaActualizada = await venta.save();
            return res.status(200).send({ message: 'Venta actualizada exitosamente', venta: ventaActualizada });
        } catch (err) {
            return res.status(500).send({ message: 'Error al actualizar la venta', error: err.message });
        }
    },
    deleteVenta: async function (req, res) {
        const {ventaId} = req.params;
        try {
            // Encontrar y eliminar la venta por ID
            let venta = await Venta.findByIdAndDelete(ventaId);
            if (!venta) {
                return res.status(404).send({ message: 'Venta no encontrada' });
            }
            return res.status(200).send({ message: 'Venta eliminada exitosamente' });
        } catch (err) {
            return res.status(500).send({ message: 'Error al eliminar la venta', error: err.message });
        }
    }

};

module.exports = controller;
