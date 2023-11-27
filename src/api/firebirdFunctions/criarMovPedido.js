
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


function criarMovPedido(produto, pedido, erro, db) {

  return new Promise(async function (resolve, reject) {

    //     console.log(`INSERT INTO
    //     TB_MOVPEDIDOS(
    //       DESCRICAO,
    //       PRECO,
    //       RALPED,
    //       QTD,
    //       NR_ITEM_ESTOQ,
    //       CUSTO,
    //       DESCRICAO_ORIGINAL,
    //       CODIGOPRODUTO,
    //       UNID,
    //       QTD_S,
    //       PRECO_UNITARIO,
    //       PRECO_UNITARIO_OR,
    //       VALORV,
    //       VALORP,
    //       PESO,
    //       PESO_U,
    //       DEPARTAMENTO,
    //       DIVISAO,
    //       EMB_VENDA,
    //       NOME_FORNEC,
    //       PERC_DESCONTO,
    //       DESCONTO,
    //       CAT,
    //       RELGRUPOS,
    //       RELPROMO,
    //       COD_EMP,
    //       MASTER,
    //       QTD_MASTER,
    //       TIPO_ENTREGA,
    //       DESCRICAO_ADICIONAL,
    //       RELMARCA,
    //       TP_PROMO,
    //       VLR_PERC_PROMO,
    //       TP_PROMO_QUEI,
    //       LOCAL_LOGISTICA,
    //       REL_PRODLOTE
    //     )
    // VALUES
    // (
    //   '${produto.DESCRICAO}',
    //   ${produto.PRECOTOTAL_PRODUTOLIQUIDO.toFixed(2)},
    //   ${pedido},
    //   ${produto.qtd},
    //   ${produto.CODIGO},
    //   ${produto.CUSTOTOTAL_PRODUTO.toFixed(2)},
    //   '${produto.DESCRICAO}',
    //   ${produto.CODIGO},
    //   '${produto.UNID}',
    //   ${produto.qtd},
    //   ${produto.PRECO_UNITARIO.toFixed(2)},
    //   ${produto.PRECO_UNITARIO_OR.toFixed(2)},
    //   ${produto.PRECO_UNITARIO.toFixed(2)},
    //   ${produto.PRECO_UNITARIO_OR.toFixed(2)},
    //   ${produto.PESOTOTAL_PRODUTO || 0},
    //   ${produto.PESO || 0},
    //   ${produto.DEPARTAMENTO ? "'" + produto.DEPARTAMENTO + "'" : "''"},
    //   ${produto.DIVISAO ? "'" + produto.DIVISAO + "'" : "''"},
    //   ${produto.EMB},
    //   ${produto.FORNECEDOR ? "'" + produto.FORNECEDOR + "'" : "''"},
    //   ${produto.PERCDESCONTO_PRODUTO.toFixed(2)},
    //   ${produto.TOTALDESCONTO_PRODUTO.toFixed(2)},
    //   ${produto.CUSTO_FINAL.toFixed(2)},
    //   ${produto.RELGRUPOS},
    //   ${produto.promocao ? produto.detalhesPromocao.REL_PROMO : 'null'},
    //   1,
    //   'N',
    //   1,
    //   'I',
    //   ${produto.descAdd ? "'" + produto.descAdd + "'" : null},
    //   ${produto.FAMILIA},
    //   ${produto.promocao ? "'" + '$' + "'" : 'null'},
    //   ${produto.promocao ? produto.detalhesPromocao.VALORPROMO : 'null'},
    //   ${produto.promocao ? "'" + 'P' + "'" : 'null'},
    //   0,
    //   ${produto.REL_PRODLOTE != '' ? produto.REL_PRODLOTE : ''}
    // ) 
    //     RETURNING CODIGO;`)
    // console.log(`INSERT INTO
    //         TB_MOVPEDIDOS(
    //           DESCRICAO,
    //           PRECO,
    //           RALPED,
    //           QTD,
    //           NR_ITEM_ESTOQ,
    //           CUSTO,
    //           DESCRICAO_ORIGINAL,
    //           CODIGOPRODUTO,
    //           UNID,
    //           QTD_S,
    //           PRECO_UNITARIO,
    //           PRECO_UNITARIO_OR,
    //           VALORV,
    //           VALORP,
    //           PESO,
    //           PESO_U,
    //           DEPARTAMENTO,
    //           DIVISAO,
    //           EMB_VENDA,
    //           NOME_FORNEC,
    //           PERC_DESCONTO,
    //           DESCONTO,
    //           CAT,
    //           RELGRUPOS,
    //           RELPROMO,
    //           COD_EMP,
    //           MASTER,
    //           QTD_MASTER,
    //           TIPO_ENTREGA,
    //           DESCRICAO_ADICIONAL,
    //           RELMARCA,
    //           TP_PROMO,
    //           VLR_PERC_PROMO,
    //           TP_PROMO_QUEI,
    //           LOCAL_LOGISTICA,
    //           REL_PRODLOTE
    //         )
    //     VALUES
    //     (
    //       '${produto.DESCRICAO}',
    //       ${produto.PRECOTOTAL_PRODUTOLIQUIDO.toFixed(2)},
    //       ${pedido},
    //       ${produto.qtd},
    //       ${produto.CODIGO},
    //       ${produto.CUSTOTOTAL_PRODUTO.toFixed(2)},
    //       '${produto.DESCRICAO}',
    //       ${produto.CODIGO},
    //       '${produto.UNID}',
    //       ${produto.qtd},
    //       ${produto.PRECO_UNITARIO.toFixed(2)},
    //       ${produto.PRECO_UNITARIO_OR.toFixed(2)},
    //       ${produto.PRECO_UNITARIO.toFixed(2)},
    //       ${produto.PRECO_UNITARIO_OR.toFixed(2)},
    //       ${produto.PESOTOTAL_PRODUTO || 0},
    //       ${produto.PESO || 0},
    //       ${produto.DEPARTAMENTO ? "'" + produto.DEPARTAMENTO + "'" : "''"},
    //       ${produto.DIVISAO ? "'" + produto.DIVISAO + "'" : "''"},
    //       ${produto.EMB},
    //       ${produto.FORNECEDOR ? "'" + produto.FORNECEDOR + "'" : "''"},
    //       ${produto.PERCDESCONTO_PRODUTO.toFixed(2)},
    //       ${produto.TOTALDESCONTO_PRODUTO.toFixed(2)},
    //       ${produto.CUSTO_FINAL.toFixed(2)},
    //       ${produto.RELGRUPOS},
    //       ${produto.promocao ? produto.detalhesPromocao.REL_PROMO : 'null'},
    //       1,
    //       'N',
    //       1,
    //       'I',
    //       ${produto.descAdd ? "'" + produto.descAdd + "'" : null},
    //       ${produto.FAMILIA},
    //       ${produto.promocao ? "'" + '$' + "'" : 'null'},
    //       ${produto.promocao ? produto.detalhesPromocao.VALORPROMO : 'null'},
    //       ${produto.promocao ? "'" + 'P' + "'" : 'null'},
    //       0,
    //       ${produto.REL_PRODLOTE != '' ? produto.REL_PRODLOTE : ''}
    //   ) 
    //         RETURNING CODIGO;`)

    //console.log('produto code: ',produto)

    if (pedido > 1 && produto.DESCRICAO && produto.CODIGO && produto.UNID && produto.CUSTO_FINAL && produto.DEPARTAMENTO && produto.PRECO_UNITARIO_OR && produto.qtd) {
      // Firebird.attach(options, async function (err, db) {
      // if (err)
      //   throw err;
      if (erro == undefined && db) {
        db.query(`INSERT INTO
            TB_MOVPEDIDOS(
              DESCRICAO,
              PRECO,
              RALPED,
              QTD,
              NR_ITEM_ESTOQ,
              CUSTO,
              DESCRICAO_ORIGINAL,
              CODIGOPRODUTO,
              UNID,
              QTD_S,
              PRECO_UNITARIO,
              PRECO_UNITARIO_OR,
              VALORV,
              VALORP,
              PESO,
              PESO_U,
              DEPARTAMENTO,
              DIVISAO,
              EMB_VENDA,
              NOME_FORNEC,
              PERC_DESCONTO,
              DESCONTO,
              CAT,
              RELGRUPOS,
              RELPROMO,
              COD_EMP,
              MASTER,
              QTD_MASTER,
              TIPO_ENTREGA,
              DESCRICAO_ADICIONAL,
              RELMARCA,
              TP_PROMO,
              VLR_PERC_PROMO,
              TP_PROMO_QUEI,
              LOCAL_LOGISTICA,
              REL_PRODLOTE
            )
        VALUES
        (
          '${produto.DESCRICAO}',
          ${produto.PRECOTOTAL_PRODUTOLIQUIDO.toFixed(2)},
          ${pedido},
          ${produto.qtd},
          ${produto.CODIGO},
          ${produto.CUSTOTOTAL_PRODUTO.toFixed(2)},
          '${produto.DESCRICAO}',
          ${produto.CODIGO},
          '${produto.UNID}',
          ${produto.qtd},
          ${produto.PRECO_UNITARIO.toFixed(2)},
          ${produto.PRECO_UNITARIO_OR.toFixed(2)},
          ${produto.PRECO_UNITARIO.toFixed(2)},
          ${produto.PRECO_UNITARIO_OR.toFixed(2)},
          ${produto.PESOTOTAL_PRODUTO || 0},
          ${produto.PESO || 0},
          ${produto.DEPARTAMENTO ? "'" + produto.DEPARTAMENTO + "'" : "''"},
          ${produto.DIVISAO ? "'" + produto.DIVISAO + "'" : "''"},
          ${produto.EMB},
          ${produto.FORNECEDOR ? "'" + produto.FORNECEDOR + "'" : "''"},
          ${produto.PERCDESCONTO_PRODUTO == 0 ? 0 : produto.PERCDESCONTO_PRODUTO.toFixed(2)},
          ${produto.TOTALDESCONTO_PRODUTO.toFixed(2)},
          ${produto.CUSTO_FINAL.toFixed(2)},
          ${produto.RELGRUPOS},
          ${produto.promocao ? produto.detalhesPromocao.REL_PROMO : 'null'},
          1,
          'N',
          1,
          'I',
          ${produto.descAdd ? "'" + produto.descAdd.toUpperCase() + "'" : null},
          ${produto.FAMILIA},
          ${produto.promocao ? "'" + '$' + "'" : 'null'},
          ${produto.promocao ? produto.detalhesPromocao.VALORPROMO : 'null'},
          ${produto.promocao ? "'" + 'P' + "'" : 'null'},
          0,
          ${produto.REL_PRODLOTE != '' ? produto.REL_PRODLOTE : 'null'}
      ) 
            RETURNING CODIGO;`, async function (err, result) {
          //console.log(result)
          if (result == undefined) {
            //db.detach()
            //console.log(err)
            resolve({ erro: err })

          }
          else {
            //db.detach()
            resolve({ codigo: result.CODIGO })

          }

        })//-dbquery;
      }

      //}); //fire

    }
    else {

      //console.log('erro criar movpedidos', pedido  , produto.DESCRICAO , produto.CODIGO , produto.UNID , produto.CUSTO_FINAL , produto.DEPARTAMENTO , produto.PRECO_UNITARIO_OR , produto.qtd)
      resolve({ erro: { Error: 'Erro, falta informaçoes para gerar o pedido.' } })

    }



  });

};



module.exports = criarMovPedido