'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var notaVentaSchema = Schema({
    venta: {
        type: Schema.Types.ObjectId, ref: 'Venta', required: true
    },
    cliente: {
        nombre: { type: String, required: true },
        ci: { type: String, required: true },
        telefono: { type: String, required: true },
        direccion: { type: String, required: true }
    },
    fecha: { type: Date, default: Date.now }
});
module.exports = mongoose.model('notaVenta', notaVentaSchema);