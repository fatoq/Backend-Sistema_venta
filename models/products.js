'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = Schema({
    codigoBarra: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    categoria: { type: String, required: true },
    stock: { type: Number, required: true },
    precio: { type: Number, required: true },
    disponible: { type: Boolean, default: true },
    vendidos: { type: Number, default: 0 },
});

module.exports = mongoose.model('Product', ProductSchema);