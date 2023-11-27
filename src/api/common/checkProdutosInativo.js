const Produtos = require('../ProdutosRoutes/Produtos')
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

function checkProdutosInativos(erro, db) {
  return new Promise(async function (resolve, reject) {
    //  Firebird.attach(options, async function (err, db) {
    if (erro == undefined && db) {
      db.query(`
    select
    w.codigo,
    w.descricao,
    y.desc_linha as Marca,
    w.caixa as Emb,
    w.unid,
    w.disp as Estoque_Disponivel,
    w.saldo as Estoque_Fisico,
    w.p_tabela Custo_NF,
    w.cat as Custo_Final,
    w.margem_venda as Markup_Cadastro,
    --cast(((w.valorp-w.cat)/w.cat)*100 as numeric(15,2)) as Markup_Real,
    --cast(((w.valorp-w.cat)/w.cat)*100 as numeric(15,2))-w.margem_venda as Dif_Margem,
    w.valorp as Valor_Venda,
    w.gtin as Codigo_de_Barras,
    w.datacad as Data_de_Cadastro,
    (select first 1 datafat from tb_pedidosfat fat
      where fat.relitem = w.codigo
      order by datafat desc) As ULTIMA_VENDA,
      (select first 1 data_emissao from tb_estoque est
      where est.relmovestq = w.codigo and est.movto = 'E' and est.tipo = 'B'
      order by data_emissao desc) As ULTIMA_ENTRADA,
    w.peso_produto as Peso,
    w.inativo,
    w.status,
    w.encomenda
    from tb_produtos w , tb_prod_linha y
    where w.familia = y.codigo
    and w.inativo = 'S'
    and w.ULTMODIF_APP > '${moment().subtract(30, 'days').format('DD.MM.YYYY HH:mm:ss.SSS')}';
    `, async function (err, result) {

        if (!err) {
          if (result.length > 0) {
             //console.log('Quantidade de dados da query (PRODUTOS INATIVO): ' + result.length)
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
                  DESCRICAO: result[i].DESCRICAO,
                  MARCA: result[i].MARCA,
                  EMB: result[i].EMB,
                  UNID: result[i].UNID,
                  ESTOQUE_DISPONIVEL: result[i].ESTOQUE_DISPONIVEL,
                  ESTOQUE_FISICO: result[i].ESTOQUE_FISICO,
                  CUSTO_NF: result[i].CUSTO_NF,
                  CUSTO_FINAL: result[i].CUSTO_FINAL,
                  MARKUP_CADASTRO: result[i].MARKUP_CADASTRO,
                  // MARKUP_REAL: result[i].MARKUP_REAL,
                  // DIF_MARGEM: result[i].DIF_MARGEM,
                  VALOR_VENDA: result[i].VALOR_VENDA,
                  CODIGO_DE_BARRAS: result[i].CODIGO_DE_BARRAS,
                  DATA_DE_CADASTRO: result[i].DATA_DE_CADASTRO,
                  ULTIMA_VENDA: result[i].ULTIMA_VENDA,
                  ULTIMA_ENTRADA: result[i].ULTIMA_ENTRADA,
                  PESO: result[i].PESO,
                  INATIVO: result[i].INATIVO == 'N   ' ? false : true,
                  STATUS: result[i].STATUS,
                  ENCOMENDA: result[i].ENCOMENDA,
                  USA_LOTE: result[i].USA_LOTE == 'S' ? true : false,

                },
                options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
              // Find the document
              try {
                let save = await Produtos.findOneAndUpdate(query, update, options).exec();
              } catch (err) {
                var query = {}
                var update = {
                  tipo: 'PRODUTOS INATIVO',
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
              tipo: 'PRODUTOS INATIVO',
              data: moment().format('D.M.YYYY'),
              hora: moment().format('HH:mm'),
              erro: err
            }
            var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
            let save = await Erros.findOneAndUpdate(query, update, options).exec();
            db.detach()
          }
        }

      })
    }

    //  }); //-fire
  })


};



module.exports = checkProdutosInativos