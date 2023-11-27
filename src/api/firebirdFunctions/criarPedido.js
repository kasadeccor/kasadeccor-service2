
const MovPedidos = require('../MovPedidosRoutes/MovPedidos')
const Erros = require('../ErrosRoutes/Erros')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
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


function criarPedido(pedido, erro, db) {
  return new Promise(async function (resolve, reject) {


    let erroCliente = false
    let COND_PAGTO = 'COND. PAGTO. NÃO ESCOLHIDA'
    let ESPE_COBR = 'COND. PAGTO. NÃO ESCOLHIDA'
    let TABELA = null

    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    if (pedido.novoCliente == '') {

      if (!pedido.cliente.REL_OBRA || !pedido.cliente.NOME_CLI || !pedido.cliente.CODIGO) {

        erroCliente = true


      }
      else {

        if (pedido.cliente.TABELA != undefined && pedido.cliente.TABELA > 0) {

          ESPE_COBR = ' ' + formatter.format(pedido.totalLiquido.toFixed(2)) + ' ' + pedido.cliente.COND + ' |'
          COND_PAGTO = ' ( ' + pedido.cliente.QTD_PARC.toString() + ' X De ' + formatter.format(pedido.totalLiquido.toFixed(2)) + ' )'
          TABELA = pedido.cliente.TABELA

        }

      }
    }


    if (pedido.nome_vendedor && pedido.total_comissao_vendedor && pedido.codigo_vendedor && !erroCliente) {
      //if (pedido.nome_vendedor && pedido.total_comissao_vendedor && pedido.codigo_vendedor && erroCliente) {
      // Firebird.attach(options, async function (err, db) {
      // if (err)
      //   throw err;
      if (erro == undefined && db) {
        db.query(`    INSERT INTO
            TB_PEDIDOS(
                RELACIONAMENTO,
                RELOBRA,
                SITUACAO,
                TOTAL_BRUTO_PED,
                TOTAL_LIQ_PED,
                DESC_PED,
                DATA,
                VENDEDOR,
                NOME_CLI,
                CUSTO,

                TABELA_CLI,
                COND_PAGTO,
                ESPE_COBR,

                PESO,
                TOTAL_COMISSAO,
                OPERADOR,
                DATA_EDICAO,
                HORA_EDICAO,
                QTD_ATENDENTES,
                COMISS_VEND,
                COD_VEND,
                FONE,
                COD_EMP,
                COD_TIPO,
                NOME_TIPO,
                BLOQ_FATURAMENTO,
                OBS_PED
            )
        VALUES
        (
          ${pedido.novoCliente == '' ? pedido.cliente.CODIGO : 1},
          ${pedido.novoCliente == '' ? pedido.cliente.REL_OBRA : null},
          'PR',
          ${pedido.totalBruto.toFixed(2)},
          ${pedido.totalLiquido.toFixed(2)},
          ${pedido.totalDesconto.toFixed(2)},
          '${moment().format('YYYY-MM-DD')}',
          '${pedido.nome_vendedor}',
          '${pedido.novoCliente == '' ? pedido.cliente.NOME_CLI : pedido.novoCliente + ' *'}',
          ${pedido.total_custo_final.toFixed(2)},

           ${TABELA},
          '${COND_PAGTO}',
          '${ESPE_COBR}',

          ${pedido.total_peso.toFixed(2)},
          ${pedido.total_comissao_vendedor},
          '${pedido.nome_vendedor}',
          '${moment().format('YYYY-MM-DD')}',
          '${moment().format('hh:mm:ss')}',
          1.00,
          ${pedido.comissao_vendedor},
          ${pedido.codigo_vendedor},
          '${pedido.telefoneNovo != '' ? pedido.telefoneNovo : pedido.cliente.FONE1_CLI ? pedido.cliente.FONE1_CLI : ''}',
          1,
          0,
          'VENDAS',
          'S',
          ${pedido.OBS != '' ? "'" + pedido.OBS.toUpperCase() + "'" : null}
      ) 
            RETURNING CODIGO;`, async function (err, result) {

          if (result == undefined) {
            //console.log(err)
           // db.detach()
            resolve({ erro: err })

          }
          else {
          //  db.detach()
            resolve({ codigo: result.CODIGO })

          }

        })//-dbquery;
      }

      // }); //fire
    }
    else {
      //console.log('erro', pedido.CODIGO, pedido.nome_vendedor , pedido.total_comissao_vendedor , pedido.codigo_vendedor , erroCliente)
      resolve({ erro: { Error: 'Erro, falta informaçoes para gerar o pedido.' } })
    }


  });

};



module.exports = criarPedido