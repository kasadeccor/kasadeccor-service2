const { Mixed } = require('mongoose')
const restful = require('node-restful')
const mongoose = restful.mongoose

const produtosSchema = new mongoose.Schema({

    CODIGO: { type: Number, },
    DESCRICAO: { type: String, },
    MARCA: { type: String, },
    EMB: { type: String, },
    UNID: { type: String, },
    ESTOQUE_DISPONIVEL: { type: Number, },
    ESTOQUE_FISICO: { type: Number, },
    CUSTO_NF: { type: Number, },
    CUSTO_FINAL: { type: Number, },
    MARKUP_CADASTRO: { type: Number, },
    MARKUP_REAL: { type: Number, },
    DIF_MARGEM: { type: Number, },
    VALOR_VENDA: { type: Number, },
    CODIGO_DE_BARRAS: { type: String, },
    DATA_DE_CADASTRO: { type: Date, },
    ULTIMA_VENDA: { type: Date, },
    lastUpdate: { type: Date, },
    ULTIMA_ENTRADA: { type: Date, },
    PESO: { type: Number, },
    INATIVO: { type: Boolean },
    STATUS: { type: String, },
    ENCOMENDA: { type: String, },
    FAMILIA: { type: Number, },
    DIVISAO: { type: Number, },
    RELGRUPOS: { type: Number, },
    DEPARTAMENTO: { type: Number, },
    FORNECEDOR: { type: String, },
    dist: { type: Array, default: [] },
    status_item: { type: Number, default: 0 },
    productImages: { type: Array, default: [] },
    productAmbientes: { type: Array, default: [] },
    productClientes: { type: Array, default: [] },
    specs: { type: Array, default: [] },
    promocao: { type: Boolean },
    detalhesPromocao: { type: Mixed},
    lotes: { type: Array, default: [] },
    USA_LOTE: { type: Boolean }
})
module.exports = restful.model('Produtos', produtosSchema)

