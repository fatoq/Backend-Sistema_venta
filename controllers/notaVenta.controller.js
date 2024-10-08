'use strict'
var NotaVenta = require('../models/cliente');
var Venta=require('../models/ventas')
const PDFDocument = require('pdfkit');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

var controller = {
    //validar datos del cliente
    validatecustomerdata: [
        body('cliente.nombre').matches(/^[a-zA-Z\s]+$/).withMessage('El nombre solo debe contener letras.'),
        body('cliente.ci').isNumeric().withMessage('solo debe ser numeros').isLength({min:10,max: 10 }).withMessage('La cédula de identidad debe tener 10 numeros.'),
        body('cliente.telefono').isNumeric().withMessage('solo debe introducir numeros'),
    ],
    // Crear una nueva venta
    createNotaVenta: async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        var {ventaId,cliente} = req.body;
        //Log de los datos recibidos
        console.log('Datos recibidos:', {ventaId,cliente});
        try {
            let venta = await Venta.findById(ventaId);
            if (!venta) {
                return res.status(404).send({ message: 'La venta no existe' });
            }
            const notaVenta = new NotaVenta({
                venta: venta._id,
                cliente: {
                    nombre: cliente.nombre,
                    ci: cliente.ci,
                    telefono: cliente.telefono,
                    direccion: cliente.direccion
                }
        });
        console.log('Datos de notaVenta antes de guardar:', notaVenta);
        await notaVenta.save();
        res.status(201).send({ message: 'Nota de venta creada correctamente', notaVenta });
        }catch(err){
            console.log(err);
            res.status(500).send({ message: 'Error al crear la nota de venta', error: err.message });
        }  
    },
    genenNotaventa: async function(req, res) {
        const { notaVentaId } = req.params;
        const directoryPath = path.join(__dirname, '../notas_venta_pdf');
        //const filePath = path.join(directoryPath, `Nota_venta_${notaVentaId}.pdf`);
        const file=path.join(directoryPath,`Nota_venta_${notaVentaId}.pdf`);
        try {
            // Verifica si la carpeta 'notas_venta_pdf' existe, si no, la crea
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }
            if(fs.existsSync(file)){
                //return res.status(200).send({message:'PDF generado'});
                return res.download(file, `Nota_venta_${notaVentaId}.pdf`);
            }
            const notaVenta = await NotaVenta.findById(notaVentaId).populate({
                    path: 'venta',
                    populate: {
                        path: 'productos.producto', //datos del producto
                        model: 'Product'
                    }
                });
            if (!notaVenta) {
                return res.status(404).send({ message: 'Nota de venta no encontrada' });
            }
            if (!notaVenta.cliente) {
                return res.status(404).send({ message: 'Cliente no encontrado en la nota de venta' });
            }
            // Generar el PDF
            const doc = new PDFDocument();
            const pdfStream = fs.createWriteStream(file);          
            doc.pipe(pdfStream);
            doc.fontSize(18).text('Nota de Venta', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Cliente: ${notaVenta.cliente.nombre}`);
            doc.text(`C.I.: ${notaVenta.cliente.ci}`);
            doc.text(`Teléfono: ${notaVenta.cliente.telefono}`);
            doc.text(`Dirección: ${notaVenta.cliente.direccion}`);
            doc.moveDown();
            doc.text(`Fecha: ${notaVenta.fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
            doc.moveDown();
            // productos
            notaVenta.venta.productos.forEach((item) => {
                const producto = item.producto;  
                const cantidad = item.cantidad;
                const precio = producto.precio;  
                const nombre = producto.nombre;
                doc.text(`Producto: ${nombre} - Cantidad: ${cantidad} - Precio: ${precio} - Total: ${cantidad * precio}`);
            });
            doc.text(`Total: ${notaVenta.venta.total}`);
            doc.end();
            pdfStream.on('finish',function(){
                console.log('PDF generado correctamente');
               //res.status(200).send({ message: 'PDF generado correctamente' });
                res.download(file, `Nota_venta_${notaVentaId}.pdf`);

            });
            pdfStream.on('error',function(err){
                console.error('Error generando PDF:', err);
                res.status(500).send({ message: 'Error al generar el PDF', error: err.message });  
            });
        } catch (err) {
            console.log(err);
            res.status(500).send({ message: 'Error al generar la nota de venta', error: err.message });
        }
    }
};

module.exports = controller;
