const restful = require('node-restful')
const mongoose = restful.mongoose

const estoqueSchema = new mongoose.Schema({
    CODIGO: { type: Number, required: true },
    DATACAD: { type: Date, required: true },
    DESCRICAO: { type: String, required: true },
    SALDO: { type: Number, required: true },
    CAT: { type: Number, required: true },
    VALORAGR: { type: Number, required: true },
    ACUMULADO: { type: Number, required: true },
    ULT_VENDA: { type: Number, required: true },
    ULT_COMPRA: { type: Number, required: true },
    DVENDA: { type: Date, required: true },
    DCOMPRA: { type: Date, required: true },
    STATUS: { type: String,  },
    DEPARTAMENTO: { type: Number},
    DT_TERMINO_PROMOCAO: { type: Date, },
    DIASPARADO: { type: Number, required: true },
    INATIVO: { type: String },
    AGRUPAR: { type: Number, required: true },
    status_item: { type: Number, default: 0 }
})


module.exports = restful.model('Estoque', estoqueSchema)