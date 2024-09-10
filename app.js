//Para establecer metodos, rutas 
'use strict'
var express=require('express');
var bodyParse=require('body-parser');
var app=express();
var userRoutes=require('./routes/user.routes');
var productRoutes=require('./routes/productos_routes');
app.use(bodyParse.urlencoded({extended:false}));
app.use(bodyParse.json());
const cors = require('cors');
const bodyParser = require('body-parser'); 
// Configuración de CORS
const corsOptions = {
    origin: 'http://localhost:3000',  // la direccion del frontend
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())
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
app.use('/',userRoutes,productRoutes);
module.exports=app;