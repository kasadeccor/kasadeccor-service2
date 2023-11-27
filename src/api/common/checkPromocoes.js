
const Produtos = require('../ProdutosRoutes/Produtos')
const Erros = require('../ErrosRoutes/Erros')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
var PushController = require('./PushController');
fs = require('fs');

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
function checkPromocoes(erro, db) {
  return new Promise(async function (resolve, reject) {
    let data1 = moment().format('D.M.YYYY')
    let data2 = moment().subtract(3, 'days').format('D.M.YYYY')
    let qtd = 0
    flag = true
    const fs = require('fs');

    // Firebird.attach(options, async function (err, db) {

    if (erro == undefined && db) {
      db.query(`
    select a.codigo, p.data_criacao, p.data_termino, p.codigo as rel_promo, a.descricao, a.unid, a.disp, a.valorv, a.valorp,
    case     when(cast((a.valorv - ((coalesce(p.desconto,0) *       a.valorv)/100.000)) as numeric(15,3))) = a.valorv then coalesce(p.valor,a.valorv)
    else cast((a.ValorV - ((coalesce(p.desconto,0) *       a.valorv) / 100.000)) as numeric(15,3))
    end as ValorPromo, a.saldo, (select c.unidade from S_LOC_LOCALIZACOES(a.codigo) c) as localizacao,
    (select b.descricao from S_LOC_CODFORNEC_CODREF(a.codigo) b) as CodFornec from tb_produtos a inner join tb_promocao p on a.relpromo = p.codigo
    and current_date between p.data_criacao and p.data_termino where coalesce(a.inativo, 'N') <> 'S' and   case
    when(coalesce(p.fimestoq,'S') = 'S' and coalesce(a.saldo,0) <= 0) then 0     when(coalesce(p.fimestoq,'S') = 'S' and coalesce(a.saldo,0) > 0) then 1
    else 1   end = 1
    `, async function (err, result) {

        if (!err) {
           //console.log('Promoção ativada para: ', result.length)

          let itensPromocoes = result


          for (let i in itensPromocoes) {

            detalhesPromocao = {
              REL_PROMO: itensPromocoes[i].REL_PROMO,
              DATA_CRIACAO: itensPromocoes[i].DATA_CRIACAO,
              DATA_TERMINO: itensPromocoes[i].DATA_TERMINO,
              DESCRICAO: itensPromocoes[i].DESCRICAO,
              VALORV: itensPromocoes[i].VALORV,
              VALORP: itensPromocoes[i].VALORP,
              VALORPROMO: itensPromocoes[i].VALORPROMO,
              SALDO: itensPromocoes[i].SALDO,
              CODFORNEC: itensPromocoes[i].CODFORNEC
            }

            try {

              let save = await Produtos.findOneAndUpdate({ $and: [{ CODIGO: itensPromocoes[i].CODIGO }] }, { detalhesPromocao: detalhesPromocao, promocao: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
              //console.log('Promoção ativada para: ', itensPromocoes[i].CODIGO)
            } catch (err) {

              //console.log(err)

            }

          }


          //////// RETIRAR PROMOCOES ////////
          try {

            let findProd = await Produtos.find({ promocao: true }).exec()
            let produtos = findProd

            if (produtos.length > 0) {

              for (let i in produtos) {

                let removePromocao = true

                for (let j in itensPromocoes) {

                  if (itensPromocoes[j].CODIGO == produtos[i].CODIGO) {

                    removePromocao = false

                  }

                }


                //Checkar se precisa deletar promo


                if (removePromocao == true) {

                  detalhesPromocao = {}

                  try {

                    let save = await Produtos.findOneAndUpdate({ $and: [{ CODIGO: produtos[i].CODIGO }] }, { detalhesPromocao: detalhesPromocao, promocao: false }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                    // console.log('Promoção removida para: ', produtos[i].CODIGO)
                  } catch (err) {

                    // console.log(err)

                  }

                }



              }

            }
          } catch (err) {
            // console.log('Erro ao buscar produtos em promoção')
          }




          // db.detach()
          resolve()
        }


        else {


          console.log('Erro - ', err)
          var query = {}
          var update = {
            tipo: 'PROMOCOES',
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



module.exports = checkPromocoes