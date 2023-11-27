
const AjusteEstoque = require('../AjusteEstoqueRoutes/AjusteEstoque')
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


// let db
// let err
// Firebird.attach(options, async function (erroF, dba) {
//   db = dba
//   err = erroF
// })


let flag = false

function checkAjusteEstoque(erro, db) {
  return new Promise(async function (resolve, reject) {
    let data1 = moment().add(2, 'days').format('D.M.YYYY')
    let data2 = moment().subtract(2, 'days').format('D.M.YYYY')
    let qtd = 0
    flag = true
    // db = DATABASE
    //console.log('ajuste estoquexxxxx')


    if (erro == undefined && db) {
      db.query(`
    select q.codigo, w.codigo as CODITEM , Q.datamovto,Q.data_emissao, q.relmovestq, w.descricao as descricao_produto,  q.descricao ,
    q.relped,  q.movto, q.tipo,q.quant, q.operador, q.prod_saldo, q.prod_disp
       from tb_estoque q , tb_produtos w
       where q.relmovestq = w.codigo
       and q.datamovto between cast('${data2}' as date) and cast('${data1}' as date)
       and Q.movto in ( 'E' , 'S')
     --AND q.descricao like 'Rec%'                ----LISTA DE PRODUTOS QUE DEU ENTRADA NO ESTOQUE---
     AND Q.descricao like '%Ajuste%'         ----LISTA DE PRODUTOS QUE TEVE AJUSTE AVULSO DE ESTOQUE---
     --AND Q.descricao like 'DEV%'             ----LISTA DE PRODUTOS QUE TEVE DEVOLUCAO CLIENTES---
     --AND Q.descricao like 'Saida por Dev%'   ----LISTA DE PRODUTOS QUE TEVE DEVOLUCAO FORNECEDOR---
    `, async function (err, result) {

        if (!err) {
          if (result) {
            //console.log('ajuste estoque', result.length)

            for (let i in result) {
              var query = {
                $and: [
                  {
                    CODIGO: result[i].CODIGO
                  }
                ]
              },
                update = {
                  DATAMOVTO: result[i].DATAMOVTO,
                  DATA_EMISSAO: result[i].DATA_EMISSAO,
                  RELMOVESTQ: result[i].RELMOVESTQ,
                  DESCRICAO_PRODUTO: result[i].DESCRICAO_PRODUTO,
                  DESCRICAO: result[i].DESCRICAO,
                  RELPED: result[i].RELPED,
                  MOVTO: result[i].MOVTO,
                  TIPO: result[i].TIPO,
                  QUANT: result[i].QUANT,
                  PROD_SALDO: result[i].PROD_SALDO,
                  PROD_DISP: result[i].PROD_DISP,
                  CODITEM: result[i].CODITEM,
                  OPERADOR: result[i].OPERADOR,
                },
                options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
              // Find the document
              try {
                let save = await AjusteEstoque.findOneAndUpdate(query, update, options).exec();
              } catch (err) {
                var query = {}
                var update = {
                  tipo: 'AjusteEstoque',
                  data: moment().format('D.M.YYYY'),
                  hora: moment().format('HH:mm'),
                  erro: err
                }
                var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                let save = await Erros.findOneAndUpdate(query, update, options).exec();
                console.log('Erro - ', err)
              }
            }
            // resolve(console.log('Total de vendas atualizado'))
            // db.detach()
            resolve()

          }
          else {
            console.log('Erro - ', err)
            var query = {}
            var update = {
              tipo: 'AjusteEstoque',
              data: moment().format('D.M.YYYY'),
              hora: moment().format('HH:mm'),
              erro: err
            }
            var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            let save = await Erros.findOneAndUpdate(query, update, options).exec();
            db.detach()
          }
        }

      })
    }
    // else {
    //   console.log('erro', err)
    // }

    // }); //-firebird
  })


};



module.exports = checkAjusteEstoque