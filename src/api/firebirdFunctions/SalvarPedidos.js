
const MovPedidos = require('../MovPedidosRoutes/MovPedidos')
const Erros = require('../ErrosRoutes/Erros')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
const criarDelay = require('../common/criarDelay');
//var PushController = require('./PushController');
fs = require('fs');

function SalvarPedidos(desc) {
  return new Promise(async function (resolve, reject) {

    console.log('1')
    console.log('desc Codigo: ', desc.CODIGO)
    MovPedidos.findOne({ CODIGO: desc.CODIGO }, async function (err, data) {
      if (!data) {
        console.log('2.0', data)
        console.log('2.1')
        try {
          var inserir = new MovPedidos(desc)
          let saved = await inserir.save()
         // console.log('2.1 - inserido')
        }
        catch (error) {

          console.log('error inserir: ', error)
        }


      } else if (data.status_movimentacao == 5 || data.status_movimentacao == 22) {
        console.log('2.2')

        try {
          let changed = await MovPedidos.findByIdAndUpdate({ _id: data._id }, { ...desc })
          console.log('2.2 - alterado')
        }
        catch (error) {
          console.log('error alterar: ', error)
        }

      }
    })
    console.log('3')



  });

};



module.exports = SalvarPedidos
