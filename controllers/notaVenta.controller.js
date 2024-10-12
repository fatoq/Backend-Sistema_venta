'use strict'
var NotaVenta = require('../models/cliente');
var Venta=require('../models/ventas')
const PDFDocument = require('pdfkit-table');
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
            //ver si el cliente existe
            let clienteExiste = await NotaVenta.findOne({ 'cliente.ci': cliente.ci });
            if (!clienteExiste) {
                clienteExiste={
                    nombre: cliente.nombre,
                    ci: cliente.ci,
                    telefono: cliente.telefono,
                    direccion: cliente.direccion
                };
                console.log('no existe el cliente, se va a crear el usuario');
            } else{
                clienteExiste=clienteExiste.cliente;
                console.log('cliente existente');
            }
            const notaVenta = new NotaVenta({
                venta: venta._id,
                cliente: clienteExiste
                /*
                {
                    nombre: cliente.nombre,
                    ci: cliente.ci,
                    telefono: cliente.telefono,
                    direccion: cliente.direccion
                }*/
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
        const file=path.join(directoryPath,`Nota_venta_${notaVentaId}.pdf`);
        try {             // si la carpeta 'notas_venta_pdf' existe, sino la crea
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
            //logo
            const imagePath = path.join(__dirname, '../notas_venta_pdf/logo.png');  // Ajustar la ruta relativa
            // Verificar si la imagen existe
            if (fs.existsSync(imagePath)) {
                // Insertar la imagen en el lado izquierdo del título "NOTA DE VENTA"
                doc.image(imagePath, 50, 5, { width: 130, height: 100 });
            } else {
                console.log('El archivo de imagen no se encontró:', imagePath);
            }
            //Encabezado
            doc.fontSize(32).font('Helvetica-Bold').text('NOTA DE VENTA', { align: 'right' });
            doc.fontSize(32).font('Helvetica-Bold').text('Viveres Ronaldo', { align: 'center' });
            doc.fontSize(11).text('Leonidas Plaza-272 y Lizardo Garcia N24; Cel:0998866499', { align: 'center' });
            doc.moveTo(50, 100).lineTo(550, 100).stroke();
            doc.moveDown();
            doc.fontSize(10.5).text('Atendiendo a su amable solicitud se emite la correspondiente nota de venta', { align: 'center' });
            doc.moveDown();
            // Datos del cliente y venta
            doc.fontSize(12).font('Helvetica-Bold').text('Cliente:', 50, doc.y);  // Usar doc.y para obtener la posición actual y colocar elementos después
            doc.moveTo(150, doc.y -2).lineTo(550, doc.y - 2).stroke();  // Línea subrayada para "Cliente"
            doc.fontSize(12).font('Helvetica').text(notaVenta.cliente.nombre, 315, doc.y-18); 
            doc.moveDown();
            // Espacio y línea para "C.I./R.U.C"
            doc.fontSize(12).font('Helvetica-Bold').text('C.I./R.U.C:', 50, doc.y);
            doc.moveTo(150, doc.y -2).lineTo(550, doc.y -2).stroke();
            doc.fontSize(12).font('Helvetica').text(notaVenta.cliente.ci, 315, doc.y-18);
            doc.moveDown();
            // Espacio y línea para "Teléfono"
            doc.fontSize(12).font('Helvetica-Bold').text('Teléfono:', 50, doc.y);
            doc.moveTo(150, doc.y -2).lineTo(550, doc.y -2).stroke();
            doc.fontSize(12).font('Helvetica').text(notaVenta.cliente.telefono, 315, doc.y-18);
            doc.moveDown();
            // Espacio y línea para "Dirección"
            doc.fontSize(12).font('Helvetica-Bold').text('Dirección:', 50, doc.y);
            doc.moveTo(150, doc.y -2).lineTo(550, doc.y -2).stroke();
            doc.fontSize(12).font('Helvetica').text(notaVenta.cliente.direccion, 315, doc.y-18);
            doc.moveDown();
            // Espacio y línea para "Fecha"
            doc.fontSize(12).font('Helvetica-Bold').text('Fecha:', 50, doc.y);
            doc.moveTo(150, doc.y -2).lineTo(550, doc.y -2).stroke();
            doc.fontSize(12).font('Helvetica').text(notaVenta.fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 281, doc.y-18);
            doc.moveDown();
            doc.moveDown();
            // productos de la venta
            const productos = notaVenta.venta.productos.map(item => ({
                cantidad: item.cantidad,
                descripcion: item.producto.nombre,
                precioUnitario: item.producto.precio,
                precioTotal: item.cantidad * item.producto.precio
            }));
            // Crear tabla con los productos
            const table = {
                title: 'Detalles de la venta',
                headers: ['Cantidad', 'Descripción', 'Precio Unitario', 'Precio Total'],
                rows: productos.map(item => [
                    item.cantidad,
                    item.descripcion,
                    `$${item.precioUnitario.toFixed(2)}`,
                    `$${item.precioTotal.toFixed(2)}`
                ])
            };
            // Insertar la tabla en el PDF justo después de los datos del cliente
            doc.table(table, {
                prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
                prepareRow: (row, i) => doc.font('Helvetica').fontSize(10),
                width: 500,
                columnSpacing: 10,
                x: 50,  // Posición X de la tabla (mantener fija)
            });
            // Total de la venta
            doc.moveDown();
            doc.fontSize(12).font('Helvetica-Bold').text(`Total de la Venta: $${notaVenta.venta.total.toFixed(2)}`, { align: 'right' });
            doc.moveDown();
            doc.fontSize(17).font('Helvetica-Bold').text(`Gracias por preferirnos`, { align: 'center' });
            // Finalizar el documento
            doc.end();
            pdfStream.on('finish',function(){
                console.log('PDF generado correctamente');
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
