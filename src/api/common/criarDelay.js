
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');

fs = require('fs');


function criarDelay(tempo) {
  return new Promise(async function (resolve, reject) {

    setTimeout(() => {

      resolve()
    
    }, tempo)
  

  });

};



module.exports = criarDelay