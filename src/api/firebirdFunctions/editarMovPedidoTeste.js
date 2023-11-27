
// const MovPedidos = require('../MovPedidosRoutes/MovPedidos')
// const Erros = require('../ErrosRoutes/Erros')
// //const db = require('./../../config/firebird')
// let moment = require('moment');
// require('moment/locale/pt-br');
// moment.locale('pt-br');
// const Firebird = require('node-firebird');
// const criarDelay = require('../common/criarDelay');
// //var PushController = require('./PushController');
// fs = require('fs');

// let options = {};

// // options.host = '192.168.0.200';
// options.host = '127.0.0.1';
// options.port = 3050;
// // options.database = "C:\\Sistema\\db\\DADOS.FDB";
// options.database = "/Library/Frameworks/Firebird.framework/Versions/A/Resources/examples/empbuild/DADOST.fdb";
// options.user = 'SYSDBA';
// options.password = 'masterkey';
// options.lowercase_keys = false; // set to true to lowercase keys
// options.role = null;            // default
// options.pageSize = 2048;

// let db

// Firebird.attach(options, function (err, dba) {

//   if (err)
//     throw err;

//   db = dba

// })

// function editarMovPedido() {
//   return new Promise(async function (resolve, reject) {

//     Firebird.attach(options, async function (err, db) {
//       if (err)
//         throw err;

//       db.transaction(Firebird.ISOLATION_READ_COMMITTED, function (err, transaction) {

//         transaction.query(`
//         UPDATE TB_PEDIDOS 
//         SET OBS_PED  = (?)
//         WHERE CODIGO = 7 RETURNING CODIGO;`, ['Janko'], async function (err, result) {

//           console.log('RESUL2', result)
//           if (result == undefined) {
//             transaction.rollback();
//             console.log('erro before 2', err)
//             resolve({ erro: err })
//           }
//           else {
//             await criarDelay(30000)
//             transaction.commit(function (err) {
//               if (err) {
//                 console.log('erro after 2', err)
//                 transaction.rollback();
//               }
//               else {
//                 console.log('deu certo 2', err)
//                 resolve({ codigoRESUL: result.CODIGO })
//                 db.detach();
//               }

//             })

//           }

//         })//-dbquery;

//       });

//     });

//   });

// };



// module.exports = editarMovPedido