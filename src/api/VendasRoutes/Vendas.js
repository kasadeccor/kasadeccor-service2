const restful = require('node-restful')
const mongoose = restful.mongoose

const vendasSchema = new mongoose.Schema({
    VENDEDOR: { type: String,  },
    TOTAL_CUSTO: { type: Number,   default: 0  },
    DATA_VENDAS: { type: Date, },
    TOTAL_VENDA_COM_DESC:  { type: Number,  default: 0 },
    INDECE_SEM_DEV:  { type: Number,  default: 0 },
    MKP_SEM_DEV:  { type: Number,   default: 0},
    TOTAL_VENDA_BRUTA:  { type: Number,   default: 0},
    TOTAL_RETENCAO:  { type: Number,  default: 0 },
    TOTAL_CUSTO_DEVOLUCAO:  { type: Number, default: 0  },
    TOTAL_DEVOLUCAO:  { type: Number,  default: 0 }
})
module.exports = restful.model('Vendas', vendasSchema)