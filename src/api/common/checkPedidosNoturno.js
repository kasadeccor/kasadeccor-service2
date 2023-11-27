const Desconto = require('../DescontoRoutes/Desconto')
const User = require('../user/user')
const Erros = require('../ErrosRoutes/Erros')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
var PushController = require('./PushController');
const MovPedidos = require('../MovPedidosRoutes/MovPedidos');

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
function checkPedidosDaily(erro, db) {
  return new Promise(async function (resolve, reject) {
    let data1 = '01.01.2020'
    let data2 = '01.06.2020'
    let qtd = 0
    flag = true
    // db = DATABASE
    //   Firebird.attach(options, function (err, db) {

    if (erro == undefined && db) {
      db.query(`
   select p.ralped as PEDIDO, t.nome_cli as NOME_CLIENTE, p.nr_item_estoq as CODPRODUTO, t.SITUACAO,
   p.descricao_original as DESCRICAO, p.qtd as QUANTIDADE, p.custo as CUSTO,
   p.preco as TOTAL_PROD_LIQUIDO, cast (p.qtd * p.valorv as double precision) as TOTAL_PROD_BRUTO,
   p.preco_unitario as PRECO_VENDA, p.valorv as PRECO_UNITARIO, p.preco_unitario_or as PRECO_UNITARIO_ORIGINAL, p.desconto as DESCONTO_ITEM, p.perc_desconto as DESC_PERC_ITEM,
   cast(ROUND(((t.desc_ped / t.total_bruto_ped) * 100),2) as decimal(12,2)) as DESC_PERC_PEDIDO,
   t.total_bruto_ped as TOTAL_PED_BRUTO, t.total_liq_ped as TOTAL_PED_LIQUIDO, t.desc_ped as TOTAL_PED_DESCONTO,
   t.vendedor, t.cond_pagto as CONDICAO_PAGAMENTO, t.espe_cobr as TIPO_PAGAMENTO, t.data_edicao, t.hora_edicao,
   (SELECT first 1 DATA_TERMINO from tb_promocao pro WHERE pro.codigo = s.relpromo order by pro.data_termino desc) as DATA_FIM_PROMOCAO,
   (SELECT first 1 VALOR from tb_promocao pro WHERE pro.codigo = s.relpromo order by pro.data_termino desc) as VALOR_PROMOCAO
   
   from tb_movpedidos p , tb_pedidos t  , tb_produtos s
   where p.ralped = t.codigo
   and p.nr_item_estoq = s.codigo
   and (t.situacao = 'CP' or t.situacao = 'CC' or t.situacao = 'PD' OR t.situacao = '' OR t.situacao is null)
   and t.ULTMODIF_APP > cast('${moment().subtract(7, 'days').format('D.M.YYYY')}' as date)
   order by p.ralped desc;
    `, async function (err, result) {

        if (!err) {
          if (result.length > 0) {
            // console.log('Quantidade de dados da query (pedidos noturnos): ' + result.length)

            let prevPed = ' '
            let statusprom = false
            let desc = {}
            desc.PRODUTOS = []
            prevPed = result[0].PEDIDO

            for (let i in result) {
              if (result[i].PEDIDO == prevPed) {
                if (moment().isBefore(moment(result[i].DATA_FIM_PROMOCAO))) {
                  statusprom = true
                }

                desc.PEDIDO = result[i].PEDIDO
                desc.NOME_CLIENTE = result[i].NOME_CLIENTE
                desc.DESC_PERC_PEDIDO = result[i].DESC_PERC_PEDIDO
                desc.TOTAL_PED_BRUTO = result[i].TOTAL_PED_BRUTO
                desc.TOTAL_PED_LIQUIDO = result[i].TOTAL_PED_LIQUIDO
                desc.TOTAL_PED_DESCONTO = result[i].TOTAL_PED_DESCONTO
                desc.VENDEDOR = result[i].VENDEDOR
                desc.CONDICAO_PAGAMENTO = result[i].CONDICAO_PAGAMENTO
                desc.TIPO_PAGAMENTO = result[i].TIPO_PAGAMENTO
                desc.HORA_EDICAO = result[i].HORA_EDICAO
                desc.DATA_EDICAO = result[i].DATA_EDICAO
                desc.STATUS = 0

                if (result[i].SITUACAO == 'PD') {
                  desc.status_pedido = 0

                }
                if (result[i].SITUACAO == 'CC' || result[i].SITUACAO == 'CP') {
                  desc.status_pedido = 50
                }

                if (result[i].SITUACAO == '' || result[i].SITUACAO == null) {

                  desc.status_pedido = 70

                }

                desc.STATUS_PROMOCAO = statusprom


                if (moment().isBefore(moment(result[i].DATA_FIM_PROMOCAO))) {
                  statusprom = true
                }
                else {
                  statusprom = false
                }
                desc.PRODUTOS.push({
                  CODPRODUTO: result[i].CODPRODUTO,
                  DESCRICAO: result[i].DESCRICAO,
                  QUANTIDADE: result[i].QUANTIDADE,
                  CUSTO: result[i].CUSTO,
                  TOTAL_PROD_LIQUIDO: result[i].TOTAL_PROD_LIQUIDO,
                  TOTAL_PROD_BRUTO: result[i].TOTAL_PROD_BRUTO,
                  PRECO_UNITARIO: statusprom ? result[i].PRECO_UNITARIO_ORIGINAL : result[i].PRECO_UNITARIO,
                  PRECO_VENDA: result[i].PRECO_VENDA,
                  DESCONTO_ITEM: result[i].DESCONTO_ITEM,
                  DESC_PERC_ITEM: result[i].DESC_PERC_ITEM,
                  DATA_FIM_PROMOCAO: result[i].DATA_FIM_PROMOCAO,
                  VALOR_PROMOCAO: result[i].VALOR_PROMOCAO,
                  STATUS_PROMOCAO: statusprom
                })

              }

              else {


                let findPed = {}
                let saved = {}
                try {

                  findPed = await Desconto.find({ PEDIDO: desc.PEDIDO }).exec()


                } catch (err) {
                  console.log('Erro ao buscar produto: ' + desc.PEDIDO)
                }

                if (findPed.length == 0 && (desc.status_pedido == 50 || desc.status_pedido == 0)) {

                  let desconto = new Desconto(desc);
                  try {
                    saved = await desconto.save()

                    if(desc.DESC_PERC_PEDIDO >= 5 && desc.status_pedido == 0) {
                      let push = {}
                      push.id = '5f007aa19074d8d50fded9ab'
                      push.header = "ALERTA! Desconto acima de 5%"
                      push.msg = `Pedido: ${desc.PEDIDO} - Vendedor: ${desc.VENDEDOR} - Desconto: ${desc.DESC_PERC_PEDIDO}%`
                      PushController.pushNotification(push)
                    }

                    qtd++
                    statusprom = false
                    if (saved) {
                      try {
                        let deleteMov = await MovPedidos.remove({ CODIGO: desc.PEDIDO });
                        // console.log("Deleted course: ", result);
                      } catch (err) {
                        console.log(err)
                      }
                    }
                  }
                  catch (err) {
                    console.log('Erro ao inserir produto: ' + desc.PEDIDO + err)
                  }

                }
                else {
                  try {
                    let deleteMov = await MovPedidos.remove({ CODIGO: desc.PEDIDO });
                    // console.log("Deleted course: ", result);
                  } catch (err) {
                    console.log(err)
                  }
                }





                desc = {}
                desc.PRODUTOS = []
                statusprom = false
                // statusprom = false


                if (moment().isBefore(moment(result[i].DATA_FIM_PROMOCAO))) {
                  statusprom = true
                }

                desc.PEDIDO = result[i].PEDIDO
                desc.NOME_CLIENTE = result[i].NOME_CLIENTE
                desc.DESC_PERC_PEDIDO = result[i].DESC_PERC_PEDIDO
                desc.TOTAL_PED_BRUTO = result[i].TOTAL_PED_BRUTO
                desc.TOTAL_PED_LIQUIDO = result[i].TOTAL_PED_LIQUIDO
                desc.TOTAL_PED_DESCONTO = result[i].TOTAL_PED_DESCONTO
                desc.VENDEDOR = result[i].VENDEDOR
                desc.CONDICAO_PAGAMENTO = result[i].CONDICAO_PAGAMENTO
                desc.TIPO_PAGAMENTO = result[i].TIPO_PAGAMENTO
                desc.HORA_EDICAO = result[i].HORA_EDICAO
                desc.DATA_EDICAO = result[i].DATA_EDICAO
                desc.STATUS = 0
                desc.STATUS_PROMOCAO = statusprom

                if (result[i].SITUACAO == 'PD') {
                  desc.status_pedido = 0

                }
                if (result[i].SITUACAO == 'CC' || result[i].SITUACAO == 'CP') {
                  desc.status_pedido = 50
                }

                if (result[i].SITUACAO == '' || result[i].SITUACAO == null) {

                  desc.status_pedido = 70

                }
                desc.PRODUTOS = []


                desc.PRODUTOS.push({
                  CODPRODUTO: result[i].CODPRODUTO,
                  DESCRICAO: result[i].DESCRICAO,
                  QUANTIDADE: result[i].QUANTIDADE,
                  CUSTO: result[i].CUSTO,
                  TOTAL_PROD_LIQUIDO: result[i].TOTAL_PROD_LIQUIDO,
                  TOTAL_PROD_BRUTO: result[i].TOTAL_PROD_BRUTO,
                  PRECO_UNITARIO: statusprom ? result[i].PRECO_UNITARIO_ORIGINAL : result[i].PRECO_UNITARIO,
                  PRECO_VENDA: result[i].PRECO_VENDA,
                  DESCONTO_ITEM: result[i].DESCONTO_ITEM,
                  DESC_PERC_ITEM: result[i].DESC_PERC_ITEM,
                  DATA_FIM_PROMOCAO: result[i].DATA_FIM_PROMOCAO,
                  VALOR_PROMOCAO: result[i].VALOR_PROMOCAO,
                  STATUS_PROMOCAO: statusprom
                })

              }
              prevPed = result[i].PEDIDO

            } // end for

            let findPed = {}
            let saved = {}
            try {

              findPed = await Desconto.find({ PEDIDO: desc.PEDIDO }).exec()

            } catch (err) {
              console.log('Erro ao buscar produto: ' + desc.PEDIDO)
            }

            if (findPed.length == 0 && (desc.status_pedido == 50 || desc.status_pedido == 0)) {
              let desconto = new Desconto(desc);
              try {
                saved = await desconto.save()

                if(desc.DESC_PERC_PEDIDO >= 5 && desc.status_pedido == 0) {
                  let push = {}
                  push.id = '5f007aa19074d8d50fded9ab'
                  push.header = "ALERTA! Desconto acima de 5%"
                  push.msg = `Pedido: ${desc.PEDIDO} - Vendedor: ${desc.VENDEDOR} - Desconto: ${desc.DESC_PERC_PEDIDO}%`
                  PushController.pushNotification(push)
                }

                qtd++
                statusprom = false
                if (saved) {
                  try {
                    let deleteMov = await MovPedidos.remove({ CODIGO: desc.PEDIDO });
                    // console.log("Deleted course: ", result);
                  } catch (err) {
                    console.log(err)
                  }
                }
              }
              catch (err) {
                console.log('Erro ao inserir produto: ' + desc.PEDIDO + err)
              }


            }
            else {
              try {
                let deleteMov = await MovPedidos.remove({ CODIGO: desc.PEDIDO });
                // console.log("Deleted course: ", result);
              } catch (err) {
                console.log(err)
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
            tipo: 'DESCONTO',
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
    // }) //fire

  }); //-dbquery


};



module.exports = checkPedidosDaily