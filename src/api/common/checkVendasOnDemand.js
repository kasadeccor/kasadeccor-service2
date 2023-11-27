const Vendas = require('../VendasRoutes/Vendas')
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


let flag = false

function checkVendasOnDemand(erro, db, data) {
  return new Promise(async function (resolve, reject) {

   
    //Firebird.attach(options, async function (err, db) {
    if (erro == undefined && db) {
      console.log(data)
      db.query(`
    select
    t.vendedor,
    sum (T.custo) as Total_Custo, cast('${data}' as date) as DATA_VENDAS,
    sum (t.total_liq_ped) as Total_venda_Com_Desc,
    (sum (t.total_liq_ped) - sum (T.custo))/sum (t.total_liq_ped) as Indece_Sem_Dev,
    (sum (t.total_liq_ped) - sum (T.custo))/sum (t.custo) as Mkp_Sem_Dev,
    sum (t.total_bruto_ped) as Total_Venda_Bruta ,  sum(t.total_retencao) as TOTAL_RETENCAO,
    (select
    sum(z.custo) as Custo_dev
    from TB_DEVOLUCAO z
      where z.data = cast('${data}' as date)
      and z.nome_vend = t.vendedor
      group by z.nome_vend) as TOTAL_CUSTO_DEVOLUCAO ,
    (select
    sum(z.valor) as valor_Dev
    from TB_DEVOLUCAO z
      where z.data = cast('${data}' as date)
      and z.nome_vend = t.vendedor
      group by z.nome_vend) as TOTAL_DEVOLUCAO
    
    from tb_pedidos t
    where t.d_baixa = cast('${data}' as date)
      and t.situacao = 'PD'
      group by t.vendedor;
    `, async function (err, result) {

        if (!err) {
           console.log('vendas', result.length)
          //cast('now' as date)

          for (let i in result) {
            var query = {
              $and: [
                {
                  VENDEDOR: result[i].VENDEDOR
                }, {

                  DATA_VENDAS: result[i].DATA_VENDAS
                },
              ]
            },
              update = {
                TOTAL_CUSTO: result[i].TOTAL_CUSTO,
                TOTAL_VENDA_COM_DESC: result[i].TOTAL_VENDA_COM_DESC,
                INDECE_SEM_DEV: result[i].INDECE_SEM_DEV,
                MKP_SEM_DEV: result[i].MKP_SEM_DEV,
                TOTAL_VENDA_BRUTA: result[i].TOTAL_VENDA_BRUTA,
                TOTAL_RETENCAO: result[i].TOTAL_RETENCAO,
                TOTAL_CUSTO_DEVOLUCAO: result[i].TOTAL_CUSTO_DEVOLUCAO,
                TOTAL_DEVOLUCAO: result[i].TOTAL_DEVOLUCAO,
              },
              options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            // Find the document

            try {
              let save = await Vendas.findOneAndUpdate(query, update, options).exec();
              console.log(save)
            } catch (err) {
              var query = {}
              var update = {
                tipo: 'VENDAS',
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
          //db.detach()
          resolve()

        }

        else {
          console.log('Erro - ', err)
          var query = {}
          var update = {
            tipo: 'VENDAS',
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



module.exports = checkVendasOnDemand