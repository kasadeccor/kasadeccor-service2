const restful = require('node-restful')
const mongoose = restful.mongoose

const clientesSchema = new mongoose.Schema({

    CODIGO: { type: Number,  },
    NOME_CLI: {type: String,  },
    END_CLI: { type: String, },
    CID_CLI: { type: String, },
    BAIR_CLI: { type: String,  },
    UF_CLI: { type: String,  },
    CEP_CLI: { type: String,  },
    FONE1_CLI: { type: String,  },
    FONE2_CLI:  { type: String,  },
    NASC_CLI: { type: Date, },
    EMAIL_CLI: { type: String, },
    ORG_CLI: { type: String, },
    CPF_CLI: { type: String, },
    SEXO_CLI: { type: String, },
    FANTAS: { type: String, },
    NACIONALIDADE: { type: String, },
    ESTADO_CIVIL: { type: String, },
    NR_CLI: { type: String, },
    COMPLEMENTO_CLI: { type: String, },
    TABELA: { type: Number, default: 0},
    QTD_PARC: { type: Number, default: 0},
    COND: { type: String, default: ''},
    STATUS_CLI: { type: String, },
    PESSOA: { type: String, },
    REL_OBRA: { type: Number, },
    DATACADASTRO: { type: Date, },
    ENDERECOS: { type: Array, default: [] },
    status_item: { type: Number, default: 0},

})
module.exports = restful.model('Clientes', clientesSchema)
