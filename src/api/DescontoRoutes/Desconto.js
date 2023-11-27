const restful = require('node-restful')
const mongoose = restful.mongoose

const descontoSchema = new mongoose.Schema({
    PEDIDO: { type: Number, required: true },
    NOME_CLIENTE: { type: String, required: true },
    DESC_PERC_PEDIDO: { type: Number, required: true },
    TOTAL_PED_BRUTO: { type: Number, required: true },
    TOTAL_PED_LIQUIDO: { type: Number, required: true },
    TOTAL_PED_DESCONTO: { type: Number, required: true },
    VENDEDOR: { type: String,  },
    CONDICAO_PAGAMENTO: { type: String,  },
    TIPO_PAGAMENTO: { type: String,  },
    HORA_EDICAO: { type: String, required: true },
    DATA_EDICAO: { type: Date, required: true },
    STATUS: { type: Number, Default: 0},
    status_pedido: { type: Number, Default: 0},
    STATUS_PROMOCAO: { type: Boolean},
    PRODUTOS: {type: Array}
})

module.exports = restful.model('Desconto', descontoSchema)