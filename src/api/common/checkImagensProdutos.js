const Produtos = require('../ProdutosRoutes/Produtos')
const Erros = require('../ErrosRoutes/Erros')
const User = require('../user/user')
const { Mixed } = require('mongoose')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const criarDelay = require('./criarDelay');

function checkImagensProdutos() {
  return new Promise(async function (resolve, reject) {


    var fabran = mongoose.createConnection('mongodb+srv://admin:admin@fabran-db1-aqtgv.mongodb.net/dados?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
    var kaza = mongoose.createConnection('mongodb+srv://kasadeccormongo:NItAxDZTkmEk1N1Q@kasadb.jrxvcmg.mongodb.net/dados?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
    //await criarDelay(3000)
    //console.log('ESTADO MONGO', mongoose.connection.readyState)

    // stored in 'testA' database
    var ProdutosFabran = fabran.model('produtos', new mongoose.Schema({
      CODIGO: { type: Number, },
      DESCRICAO: { type: String, },
      MARCA: { type: String, },
      EMB: { type: String, },
      UNID: { type: String, },
      ESTOQUE_DISPONIVEL: { type: Number, },
      ESTOQUE_FISICO: { type: Number, },
      CUSTO_NF: { type: Number, },
      CUSTO_FINAL: { type: Number, },
      MARKUP_CADASTRO: { type: Number, },
      MARKUP_REAL: { type: Number, },
      DIF_MARGEM: { type: Number, },
      VALOR_VENDA: { type: Number, },
      CODIGO_DE_BARRAS: { type: String, },
      DATA_DE_CADASTRO: { type: Date, },
      PESO: { type: Number, },
      INATIVO: { type: Boolean },
      STATUS: { type: String, },
      ENCOMENDA: { type: String, },
      dist: { type: Array, default: [] },
      status_item: { type: Number, default: 0 },
      productImages: { type: Array, default: [] },
      productAmbientes: { type: Array, default: [] },
      productClientes: { type: Array, default: [] },
      specs: { type: Array, default: [] },
      promocao: { type: Boolean },
      detalhesPromocao: { type: Mixed },
      lotes: { type: Array, default: [] },
    }));

    // stored in 'testB' database
    var ProdutosKaza = kaza.model('produtos', new mongoose.Schema({
      CODIGO: { type: Number, },
      DESCRICAO: { type: String, },
      MARCA: { type: String, },
      EMB: { type: String, },
      UNID: { type: String, },
      ESTOQUE_DISPONIVEL: { type: Number, },
      ESTOQUE_FISICO: { type: Number, },
      CUSTO_NF: { type: Number, },
      CUSTO_FINAL: { type: Number, },
      MARKUP_CADASTRO: { type: Number, },
      MARKUP_REAL: { type: Number, },
      DIF_MARGEM: { type: Number, },
      VALOR_VENDA: { type: Number, },
      CODIGO_DE_BARRAS: { type: String, },
      DATA_DE_CADASTRO: { type: Date, },
      PESO: { type: Number, },
      INATIVO: { type: Boolean },
      STATUS: { type: String, },
      ENCOMENDA: { type: String, },
      dist: { type: Array, default: [] },
      status_item: { type: Number, default: 0 },
      productImages: { type: Array, default: [] },
      productAmbientes: { type: Array, default: [] },
      productClientes: { type: Array, default: [] },
      specs: { type: Array, default: [] },
      promocao: { type: Boolean },
      detalhesPromocao: { type: Mixed },
      lotes: { type: Array, default: [] },
    }));


    //console.log('ESTADO MONGO', fabran.connection.readyState)

    ProdutosFabran.find(
      {
        $or: [{ "productImages.0": { "$exists": true } }, { "productAmbientes.0": { "$exists": true } }, { "productClientes.0": { "$exists": true } }],
        $and: [{
          lastUpdate: {
            $gte: moment().subtract(3, 'days')
          }
        }]
        //CODIGO: 660022
      }).exec(function (err, fabran) {

        if (fabran.length > 0) {
          //console.log('total fabran', fabran.length)
          // console.log('Fabran inicio: ', moment())

          for (let i in fabran) {
            // console.log('codigo fabran', fabran[i].CODIGO)


            ProdutosKaza.findOne({ CODIGO: fabran[i].CODIGO }, function (err, user) {

              if (user) {
                let change = false

                if (fabran[i].productAmbientes !== undefined && fabran[i].productAmbientes.length > 0) {

                  let productAmbientes = fabran[i].productAmbientes

                  for (let i in productAmbientes) {

                    let existe = false

                    for (let j in user.productAmbientes) {
                      if (productAmbientes[i].url == user.productAmbientes[j].url) {
                        existe = true
                      }

                    }


                    if (!existe) {
                      change = true
                      user.productAmbientes.push({ ...productAmbientes[i] })
                    }
                  }

                }

                if (fabran[i].productClientes !== undefined && fabran[i].productClientes.length > 0) {


                  let productClientes = fabran[i].productClientes

                  for (let i in productClientes) {

                    let existe = false

                    for (let j in user.productClientes) {
                      if (productClientes[i].url == user.productClientes[j].url) {
                        existe = true


                      }
                    }

                    if (!existe) {
                      change = true
                      user.productClientes.push({ ...productClientes[i] })
                    }
                  }


                }


                if (fabran[i].productImages !== undefined && fabran[i].productImages.length > 0) {


                  let productImages = fabran[i].productImages

                  for (let i in productImages) {

                    let existe = false

                    for (let j in user.productImages) {
                      if (productImages[i].url == user.productImages[j].url) {
                        existe = true


                      }
                    }

                    if (!existe) {
                      change = true
                      user.productImages.push({ ...productImages[i] })
                    }
                  }




                }




                if (change) {

                  // console.log('teve alteraçoes kazadeccor: ', user.CODIGO)

                  user.save(function (err) {
                    if (err) {
                      console.error('ERROR!', err);

                    }
                  });

                }
                else {
                  // console.log('não teve alteraçoes')


                }

              }


            });



          }
          // console.log('Fabran fim: ', moment())




        }else {
          //console.log('deu erro', err)
          if(err) {

            //console.log('deu erro', err)
          }
        }

      })
    ProdutosKaza.find({
      $or: [{ "productImages.0": { "$exists": true } }, { "productAmbientes.0": { "$exists": true } }, { "productClientes.0": { "$exists": true } }],
      $and: [{
        lastUpdate: {
          $gte: moment().subtract(3, 'days')
        }
      }]
      //CODIGO:660022
    }).exec(function (err, kaza) {

      //console.log('tamanho kaza: ', kaza.length)

      if (kaza.length > 0) {


        for (let i in kaza) {


          ProdutosFabran.findOne({ CODIGO: kaza[i].CODIGO }, function (err, user) {

            if (user) {

              let change = false

              if (kaza[i].productAmbientes !== undefined && kaza[i].productAmbientes.length > 0) {

                let productAmbientes = kaza[i].productAmbientes

                for (let i in productAmbientes) {

                  let existe = false

                  for (let j in user.productAmbientes) {
                    if (productAmbientes[i].url == user.productAmbientes[j].url) {
                      existe = true
                    }

                  }


                  if (!existe) {
                    change = true
                    user.productAmbientes.push({ ...productAmbientes[i] })
                  }
                }

              }

              if (kaza[i].productClientes !== undefined && kaza[i].productClientes.length > 0) {


                let productClientes = kaza[i].productClientes

                for (let i in productClientes) {

                  let existe = false

                  for (let j in user.productClientes) {
                    if (productClientes[i].url == user.productClientes[j].url) {
                      existe = true


                    }
                  }

                  if (!existe) {
                    change = true
                    user.productClientes.push({ ...productClientes[i] })
                  }
                }


              }


              if (kaza[i].productImages !== undefined && kaza[i].productImages.length > 0) {


                let productImages = kaza[i].productImages

                for (let i in productImages) {

                  let existe = false

                  for (let j in user.productImages) {
                    if (productImages[i].url == user.productImages[j].url) {
                      existe = true


                    }
                  }

                  if (!existe) {
                    change = true
                    user.productImages.push({ ...productImages[i] })
                  }
                }




              }




              if (change) {

                //  console.log('teve alteraçoes fabran: ', user.CODIGO)

                user.save(function (err) {
                  if (err) {
                    console.error('ERROR!', err);
                  }
                });

              }
              else {
                //  console.log('não teve alteraçoes')

              }

            }

          });



        }




      }




    })

    //console.log(moment())

  }); //-dbquery


};



module.exports = checkImagensProdutos