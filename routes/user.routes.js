'use strict'
var userController=require('../controllers/user.controller');
var express=require('express');
var router=express.Router();
const { authenticateToken , checkRole } = require('../middleware/auth');
//var userController=require();

// Ruta principal
router.get('/', (req, res) => {
    res.status(200).send('<h1>Bienvenido a la API de Usuarios</h1>');
});

//pag par los crear usuario por el admin
router.post('/create-user',authenticateToken,checkRole(['Super-admin','admin']),userController.validateUserCreation,userController.saveUsuario);
//pag para borrar los usuarios por el admin
router.delete('/delete-user/:id',authenticateToken,checkRole(['Super-admin','admin']),userController.deleteUser);
//pag para actualizar los usuarios por el admin
router.put('/update-user/:id',authenticateToken,checkRole(['Super-admin','admin']),userController.updateUser);
//para ver todos los usuarios 
router.get('/get-users',userController.getUsers);
//para ver un usuario por id
router.get('/get-user/:id',userController.getUser);
//para ver un usuario por email
//router.get('/get-user-email/:email',userController.getUserByEmail);
//para el login del usuario
router.post('/login',userController.login);
//para el logout del usuario
router.get('/logout',authenticateToken,userController.logout);
//para olvide mi contraseña
router.post('/forgot-password',userController.forgotPassword);


module.exports=router;