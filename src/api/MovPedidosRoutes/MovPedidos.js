const { Mixed } = require('mongoose')
const restful = require('node-restful')
const mongoose = restful.mongoose

const movpedidosSchema = new mongoose.Schema({
    CODIGO: { type: Number, },
    OBS: { type: String, },
    produtos: [
        {
            CODIGO: { type: Number },
            qtd: { type: Number },
            PERCDESCONTO_PRODUTO: { type: Number },
            REL_PRODLOTE: { type: Number },
            descAdd: { type: String },
            status: { type: Boolean }
        }
    ],
    cliente: { type: Mixed },
    totalBruto: { type: Number, },
    totalLiquido: { type: Number, },
    total_custo_final: { type: Number, },
    desc_perc: { type: Number, },
    totalDesconto: { type: Number, },
    total_peso: { type: Number, },
    historico: { type: Mixed },
    status_movimentacao: { type: Number, },
    tipoPedido: { type: Number, },
    comissao_vendedor: { type: Number, },
    total_comissao_vendedor: { type: Number, },
    nome_vendedor: { type: String, },
    codigo_vendedor: { type: Number, },
    SITUACAO: { type: String, },
    novoCliente: { type: String, default: '' },
    telefoneNovo: { type: String, },
    CONDICAO_PAGAMENTO: { type: String, },
    TIPO_PAGAMENTO: { type: String, },
    lastUpdate: { type: Date },
    dataCreated: { type: Date },
    idResp: { type: String, },
    nomeResp: { type: String, },
    erroLog: { type: Array, default: [] },
    viaApp: { type: Boolean, default: false },
})
module.exports = restful.model('MovPedidos', movpedidosSchema)

