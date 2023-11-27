const restful = require('node-restful')
const mongoose = restful.mongoose

const difMargemSchema = new mongoose.Schema({

    CODIGO: { type: Number,  },
    DESCRICAO: { type: String,  },
    P_VENDA_VISTA: { type: Number,  },
    P_VENDA_PRAZO: { type: Number,  },
    MKUP_CADASTRO: { type: Number,  },
    MKUP_APLICADO: { type: Number,  },
    U_CUSTO: { type: Number,  },
    DIF_MKUP:  { type: Number,  },
    STATUS: { type: Number, default: 0},

})
module.exports = restful.model('DifMargem', difMargemSchema)
