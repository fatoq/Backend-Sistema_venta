'use strict'
var Venta = require('../models/ventas');
const User = require('../models/users');
const mongoose = require('mongoose');
var controller = {
    dashboardVenta: async function (req, res) {
        try {
            const { fechaIn, fechaFin } = req.query;
            console.log('Rol del usuario:', req.user.role, 'y ID del usuario:', req.user.userId); // Verifica el rol del usuario
            const ventasEmpleado = await Venta.find({ usuario: req.user.userId });
            console.log(ventasEmpleado);
            const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
            if ((fechaIn && isNaN(Date.parse(fechaIn))) || (fechaFin && isNaN(Date.parse(fechaFin)))) {
                return res.status(400).json({ message: 'Fecha de inicio o fin inválida' });
            }
            let listaFecha = {};
            if (fechaIn && fechaFin) {
                listaFecha.fecha = { $gte: new Date(fechaIn), $lte: new Date(fechaFin) };
            } else if (fechaIn) {
                listaFecha.fecha = { $gte: new Date(fechaIn) };
            } else if (fechaFin) {
                listaFecha.fecha = { $lte: new Date(fechaFin) };
            }
            if (req.user.role == 'empleado') {
                console.log('Rol del usuario:', req.user.role, 'y ID del usuario:', req.user.userId); // Verifica el rol del usuario
                listaFecha.usuario = userObjectId;
                console.log('prueba:' + listaFecha.usuario);
                console.log('Lista de filtros combinada:', listaFecha);
                const dashboardEmpleados = await Venta.aggregate(
                    [{
                        $match: listaFecha
                        //$match: { usuario: req.user.userId }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$fecha" },
                                month: { $month: "$fecha" },
                                day: { $dayOfMonth: "$fecha" }
                            },
                            numeroVentas: { $sum: 1 },
                            totalVentas: { $sum: "$total" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            fecha: {
                                $dateFromParts: {
                                    'year': "$_id.year",
                                    'month': "$_id.month",
                                    'day': "$_id.day"
                                }
                            },
                            numeroVentas: 1,
                            totalVentas: 1
                        }
                    },
                    
                    { $sort: { fecha: 1 } },
                    {
                        $group: {
                            _id: null,
                            totalDeTodasLasVentas: { $sum: "$totalVentas" },  // Sumar todas las ventas
                            ventasPorDia: { $push: "$$ROOT" }
                        }
                    },
                    ]);
                console.log('Resultados del dashboard para el empleado:', dashboardEmpleados);
                return res.status(200).json({ dashboardEmpleados });
            } else if (req.user.role == 'admin') {
                const dashboardVentas = await Venta.aggregate(
                    [{
                        $match: listaFecha
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'usuario',
                            foreignField: '_id',
                            as: 'usuarioInfo'
                        }
                    },
                    {
                        $unwind: '$usuarioInfo'
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$fecha" },
                                month: { $month: "$fecha" },
                                day: { $dayOfMonth: "$fecha" }
                            },
                            numeroVentas: { $sum: 1 },
                            totalVentas: { $sum: "$total" },
                            empleados: {
                                $push: {
                                    _id: "$usuarioInfo._id",
                                    nombre: "$usuarioInfo.nombre",
                                    apellido: "$usuarioInfo.apellido",
                                    totalVenta: "$total"
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            fecha: {
                                $dateFromParts: {
                                    'year': "$_id.year",
                                    'month': "$_id.month",
                                    'day': "$_id.day"
                                }
                            },
                            numeroVentas: 1,
                            totalVentas: 1,
                            empleados: 1
                        }
                    },
                    {
                        $sort: {
                            "fecha": 1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalDeTodasLasVentas: { $sum: "$totalVentas" },  // Sumar todas las ventas
                            ventasPorDia: { $push: "$$ROOT" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            totalDeTodasLasVentas: 1,
                            ventasPorDia: 1
                        }
                    }
                    ]);
                console.log('Resultados del dashboard para el admin:', dashboardVentas);
                return res.status(200).json({ dashboardVentas });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al mostrar datos');
        }
    },
    ProductosTop: async function (req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'No tienes permisos para ver esta información' });
            }
            const productosTop = await Venta.aggregate(
                [{
                    $unwind: '$productos'
                },
                {
                    $lookup: {
                        from: 'products',  // Relacionar con la colección de productos
                        localField: 'productos.producto',
                        foreignField: '_id',
                        as: 'productoInfo'
                    }
                },
                {
                    $unwind: '$productoInfo'
                },
                {
                    $group: {
                        _id: "$productoInfo._id",
                        nombre: { $first: '$productoInfo.nombre' },
                        //categoria: { $first: '$productoInfo.categoria' },
                        //cantidadVendida: { $sum: '$productos.cantidad' },  // Sumar la cantidad de cada producto
                        //totalVentas: { $sum: { $multiply: ['$productos.cantidad', '$productoInfo.precio'] } }  // Sumar el total de ventas por producto
                        cantidad: { $sum: 1 },
                        total: { $sum: "$total" }
                    }
                },
                {
                    $sort: {
                        cantidad: -1
                    }
                },
                {
                    $limit: 5
                }
                ]);
            return res.status(200).json({ productosTop });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al mostrar datos');
        }
    }
};

module.exports = controller;
