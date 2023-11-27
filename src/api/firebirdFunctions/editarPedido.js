
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


function editarPedido(pedido, erro, db) {
  return new Promise(async function (resolve, reject) {


    //await criarDelay(1000)
    let status = {
      update: false,
      delete: false
    }


    // Firebird.attach(options, async function (err, db) {
    // if (err)
    //   throw err;

    if (erro == undefined && db) {
      let erroCliente = false


      if (pedido.novoCliente == '') {

        if (!pedido.cliente.REL_OBRA || !pedido.cliente.NOME_CLI || !pedido.cliente.CODIGO) {

          erroCliente = true


        }
      }

      if (pedido.CODIGO > 1 && pedido.nome_vendedor && pedido.total_comissao_vendedor && pedido.codigo_vendedor && erroCliente == false) {
        // console.log('editar123: ', pedido.CODIGO)
        db.transaction(Firebird.ISOLATION_READ_COMMITED_NOWAIT, function (err, transaction) {


          transaction.query(`
        SELECT cast(SITUACAO as varchar(2) character set utf8) FROM TB_PEDIDOS
        WHERE CODIGO = ${pedido.CODIGO} AND (SITUACAO = 'PR');`, async function (err, result) {

            // await criarDelay(5000)
            // console.log('editar12344: ', pedido.CODIGO)
            // console.log('reult: ', result)
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
                SET RELACIONAMENTO = ${pedido.novoCliente == '' ? pedido.cliente.CODIGO : 1},
                RELOBRA =  ${pedido.novoCliente == '' ? pedido.cliente.REL_OBRA : null},
                TOTAL_BRUTO_PED =   ${pedido.totalBruto.toFixed(2)},
                TOTAL_LIQ_PED =  ${pedido.totalLiquido.toFixed(2)},
                DESC_PED = ${pedido.totalDesconto.toFixed(2)},
                VENDEDOR  = '${pedido.nome_vendedor}',
                NOME_CLI  =  '${pedido.novoCliente == '' ? pedido.cliente.NOME_CLI : pedido.novoCliente.slice(-1) == '*' ? pedido.novoCliente : pedido.novoCliente + ' *'}',
                CUSTO  =    ${pedido.total_custo_final.toFixed(2)},
                PESO  =  ${pedido.total_peso.toFixed(2)},
                OPERADOR  = '${pedido.nome_vendedor}',
                TOTAL_COMISSAO = ${pedido.total_comissao_vendedor},
                DATA_EDICAO  =  '${moment().format('YYYY-MM-DD')}',
                HORA_EDICAO  =  '${moment().format('hh:mm:ss')}',
                COMISS_VEND  =  ${pedido.comissao_vendedor},
                COD_VEND  = ${pedido.codigo_vendedor},
                FONE  =    '${pedido.telefoneNovo != '' ? pedido.telefoneNovo : pedido.cliente.FONE1_CLI ? pedido.cliente.FONE1_CLI : ''}',
                OBS_PED =  ${pedido.OBS != '' ? "'" + pedido.OBS.toUpperCase() + "'" : null}
                WHERE CODIGO = ${pedido.CODIGO}  AND SITUACAO = 'PR' RETURNING CODIGO;`, async function (err, resultP) {

                  // console.log('Alterou Pedido ', resultP)

                  if (resultP == undefined) {
                    // console.log('Alterou Pedido ', err)
                    transaction.rollback();
                    if (err.toString().includes('lock conflict')) {
                      resolve({ erro: err, deadlock: true })
                    }
                    else {
                      resolve({ erro: err, deadlock: false })
                    }
                  }
                  else {
                    status.update = true

                    transaction.query(`
                  DELETE FROM TB_MOVPEDIDOS
                  WHERE RALPED = ${pedido.CODIGO};`, async function (err, resultD) {

                      if (err) {
                        transaction.rollback();
                        if (err.toString().includes('lock conflict')) {
                          resolve({ erro: err, deadlock: true })
                        }
                        else {
                          //console.log('erro before 1 D', err)
                          resolve({ erro: err, deadlock: false })
                        }
                      } else {
                        transaction.commit(function (err) {
                          if (err) {
                            //console.log('erro after 1 D', err)
                            resolve({ erro: err })
                            transaction.rollback();
                          }
                          else {
                            status.delete = true
                            //console.log('deu certo 1 D')
                            //db.detach();
                            resolve(status)

                          }
                        })
                      }

                    })

                  }

                })

              }
              else {
               // db.detach();
                resolve({ erro: { Error: 'Erro, codigo de pedido nao encontrado no sistema.' } })
              }

            }

          })//-dbquery;

        });

      }

      else {
        resolve({ erro: { Error: 'Erro, codigo de pedido ou outras informações inválido.' } })
      }

    }

    //}); //fire

  });

};



module.exports = editarPedido
