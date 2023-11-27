const Liberacao = require('../LiberacaoRoutes/Liberacao')
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
const fs = require('fs');

// let db
// let err
// Firebird.attach(options, async function (erroF, dba) {
//   db = dba
//   err = erroF
// })


function checkLiberacao(erro, db) {
  return new Promise(async function (resolve, reject) {

    //console.log(db)
    let data1 = moment().add(2, 'days').format('D.M.YYYY')
    let data2 = moment().subtract(2, 'days').format('D.M.YYYY')

    //  Firebird.attach(options, async function (err, db) {
    if (erro == undefined && db) {

     // console.log('call liberacao')
      db.query(`
    select 
    x.codigo, x.data, x.relacionamento, x.tabela,
    x.rel_user_lib, d.usuario, x.processo, 
    x.nome_tela, x.descricao, x.nome_permissao,
    x.nome_form, x.rel_user_logado,
    x.modulo, x.acesso_negado,
    x.descr_negacao, x.user_inexistente
    from tb_liberacao x , tb_usuarios d
    where x.rel_user_lib = d.codigo
    and x.data between cast('${data2}' as date) and cast('${data1}' as date)
    and x.relacionamento > 0;
    `, async function (err, result) {

      console.log(err)
        if (!err) {
         // console.log('Quantidade de dados da query (Liberação): ' + result.length)
          //cast('now' as date)
          for (let i in result) {
            var query = {
              $and: [
                {
                  CODIGO: result[i].CODIGO
                }
              ]
            },
              update = {
                DATA: result[i].DATA,
                RELACIONAMENTO: result[i].RELACIONAMENTO,
                TABELA: result[i].TABELA,
                REL_USER_LIB: result[i].REL_USER_LIB,
                USUARIO: result[i].USUARIO,
                PROCESSO: result[i].PROCESSO,
                NOME_TELA: result[i].NOME_TELA,
                DESCRICAO: result[i].DESCRICAO,
                NOME_PERMISSAO: result[i].NOME_PERMISSAO,
                NOME_FORM: result[i].NOME_FORM,
                REL_USER_LOGADO: result[i].REL_USER_LOGADO,
                MODULO: result[i].MODULO,
                ACESSO_NEGADO: result[i].ACESSO_NEGADO,
                DESCR_NEGACAO: result[i].DESCR_NEGACAO,
                USER_INEXISTENTE: result[i].USER_INEXISTENTE,
              },
              options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            // Find the document
            try {
              let save = await Liberacao.findOneAndUpdate(query, update, options).exec();
            } catch (err) {
              var query = {}
              var update = {
                tipo: 'LIBERACAO',
                data: moment().format('D.M.YYYY'),
                hora: moment().format('HH:mm'),
                erro: err
              }
              var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
              let save = await Erros.findOneAndUpdate(query, update, options).exec();
              console.log('Erro - ', err)
            }
          }
          // resolve(console.log('Total de vendas atualizado'))
          // db.detach()
          resolve()
        }
        else {
          console.log('Erro - ', err)
          var query = {}
          var update = {
            tipo: 'LIBERACAO',
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

    // }); //-fire
  })


};



module.exports = checkLiberacao
