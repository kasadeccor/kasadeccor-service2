const Clientes = require('../ClientesRoutes/Clientes')
const Erros = require('../ErrosRoutes/Erros')
const User = require('../user/user')
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
//   db = dba
//   err = erroF
// })


function checkClientes(erro, db) {
  return new Promise(async function (resolve, reject) {
    // Firebird.attach(options, async function (err, db) {s
    if (erro == undefined && db) {
      db.query(`
    select a.*, b.CODIGO as REL_OBRA, tc.NOME as NOME_COND, tc.QTD_PARC,
    b.REL_CLIENTES,
    b.NOME_OBRA,
    b.ENDERECO as ENDERECO_OBRA,
    b.BAIRRO as BAIRRO_OBRA,
    b.CIDADE as CIDADE_OBRA,
    b.RESPONSAVEL as RESPONSAVEL_OBRA,
    b.OBS as OBS_OBRA,
    b.COD_EMP as COD_EMP_OBRA,
    b.NUMERO as NUMERO_OBRA,
    b.COMPLEMENTO as COMPLEMENTO_OBRA,
    b.UF as UF_OBRA,
    b.CEP as CEP_OBRA,
    b.INATIVO 
  from tb_clientes a, tb_cliente_end b, TB_CONDPAGTOCX tc
  where a.CODIGO = b.REL_CLIENTES and b.INATIVO is null AND  DATA_ULTIMA_ATZ_DADOS_CONTATO > cast('${moment().subtract(20, 'days').format('D.M.YYYY')}' as date)
  AND a.TABELA = tc.CODIGO
  order by a.CODIGO desc
    `, async function (err, result) {

      //console.log(err, result)
        if (!err) {

          if (result.length > 0) {

            //console.log('cliente', result.length)

            let prevPed = ' '
            let cliente = {}
            cliente.ENDERECOS = []
            prevPed = result[0].CODIGO

            for (let i in result) {

              if (result[i].CODIGO == prevPed) {

                cliente.CODIGO = parseInt(result[i].CODIGO),
                  cliente.BAIR_CLI = result[i].BAIR_CLI,
                  cliente.CID_CLI = result[i].CID_CLI,
                  cliente.NOME_CLI = result[i].NOME_CLI,
                  cliente.END_CLI = result[i].END_CLI,
                  cliente.UF_CLI = result[i].UF_CLI,
                  cliente.CEP_CLI = result[i].CEP_CLI,
                  cliente.FONE1_CLI = result[i].FONE1_CLI,
                  cliente.FONE2_CLI = result[i].FONE2_CLI,
                  cliente.NASC_CLI = result[i].NASC_CLI,
                  cliente.EMAIL_CLI = result[i].EMAIL_CLI,
                  cliente.ORG_CLI = result[i].ORG_CLI,
                  cliente.CPF_CLI = result[i].CPF_CLI,
                  cliente.SEXO_CLI = result[i].SEXO_CLI,
                  cliente.FANTAS = result[i].FANTAS,
                  cliente.NACIONALIDADE = result[i].NACIONALIDADE,
                  cliente.ESTADO_CIVIL = result[i].ESTADO_CIVIL,
                  cliente.NR_CLI = result[i].NR_CLI,
                  cliente.COMPLEMENTO_CLI = result[i].COMPLEMENTO_CLI,
                  cliente.STATUS_CLI = result[i].STATUS_CLI,
                  cliente.PESSOA = result[i].PESSOA,
                  cliente.REL_OBRA = result[i].REL_OBRA,
                  cliente.TABELA = result[i].TABELA,
                  cliente.COND = result[i].NOME_COND,
                  cliente.QTD_PARC = result[i].QTD_PARC,

                  cliente.ENDERECOS.push({
                    REL_OBRA: result[i].REL_OBRA,
                    REL_CLIENTES: result[i].REL_CLIENTES,
                    NOME_OBRA: result[i].NOME_OBRA,
                    ENDERECO_OBRA: result[i].ENDERECO_OBRA,
                    BAIRRO_OBRA: result[i].BAIRRO_OBRA,
                    CIDADE_OBRA: result[i].CIDADE_OBRA,
                    RESPONSAVEL_OBRA: result[i].RESPONSAVEL_OBRA,
                    OBS_OBRA: result[i].OBS_OBRA,
                    COD_EMP_OBRA: result[i].COD_EMP_OBRA,
                    NUMERO_OBRA: result[i].NUMERO_OBRA,
                    COMPLEMENTO_OBRA: result[i].COMPLEMENTO_OBRA,
                    UF_OBRA: result[i].UF_OBRA,
                    CEP_OBRA: result[i].CEP_OBRA,
                    INATIVO: result[i].INATIVO
                  })

              }

              else {
                let findPed = {}
                let saved = {}
                // try {

                //   console.log('clientes', cliente)

                //   findPed = await Clientes.find({ CODIGO: cliente.CODIGO }).exec()

                // } catch (err) {
                //   console.log('Erro ao buscar produto: ' + cliente.PEDIDO)
                // }

                // if (findPed.length == 0) {
                //   let clientes = new Clientes(cliente);
                //   try {
                //     saved = await clientes.save()
                //     qtd++
                //   }
                //   catch (err) {
                //     //console.log('Erro ao inserir cliente: ' + desc.PEDIDO + err)
                //   }

                // } else
                // {
                var query = {
                  $and: [
                    {
                      CODIGO: cliente.CODIGO
                    }
                  ]
                },
                  update = {
                    ...cliente
                  },
                  options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                // Find the document
                try {
                  let save = await Clientes.findOneAndUpdate(query, update, options).exec();
                } catch (err) {
                  var query = {}
                  var update = {
                    tipo: 'Clientes',
                    data: moment().format('D.M.YYYY'),
                    hora: moment().format('HH:mm'),
                    erro: err
                  }
                  var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                  let save = await Erros.findOneAndUpdate(query, update, options).exec();
                  console.log('Erro - ', err)
                }


                // }

                cliente = {}
                cliente.ENDERECOS = []


                cliente.CODIGO = parseInt(result[i].CODIGO),
                  cliente.BAIR_CLI = result[i].BAIR_CLI,
                  cliente.CID_CLI = result[i].CID_CLI,
                  cliente.NOME_CLI = result[i].NOME_CLI,
                  cliente.END_CLI = result[i].END_CLI,
                  cliente.UF_CLI = result[i].UF_CLI,
                  cliente.CEP_CLI = result[i].CEP_CLI,
                  cliente.FONE1_CLI = result[i].FONE1_CLI,
                  cliente.FONE2_CLI = result[i].FONE2_CLI,
                  cliente.NASC_CLI = result[i].NASC_CLI,
                  cliente.EMAIL_CLI = result[i].EMAIL_CLI,
                  cliente.ORG_CLI = result[i].ORG_CLI,
                  cliente.CPF_CLI = result[i].CPF_CLI,
                  cliente.SEXO_CLI = result[i].SEXO_CLI,
                  cliente.FANTAS = result[i].FANTAS,
                  cliente.NACIONALIDADE = result[i].NACIONALIDADE,
                  cliente.ESTADO_CIVIL = result[i].ESTADO_CIVIL,
                  cliente.NR_CLI = result[i].NR_CLI,
                  cliente.COMPLEMENTO_CLI = result[i].COMPLEMENTO_CLI,
                  cliente.STATUS_CLI = result[i].STATUS_CLI,
                  cliente.PESSOA = result[i].PESSOA,
                  cliente.REL_OBRA = result[i].REL_OBRA,
                  cliente.TABELA = result[i].TABELA,
                  cliente.COND = result[i].NOME_COND,
                  cliente.QTD_PARC = result[i].QTD_PARC,

                  cliente.ENDERECOS.push({
                    REL_OBRA: result[i].REL_OBRA,
                    REL_CLIENTES: result[i].REL_CLIENTES,
                    NOME_OBRA: result[i].NOME_OBRA,
                    ENDERECO_OBRA: result[i].ENDERECO_OBRA,
                    BAIRRO_OBRA: result[i].BAIRRO_OBRA,
                    CIDADE_OBRA: result[i].CIDADE_OBRA,
                    RESPONSAVEL_OBRA: result[i].RESPONSAVEL_OBRA,
                    OBS_OBRA: result[i].OBS_OBRA,
                    COD_EMP_OBRA: result[i].COD_EMP_OBRA,
                    NUMERO_OBRA: result[i].NUMERO_OBRA,
                    COMPLEMENTO_OBRA: result[i].COMPLEMENTO_OBRA,
                    UF_OBRA: result[i].UF_OBRA,
                    CEP_OBRA: result[i].CEP_OBRA,
                    INATIVO: result[i].INATIVO
                  })

              }

              prevPed = result[i].CODIGO

            } // end for
            var query = {
              $and: [
                {
                  CODIGO: cliente.CODIGO
                }
              ]
            },
              update = {
                ...cliente
              },
              options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            // Find the document
            try {
              let save = await Clientes.findOneAndUpdate(query, update, options).exec();
            } catch (err) {
              var query = {}
              var update = {
                tipo: 'Clientes',
                data: moment().format('D.M.YYYY'),
                hora: moment().format('HH:mm'),
                erro: err
              }
              var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
              let save = await Erros.findOneAndUpdate(query, update, options).exec();
              console.log('Erro - ', err)
            }
            // let findPed = {}
            // let saved = {}
            // try {

            //   findPed = await Clientes.find({  CODIGO: cliente.CODIGO }).exec()

            // } catch (err) {
            //   //console.log('Erro ao buscar produto: ' + desc.PEDIDO)
            // }

            // if (findPed.length == 0) {
            //   let clientes = new Clientes(cliente);
            //   try {
            //     saved = await clientes.save()
            //     qtd++
            //   }
            //   catch (err) {
            //     //console.log('Erro ao inserir produto: ' + desc.PEDIDO + err)
            //   }
            // }
            // resolve(console.log('Quantidade de produtos inseridos: ' + qtd))
          //  db.detach()
            resolve()


          }
        }
        else {

          console.log('Erro - ', err)
          var query = {}
          var update = {
            tipo: 'Clientes',
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




    // }); //-firebird
  })


};



module.exports = checkClientes