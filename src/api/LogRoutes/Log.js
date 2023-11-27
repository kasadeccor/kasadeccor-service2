const restful = require('node-restful')
const mongoose = restful.mongoose

const tasksSchema = new mongoose.Schema({
    produto: { type: String, required: true },
    descricao: { type: String, required: true },
    vendedor: { type: String, required: true },
    dataEntrega: { type: String, default: new Date() },
    responsavel: { type: String, required: true },
    custoEntrega: { type: String, required: true },
    status: { type: Number, required: true }
   
})

/*const debtSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, min: 0, required: [true, 'Informe o valor do débito!'] },
    status: { type: String, required: false, uppercase: true,
        enum: ['PAGO', 'PENDENTE', 'AGENDADO'] }
})

const billingCycleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, min: 1970, max: 2100, required: true },
    credits: [creditSchema],
    debts: [debtSchema]
}) */

module.exports = restful.model('Tasks', tasksSchema)