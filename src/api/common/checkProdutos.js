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

function checkProdutos(erro, db) {
  return new Promise(async function (resolve, reject) {
    // console.log('total produtos')
    //console.log(db)
    // Firebird.attach(options, async function (err, db) {
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
    w.familia as familia,
    w.departamento as departamento,
    w.divisao as divisao,
    w.relgrupos as relgrupos,
    w.fornecedor as fornecedor,
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
    w.encomenda,
    w.usa_lote
    from tb_produtos w , tb_prod_linha y
    where 
    w.familia = y.codigo 
    and (w.inativo = 'N')
    and w.ULTMODIF_APP > '${moment().subtract(2, 'days').format('DD.MM.YYYY HH:mm:ss.SSS')}';
    --and w.ULTMODIF_APP > '8.3.2023'
    --and w.codigo = '990875';
    `, async function (err, result) {

        if (!err) {
          if (result.length > 0) {
            let totalupdt = 0
           // console.log('total produtos', result.length)
            //cast('now' as date)

            for (let i in result) {

              //console.log(result[i])

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
                  VALOR_VENDA: result[i].VALOR_VENDA,
                  FAMILIA: result[i].FAMILIA,
                  DIVISAO: result[i].DIVISAO,
                  RELGRUPOS: result[i].RELGRUPOS,
                  DEPARTAMENTO: result[i].DEPARTAMENTO,
                  FORNECEDOR: result[i].FORNECEDOR,
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
                //console.log(update)
                let save = await Produtos.findOneAndUpdate(query, update, options).exec();
                totalupdt++

              } catch (err) {
                var query = {}
                var update = {
                  tipo: 'PRODUTOS',
                  data: moment().format('D.M.YYYY'),
                  hora: moment().format('HH:mm'),
                  erro: err
                }
                var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
                let save = await Erros.findOneAndUpdate(query, update, options).exec();
                console.log('Erro - ', err)
              }
            }
            //db.detach()
            //resolve(console.log('Total de vendas atualizado: ', totalupdt))
            resolve()
          }
          else {
            console.log('Erro - ', err)
            var query = {}
            var update = {
              tipo: 'PRODUTOS',
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

    // }); //-fire
  })


};



module.exports = checkProdutos