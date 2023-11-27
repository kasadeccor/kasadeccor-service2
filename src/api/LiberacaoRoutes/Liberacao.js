const restful = require('node-restful')
const mongoose = restful.mongoose

const liberacaoSchema = new mongoose.Schema({

    CODIGO: { type: Number,  },
    DATA: { type: Date,  },
    RELACIONAMENTO: {type: String,  },
    TABELA: { type: String, },
    REL_USER_LIB: { type: String,  },
    USUARIO: { type: String,  },
    PROCESSO: { type: String,  },
    NOME_TELA:  { type: String,  },
    DESCRICAO: { type: String, },
    NOME_PERMISSAO: { type: String, },
    NOME_FORM: { type: String, },
    REL_USER_LOGADO: { type: String, },
    MODULO: { type: String, },
    ACESSO_NEGADO: { type: String, },
    DESCR_NEGACAO: { type: String, },
    USER_INEXISTENTE: { type: String, },
    status_item: { type: Number, default: 0},

})
module.exports = restful.model('Liberacao', liberacaoSchema)
