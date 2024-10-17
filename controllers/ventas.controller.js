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
                ventas = await Venta.aggregate([
                    {
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
                        $lookup: {
                            from: 'products',
                            localField: 'productos.producto',
                            foreignField: '_id',
                            as: 'productoDetalle'
                        }
                    },
                    {
                        $unwind: '$productos' // Desenrolla los productos para acceder a cada uno por separado
                    },
                    {
                        $unwind: '$productoDetalle'
                    },
                    {
                        $group: {
                            _id: '$_id',
                            usuarioId: { $first: '$usuarioDetalle._id' },
                            nombre: { $first: '$usuarioDetalle.nombre' },
                            apellido: { $first: '$usuarioDetalle.apellido' },
                            productos: {
                                $push: {
                                    _id: '$productoDetalle._id',
                                    codigoBarra: '$productoDetalle.codigoBarra',
                                    nombre: '$productoDetalle.nombre',
                                    categoria: '$productoDetalle.categoria',
                                    precio: '$productoDetalle.precio',
                                    cantidad: '$productos.cantidad' // Aquí obtenemos la cantidad correcta de cada producto
                                }
                            },
                            total: { $first: '$total' }, // Mantener el total de la venta
                            fecha: { $first: '$fecha' }
                        }
                    },
                    {
                        $group: {
                            _id: '$usuarioId',
                            nombre: { $first: '$nombre' },
                            apellido: { $first: '$apellido' },
                            ventas: {
                                $push: {
                                    _id: '$_id',
                                    productos: '$productos',
                                    total: '$total',
                                    fecha: '$fecha'
                                }
                            },
                            totalVentas: { $sum: '$total' }
                        }
                    }
                ]);
                console.log('****resultado****',ventas);
            } else{
                ventas = await Venta.find({ usuario: req.user.userId })
                .populate('productos.producto', 'nombre categoria codigoBarra precio') // Aquí esta los detalles del producto
                .populate('usuario', 'nombre apellido');  // Aquí esta el nombre y apellido del empleado
                    
            }
            console.log('****resultado****',ventas);
            if (!ventas || ventas.length == 0) {
                return res.status(404).send({ message: 'No hay ventas registradas' });  // No hay ventas registradas para este usuario
            }
            return res.status(200).send({ ventas });
        } catch (err) {
            return res.status(500).send({ message: 'Error al obtener las ventas', error: err.message });
        }
    },
    getcanastos: async function (req, res) {
        try {
            const canastos = await Venta.aggregate([
                {
                    $unwind: '$productos'
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productos.producto',
                        foreignField: '_id',
                        as: 'productoInfo'
                    }
                },
                {
                    $unwind: '$productoInfo'
                },
                {
                    // Convertir el precio a un número válido para la operación
                    $addFields: {
                        precioNumerico: {
                            $cond: {
                                if: { $isNumber: "$productoInfo.precio" },
                                then: { $toDouble: "$productoInfo.precio" },  // Convertir a double si es un número
                                else: { $toDecimal: "$productoInfo.precio" }  // Si es decimal128, manejarlo como decimal
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: '$productoInfo.categoria',
                        cantidaVendida: { $sum: '$productos.cantidad' },
                        ventaTotales: { $sum: { $multiply: ['$productos.cantidad', '$precioNumerico'] } }  // Usar precioNumerico en lugar de productoInfo.precio
                    }
                },
                {
                    $sort: { cantidaVendida: -1 }
                }
            ]);
            // Convertir todas las ventas totales a un número para evitar problemas con Decimal128
            const canastosConvertidos = canastos.map(item => ({
                ...item,
                ventaTotales: parseFloat(item.ventaTotales.$numberDecimal || item.ventaTotales)
            }));
            const totalVentas = canastosConvertidos.reduce((acc, item) => acc + item.ventaTotales, 0);
            const porcentajes = canastosConvertidos.map(item => ({
                ...item,
                porcentajeVentas: ((item.ventaTotales / totalVentas) * 100).toFixed(2)  // Calcular porcentaje de ventas
            }));
            return res.status(200).send({ porcentajes });
        } catch (err) {
            return res.status(500).send({ message: 'Error al obtener las estadísticas por categoría', error: err.message });
        }
    },
    
    getProductosVendidos: async function (req, res) {
        try {
            const prodVenta = await Product.aggregate([
                {
                    $lookup: {
                        from: 'venta',
                        localField: '_id',
                        foreignField: 'productos.producto',
                        as: 'ventaInfo'
                    }
                },
                
            {
                    $unwind:{ 
                    path:'$ventaInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields:{
                    cantidadVendida:{
                        $cond:{
                            if:{$gt: ['$ventaInfo',null]},
                            then:{$sum:'$ventaInfo.productos.cantidad'},
                            else:0
                        }
                    },
                    totalVentas:{
                        $cond:{
                            if:{$gt: ['$ventaInfo', null]},
                            then:{ $multiply: [{ $sum: '$ventaInfo.productos.cantidad' }, { $toDouble: '$precio' }] },
                            else:0
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    nombre: { $first: '$nombre' },
                    categoria: { $first: '$categoria' },
                    cantidadVendida: { $sum: '$cantidadVendida' },  // Sumamos la cantidad vendida de este producto
                    totalVentas: { $sum: '$totalVentas' }  // Sumamos el total de ventas para este producto
                }
            },
            {
                $sort: { cantidadVendida: -1 }
            }
            ]);
            const totalVentasG=prodVenta.reduce((acc,item)=> acc + item.totalVentas, 0);
            const productoEsta=prodVenta.map(item=>({
                ...item,
                porcentajeVentas: totalVentasG>0? ((item.totalVentas / totalVentasG) * 100).toFixed(2) :0 // Calcular porcentaje de ventas
            }));
            return res.status(200).send({productos:productoEsta});
            
        } catch (err) {
            return res.status(500).send({ message: 'Error al obtener los productos vendidos', error: err.message });
        }
        
    },
    
    /*getProductosVendidos: async function (req, res) {
        try {
            const prodVenta = await Product.aggregate([
                {
                    $lookup: {
                        from: 'ventas',
                        localField: '_id',
                        foreignField: 'productos.producto',
                        as: 'ventaInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$ventaInfo',
                        preserveNullAndEmptyArrays: true  // Esto garantiza que también se muestren productos que no han sido vendidos
                    }
                },
                {
                    $addFields: {
                        // Si hay ventas para este producto, calculamos la cantidad vendida y el total de ventas
                        cantidadVendida: {
                            $cond: {
                                if: { $gt: ['$ventaInfo', null] },
                                then: { $sum: '$ventaInfo.productos.cantidad' },  // Sumar la cantidad de productos vendidos
                                else: 0
                            }
                        },
                        totalVentas: {
                            $cond: {
                                if: { $gt: ['$ventaInfo', null] },
                                then: { $multiply: ['$ventaInfo.productos.cantidad', { $toDouble: '$precio' }] },  // Multiplicar cantidad vendida por el precio del producto
                                else: 0
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        nombre: { $first: '$nombre' },
                        categoria: { $first: '$categoria' },
                        cantidadVendida: { $sum: '$cantidadVendida' },  // Sumar la cantidad vendida de este producto
                        totalVentas: { $sum: '$totalVentas' }  // Sumar el total de ventas de este producto
                    }
                },
                {
                    $sort: { cantidadVendida: -1 }  // Ordenar de mayor a menor por cantidad vendida
                }
            ]);
    
            // Calcular el total de ventas global
            const totalVentasGlobal = prodVenta.reduce((acc, item) => acc + item.totalVentas, 0);
    
            // Calcular el porcentaje de ventas para cada producto
            const productosConPorcentaje = prodVenta.map(item => ({
                ...item,
                porcentajeVentas: totalVentasGlobal > 0
                    ? ((item.totalVentas / totalVentasGlobal) * 100).toFixed(2)  // Calcular porcentaje de ventas
                    : 0
            }));
    
            return res.status(200).send({ productos: productosConPorcentaje });
    
        } catch (err) {
            return res.status(500).send({ message: 'Error al obtener los productos vendidos', error: err.message });
        }
    },*/
    
    updateVenta: async function (req, res) {
        const {ventaId} = req.params;
        const {productos} = req.body; // Los productos nuevos o actualizados
        let total = 0;
        let ventaProductos = [];
        try {
            // Encontrar la venta por ID
            let venta = await Venta.findById(ventaId);
            console.log('ID encontrada :', ventaId);
            if (!venta) {
            return res.status(404).send({message:'Venta no encontrada'});
            }
            //para actualizar solo los que hacen su propias ventas
            if (req.user.userId.toString() !== venta.usuario.toString()) {
                console.log('Permiso denegado: El usuario no es el creador de la venta');
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
            console.log('Venta actualizada exitosamente:', ventaActualizada);
            return res.status(200).send({ message: 'Venta actualizada exitosamente', venta: ventaActualizada });
        } catch (err) {
            return res.status(500).send({ message: 'Error al actualizar la venta', error: err.message });
        }
    },
    deleteVenta: async function (req, res) {
        const {ventaId} = req.params;
        console.log("ventaId recibido en backend:", ventaId); 
        try {
            // Encontrar y eliminar la venta por id
            let ventaDeleted = await Venta.findByIdAndDelete(ventaId);
            if (!ventaDeleted) {
                return res.status(404).send({ message: 'Venta no encontrada' });
            }
            return res.status(200).send({ message: 'Venta eliminada exitosamente' });
        } catch (err) {
            return res.status(500).send({ message: 'Error al eliminar la venta', error: err.message });
        }
    }

};

module.exports = controller;
