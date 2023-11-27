
const Retiradas = require('../RetiradasRoutes/Retiradas')
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
//   //console.log('db start 2')
//   db = dba
//   err = erroF
// })

let flag = false
function checkBaixa(erro, db) {
  return new Promise(async function (resolve, reject) {
    let data1 = moment().format('D.M.YYYY')
    let data2 = moment().subtract(3, 'days').format('D.M.YYYY')
    let qtd = 0
    flag = true

    let dbQ = db

   // console.log(erro, db)
    // fs.readFile('dadosretirada.json', 'utf8' , (err, data) => {

    //   obj = JSON.parse(data)
    //   console.log(obj[0])


    // })
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    Retiradas.find({ D_BAIXA: null }).exec(function (err, docs) {
       console.log('Baixa TOTOAL ', docs.length)

      for (let i in docs) {

        //  Firebird.attach(options, async function (err, db) {

        // if (err)
        //   throw err;

        // db = DATABASE
        if (erro == undefined && dbQ) {

         // console.log('call baixa')

          dbQ.query(`
        Select *
        from tb_entrega
        where  codigo  = ${docs[i].REL}
       `, async function (err, result) {

          console.log('check baixa : ', err, result)

            if (!err) {
              if (result.length > 0) {
                // console.log(result)

                if (result[0].D_BAIXA != null) {

                  //  console.log(result[0])

                  try {
                    let save = await Retiradas.findOneAndUpdate({ _id: docs[i]._id }, { D_BAIXA: result[0].D_BAIXA, status_item: 10 }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                  } catch (err) {

                  }

                }
                else {


                }
                // resolve(console.log('Total de vendas atualizado'))
                db.detach()

              }
              else if (err) {

                //console.log(err)

                var query = {}
                var update = {
                  tipo: 'BAIXA',
                  data: moment().format('D.M.YYYY'),
                  hora: moment().format('HH:mm'),
                  erro: err
                }
                var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                let save = await Erros.findOneAndUpdate(query, update, options).exec();
                // db.detach()

              }
            }

           // db.detach()

          })//-dbquery;
        }

        // }); //firebird

      }

    })











  });


};



module.exports = checkBaixa