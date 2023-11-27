const restful = require('node-restful')
const mongoose = restful.mongoose

const userSchema = new mongoose.Schema({
    nomeCompleto: { type: String, required: true },
    cpf: { type: String, required: true },
    email: { type: String, required: true },
    datanascimento: { type: String, required: true },
    sexo: { type: String, required: true },
    celular: { type: String, required: true },
    cargo: { type: String, required: true }, 
    tipoUsuario: { type: Number, required: true }, 
    codigoUsuario: { type: Number, }, 
    password: { type: String, min: 6, max: 12},
    profileImage: { type: String },
    pushToken: { type: String }
})

module.exports = restful.model('User', userSchema)