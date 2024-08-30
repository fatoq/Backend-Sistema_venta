'user strict'
var mongoose=require('mongoose');
var bcrypt = require('bcryptjs');
var Schema=mongoose.Schema;

var UserSchema=Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'empleado'], default: 'empleado' },
});
// Middleware para encriptar la contraseña antes de guardarla
UserSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});
// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
module.exports=mongoose.model('User',UserSchema);