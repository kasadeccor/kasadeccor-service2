const MovPedidos = require('../MovPedidosRoutes/MovPedidos')
const User = require('../user/user')
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
//   //console.log('DB START')
//   db = dba
//   err = erroF
// })

let flag = false
function checkPedidosAberto
  (erro, db) {
  return new Promise(async function (resolve, reject) {
    //let db
    // Firebird.attach(options, async function (err, db) {

    //console.log(db)
    if (erro == undefined && db) {
      db.query(`
    select p.ralped as CODIGO, t.nome_cli as NOME_CLIENTE, p.nr_item_estoq as CODPRODUTO, p.DESCRICAO_ADICIONAL as DESCADD, p.REL_PRODLOTE, t.ULTMODIF_APP,
    t.RELACIONAMENTO as CODCLIENTE, t.RELOBRA as REL_OBRA, t.DATA as DATACREATED, t.TOTAL_COMISSAO, t.COMISS_VEND, t.COD_VEND, t.FONE, 
    p.descricao_original as DESCRICAO, p.qtd as qtd, p.custo as CUSTOTOTAL_PRODUTO, t.OPERADOR, cast(t.OBS_PED as varchar(500)) as OBS_PED,
    p.preco as PRECOTOTAL_PRODUTOLIQUIDO, cast (p.qtd * p.valorv as double precision) as PRECOTOTAL_PRODUTOBRUTO,
    p.preco_unitario as PRECO_UNITARIO, p.valorv as PRECO_UNITARIO_VALORV, p.preco_unitario_or as PRECO_UNITARIO_OR, p.desconto as TOTALDESCONTO_PRODUTO, p.perc_desconto as PERCDESCONTO_PRODUTO,
    cast(ROUND(((t.desc_ped / t.total_bruto_ped) * 100),2) as decimal(12,2)) as totalDesconto,
    t.total_bruto_ped as totalBruto, t.total_liq_ped as totalLiquido, t.desc_ped as totalDesconto,
    t.vendedor as nome_vendedor, t.cond_pagto as CONDICAO_PAGAMENTO, t.espe_cobr as TIPO_PAGAMENTO, t.data_edicao, t.hora_edicao
    from tb_movpedidos p , tb_pedidos t  , tb_produtos s
    where p.ralped = t.codigo
    and p.nr_item_estoq = s.codigo
    and (t.situacao = 'PR')
    and t.ULTMODIF_APP > cast('${moment().subtract(2, 'days').format('D.M.YYYY')}' as date)
    order by p.ralped desc;
     `, async function (err, result) {

        //console.log('result: ', result)

        if (!err) {
          if (result.length > 0) {
          //  console.log('Quantidade de dados da query (pedidos em aberto): ' + result.length)

            let prevPed = ' '
            let desc = {}
            desc.produtos = []
            prevPed = result[0].CODIGO
            //console.log('qtd sync: ', result.length)

            for (let i in result) {
              //console.log('CODIGO ABERTO: ', result[i].CODIGO)
              if (result[i].CODIGO == prevPed) {


                desc.CODIGO = result[i].CODIGO
                desc.desc_perc = result[i].DESC_PERC
                desc.totalBruto = result[i].TOTALBRUTO
                desc.totalLiquido = result[i].TOTALLIQUIDO
                desc.totalDesconto = result[i].TOTALDESCONTO
                desc.nome_vendedor = result[i].NOME_VENDEDOR
                desc.cliente = {}
                if (result[i].CODCLIENTE == 1) {
                  desc.novoCliente = result[i].NOME_CLIENTE
                  desc.telefoneNovo = result[i].FONE
                }
                else {
                  desc.cliente.CODIGO = result[i].CODCLIENTE
                  desc.cliente.FONE1_CLI = result[i].FONE
                  desc.cliente.NOME_CLI = result[i].NOME_CLIENTE
                  desc.cliente.REL_OBRA = result[i].REL_OBRA
                }

                desc.dataCreated = result[i].DATACREATED
                desc.total_comissao_vendedor = result[i].TOTAL_COMISSAO
                desc.comissao_vendedor = result[i].COMISS_VEND
                desc.codigo_vendedor = result[i].COD_VEND
                desc.CONDICAO_PAGAMENTO = result[i].CONDICAO_PAGAMENTO
                desc.TIPO_PAGAMENTO = result[i].TIPO_PAGAMENTO
                //desc.nomeResp = result[i].OPERADOR
                desc.OBS = result[i].OBS_PED ? result[i].OBS_PED.toUpperCase() : ''
                //desc.lastUpdate = moment(result[i].DATA_EDICAO).hour(result[i].HORA_EDICAO.substring(0, 2)).minute(result[i].HORA_EDICAO.substring(3, 5)).second(result[i].HORA_EDICAO.substring(6, 8))
                desc.lastUpdate = result[i].ULTMODIF_APP
                desc.status_movimentacao = 5
                //console.log({codigo: result[i].CODIGO, obs: result[i].OBS_PED})


                desc.produtos.push({
                  CODIGO: result[i].CODPRODUTO,
                  qtd: result[i].QTD,
                  PERCDESCONTO_PRODUTO: result[i].PERCDESCONTO_PRODUTO,
                  descAdd: result[i].DESCADD ? result[i].DESCADD.toUpperCase() : '',
                  REL_PRODLOTE: result[i].REL_PRODLOTE,
                  status: true
                })


              }

              else {

                //  console.log('1')
                // console.log('desc Codigo: ', desc.CODIGO)


                let find = await MovPedidos.findOne({ CODIGO: desc.CODIGO })


                //console.log('2.0', find)
                if (!find) {
                  // console.log('2.1')
                  try {
                    var inserir = new MovPedidos(desc)
                    let saved = await inserir.save()
                    //console.log('2.1 - inserido')
                  }
                  catch (error) {

                    //  console.log('error inserir: ', error)
                  }


                } else if (find.status_movimentacao == 5 || find.status_movimentacao == 22) {
                  //  console.log('2.2')

                  try {
                    let changed = await MovPedidos.findByIdAndUpdate({ _id: find._id }, { ...desc })
                    //  console.log('2.2 - alterado')
                  }
                  catch (error) {
                    //   console.log('error alterar: ', error)
                  }

                }

                //   console.log('3')





                // var query = {
                //   $and: [
                //     {
                //       CODIGO: desc.CODIGO
                //     },
                //     {
                //       $or: [
                //         {
                //           status_movimentacao: undefined
                //         },
                //         {
                //           status_movimentacao: 5
                //         }
                //       ]
                //     }

                //   ]
                // },
                //   update = {
                //     ...desc
                //   },
                //   options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                // // Find the document
                // try {
                //   let save = await MovPedidos.findOneAndUpdate(query, update, options).exec();
                // } catch (err) {
                //   var query = {}
                //   var update = {
                //     tipo: 'MovPedidos',
                //     data: moment().format('D.M.YYYY'),
                //     hora: moment().format('HH:mm'),
                //     erro: err
                //   }
                //   var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                //   let save = await Erros.findOneAndUpdate(query, update, options).exec();
                //   console.log('Erro - ', err)
                // }

                desc = {}
                desc.produtos = []


                desc.CODIGO = result[i].CODIGO
                desc.desc_perc = result[i].DESC_PERC
                desc.totalBruto = result[i].TOTALBRUTO
                desc.totalLiquido = result[i].TOTALLIQUIDO
                desc.totalDesconto = result[i].TOTALDESCONTO
                desc.nome_vendedor = result[i].NOME_VENDEDOR
                desc.cliente = {}
                if (result[i].CODCLIENTE == 1) {
                  desc.novoCliente = result[i].NOME_CLIENTE
                  desc.telefoneNovo = result[i].FONE
                }
                else {
                  desc.cliente.CODIGO = result[i].CODCLIENTE
                  desc.cliente.FONE1_CLI = result[i].FONE
                  desc.cliente.NOME_CLI = result[i].NOME_CLIENTE
                  desc.cliente.REL_OBRA = result[i].REL_OBRA
                }

                desc.dataCreated = result[i].DATACREATED
                desc.total_comissao_vendedor = result[i].TOTAL_COMISSAO
                desc.comissao_vendedor = result[i].COMISS_VEND
                desc.codigo_vendedor = result[i].COD_VEND
                desc.CONDICAO_PAGAMENTO = result[i].CONDICAO_PAGAMENTO
                desc.TIPO_PAGAMENTO = result[i].TIPO_PAGAMENTO
                //desc.nomeResp = result[i].OPERADOR
                desc.OBS = result[i].OBS_PED ? result[i].OBS_PED.toUpperCase() : ''
                // desc.lastUpdate = moment(result[i].DATA_EDICAO).hour(result[i].HORA_EDICAO.substring(0, 2)).minute(result[i].HORA_EDICAO.substring(3, 5)).second(result[i].HORA_EDICAO.substring(6, 8))
                desc.lastUpdate = result[i].ULTMODIF_APP
                desc.status_movimentacao = 5


                desc.produtos.push({
                  CODIGO: result[i].CODPRODUTO,
                  qtd: result[i].QTD,
                  PERCDESCONTO_PRODUTO: result[i].PERCDESCONTO_PRODUTO,
                  descAdd: result[i].DESCADD ? result[i].DESCADD.toUpperCase() : '',
                  REL_PRODLOTE: result[i].REL_PRODLOTE,
                  status: true
                })

              }

              prevPed = result[i].CODIGO

            } // end for

            // var query = {
            //   $and: [
            //     {
            //       CODIGO: desc.CODIGO
            //     }
            //   ]
            // },
            //   update = {
            //     ...desc
            //   },
            //   options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            // // Find the document
            // try {
            //   let save = await MovPedidos.findOneAndUpdate(query, update, options).exec();
            // } catch (err) {
            //   var query = {}
            //   var update = {
            //     tipo: 'MovPedidos',
            //     data: moment().format('D.M.YYYY'),
            //     hora: moment().format('HH:mm'),
            //     erro: err
            //   }
            //   var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            //   let save = await Erros.findOneAndUpdate(query, update, options).exec();
            //   console.log('Erro - ', err)
            // }


            // console.log('1')
            // console.log('desc Codigo: ', desc.CODIGO)


            let find = await MovPedidos.findOne({ CODIGO: desc.CODIGO })

            //console.log('2.0', find)
            if (!find) {
              //   console.log('2.1')
              try {
                var inserir = new MovPedidos(desc)
                let saved = await inserir.save()
                //     console.log('2.1 - inserido')
              }
              catch (error) {

                //    console.log('error inserir: ', error)
              }


            } else if (find.status_movimentacao == 5 || find.status_movimentacao == 22) {
              //   console.log('2.2')

              try {
                let changed = await MovPedidos.findByIdAndUpdate({ _id: find._id }, { ...desc })
                //    console.log('2.2 - alterado')
              }
              catch (error) {
                //     console.log('error alterar: ', error)
              }

            }

            //   console.log('3')


            // db.detach()
            //db.detach()
            resolve()
            //resolve()

          }
        }
        else {

          console.log('Erro - ', err)
          var query = {}
          var update = {
            tipo: 'PEDIDO ABERTO',
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

    let data1 = '01.01.2020'
    let data2 = '01.06.2020'
    let qtd = 0
    flag = true
    // db = DATABASE

  }); //-dbquery


};



module.exports = checkPedidosAberto
