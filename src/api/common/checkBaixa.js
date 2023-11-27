
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
    let codigos = ''

    let dados = await Retiradas.find({ D_BAIXA: null }).exec()

   // console.log('Baixa TOTOAL ', dados.length)


    for (let i in dados) {

      if (i == dados.length - 1) {
        codigos = codigos + ' ' + dados[i].REL
      } else {
        codigos = codigos + ' ' + dados[i].REL + ','
      }


    }
  //   console.log('codigos', `
  //   Select *
  //   from tb_entrega
  //   where  codigo  in (${codigos});
  //  `)

    if (erro == undefined && dbQ) {

     // console.log('call baixa')
      dbQ.query(`
        Select *
        from tb_entrega
        where  codigo  in (${codigos}) and D_BAIXA is not null;
       `, [codigos], async function (err, result) {

       // console.log('check baixa : ', err, result.length)

        if (!err) {
          if (result.length > 0) {
            //console.log(result)

            //  console.log(result[0])

            for (let i in result) {
              try {
                let save = await Retiradas.findOneAndUpdate({ REL: result[i].CODIGO }, { D_BAIXA: result[i].D_BAIXA, status_item: 10 }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
              } catch (err) {

              }

            }

            resolve()
            //db.detach()
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
        } // err

        // db.detach()

      })//-dbquery;




    }

    //  }

  });


};



module.exports = checkBaixa

