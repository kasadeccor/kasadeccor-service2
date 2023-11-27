
const Produtos = require('../ProdutosRoutes/Produtos')
const Erros = require('../ErrosRoutes/Erros')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
var PushController = require('../common/PushController');
fs = require('fs');



function makeBackup() {
  return new Promise(async function (resolve, reject) {
    let data1 = moment().format('D.M.YYYY')
    let data2 = moment().subtract(14, 'days').format('D.M.YYYY')
    let qtd = 0
    flag = true



    let save = await Produtos.find({}).exec();

    fs.writeFile('produtosbkp.txt', JSON.stringify(save), function (err) {
      if (err) return console.log(err);
      console.log('deu certo');
    });
  // console.log(save)



resolve()
}); //

};



module.exports = makeBackup