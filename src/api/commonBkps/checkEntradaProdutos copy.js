
const EntradaProdutos = require('../EntradaProdutosRoutes/EntradaProdutos')
const Erros = require('../ErrosRoutes/Erros')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
var PushController = require('../common/PushController');

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
function checkAjusteEstoque() {
  return new Promise(async function (resolve, reject) {
    let data1 = moment().add(2, 'days').format('D.M.YYYY')
    let data2 = moment().subtract(2, 'days').format('D.M.YYYY')
    let qtd = 0
    flag = true
    // db = DATABASE

    db.query(`
    select
    r.relitem as coditem, rc.data_emissao_nf, i.descricao, r.qtdrec, r.unitario, r.valor_tot, r.vlr_frete, r.vr_ipi,
    r.vlr_icms_st, r.vlr_outros, r.vlr_difaliq, r.custo, f.nome_fornec, r.relrec_compra, r.relpedco
    from tb_movreccompra r
    left join tb_reccompra rc on r.relrec_compra = rc.codigo
    left join tb_fornecedores f on f.codigo = rc.codfornec
    left join tb_produtos i on i.codigo = r.relitem
    where rc.data_emissao_nf between cast('${data2}' as date) and cast('${data2}' as date)
    and coalesce(rc.Bonificado,'N') <> 'S'
    `, async function (err, result) {

      if (result) {

        for (let i in result) {
          var query = {
            $and: [
              {
                CODITEM: result[i].CODITEM
              }
            ]
          },
            update = {

              CODITEM: result[i].CODITEM,
              DATA_EMISSAO_NF: result[i].DATA_EMISSAO_NF,
              CUSTO: result[i].CUSTO,
              NOME_FORNEC: result[i].NOME_FORNEC,
              DESCRICAO: result[i].DESCRICAO,
              RELPEDCO: result[i].RELPEDCO,
              UNITARIO: result[i].UNITARIO,
              VALOR_TOT: result[i].VALOR_TOT,
              VLR_FRETE: result[i].VLR_FRETE,
              VR_IPI: result[i].VR_IPI,
              VLR_ICMS_ST: result[i].VLR_ICMS_ST,
              VLR_OUTROS: result[i].VLR_OUTROS,
              VLR_DIFALIQ: result[i].VLR_DIFALIQ,
              RELREC_COMPRA: result[i].RELREC_COMPRA,
              QTDREC: result[i].QTDREC,

            },
            options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
          // Find the document
          try {
            let save = await EntradaProdutos.findOneAndUpdate(query, update, options).exec();
          } catch (err) {
            var query = {}
            var update = {
              tipo: 'EntradaProdutos',
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

    })

  }); //-dbquery


};



module.exports = checkAjusteEstoque