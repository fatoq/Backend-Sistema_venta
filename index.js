'use strict'
var mongoose=require('mongoose');
var port='3600';
mongoose.promise=global.Promise;
mongoose.set("strictQuery",false);
var app=require('./app');
mongoose.connect('mongodb://localhost:27017/Usuarios')
.then(()=>{
    console.log('Conectado a la base de datos');
    app.listen(port,()=>{
        console.log(`Servidor escuchando en el puerto ${port}`);
    })
})
.catch(err=>console.log(err))