const Vendedores = require('../VendedoresRoutes/Vendedores')
const Erros = require('../ErrosRoutes/Erros')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
var PushController = require('./PushController');
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
let err
Firebird.attach(options, async function (erroF, dba) {
  db = dba
  err = erroF
})

function checkProdutos(erro, db) {
  return new Promise(async function (resolve, reject) {

    //console.log(db)
    //  Firebird.attach(options, async function (err, db) {
    if (erro == undefined && db) {
      db.query(`
  SELECT
    CODIGO,
    VENDEDOR,
    INVISIVEL,
    BLOQUEADO,
    SUPERVISOR,
    COMISSAO
  FROM
    TB_VENDEDORES;
    
    `, async function (err, result) {


        if (!err) {
         // console.log('VENDEDRES ', result.length)
          for (let i in result) {
            var query = {
              $and: [
                {
                  CODIGO: result[i].CODIGO
                }
              ]
            },
              update = {
                VENDEDOR: result[i].VENDEDOR,
                INVISIVEL: result[i].INVISIVEL,
                BLOQUEADO: result[i].BLOQUEADO == 'S   ' ? true : false,
                SUPERVISOR: result[i].SUPERVISOR,
                COMISSAO: result[i].COMISSAO
              },
              options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            // Find the document
            try {
              //console.log(update)
              let save = await Vendedores.findOneAndUpdate(query, update, options).exec();

            } catch (err) {
              var query = {}
              var update = {
                tipo: 'Vendedores',
                data: moment().format('D.M.YYYY'),
                hora: moment().format('HH:mm'),
                erro: err
              }
              var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
              let save = await Erros.findOneAndUpdate(query, update, options).exec();
              console.log('Erro - ', err)
            }
          }
          //resolve(console.log('Total de vendas atualizado: ', totalupdt))
          //db.detach()
          resolve()
        }
        else {
          console.log('Erro - ', err)
          var query = {}
          var update = {
            tipo: 'PRODUTOS',
            data: moment().format('D.M.YYYY'),
            hora: moment().format('HH:mm'),
            erro: err
          }
          var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
          let save = await Erros.findOneAndUpdate(query, update, options).exec();
          db.detach()
        }

      })
    }

    // }); //fire
  })


};



module.exports = checkProdutos