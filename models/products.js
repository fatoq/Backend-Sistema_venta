'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = Schema({
    codigoBarra: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    categoria: { type: String, required: true },
    stock: { type: Number, required: true },
    precio: { type: Number, required: true}
});
//transformar y validar el precio
ProductSchema.pre('save', function(next) {
    console.log('Precio antes de transformación:', this.precio);
    if (this.precio) {
        // Reemplazar comas por puntos en el precio
        this.precio = this.precio.toString().replace(',', '.');
      // Convertir a número flotante
        let precioFinal = parseFloat(this.precio);
      // Verificar si el precio es un número válido
        if (isNaN(precioFinal)) {
            return next(new Error('El precio no es válido.'));
        }
      // Redondear a 2 decimales
    this.precio = parseFloat(precioFinal.toFixed(2));
    }
    next();
});


module.exports = mongoose.model('Product', ProductSchema);
