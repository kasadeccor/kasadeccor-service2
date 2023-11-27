const restful = require('node-restful')
const mongoose = restful.mongoose

const devolucoesEstoqueSchema = new mongoose.Schema({
    CODIGO: { type: Number, required: true },
    COD_ENTREGA: { type: Number, required: true },
    CODCLI: { type: Number, required: true },
    NOMECLI: { type: String, required: true },
    TIPO_ENTREGA: { type: String, required: true },
    VALOR: { type: Number, required: true },
    DATA: { type: Date, required: true },
    COD_VEND: { type: Number, required: true },
    NOME_VEND: { type: String, required: true },
    OPERADOR: { type: String, required: true },
    DATA_EDICAO: { type: Date, required: true },
    HORA_EDICAO: { type: Date, required: true },
    RELVENDA: { type: Number, required: true },
    OBS_DEVOLUCAO: { type: String,  },
    NF: { type: String,  },
    PRODUTOS: { type: Array, default: [] },
    DESC_MOTIVO: { type: String,  },
    STATUS: { type: Number, default: 0},
    idVendedor: { type: String, default: ''},
    idAdmin: { type: String, default: ''},
    messages: {type: Array, default: []},
    vendedorMsg: { type: Boolean, default: false},
    adminMsg: { type: Boolean, default: false}

})

module.exports = restful.model('DevolucoesEstoque', devolucoesEstoqueSchema)