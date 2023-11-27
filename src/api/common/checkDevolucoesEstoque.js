
const DevolucoesEstoque = require('../DevolucoesEstoqueRoutes/DevolucoesEstoque')
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


// let db
// let err
// Firebird.attach(options, async function (erroF, dba) {
//   db = dba
//   err = erroF
// })

let flag = false
function checkAjusteEstoque(erro, db) {
  return new Promise(async function (resolve, reject) {
    let data1 = moment().add(2, 'days').format('D.M.YYYY')
    let data2 = moment().subtract(2, 'days').format('D.M.YYYY')
    let qtd = 0
    flag = true
    // db = DATABASE
    // Firebird.attach(options, async function (err, db) {
    if (erro == undefined && db) {
      db.query(`
    Select a.Codigo, a.RelEntrega as Cod_Entrega, a.Relcli as CodCli, a.NomeCli, a.Tipo as Tipo_Entrega,
    a.Valor, a.Data, a.Cod_Vend, a.Nome_Vend, a.Operador, a.Data_Edicao, 
    a.Hora_Edicao, a.RelVenda, a.Custo, cast(a.motivo as varchar(1000) character set utf8) as Obs_Devolucao, a.NF, d.relitem as CODIGO_PRODUTO,
    d.descricao, d.unitario, d.cat, d.preco, d.qtd  ,
    ---x.data_edicao,    --nao consegui trazer a data da venda--
    case when m.motivo is null then
        'SEM MOTIVO'
    else
        m.motivo
    end as desc_motivo
    From TB_DEVOLUCAO a --, tb_pedidos x
    left join TB_DEVS_MOTIVO m on m.codigo = a.rel_motivo
    left join tb_movdevolucao d on d.rel = a.codigo
    Where a.Data between cast('${data2}' as date) and cast('${data1}' as date) and coalesce(a.finalizada,1) = 1
    and (a.Filial <= 0 Or a.Filial is Null)
    --and a.relvenda = x.codigo   -- nao consegui relacionar a tabela--
    --Order by a.Nome_Vend, a.RelVenda
    Order by a.codigo

    `, async function (err, result) {

        if (!err) {

          if (result.length > 0) {
            //console.log('Quantidade de dados da query (dev estoque): ' + result.length)

            let prevPed = ' '
            let desc = {}
            desc.PRODUTOS = []
            prevPed = result[0].CODIGO

            for (let i in result) {
              if (result[i].CODIGO == prevPed) {


                desc.CODIGO = result[i].CODIGO,
                  desc.COD_ENTREGA = result[i].COD_ENTREGA,
                  desc.CODCLI = result[i].CODCLI,
                  desc.NOMECLI = result[i].NOMECLI,
                  desc.TIPO_ENTREGA = result[i].TIPO_ENTREGA,
                  desc.VALOR = result[i].VALOR,
                  desc.DATA = result[i].DATA,
                  desc.COD_VEND = result[i].COD_VEND,
                  desc.NOME_VEND = result[i].NOME_VEND,
                  desc.OPERADOR = result[i].OPERADOR,
                  desc.DATA_EDICAO = result[i].DATA_EDICAO,
                  desc.HORA_EDICAO = result[i].HORA_EDICAO,
                  desc.RELVENDA = result[i].RELVENDA,
                  desc.OBS_DEVOLUCAO = result[i].OBS_DEVOLUCAO,
                  desc.NF = result[i].NF,
                  desc.DESC_MOTIVO = result[i].DESC_MOTIVO,


                  desc.PRODUTOS.push({

                    CUSTO: result[i].CUSTO,
                    CODIGO_PRODUTO: result[i].CODIGO_PRODUTO,
                    DESCRICAO: result[i].DESCRICAO,
                    UNITARIO: result[i].UNITARIO,
                    CAT: result[i].CAT,
                    PRECO: result[i].PRECO,
                    QTD: result[i].QTD,
                    DATA: result[i].DATA,
                    CODIGO: result[i].CODIGO,
                    OBS_DEVOLUCAO: result[i].OBS_DEVOLUCAO,
                    DESC_MOTIVO: result[i].DESC_MOTIVO,
                  })

              }

              else {
                let findPed = {}
                let saved = {}
                try {

                  findPed = await DevolucoesEstoque.find({ CODIGO: desc.CODIGO }).exec()

                } catch (err) {
                  console.log('Erro ao buscar produto novo: ' + desc.CODIGO)
                }

                if (findPed.length == 0) {
                  let devolucoesEstoque = new DevolucoesEstoque(desc);
                  try {
                    saved = await devolucoesEstoque.save()
                    qtd++

                  }
                  catch (err) {
                    console.log('Erro ao inserir produto novo: ' + desc.CODIGO + err)
                  }

                }

                desc = {}
                desc.PRODUTOS = []
                desc.CODIGO = result[i].CODIGO,
                  desc.COD_ENTREGA = result[i].COD_ENTREGA,
                  desc.CODCLI = result[i].CODCLI,
                  desc.NOMECLI = result[i].NOMECLI,
                  desc.TIPO_ENTREGA = result[i].TIPO_ENTREGA,
                  desc.VALOR = result[i].VALOR,
                  desc.DATA = result[i].DATA,
                  desc.COD_VEND = result[i].COD_VEND,
                  desc.NOME_VEND = result[i].NOME_VEND,
                  desc.OPERADOR = result[i].OPERADOR,
                  desc.DATA_EDICAO = result[i].DATA_EDICAO,
                  desc.HORA_EDICAO = result[i].HORA_EDICAO,
                  desc.RELVENDA = result[i].RELVENDA,
                  desc.OBS_DEVOLUCAO = result[i].OBS_DEVOLUCAO,
                  desc.NF = result[i].NF,
                  desc.DESC_MOTIVO = result[i].DESC_MOTIVO,
                  desc.PRODUTOS = []


                desc.PRODUTOS.push({
                  CUSTO: result[i].CUSTO,
                  CODIGO_PRODUTO: result[i].CODIGO_PRODUTO,
                  DESCRICAO: result[i].DESCRICAO,
                  UNITARIO: result[i].UNITARIO,
                  CAT: result[i].CAT,
                  PRECO: result[i].PRECO,
                  QTD: result[i].QTD,
                  DATA: result[i].DATA,
                  CODIGO: result[i].CODIGO,
                  OBS_DEVOLUCAO: result[i].OBS_DEVOLUCAO,
                  DESC_MOTIVO: result[i].DESC_MOTIVO,

                })

              }
              prevPed = result[i].CODIGO

            } // end for

            let findPed = {}
            let saved = {}
            try {

              findPed = await DevolucoesEstoque.find({ CODIGO: desc.CODIGO }).exec()

            } catch (err) {
              console.log('Erro ao buscar produto novo: ' + desc.CODIGO)
            }

            if (findPed.length == 0) {
              let devolucoesEstoque = new DevolucoesEstoque(desc);
              try {
                saved = await devolucoesEstoque.save()
                qtd++

              }
              catch (err) {
                console.log('Erro ao inserir produto: ' + desc.CODIGO + err)
              }

            }

            // resolve(console.log('Quantidade de produtos inseridos: ' + qtd))
            //   db.detach()
            resolve()
          }
        }
        else {


          console.log('Erro - ', err)
          var query = {}
          var update = {
            tipo: 'DevEstoque',
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



module.exports = checkAjusteEstoque