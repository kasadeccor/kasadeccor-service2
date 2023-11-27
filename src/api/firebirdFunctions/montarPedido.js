
const MovPedidos = require('../MovPedidosRoutes/MovPedidos')
const Erros = require('../ErrosRoutes/Erros')
const Produtos = require('../ProdutosRoutes/Produtos')
const Clientes = require('../ClientesRoutes/Clientes')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
//var PushController = require('./PushController');
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


let db

// Firebird.attach(options, function (err, dba) {

//   if (err)
//     throw err;

//   db = dba

// })


function montarPedido(pedido) {
  return new Promise(async function (resolve, reject) {


   
    let produtosPed = pedido.produtos ? pedido.produtos : []
    
   //console.log(pedido)


    for (let i in produtosPed) {
      try {
        // console.log(produtosPed)
        delete produtosPed[i].ESTOQUE_DISPONIVEL
        delete produtosPed[i].ESTOQUE_FISICO
        // console.log('Pedido', produtos)
        let produto = await Produtos.find({ CODIGO: produtosPed[i].CODIGO }).exec();
        // console.log('Produtos', produtos)
        //console.log(produto)

        let produtoAtual = produto[0].toObject()



       // console.log('produtos ped: ', produtosPed[i])

        produtosPed[i] = { ...produtosPed[i], ...produtoAtual }

       // console.log('produtos ped2 : ', produtosPed[i])


      

        let qtd = produtosPed[i].qtd

        let descPromo = false
        let percPromo = 0

        produtosPed[i].PRECOTOTAL_PRODUTOBRUTO = (qtd * (produtoAtual.VALOR_VENDA))

        produtosPed[i].PERCDESCONTO_PRODUTO = produtosPed[i].PERCDESCONTO_PRODUTO

        if (produtoAtual.promocao == true && produtosPed[i].PERCDESCONTO_PRODUTO == 0) {
          descPromo = true
          produtosPed[i].PERCDESCONTO_PRODUTO = (((produtoAtual.VALOR_VENDA - produtoAtual.detalhesPromocao.VALORPROMO) / produtoAtual.VALOR_VENDA) * 100).toFixed(2)
          produtosPed[i].PERCDESCONTO_PRODUTO = parseFloat(produtosPed[i].PERCDESCONTO_PRODUTO)
        //  console.log('desc', produtosPed[i].PERCDESCONTO_PRODUTO)
        //  console.log('desc2', parseFloat(produtosPed[i].PERCDESCONTO_PRODUTO))
        }

        else if (qtd == 0) {
          produtosPed[i].PERCDESCONTO_PRODUTO = 0
         
        }

       
        produtosPed[i].PRECOTOTAL_PRODUTOLIQUIDO = produtosPed[i].PRECOTOTAL_PRODUTOBRUTO - ((produtosPed[i].PRECOTOTAL_PRODUTOBRUTO) * produtosPed[i].PERCDESCONTO_PRODUTO / 100)
        produtosPed[i].TOTALDESCONTO_PRODUTO = produtosPed[i].PRECOTOTAL_PRODUTOBRUTO - produtosPed[i].PRECOTOTAL_PRODUTOLIQUIDO

        produtosPed[i].CUSTOTOTAL_PRODUTO = qtd * produtoAtual.CUSTO_FINAL
        produtosPed[i].PRECO_UNITARIO = (produtosPed[i].PRECOTOTAL_PRODUTOLIQUIDO / qtd)
        produtosPed[i].PRECO_UNITARIO_OR = produtoAtual.VALOR_VENDA
        produtosPed[i].PESOTOTAL_PRODUTO = qtd * produtoAtual.PESO

        
      } catch (err) {
       resolve({ errors: [err] })
      }
    }
  
    let pedidoFinal = pedido
    pedidoFinal.produtos = produtosPed
    
    // if (pedidoFinal.novoCliente == '') {
    //   let cliente = await Clientes.find({ CODIGO: pedidoFinal.cliente.CODIGO }).exec();

    //   if (cliente.length > 0) {
    //     let cli = cliente[0].toObject()

    //     for (let j in cli.ENDERECOS) {

    //       if (pedidoFinal.cliente.REL_OBRA == cli.ENDERECOS[j].REL_OBRA) {
    //         pedidoFinal.cliente = { ...pedidoFinal.cliente, ...cli.ENDERECOS[j] }
    //       }


    //     }

    //   }
    // }

    pedidoFinal.totalBruto = 0
    pedidoFinal.totalLiquido = 0
    pedidoFinal.desconto = 0
    pedidoFinal.total_custo_final = 0
    pedidoFinal.total_peso = 0
    pedidoFinal.total_comissao_vendedor = 0
    pedidoFinal.totalDesconto = 0

    for (let i in produtosPed) {

        pedidoFinal.totalBruto =  pedidoFinal.totalBruto + (produtosPed[i].PRECOTOTAL_PRODUTOBRUTO)
        pedidoFinal.totalLiquido =  pedidoFinal.totalLiquido + (produtosPed[i].PRECOTOTAL_PRODUTOLIQUIDO)
        pedidoFinal.total_custo_final =  pedidoFinal.total_custo_final + (produtosPed[i].CUSTOTOTAL_PRODUTO)
        pedidoFinal.total_peso =  pedidoFinal.total_peso + (produtosPed[i].PESOTOTAL_PRODUTO)

        pedidoFinal.total_comissao_vendedor =  pedidoFinal.totalLiquido * 0.01

    }

    pedidoFinal.desconto = ((( pedidoFinal.totalBruto -  pedidoFinal.totalLiquido) /  pedidoFinal.totalBruto) * 100).toFixed(2)
    pedidoFinal.totalDesconto =  pedidoFinal.totalBruto -  pedidoFinal.totalLiquido

    resolve(pedidoFinal)


  });

};



module.exports = montarPedido