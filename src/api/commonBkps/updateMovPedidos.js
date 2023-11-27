
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
const criarDelay = require('./criarDelay');
fs = require('fs');


function updateMovPedidos() {
  return new Promise(async function (resolve, reject) {
    let data1 = moment().format('D.M.YYYY')
    let data2 = moment().subtract(3, 'days').format('D.M.YYYY')
    let qtd = 0
    let prodChanges = []
    flag = true

    while (true) {


      await criarDelay(3000)

      //  let editar2 =  editarMovPedidoTeste()
      //  let editar1 =  editarMovPedido()
       
      //  await criarDelay(34444000)

      //  console.log('editar 1',editar)
      //  console.log('editar 2', editar2)

      let movpedidosdb = await MovPedidos.find({ status_movimentacao: 20 }).exec()

      console.log('qtd novos: ', movpedidosdb.length)

      if (movpedidosdb.length > 0) {
        for (let i in movpedidosdb) {

          var query = {
            $and: [{ _id: movpedidosdb[i]._id }]
          },
            update = { status_movimentacao: 21, },
            options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
          try {

            let updateMovPedidos = await MovPedidos.findOneAndUpdate(query, update, options).exec();

          } catch (err) {
            var query = {}
            var update = { tipo: 'MovPedidos', data: moment().format('D.M.YYYY'), hora: moment().format('HH:mm'), erro: err }
            var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            let save = await Erros.findOneAndUpdate(query, update, options).exec();
          }


          let montarpedido = await montarPedido(movpedidosdb[i].toObject())
          let pedidoPronto = montarpedido


//-------------------------------------

          let criarP = await criarPedido(pedidoPronto)
          console.log('Resultado criarP: ', criarP)

          // let criarP = {}
          // criarP.codigo = 56891


          if (criarP.codigo) {

            let erroMovPedidos = false
            let produtos = pedidoPronto.produtos

            for (let i in produtos) {

              let criarM = await criarMovPedido(produtos[i], criarP.codigo)
              console.log('Resultado criarM: ', criarM)

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
                update = { status_movimentacao: 19, produtos },
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
                  CODIGO: parseInt(criarP.codigo), status_movimentacao: 5,
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
            var query = {
              $and: [{ _id: pedidoPronto._id }]
            },
              update = { status_movimentacao: 9, },
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
      }

      else {
        // await checkPedidosAberto()
      }


    }

  });

};



module.exports = updateMovPedidos