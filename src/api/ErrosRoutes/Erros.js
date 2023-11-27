const restful = require('node-restful')
const mongoose = restful.mongoose

const errosSchema = new mongoose.Schema({

    tipo: { type: String,  },
    data: { type: String,  },
    hora: {type: String,  },
    erro: { type: String, }

})
module.exports = restful.model('Erros', errosSchema)
