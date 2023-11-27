const restful = require('node-restful')
const mongoose = restful.mongoose

const ajusteSchema = new mongoose.Schema({

    CODIGO: { type: Number,  },
    CODITEM: { type: Number,  },
    DATAMOVTO: { type: Date,  },
    DATA_EMISSAO: { type: Date,  },
    RELMOVESTQ: { type: Number, },
    DESCRICAO_PRODUTO: { type: String,  },
    DESCRICAO: { type: String,  },
    OPERADOR: { type: String,  },
    RELPED: { type: Number,  },
    MOVTO:  { type: String,  },
    TIPO: { type: String, },
    QUANT: { type: Number, },
    PROD_SALDO: { type: Number, },
    PROD_DISP: { type: Number, },
    status_item: { type: Number, default: 0},

})
module.exports = restful.model('AjusteEstoque', ajusteSchema)
