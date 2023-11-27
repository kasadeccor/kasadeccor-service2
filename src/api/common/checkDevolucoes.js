const Vendas = require('../VendasRoutes/Vendas')
const User = require('../user/user')
//const db = require('./../../config/firebird')
const Erros = require('../ErrosRoutes/Erros')
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


// let db
// let err
// Firebird.attach(options, async function (erroF, dba) {
//   db = dba
//   err = erroF
// })

let flag = false

function checkDevolucoes
  (data, erro, db) {
  return new Promise(async function (resolve, reject) {

    //console.log(db)
    // Firebird.attach(options, async function (err, db) {
    if (erro == undefined && db) {
      db.query(`
    select
    z.nome_vend as VENDEDOR,
    cast('${data}' as date) as DATA_VENDAS,
    sum(z.valor) as TOTAL_DEVOLUCAO,
    sum(z.custo) as TOTAL_CUSTO_DEVOLUCAO
    from TB_DEVOLUCAO z
    where z.data between '${data}' and '${data}'
    group by z.nome_vend
    `, async function (err, result) {

        if (!err) {
         // console.log('Quantidade de dados da query (Devolucoes): ' + result.length + ' - Data: ' + data)
          //console.log(result)

          for (let i in result) {

            let vendedor = result[i].VENDEDOR == 'USO INTERNO LOJ' ? 'USO INTERNO LOJA' : result[i].VENDEDOR
            var query = {
              $and: [
                {
                  VENDEDOR: vendedor
                }, {

                  DATA_VENDAS: result[i].DATA_VENDAS
                },
              ]
            },
              update = {
                TOTAL_CUSTO_DEVOLUCAO: result[i].TOTAL_CUSTO_DEVOLUCAO,
                TOTAL_DEVOLUCAO: result[i].TOTAL_DEVOLUCAO,
              },
              options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            // Find the document

            try {
              let save = await Vendas.findOneAndUpdate(query, update, options).exec();
            } catch (err) {
              console.log('Erro - ', err)
              var query = {}
              var update = {
                tipo: 'DEVOLUCOES',
                data: moment().format('D.M.YYYY'),
                hora: moment().format('HH:mm'),
                erro: err
              }
              var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
              let save = await Erros.findOneAndUpdate(query, update, options).exec();
            }

          }
          // db.detach()
          resolve()

        }

        else {
          console.log('Erro - ', err)
          var query = {}
          var update = {
            tipo: 'DEVOLUCOES',
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

    //  }); //-fire
  })


};



module.exports = checkDevolucoes
