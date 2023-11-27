
const Produtos = require('../ProdutosRoutes/Produtos')
const Erros = require('../ErrosRoutes/Erros')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
var PushController = require('../common/PushController');
fs = require('fs');

let options = {};

options.host = '192.168.0.200';
options.port = 3050;
options.database = "C:\\Sistema\\db\\DADOS.FDB";
options.user = 'SYSDBA';
options.password = 'masterkey';
options.lowercase_keys = false; // set to true to lowercase keys
options.role = null;            // default
options.pageSize = 2048;


let db

Firebird.attach(options, function (err, dba) {

  if (err)
    throw err;

  db = dba

})

let flag = false
function deleteLotes() {
  return new Promise(async function (resolve, reject) {
    let data1 = moment().format('D.M.YYYY')
    let data2 = moment().subtract(3, 'days').format('D.M.YYYY')
    let qtd = 0
    let prodChanges = []
    flag = true
    const fs = require('fs');




    Produtos.find({}).exec(async function (err, docs) {
      for (let i in docs) {
        console.log(docs[i].CODIGO)
        let mostra_lote_enc = 1
        let mostra_disp_negativo = 0
        let QtdSolicitada = 1

        try {

          let save = await Produtos.findOneAndUpdate({ $and: [{ CODIGO: docs[i].CODIGO }] }, { lotes: [] }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
          fs.appendFile('produtosLotes.json', JSON.stringify({ CODIGO: docs[i].CODIGO }) + ", \n", function (err) {
            if (err) return console.log(err);

          });
        } catch (err) {

          // console.log(err)

        }



      }

    })


  });

};



module.exports = deleteLotes