const DifMargem = require('../DifMargemRoutes/DifMargem')
const Erros = require('../ErrosRoutes/Erros')
const User = require('../user/user')
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

function checkDifMargem(erro, db) {
  return new Promise(async function (resolve, reject) {
    // Firebird.attach(options, async function (err, db) {

    if (erro == undefined && db) {
      db.query(`
    select
    codigo, descricao, p_venda_vista, p_venda_prazo, mkup_cadastro,
    u_custo, mkup_aplicado, (mkup_cadastro - mkup_aplicado) as dif_mkup
  from (
  select
    p.codigo,
    p.descricao,
    p.valorv as p_venda_vista,
    p.valorp as p_venda_prazo,
    p.margem_venda as mkup_cadastro,
    p.cat as u_custo,
    cast(((p.valorv-p.cat)/p.cat)*100.00 as numeric(15,2)) as mkup_aplicado
  from tb_produtos p
  where coalesce(p.inativo,'N') <> 'S' and coalesce(p.prod_dest_consumo,'N') <> 'S'
  and coalesce(p.cat,0) > 0 and coalesce(p.valorv,0) > 0)
  where mkup_cadastro <> mkup_aplicado
    `, async function (err, result) {

        if (!err) {

          // console.log('Quantidade de dados da query (Diferença de margem): ' + result.length)
          //cast('now' as date)

          try {
            let deletes = await DifMargem.deleteMany({}).exec();
          } catch (err) {
            console.log('Erro - ', err)
          }

          for (let i in result) {
            var query = {
              $and: [
                {
                  CODIGO: result[i].CODIGO
                }
              ]
            },
              update = {
                DESCRICAO: result[i].DESCRICAO,
                P_VENDA_VISTA: result[i].P_VENDA_VISTA,
                P_VENDA_PRAZO: result[i].P_VENDA_PRAZO,
                MKUP_CADASTRO: result[i].MKUP_CADASTRO,
                MKUP_APLICADO: result[i].MKUP_APLICADO,
                U_CUSTO: result[i].U_CUSTO,
                DIF_MKUP: result[i].DIF_MKUP
              },
              options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            // Find the document
            try {
              let save = await DifMargem.findOneAndUpdate(query, update, options).exec();
            } catch (err) {
              console.log('Erro - ', err)
              var query = {}
              var update = {
                tipo: 'DIFMARGEM',
                data: moment().format('D.M.YYYY'),
                hora: moment().format('HH:mm'),
                erro: err
              }
              var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
              let save = await Erros.findOneAndUpdate(query, update, options).exec();
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
            tipo: 'DIFMARGEM',
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



module.exports = checkDifMargem