
const Estoque = require('../EstoqueRoutes/Estoque')
const User = require('../user/user')
//const db = require('./../../config/firebird')
const Firebird = require('node-firebird');
const Erros = require('../ErrosRoutes/Erros')

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

Firebird.attach(options, function (err, dba) {

  if (err)
    throw err;


  db = dba

})



let flag = false

function checkEstoque() {
  return new Promise(async function (resolve, reject) {
    let data1 = '01.01.2020'
    db.query(`
    SELECT Codigo, DataCad, Descricao, Saldo, Cat, cast(Saldo * Cat as double precision) as ValorAgr,
    Saldo As Acumulado, Saldo As Ult_Venda, Saldo As Ult_Compra,
    (select first 1 datafat from tb_pedidosfat fat
    where fat.relitem = a.codigo
    order by datafat desc) As Dvenda,
    DataCad As Dcompra, Status,departamento, (select data_termino
    from tb_promocao pro where pro.codigo=a.relpromo) as dt_termino_promocao,
    Saldo As DiasParado, Inativo, cast(1 as integer) as Agrupar From tb_produtos a Where 1 = 1
    and a.saldo > 0
    and Coalesce(a.Inativo, 'N') = 'N' and coalesce(PROD_DEST_CONSUMO,'N') = 'N' and
    not exists (select relitem FROM tb_pedidosfat WHERE
    datafat between '${data1}' and cast('now' as date) and a.codigo = relitem )
    and a.DataCad < '01.01.2020' ORDER BY 6 desc;
    `, async function (err, result) {
      if (result) {
       //console.log('Quantidade de dados da query (ESTOQUE PARADO): ' + result.length)

        for (let i in result) {
          var query = {
            $and: [
              {
                CODIGO: result[i].CODIGO
              }
            ]
          },

            update = {
              DESCRICAO: result[i].DESCRICAO,
              DATACAD: result[i].DATACAD,
              SALDO: result[i].SALDO,
              CAT: result[i].CAT,
              VALORAGR: result[i].VALORAGR,
              ACUMULADO: result[i].ACUMULADO,
              ULT_VENDA: result[i].ULT_VENDA,
              ULT_COMPRA: result[i].ULT_COMPRA,
              DVENDA: result[i].DVENDA,
              DCOMPRA: result[i].DCOMPRA,
              STATUS: result[i].STATUS,
              DEPARTAMENTO: result[i].DEPARTAMENTO,
              DT_TERMINO_PROMOCAO: result[i].DT_TERMINO_PROMOCAO,
              DIASPARADO: result[i].DIASPARADO,
              INATIVO: result[i].INATIVO,
              AGRUPAR: result[i].AGRUPAR,
            },
            options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
          // Find the document

          try {
            let save = await Estoque.findOneAndUpdate(query, update, options).exec();
          } catch (err) {
            var query = {}
            var update = {
              tipo: 'ESTOQUE',
              data: moment().format('D.M.YYYY'),
              hora: moment().format('HH:mm'),
              erro: err
            }
            var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            let save = await Erros.findOneAndUpdate(query, update, options).exec();
            console.log('Erro - ', err)
          }

        }

        //resolve(console.log('Total de estoque parado atualizado'))
        resolve()

      }

      else {
        console.log('Erro - ', err)
        var query = {}
        var update = {
          tipo: 'ESTOQUE',
          data: moment().format('D.M.YYYY'),
          hora: moment().format('HH:mm'),
          erro: err
        }
        var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
        let save = await Erros.findOneAndUpdate(query, update, options).exec();
        db.detach()
      }

    }); //-dbquery

  });


}
module.exports = checkEstoque