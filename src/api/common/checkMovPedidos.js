
const MovPedidos = require('../MovPedidosRoutes/MovPedidos')
const criarPedido = require('../firebirdFunctions/criarPedido')
const montarPedido = require('../firebirdFunctions/montarPedido')
const Erros = require('../ErrosRoutes/Erros')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
var PushController = require('./PushController');
const { create } = require('lodash');
const criarMovPedido = require('../firebirdFunctions/criarMovPedido');
const editarMovPedido = require('../firebirdFunctions/SalvarPedidos');
const editarPedido = require('../firebirdFunctions/editarPedido');
const cancelarPedido = require('../firebirdFunctions/cancelarPedido');
const checkPedidosAberto = require('./checkPedidosAberto');
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



function checkMovPedidos() {
  return new Promise(async function (resolve, reject) {
    let data1 = moment().format('D.M.YYYY')
    let data2 = moment().subtract(3, 'days').format('D.M.YYYY')
    let qtd = 0
    let prodChanges = []
    flag = true

    // console.log('oiooio')
    //  while (true) {


    // await criarDelay(3000)

    //let editar2 = editarMovPedidoTeste()
    // let editar1 =  await editarMovPedido()

    //  await criarDelay(34444000)

    //  console.log('editar 1',editar)
    //  console.log('editar 2', editar2)
    // Firebird.attach(options, async function (err, db) {

    if (!err && db) {

      let movpedidosdb = await MovPedidos.find({
        $or: [
          {
            status_movimentacao: 0
          },
          {
            status_movimentacao: 21
          },
          {
            status_movimentacao: 49
          }
        ]
      }).exec()

      //console.log('qtd novos: ', movpedidosdb.length)

      if (movpedidosdb.length > 0) {
        for (let i in movpedidosdb) {

          if (movpedidosdb[i].status_movimentacao == 0) {

            // var query = {
            //   $and: [{ _id: movpedidosdb[i]._id }]
            // },
            //   update = { status_movimentacao: 1, },
            //   options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            // try {

            //   let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();

            // } catch (err) {
            //   var query = {}
            //   var update = { tipo: 'MovPedidos', data: moment().format('D.M.YYYY'), hora: moment().format('HH:mm'), erro: err }
            //   var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            //   let save = await Erros.findOneAndUpdate(query, update, options).exec();
            // }


            let montarpedido = await montarPedido(movpedidosdb[i].toObject())
            let pedidoPronto = montarpedido

            let criarP = await criarPedido(pedidoPronto, err, db)
            //console.log('Resultado criarP: ', criarP)

            // let criarP = {}
            // criarP.codigo = 56891


            if (criarP.codigo) {

              let erroMovPedidos = false
              let produtos = pedidoPronto.produtos

              for (let i in produtos) {

                let criarM = await criarMovPedido(produtos[i], criarP.codigo, err, db)
                //console.log('Resultado criarM: ', criarM)

                // let criarM = {}
                // if (i == 1)
                //   criarM.codigo = 999999

                if (!criarM.codigo) {
                  erroMovPedidos = true
                  produtos[i].status = false
                }
                else {

                  produtos[i].status = true

                }

              }

              if (erroMovPedidos) {

                var query = {
                  $and: [{ _id: pedidoPronto._id }]
                },
                  update = { status_movimentacao: 19, produtos, lastUpdate: moment() },
                  options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                try {
                  let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();
                } catch (err) {
                  var query = {}
                  var update = { tipo: 'MovPedidos', data: moment().format('D.M.YYYY'), hora: moment().format('HH:mm'), erro: err }
                  var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                  let save = await Erros.findOneAndUpdate(query, update, options).exec();
                }
              }
              else {
                var query = {
                  $and: [
                    {
                      _id: pedidoPronto._id
                    }
                  ]
                },
                  update = {
                    CODIGO: parseInt(criarP.codigo), status_movimentacao: 5, produtos, lastUpdate: moment()
                  },
                  options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                // Find the document
                try {
                  let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();
                  //resolve(console.log('Atualizado: ', criarP.codigo))

                } catch (err) {
                  var query = {}
                  var update = {
                    tipo: 'MovPedidos',
                    data: moment().format('D.M.YYYY'),
                    hora: moment().format('HH:mm'),
                    erro: err
                  }
                  var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                  let save = await Erros.findOneAndUpdate(query, update, options).exec();
                  console.log('Erro - ', err)
                }
              }

            }

            else if (criarP.erro) {
              // console.log('CRIAR P', criarP.erro.toString())
              var query = {
                $and: [{ _id: pedidoPronto._id }]
              },
                update = { status_movimentacao: 9, lastUpdate: moment(), "$push": { "erroLog": criarP.erro.toString() } },
                options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
              try {
                let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();
              } catch (err) {
                var query = {}
                var update = { tipo: 'MovPedidos', data: moment().format('D.M.YYYY'), hora: moment().format('HH:mm'), erro: err }
                var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                let save = await Erros.findOneAndUpdate(query, update, options).exec();
              }
            }
            //***************************** */


            //***************************** */

          }

          else if (movpedidosdb[i].status_movimentacao == 21) {

            // var query = {
            //   $and: [{ _id: movpedidosdb[i]._id }]
            // },
            //   update = { status_movimentacao: 21, },
            //   options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            // try {

            //   let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();

            // } catch (err) {
            //   var query = {}
            //   var update = { tipo: 'MovPedidos', data: moment().format('D.M.YYYY'), hora: moment().format('HH:mm'), erro: err }
            //   var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            //   let save = await Erros.findOneAndUpdate(query, update, options).exec();
            // }


            let montarpedidoEdit = await montarPedido(movpedidosdb[i].toObject())
            let pedidoEdit = montarpedidoEdit
            //console.log('editp1')
            let editP = await editarPedido(pedidoEdit, err, db)
            //console.log('editp2')


            if (editP.erro) {

              //console.log('erro editp deadlock', editP)

              if (editP.deadlock == true) {
                var query = {
                  $and: [{ _id: pedidoEdit._id }]
                },
                  update = { status_movimentacao: 29, lastUpdate: moment() },
                  options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                try {
                  let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();
                } catch (err) {
                  var query = {}
                  var update = { tipo: 'MovPedidos', data: moment().format('D.M.YYYY'), hora: moment().format('HH:mm'), erro: err }
                  var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                  let save = await Erros.findOneAndUpdate(query, update, options).exec();
                }
              }
              else {
                console.log('erro', editP)
                var query = {
                  $and: [{ _id: pedidoEdit._id }]
                },
                  update = { status_movimentacao: 9, lastUpdate: moment(), "$push": { "erroLog": editP.erro.toString() } },
                  options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                try {
                  let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();
                } catch (err) {
                  var query = {}
                  var update = { tipo: 'MovPedidos', data: moment().format('D.M.YYYY'), hora: moment().format('HH:mm'), erro: err }
                  var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                  let save = await Erros.findOneAndUpdate(query, update, options).exec();
                }
              }


            }
            else if (editP.delete == true && editP.update == true) {
              // console.log('deu certo', editP)


              let erroMovPedidos = false
              let produtos = pedidoEdit.produtos

              for (let i in produtos) {

                let criarM = await criarMovPedido(produtos[i], pedidoEdit.CODIGO, err, db)
                //console.log('Resultado criarM: ', criarM)

                // let criarM = {}
                // if (i == 1)
                //   criarM.codigo = 999999

                if (!criarM.codigo) {
                  erroMovPedidos = true
                  produtos[i].status = false
                }
                else {

                  produtos[i].status = true

                }

              }

              if (erroMovPedidos) {
                var query = {
                  $and: [{ _id: pedidoEdit._id }]
                },
                  update = { status_movimentacao: 19, produtos, lastUpdate: moment() },
                  options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                try {
                  let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();
                } catch (err) {
                  var query = {}
                  var update = { tipo: 'MovPedidos', data: moment().format('D.M.YYYY'), hora: moment().format('HH:mm'), erro: err }
                  var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                  let save = await Erros.findOneAndUpdate(query, update, options).exec();
                }
              }
              else {
                var query = {
                  $and: [
                    {
                      _id: pedidoEdit._id
                    }
                  ]
                },
                  update = {
                    CODIGO: parseInt(pedidoEdit.CODIGO), status_movimentacao: 5, produtos, lastUpdate: moment()
                  },
                  options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                // Find the document
                try {
                  let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();
                  //resolve(console.log('Atualizado: ', criarP.codigo))

                } catch (err) {
                  var query = {}
                  var update = {
                    tipo: 'MovPedidos',
                    data: moment().format('D.M.YYYY'),
                    hora: moment().format('HH:mm'),
                    erro: err
                  }
                  var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                  let save = await Erros.findOneAndUpdate(query, update, options).exec();
                  console.log('Erro - ', err)
                }
              }

            }



          }

          else if (movpedidosdb[i].status_movimentacao == 49) {

            // var query = {
            //   $and: [{ _id: movpedidosdb[i]._id }]
            // },
            //   update = { status_movimentacao: 21, },
            //   options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            // try {

            //   let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();

            // } catch (err) {
            //   var query = {}
            //   var update = { tipo: 'MovPedidos', data: moment().format('D.M.YYYY'), hora: moment().format('HH:mm'), erro: err }
            //   var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            //   let save = await Erros.findOneAndUpdate(query, update, options).exec();
            // }


            let montarpedidoCancel = await montarPedido(movpedidosdb[i].toObject())
            let pedidoCancel = montarpedidoCancel
            //  console.log('editp1')
            let editP = await cancelarPedido(pedidoCancel, err, db)
            // console.log('editp2')

            if (editP.erro) {

              //console.log('erro editp deadlock', editP)

              if (editP.deadlock == true) {
                var query = {
                  $and: [{ _id: pedidoCancel._id }]
                },
                  update = { status_movimentacao: 29, lastUpdate: moment() },
                  options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                try {
                  let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();
                } catch (err) {
                  var query = {}
                  var update = { tipo: 'MovPedidos', data: moment().format('D.M.YYYY'), hora: moment().format('HH:mm'), erro: err }
                  var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                  let save = await Erros.findOneAndUpdate(query, update, options).exec();
                }
              }
              else {
                //console.log('erro', editP)
                var query = {
                  $and: [{ _id: pedidoCancel._id }]
                },
                  update = { status_movimentacao: 9, lastUpdate: moment() },
                  options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                try {
                  let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();
                } catch (err) {
                  var query = {}
                  var update = { tipo: 'MovPedidos', data: moment().format('D.M.YYYY'), hora: moment().format('HH:mm'), erro: err }
                  var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                  let save = await Erros.findOneAndUpdate(query, update, options).exec();
                }
              }


            }
            else if (editP.update == true) {
              //console.log('deu certo', editP)

              let erroMovPedidos = false
              let produtos = pedidoCancel.produtos

              var query = {
                $and: [
                  {
                    _id: pedidoCancel._id
                  }
                ]
              },
                update = {
                  CODIGO: parseInt(pedidoCancel.CODIGO), status_movimentacao: 50, produtos, lastUpdate: moment()
                },
                options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
              // Find the document
              try {
                let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();
                //resolve(console.log('Atualizado: ', criarP.codigo))

              } catch (err) {
                var query = {}
                var update = {
                  tipo: 'MovPedidos',
                  data: moment().format('D.M.YYYY'),
                  hora: moment().format('HH:mm'),
                  erro: err
                }
                var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                let save = await Erros.findOneAndUpdate(query, update, options).exec();
                console.log('Erro - ', err)
              }


            }

          }



        }

        resolve({ status: true })

      }
      else {

        await checkPedidosAberto(err, db)

        resolve({ status: true })

      }




      // }

    }
    // });//fire

  });


};



module.exports = checkMovPedidos