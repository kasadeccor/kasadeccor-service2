

const bodyParser = require('body-parser')
const express = require('express')
const server = express()
const allowCors = require('./cors')
const queryParser = require('express-query-int')
const path = require('path');
const cors = require('cors');
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');


// const checkDesconto = require('./../api/common/checkDesconto')
// const checkVendas = require('./../api/common/checkVendas')
// const checkDifMargem = require('../api/common/checkDifMargem')
// const checkProdutos = require('../api/common/checkProdutos')
// const checkLiberacao = require('../api/common/checkLiberacao')
// const checkDevolucoes = require('../api/common/checkDevolucoes')
// const checkAjusteEstoque = require('../api/common/checkAjusteEstoque')
// const checkDevolucoesEstoque = require('../api/common/checkDevolucoesEstoque')
// const checkEntradaProdutos = require('../api/common/checkEntradaProdutos')
// const checkRetiradas = require('../api/common/checkRetiradas.js')
// const checkBaixa = require('../api/common/checkBaixa.js')
// const checkProdutosInativo = require('../api/common/checkProdutosInativo.js')
const checkProdutosDiario = require('../api/common/checkProdutosDiario.js')
// const checkPromocoes = require('../api/common/checkPromocoes.js')
// const checkLotes = require('../api/commonBkps/checkLotes.js')
// // const deleteLotes = require('../api/common/deleteLotes.js')
// const checkImagensProdutos = require('../api/common/checkImagensProdutos.js')
// const checkClientes = require('../api/common/checkClientes.js')
// const checkMovPedidos = require('../api/common/checkMovPedidos.js')
// // const checkPedidosAberto = require('../api/common/checkPedidosAberto.js')
// const checkPedidos = require('../api/commonBkps/checkPedidos.js')
// const checkVendedores = require('../api/common/checkVendedores.js')
// const Vendas = require('../api/VendasRoutes/Vendas')
// const checkPedidosAberto = require('../api/common/checkPedidosAberto')
const checkPedidosDaily = require('../api/common/checkPedidosDaily')
// const checkPedidosNoturno = require('../api/common/checkPedidosNoturno')
// // const makeBackup = require('../api/common/makeBackup')
// const checkPedidosCancelados = require('../api/common/checkPedidosDaily')
// // const checkPedidosDaily = require('../api/common/checkPedidosDaily')
// const checkOrcamentos = require('../api/commonBkps/checkOrcamentos')




server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())
server.use(cors());
server.options('*', cors());
//server.use(allowCors)
server.use(queryParser())


// setInterval(() => {
//   checkMovPedidos()
// }, 5000)

// setInterval(() => {
//   checkPedidosAberto()
// }, 5000)

// setInterval(() => {
//   checkRetiradas()
//   checkVendas()
//   checkVendedores()
//   checkPedidosDaily()
//  // checkPedidosNoturno()
// }, 10000)

// setInterval(() => {
//   checkProdutos()
//   checkProdutosDiario()
//   checkProdutosInativo()
//   checkPromocoes()
// }, 10000)

// setInterval(() => {
//   checkAjusteEstoque()
//   checkEntradaProdutos()
//   checkLiberacao()
// }, 10000)

// setInterval(() => {
//   checkClientes()
//   checkBaixa()
//   checkDesconto()
// }, 10000)

// setInterval(() => {
//   checkDifMargem()
//   checkDevolucoes(moment().format('D.M.YYYY'))
//   checkDevolucoesEstoque()
// }, 10000)

let produto = false
let statusApp = false
/*****************  INICIO SERVIÇOS ******************/

//-------------
const Firebird = require('node-firebird');
const criarDelay = require('../api/common/criarDelay')
const checkVendasOnDemand = require('../api/common/checkVendasOnDemand')
let options = {};
options.host = '192.168.0.200';
options.port = 3050;
options.database = "C:\\Sistema\\db\\DADOS.FDB";
options.user = 'SYSDBA';
options.password = 'masterkey';
options.lowercase_keys = false; // set to true to lowercase keys
options.role = null;            // default
options.pageSize = 2048;

Firebird.attach(options, async function (err, db) {


  setInterval(async () => {
    if (moment().hour() > 0 && moment().hour() < 23) {
      checkProdutosDiario(err, db)
    }
  }, 9200)

  // setInterval(() => {
  //   if (moment().hour() > 0 && moment().hour() < 23) {
  //     checkPedidosDaily(err, db)
  //   }
  // }, 6932)




  // setTimeout(async () => {
  //    await checkVendasOnDemand(err, db, moment("10/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("11/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("12/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("13/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("14/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("15/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("16/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("17/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("18/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("19/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("20/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("21/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("22/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("23/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("24/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("25/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("26/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("27/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("28/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("29/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("30/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))
  //    await criarDelay(1000)
  //    await checkVendasOnDemand(err, db, moment("31/7/2023", "DD/MM/YYYY").format('D.M.YYYY'))

  // }, 2432)


  setInterval(() => {
    if (moment().hour() > 0 && moment().hour() < 21) {
      console.log('sair exit', moment().hour())
      process.exit(1)
    }
  }, 10800000)

})


/*****************  FIM SERVIÇOS ******************/


server.listen(3020, () => {
  console.log(`BACKEND is running on port ${3020}.`)
})

module.exports = server