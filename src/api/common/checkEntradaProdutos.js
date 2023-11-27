
const EntradaProdutos = require('../EntradaProdutosRoutes/EntradaProdutos')
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
    let data1 = moment().format('D.M.YYYY')
    let data2 = moment().subtract(2, 'days').format('D.M.YYYY')
    let qtd = 0
    flag = true
    // db = DATABASE
    // Firebird.attach(options, async function (err, db) {
    if (erro == undefined && db) {
      db.query(`
    select
    r.relitem as coditem, rc.data_emissao_nf, rc.data as DATA_RECEBIMENTO, i.descricao, r.qtdrec, r.unitario, r.valor_tot, r.vlr_frete, r.vr_ipi,
    r.vlr_icms_st, r.vlr_outros, r.vlr_difaliq, r.custo, f.nome_fornec, r.relrec_compra, r.relpedco, pd.d_entrega as DATA_ENTRADA
    from tb_movreccompra r
    left join tb_reccompra rc on r.relrec_compra = rc.codigo
    left join tb_pedidocompras pd on r.relpedco = pd.codigo
    left join tb_fornecedores f on f.codigo = rc.codfornec
    left join tb_produtos i on i.codigo = r.relitem
    where pd.d_entrega between cast('${data2}' as date) and cast('${data1}' as date)
    and pd.situacao = 'PD'
    --and r.relpedco = 3868
    and coalesce(rc.Bonificado,'N') <> 'S'
    `, async function (err, result) {

     

        if (!err) {
          if (result.length > 0) {
            //  console.log('Quantidade de dados da query (ENTRADA): ' + result.length)

            let prevPed = ' '
            let desc = {}
            desc.PRODUTOS = []
            prevPed = result[0].RELPEDCO

            for (let i in result) {
              if (result[i].RELPEDCO == prevPed) {

                desc.DATA_EMISSAO_NF = result[i].DATA_EMISSAO_NF,
                  desc.DATA_ENTRADA = result[i].DATA_ENTRADA,
                  desc.DATA_RECEBIMENTO = result[i].DATA_RECEBIMENTO,
                  desc.NOME_FORNEC = result[i].NOME_FORNEC,
                  desc.RELPEDCO = result[i].RELPEDCO,

                  desc.PRODUTOS.push({
                    CODITEM: result[i].CODITEM,
                    DATA_EMISSAO_NF: result[i].DATA_EMISSAO_NF,
                    DATA_ENTRADA: result[i].DATA_ENTRADA,
                    DATA_RECEBIMENTO: result[i].DATA_RECEBIMENTO,
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
                  })

              }

              else {
                let findPed = {}
                let saved = {}
                try {

                  findPed = await EntradaProdutos.find({ RELPEDCO: desc.RELPEDCO }).exec()

                } catch (err) {
                  console.log('Erro ao buscar produto novo: ' + desc.RELPEDCO)
                }

                if (findPed.length == 0) {
                  let entradaProdutos = new EntradaProdutos(desc);
                  try {
                    saved = await entradaProdutos.save()
                    qtd++

                  }
                  catch (err) {
                    console.log('Erro ao inserir produto novo: ' + desc.RELPEDCO + err)
                  }

                }

                desc = {}
                desc.PRODUTOS = []
                desc.DATA_EMISSAO_NF = result[i].DATA_EMISSAO_NF,
                  desc.DATA_ENTRADA = result[i].DATA_ENTRADA,
                  desc.DATA_RECEBIMENTO = result[i].DATA_RECEBIMENTO,
                  desc.NOME_FORNEC = result[i].NOME_FORNEC,
                  desc.RELPEDCO = result[i].RELPEDCO,
                  desc.PRODUTOS = []


                desc.PRODUTOS.push({
                  CODITEM: result[i].CODITEM,
                  DATA_EMISSAO_NF: result[i].DATA_EMISSAO_NF,
                  DATA_ENTRADA: result[i].DATA_ENTRADA,
                  DATA_RECEBIMENTO: result[i].DATA_RECEBIMENTO,
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

                })

              }
              prevPed = result[i].RELPEDCO

            } // end for

            let findPed = {}
            let saved = {}
            try {

              findPed = await EntradaProdutos.find({ RELPEDCO: desc.RELPEDCO }).exec()

            } catch (err) {
              console.log('Erro ao buscar produto novo: ' + desc.RELPEDCO)
            }

            if (findPed.length == 0) {
              let entradaProdutos = new EntradaProdutos(desc);
              try {
                saved = await entradaProdutos.save()
                qtd++

              }
              catch (err) {
                console.log('Erro ao inserir produto: ' + desc.RELPEDCO + err)
              }

            }

            // resolve(console.log('Quantidade de produtos inseridos: ' + qtd))
            // db.detach()
            resolve()
          }
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
    }

    // }); //-fire
  })


};



module.exports = checkAjusteEstoque