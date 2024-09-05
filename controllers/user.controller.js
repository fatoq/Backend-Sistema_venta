'use strict'
const jwt = require('jsonwebtoken');
var User=require('../models/users');
const {blacklistedTokens} = require('../middleware/auth'); 
const { body, validationResult } = require('express-validator');

var controller = {
    validateUserCreation: [
        body('email').isEmail().withMessage('Introduce un email válido.'),
        body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres.'),
        body('nombre').isAlpha().withMessage('El nombre solo debe contener letras.'),
        body('apellido').isAlpha().withMessage('El apellido solo debe contener letras.'),
    ],

    saveUsuario: async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
        var user = new User();
        var params = req.body;
        user.nombre = params.nombre;
        user.apellido = params.apellido;
        user.email = params.email; 
        user.password = params.password;
        user.role = params.role;
        try {
            // Comprobar si el email ya está registrado
            var userExist = await User.findOne({ email: user.email });
            if (userExist) {
                return res.status(400).send({ message: 'El email ya está registrado' });
            }
          // Encriptar la contraseña solo una vez y verificar
        console.log('Contraseña sin hash:', params.password);
        console.log('Contraseña con hash:', user.password);
            var userSave = await user.save();
            return res.status(200).send({ user: userSave });
        } catch (err) {
            return res.status(500).send({ message: 'Error al crear Usuario' });
        }
    },
    deleteUser:function(req,res){
        var userId = req.params.id;
        User.findByIdAndDelete(userId).then(userRemoved => {
            if (!userRemoved) {
                return res.status(404).send({ message: 'Usuario no encontrado' });
            }
            return res.status(200).send({ message: 'Usuario eliminado correctamente', user: userRemoved });
        }).catch(err => {
            return res.status(500).send({ message: 'Error al eliminar Usuario' });
        });
    },
    updateUser:function(req,res){
        var userId = req.params.id;
        var update = req.body;
        User.findByIdAndUpdate(userId, update, { new: true }).then(userUpdated => {
            if (!userUpdated) {
                return res.status(404).send({ message: 'Usuario no encontrado' });
            }
            return res.status(200).send({ message: 'Usuario actualizado correctamente', user: userUpdated });
        }).catch(err => {
            return res.status(500).send({ message: 'Error al actualizar Usuario' });
        });
    },
    getUsers: function (req, res) {
        User.find().then(users => {
            if (!users) {
                return res.status(404).send({ message: 'No hay Usuarios' });
            }
            return res.status(200).send({ users });
        }).catch(err => {
            return res.status(500).send({ message: 'Error al obtener Usuarios' });
        });
    },
    getUser: function (req, res) {
        var userId = req.params.id;
        User.findById(userId).then(user => {
            if (!user) {
                return res.status(404).send({ message: 'Usuario no encontrado' });
            }
            return res.status(200).send({ user });
        }).catch(err => {
            return res.status(500).send({ message: 'Error al obtener Usuario' });
        });
    },   
    //para el ingreso de session
    login: async function(req,res){
        const {email,password}= req.body;
        try{
            console.log("Datos recibidos - Email:", email, "Password:", password);
            const user = await User.findOne({email});
            if(!user){
                return res.status(404).send({message:'Usuario no encontrado'});
            }
            console.log('Contraseña recibida:', password); // Verificar la contraseña recibida
            const validPassword = await user.comparePassword(password);
            console.log('¿Contraseña válida?:', validPassword);      // Verificar si la contraseña es válida
            if(!validPassword){
                return res.status(401).send({message:'Contraseña incorrecta'});
            }
            //uso del jwt
            const token = jwt.sign(
                {userId:user._id, role:user.role},
                'your-secret-key',
                { expiresIn: '24h'}
            );
            console.log("Login exitoso");
            return res.status(200).send({ message: 'Login exitoso',token, user });
        } catch (error){
            return res.status(500).send({ message: 'Error en el SERVIDOR', error });
        }
    },
    //para salir de la session 
    logout: function (req, res) {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).send({ message: 'No hay token para invalidar' });
        }
        const token = authHeader.replace('Bearer ', ''); // Eliminar 'Bearer ' del token
        // Añadir el token a la lista negra
        blacklistedTokens.push(token);
    return res.status(200).send({ message: 'Logout exitoso' });
}
};

module.exports = controller;