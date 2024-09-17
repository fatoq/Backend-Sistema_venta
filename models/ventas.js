'use strict';
var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var VentaSchema=Schema({
    usuario: { 
        type: Schema.Types.ObjectId, ref: 'User', required: true
        
    },
    productos: [{
        producto: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        cantidad: { type: Number, required: true },
    }],
    total: { type: Number, required: true },
    fecha: { type: Date, default: Date.now }
});

module.exports=mongoose.model('Venta', VentaSchema); 