const restful = require('node-restful')
const mongoose = restful.mongoose

const vendedoresSchema = new mongoose.Schema({
    CODIGO: { type: Number,  },
	VENDEDOR: {type: String,  },
	INVISIVEL: {type: String,  },
	BLOQUEADO: {type: Boolean,  },
	SUPERVISOR: {type: String,  },
	COMISSAO: { type: Number,  },
})
module.exports = restful.model('Vendedores', vendedoresSchema)
