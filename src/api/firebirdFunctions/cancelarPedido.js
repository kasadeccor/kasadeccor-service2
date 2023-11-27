
const MovPedidos = require('../MovPedidosRoutes/MovPedidos')
const Erros = require('../ErrosRoutes/Erros')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
const criarDelay = require('../common/criarDelay');
//var PushController = require('./PushController');
fs = require('fs');

let options = {};

options.host = '192.168.0.200';
// options.host = '127.0.0.1';
options.port = 3050;
options.database = "C:\\Sistema\\db\\DADOS.FDB";
// options.database = "/Library/Frameworks/Firebird.framework/Versions/A/Resources/examples/empbuild/DADOST.fdb";

options.user = 'SYSDBA';
options.password = 'masterkey';
options.lowercase_keys = false; // set to true to lowercase keys
options.role = null;            // default
options.pageSize = 2048;

// let db
// let err
// Firebird.attach(options, async function (erroF, dba) {
//   //console.log('DB START')
//   db = dba
//   err = erroF
// })

function cancelarPedido(pedido, erro, db) {
  return new Promise(async function (resolve, reject) {


    //await criarDelay(1000)
    let status = {
      update: false,
      delete: false
    }

   // Firebird.attach(options, async function (err, db) {
      // if (err)
      //   throw err;

      if (pedido.CODIGO > 1 && erro == undefined && db) {
        if (erro == undefined) {
          db.transaction(Firebird.ISOLATION_READ_COMMITED_NOWAIT, function (err, transaction) {

            transaction.query(`
        SELECT cast(SITUACAO as varchar(2) character set utf8) FROM TB_PEDIDOS
        WHERE CODIGO = ${pedido.CODIGO} AND (SITUACAO = 'PR' OR SITUACAO = '');`, async function (err, result) {

              // await criarDelay(5000)
              if (result == undefined) {
                transaction.rollback();
                if (err.toString().includes('lock conflict')) {
                  resolve({ erro: err, deadlock: true })
                }
                else {
                  resolve({ erro: err, deadlock: false })
                }

              }
              else {
                if (result.length > 0) {
                  transaction.query(`
                UPDATE TB_PEDIDOS 
                SET SITUACAO = 'CP',
                DATA_EDICAO  =  '${moment().format('YYYY-MM-DD')}',
                HORA_EDICAO  =  '${moment().format('hh:mm:ss')}'
                WHERE CODIGO = ${pedido.CODIGO} RETURNING CODIGO;`, async function (err, resultP) {

                    //  console.log('Alterou Pedido ', resultP)
                    if (resultP == undefined) {
                      //console.log('Alterou Pedido ', err)
                      transaction.rollback();
                      if (err.toString().includes('lock conflict')) {
                        resolve({ erro: err, deadlock: true })
                      }
                      else {
                        resolve({ erro: err, deadlock: false })
                      }
                    }
                    else {

                      transaction.commit(function (err) {
                        if (err) {
                          //console.log('erro after 1 D', err)
                          resolve({ erro: err })
                          transaction.rollback();
                        }
                        else {
                          status.update = true
                          //console.log('deu certo 1 D')
                         // db.detach();
                          resolve(status)

                        }
                      })

                    }

                  })

                }
                else {

                 // db.detach();
                  resolve({ erro: { Error: 'Erro, codigo de pedido invalido.' } })
                }


              }

            })//-dbquery;


          });
        }
      }
      else {

        resolve({ erro: { Error: 'Erro, codigo de pedido invalido.' } })
      }

   // }); //fire

  });

};



module.exports = cancelarPedido
