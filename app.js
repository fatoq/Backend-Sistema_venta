//Para establecer metodos, rutas 
'use strict'
var express=require('express');
//var bodyParse=require('body-parser');
var app=express();
var userRoutes=require('./routes/user.routes');
var productRoutes=require('./routes/productos_routes');
var ventasRoutes=require('./routes/ventas_routes');
var notasRoutes=require('./routes/nota_routes');
var dashboardRoutes=require('./routes/dashboard_routes');
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//cabeceras van a procesar los metodos y control de acceso HTTP
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, X-Request-With, Content-Type,Accept, Access-Control-Allow, Request-Method')
    res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,DELETE');
    res.header('Allow','GET, POST, OPTIONS, PUT, DELETE');
    res.header("Access-Control-Allow-Credentials",true);
    next();
});

//Rutas
app.use('/',userRoutes,productRoutes,ventasRoutes,notasRoutes,dashboardRoutes);
module.exports=app;