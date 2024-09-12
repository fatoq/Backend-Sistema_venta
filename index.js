'use strict'
var mongoose=require('mongoose');
var port='3600';
mongoose.promise=global.Promise;
mongoose.set("strictQuery",false);
var app=require('./app');

var app = require('./app');
var User = require('./models/users'); // Asegúrate de que la ruta sea correcta
var bcrypt = require('bcryptjs'); 

const createSuperadmin = async () => {
    try {        
        // Verificar si el superadmin ya existe
        const existingSuperadmin = await User.findOne({ email: 'admin' });
        if (existingSuperadmin) {
            console.log('El superadmin ya existe');
            return;
        }
        // Crear el superadmin
        const superadmin = new User({
            nombre: 'Super',
            apellido: 'Admin',
            email: 'admin',
            password: 'admin', 
            role: 'Super-admin',
        });
        await superadmin.save();
        console.log('Superadmin creado con éxito');
    } catch (error) {
        console.error('Error al crear el superadmin:', error);
    }
};
mongoose.connect('mongodb://localhost:27017/Usuarios')
.then(()=>{
    console.log('Conectado a la base de datos');
    createSuperadmin();
    app.listen(port,()=>{
        console.log(`Servidor escuchando en el puerto ${port}`);
    })
})
.catch(err=>console.log(err))