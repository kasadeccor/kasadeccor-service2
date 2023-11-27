
const Produtos = require('../ProdutosRoutes/Produtos')
const Erros = require('../ErrosRoutes/Erros')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
var PushController = require('./PushController');
const criarDelay = require('./criarDelay');
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


let db
let err
Firebird.attach(options, async function (erroF, dba) {
  db = dba
  err = erroF
})

let flag = false
function checkLotesOnDemand(produtos) {
  return new Promise(async function (resolve, reject) {
    let data1 = moment().format('D.M.YYYY')
    let data2 = moment().subtract(3, 'days').format('D.M.YYYY')
    let qtd = 0
    let prodChanges = []
    flag = true
    const fs = require('fs');

    for (let i in produtos) {
      console.log('Buscar lotes: ', produtos[i].CODIGO)
      let mostra_lote_enc = 1
      let mostra_disp_negativo = 0
      let QtdSolicitada = 1

      // Firebird.attach(options, async function (err, db) {

      // if (err)
      //   throw err;

      // db = DATABASE
      await criarDelay(1000)
      if (!err && db) {
        await db.query(`

          select
          relmovestq, rel_prodlote, disponivel, qtd, qtd_saldo_compl, descr_lote,
          emb_venda_lote, qtd_min_lote, fci_lote, d_validade_lote,
          data_lote, ordem from (
        select
          relmovestq,
          coalesce(rel_prodlote,0) as rel_prodlote,
          sum(disponivel) as disponivel,
          qtd,
          qtd_saldo_compl,
          descr_lote,
          emb_venda_lote, qtd_min_lote, fci_lote, d_validade_lote,
          data_lote, ordem from (
        select
          e.relmovestq,
          e.rel_prodlote,
          sum(case
            when e.movto = 'S' then e.quant * -1
            when e.movto = 'SP' then e.quant * -1
            when e.movto = 'E' then e.quant
            else 0.00000
          end) as disponivel,
          cast(0 as numeric(15,5)) qtd,
          cast(0 as numeric(15,5)) qtd_saldo_compl,
          coalesce(
          case
            when e.rel_prodlote is not null then
              (select l.descricao from tb_produtos_estoque_lote l where l.codigo = e.rel_prodlote)
            else null
          end,'Sem Lote') as descr_lote,
          case
            when e.rel_prodlote is not null then
              (select l.emb_venda from tb_produtos_estoque_lote l where l.codigo = e.rel_prodlote)
            else null
          end as emb_venda_lote,
          case
            when e.rel_prodlote is not null then
              (select l.qtd_min from tb_produtos_estoque_lote l where l.codigo = e.rel_prodlote)
            else null
          end as qtd_min_lote,
          case
            when e.rel_prodlote is not null then
              (select l.fci from tb_produtos_estoque_lote l where l.codigo = e.rel_prodlote)
            else null
          end as fci_lote,
          case
            when e.rel_prodlote is not null then
              (select l.d_validade from tb_produtos_estoque_lote l where l.codigo = e.rel_prodlote)
            else null
          end as d_validade_lote,
          case
            when e.rel_prodlote is not null then
              (select l.data from tb_produtos_estoque_lote l where l.codigo = e.rel_prodlote)
            else null
          end as data_lote,
          cast(0 as smallint) as ordem
        from tb_estoque e
        where e.relmovestq = ${produtos[i].CODIGO} and (e.movto = 'S' or e.movto = 'SP' or e.movto = 'E')
        and coalesce(e.rel_prodlote,0) <> -1000
        group by e.relmovestq, e.rel_prodlote)
        group by relmovestq, rel_prodlote, qtd, qtd_saldo_compl, descr_lote, emb_venda_lote, qtd_min_lote,
        fci_lote, d_validade_lote, data_lote, ordem
        union all
        select
          p.codigo as relmovestq,
          cast(-1000 as integer) as rel_prodlote,
          cast(${QtdSolicitada} as numeric(15,2)) as disponivel,
          cast(0 as numeric(15,5)) qtd,
          cast(0 as numeric(15,5)) qtd_saldo_compl,
          cast('*** LOTE ENCOMENDA ***' as varchar(50)) as descr_lote,
          cast(1 as numeric(15,2)) as emb_venda_lote,
          cast(1 as numeric(15,2)) as qtd_min_lote,
          cast(null as varchar(36)) as fci_lote,
          cast(null as date) as d_validade_lote,
          cast(null as timestamp) as data_lote,
          cast(1 as smallint) as ordem
        from tb_produtos p
        where p.codigo = ${produtos[i].CODIGO} and
        case ${mostra_lote_enc}
          when 1 then 1
          else 0
        end = 1)
        where (
        case ${mostra_disp_negativo}
          when 1 then iif(coalesce(disponivel,0) <> 0, 1, 0)
          when 2 then 1
          else iif(coalesce(disponivel,0) > 0, 1, 0)
        end = 1 or descr_lote = '*** LOTE ENCOMENDA ***')
        order by 12, 11 nulls last, 2 nulls last
       `, async function (err, result) {

          console.log('ACHOU: ', produtos[i].CODIGO)
          if (!err) {
            if (result.length > 0) {

              let lotes = []

              for (let i in result) {

                lotes.push({
                  RELMOVESTQ: result[i].RELMOVESTQ,
                  REL_PRODLOTE: result[i].REL_PRODLOTE,
                  DISPONIVEL: result[i].DISPONIVEL,
                  QTD: result[i].QTD,
                  QTD_SALDO_COMPL: result[i].QTD_SALDO_COMPL,
                  DESCR_LOTE: result[i].DESCR_LOTE,
                  EMB_VENDA_LOTE: result[i].EMB_VENDA_LOTE,
                  QTD_MIN_LOTE: result[i].QTD_MIN_LOTE,
                  DATA_LOTE: result[i].DATA_LOTE,
                })

              }


              if (lotes.length > 0) {
                try {

                  let save = await Produtos.findOneAndUpdate({ CODIGO: produtos[i].CODIGO }, { lotes: lotes }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();

                } catch (err) {

                  console.log(err)

                }

              }
              else {


              }
              // resolve(console.log('Total de vendas atualizado'))

            }
            else if (err) {

              console.log(err)

              var query = {}
              var update = {
                tipo: 'LOTES',
                data: moment().format('D.M.YYYY'),
                hora: moment().format('HH:mm'),
                erro: err
              }
              var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
              let save = await Erros.findOneAndUpdate(query, update, options).exec();
              // db.detach()

            }
          }


          //  db.detach()
        })//-dbquery;
      }


      //  }); //fire
      // console.log(`

      //     select
      //     relmovestq, rel_prodlote, disponivel, qtd, qtd_saldo_compl, descr_lote,
      //     emb_venda_lote, qtd_min_lote, fci_lote, d_validade_lote,
      //     data_lote, ordem from (
      //   select
      //     relmovestq,
      //     coalesce(rel_prodlote,0) as rel_prodlote,
      //     sum(disponivel) as disponivel,
      //     qtd,
      //     qtd_saldo_compl,
      //     descr_lote,
      //     emb_venda_lote, qtd_min_lote, fci_lote, d_validade_lote,
      //     data_lote, ordem from (
      //   select
      //     e.relmovestq,
      //     e.rel_prodlote,
      //     sum(case
      //       when e.movto = 'S' then e.quant * -1
      //       when e.movto = 'SP' then e.quant * -1
      //       when e.movto = 'E' then e.quant
      //       else 0.00000
      //     end) as disponivel,
      //     cast(0 as numeric(15,5)) qtd,
      //     cast(0 as numeric(15,5)) qtd_saldo_compl,
      //     coalesce(
      //     case
      //       when e.rel_prodlote is not null then
      //         (select l.descricao from tb_produtos_estoque_lote l where l.codigo = e.rel_prodlote)
      //       else null
      //     end,'Sem Lote') as descr_lote,
      //     case
      //       when e.rel_prodlote is not null then
      //         (select l.emb_venda from tb_produtos_estoque_lote l where l.codigo = e.rel_prodlote)
      //       else null
      //     end as emb_venda_lote,
      //     case
      //       when e.rel_prodlote is not null then
      //         (select l.qtd_min from tb_produtos_estoque_lote l where l.codigo = e.rel_prodlote)
      //       else null
      //     end as qtd_min_lote,
      //     case
      //       when e.rel_prodlote is not null then
      //         (select l.fci from tb_produtos_estoque_lote l where l.codigo = e.rel_prodlote)
      //       else null
      //     end as fci_lote,
      //     case
      //       when e.rel_prodlote is not null then
      //         (select l.d_validade from tb_produtos_estoque_lote l where l.codigo = e.rel_prodlote)
      //       else null
      //     end as d_validade_lote,
      //     case
      //       when e.rel_prodlote is not null then
      //         (select l.data from tb_produtos_estoque_lote l where l.codigo = e.rel_prodlote)
      //       else null
      //     end as data_lote,
      //     cast(0 as smallint) as ordem
      //   from tb_estoque e
      //   where e.relmovestq = ${produtos[i].CODIGO} and (e.movto = 'S' or e.movto = 'SP' or e.movto = 'E')
      //   and coalesce(e.rel_prodlote,0) <> -1000
      //   group by e.relmovestq, e.rel_prodlote)
      //   group by relmovestq, rel_prodlote, qtd, qtd_saldo_compl, descr_lote, emb_venda_lote, qtd_min_lote,
      //   fci_lote, d_validade_lote, data_lote, ordem
      //   union all
      //   select
      //     p.codigo as relmovestq,
      //     cast(-1000 as integer) as rel_prodlote,
      //     cast(${QtdSolicitada} as numeric(15,2)) as disponivel,
      //     cast(0 as numeric(15,5)) qtd,
      //     cast(0 as numeric(15,5)) qtd_saldo_compl,
      //     cast('*** LOTE ENCOMENDA ***' as varchar(50)) as descr_lote,
      //     cast(1 as numeric(15,2)) as emb_venda_lote,
      //     cast(1 as numeric(15,2)) as qtd_min_lote,
      //     cast(null as varchar(36)) as fci_lote,
      //     cast(null as date) as d_validade_lote,
      //     cast(null as timestamp) as data_lote,
      //     cast(1 as smallint) as ordem
      //   from tb_produtos p
      //   where p.codigo = ${produtos[i].CODIGO} and
      //   case ${mostra_lote_enc}
      //     when 1 then 1
      //     else 0
      //   end = 1)
      //   where (
      //   case ${mostra_disp_negativo}
      //     when 1 then iif(coalesce(disponivel,0) <> 0, 1, 0)
      //     when 2 then 1
      //     else iif(coalesce(disponivel,0) > 0, 1, 0)
      //   end = 1 or descr_lote = '*** LOTE ENCOMENDA ***')
      //   order by 12, 11 nulls last, 2 nulls last
      //  `)


    }

    resolve()


  });

};



module.exports = checkLotesOnDemand