const restful = require('node-restful')
const mongoose = restful.mongoose

const entradaProdutosSchema = new mongoose.Schema({

    RELPEDCO: { type: Number,  },
    DATA_EMISSAO_NF: { type: Date,  },
    DATA_ENTRADA: { type: Date,  },
    DATA_RECEBIMENTO: { type: Date,  },
    NOME_FORNEC: { type: String,  },
    PRODUTOS: { type: Array, default: [] },
    
    status_item: { type: Number, default: 0},

})
module.exports = restful.model('entradaProdutos', entradaProdutosSchema)
