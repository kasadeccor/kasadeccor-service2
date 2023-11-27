
const Retiradas = require('../RetiradasRoutes/Retiradas')
const User = require('../user/user')

const Erros = require('../ErrosRoutes/Erros')
//const db = require('./../../config/firebird')
let moment = require('moment');
require('moment/locale/pt-br');
moment.locale('pt-br');
const Firebird = require('node-firebird');
var PushController = require('./PushController');
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


// let db
// let err
// Firebird.attach(options, async function (erroF, dba) {
//   db = dba
//   err = erroF
// })

let flag = false
function checkRetiradas(erro, db) {
  return new Promise(async function (resolve, reject) {
    let data1 = moment().add(2, 'days').format('D.M.YYYY')
    let data2 = moment().subtract(2, 'days').format('D.M.YYYY')
    let qtd = 0

    // Firebird.attach(options, async function (err, db) {

    if (!erro && db) {
      db.query(`
    Select distinct a.RelCli, a.RelObra, a.Entregue, a.Valor,cr.data_edicao as data_crediario,cr.hora_edicao as hora_crediario,
    a.NomeCli, a.Codigo, a.RelVenda, a.Data, a.Vendedor, a.ObraProg,
    a.D_Entrega, a.Obs, a.Impresso, b.Bairro, b.Cidade, a.tipo,
    
    coalesce(b.endereco,'')||' '||coalesce(b.numero,'') as endereco,
    a.cod_emp, a.totalrec_local, a.encomenda, a.separado, a.nr_projeto, a.nr_etapa_projeto, a.periodo_entr,
    a.local_logistica, a.unid_entrega, a.conferido, a.numeronotafiscal, a.relnf,
    
     m.*,
      case
        when (m.rel_prodlote > 0) then
          (select e.descricao from tb_produtos_estoque_lote e where e.codigo = m.rel_prodlote)
        else null
      end as DescrLote
    
    from tb_entrega a left join tb_cliente_end b On a.RelObra = b.Codigo left join tb_municipios s on s.nome_setor = b.cidade
    left join tb_bairro ba on b.bairro = ba.bairro and ba.codcid = s.codigo
    left join tb_pedidos pd on a.relvenda = pd.codigo
    left join tb_crediario cr on a.relvenda = cr.rel_ped
    left join S_MOVENTREGA_ENCOM(a.codigo) m on m.rel = a.codigo
    where a.Entregue = 0 And Tipo = 'E' and coalesce(a.ObraProg,'N') = 'N' --and coalesce(a.local_logistica,0) = :CodUnidade --in (0,1,2,3,4,5)    -- = :CodUnidade
     and cr.data_edicao > cast('${data2}' as date)
    Order By a.D_Entrega, a.RelCli, a.Codigo
    `, async function (err, result) {


        if (!err) {
          if (result.length > 0) {
           // console.log('RETIRADASSS: ' + result.length)

            let users = []

            try {
              users = await User.find({
                $or: [
                  { tipoUsuario: 2 },
                  { tipoUsuario: 4 }
                ]
              }).exec()

            } catch (err) {
              //console.log('Erro ao buscar produto novo: ' + desc.REL)
            }


            let prevPed = ' '
            let desc = {}
            desc.PRODUTOS = []
            prevPed = result[0].REL

            for (let i in result) {
              if (result[i].REL == prevPed) {

                desc.VALOR = result[i].VALOR

                let hora = result[i].HORA_CREDIARIO.split(':')
                let datahora = moment(result[i].DATA_CREDIARIO).set('hour', hora[0]).set('minute', hora[1])
                desc.TIMESTAMP = datahora
                desc.DATA_CREDIARIO = result[i].DATA_CREDIARIO
                desc.HORA_CREDIARIO = result[i].HORA_CREDIARIO
                desc.NOMECLI = result[i].NOMECLI
                desc.RELVENDA = result[i].RELVENDA
                desc.DATA = result[i].DATA
                desc.VENDEDOR = result[i].VENDEDOR
                desc.D_ENTREGA = result[i].D_ENTREGA
                desc.OBS = result[i].OBS
                desc.BAIRRO = result[i].BAIRRO
                desc.CIDADE = result[i].CIDADE
                desc.TIPO = result[i].TIPO
                desc.ENDERECO = result[i].ENDERECO
                desc.LOCAL_LOGISTICA = result[i].LOCAL_LOGISTICA
                desc.REL = result[i].REL

                desc.PRODUTOS.push({
                  RELITEM: result[i].RELITEM,
                  DESCRICAO: result[i].DESCRICAO,
                  CAT: result[i].CAT,
                  QTD: result[i].QTD,
                  QTD_2: result[i].QTD_2,
                  UNITARIO: result[i].UNITARIO,
                  PRECO: result[i].PRECO,
                })

              }

              else {
                let findPed = {}
                let saved = {}
                try {

                  findPed = await Retiradas.find({ REL: desc.REL }).exec()

                } catch (err) {
                  console.log('Erro ao buscar produto novo: ' + desc.REL)
                }

                if (findPed.length == 0) {

                  let retiradas = new Retiradas(desc);


                  try {
                    saved = await retiradas.save()



                    if (desc.LOCAL_LOGISTICA == 3) {
                      //Retira balcao


                      if (moment(desc.TIMESTAMP).isBefore(moment().subtract(10, 'minutes'))) {



                        for (let i in users) {

                          let push = {}
                          push.id = users[i]._id
                          push.header = "ALERTA! Entrega sem baixa!"
                          let message = desc.LOCAL_LOGISTICA == 0 ? 'Central' : desc.LOCAL_LOGISTICA == 1 ? 'Expedição' : desc.LOCAL_LOGISTICA == 2 ? 'Pendências' : desc.LOCAL_LOGISTICA == 3 ? 'Retira Balcão' : desc.LOCAL_LOGISTICA == 4 ? 'Retira Expedição' : desc.LOCAL_LOGISTICA == 91 ? 'Retira no caixa' : desc.LOCAL_LOGISTICA == 92 ? ' Futura' : ' '
                          push.msg = 'Pedido: ' + desc.RELVENDA + ' - Vendedor: ' + desc.VENDEDOR + ' - Tipo: ' + message
                          // console.log(push.msg)
                          PushController.pushNotification(push)
                        }

                        try {
                          let save = await Retiradas.findOneAndUpdate({ REL: desc.REL }, { push: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                        } catch (err) {

                        }

                      }

                    }

                    if (desc.LOCAL_LOGISTICA == 4) {

                      if (moment(desc.TIMESTAMP).isBefore(moment().subtract(60, 'minutes'))) {



                        for (let i in users) {

                          let push = {}
                          push.id = users[i]._id
                          push.header = "ALERTA! Entrega sem baixa!"
                          let message = desc.LOCAL_LOGISTICA == 0 ? 'Central' : desc.LOCAL_LOGISTICA == 1 ? 'Expedição' : desc.LOCAL_LOGISTICA == 2 ? 'Pendências' : desc.LOCAL_LOGISTICA == 3 ? 'Retira Balcão' : desc.LOCAL_LOGISTICA == 4 ? 'Retira Expedição' : desc.LOCAL_LOGISTICA == 91 ? 'Retira no caixa' : desc.LOCAL_LOGISTICA == 92 ? ' Futura' : ' '
                          push.msg = 'Pedido: ' + desc.RELVENDA + ' - Vendedor: ' + desc.VENDEDOR + ' - Tipo: ' + message
                          // console.log(push.msg)
                          PushController.pushNotification(push)
                        }
                        try {
                          let save = await Retiradas.findOneAndUpdate({ REL: desc.REL }, { push: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                        } catch (err) {

                        }


                      }


                    }

                    if (desc.LOCAL_LOGISTICA == 91) {

                      //Retira Caixa


                      for (let i in users) {

                        let push = {}
                        push.id = users[i]._id
                        push.header = "ALERTA! Entrega sem baixa!"
                        let message = desc.LOCAL_LOGISTICA == 0 ? 'Central' : desc.LOCAL_LOGISTICA == 1 ? 'Expedição' : desc.LOCAL_LOGISTICA == 2 ? 'Pendências' : desc.LOCAL_LOGISTICA == 3 ? 'Retira Balcão' : desc.LOCAL_LOGISTICA == 4 ? 'Retira Expedição' : desc.LOCAL_LOGISTICA == 91 ? 'Retira no caixa' : desc.LOCAL_LOGISTICA == 92 ? ' Futura' : ' '
                        push.msg = 'Pedido: ' + desc.RELVENDA + ' - Vendedor: ' + desc.VENDEDOR + ' - Tipo: ' + message
                        // console.log(push.msg)
                        PushController.pushNotification(push)
                      }
                      try {
                        let save = await Retiradas.findOneAndUpdate({ REL: desc.REL }, { push: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                      } catch (err) {

                      }


                    }

                    if (desc.LOCAL_LOGISTICA == 92) {

                      //Futura


                      for (let i in users) {

                        let push = {}
                        push.id = users[i]._id
                        push.header = "ALERTA! Entrega sem baixa!"
                        let message = desc.LOCAL_LOGISTICA == 0 ? 'Central' : desc.LOCAL_LOGISTICA == 1 ? 'Expedição' : desc.LOCAL_LOGISTICA == 2 ? 'Pendências' : desc.LOCAL_LOGISTICA == 3 ? 'Retira Balcão' : desc.LOCAL_LOGISTICA == 4 ? 'Retira Expedição' : desc.LOCAL_LOGISTICA == 91 ? 'Retira no caixa' : desc.LOCAL_LOGISTICA == 92 ? ' Futura' : ' '
                        push.msg = 'Pedido: ' + desc.RELVENDA + ' - Vendedor: ' + desc.VENDEDOR + ' - Tipo: ' + message
                        // console.log(push.msg)
                        PushController.pushNotification(push)
                      }
                      try {
                        let save = await Retiradas.findOneAndUpdate({ REL: desc.REL }, { push: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                      } catch (err) {

                      }

                    }



                    qtd++

                  }
                  catch (err) {
                    console.log('Erro ao inserir produto novo: ' + desc.REL + err)
                  }

                }

                else {

                  if (findPed[0].LOCAL_LOGISTICA != desc.LOCAL_LOGISTICA) {
                    //console.log('alterou local: ', findPed[0].REL,findPed[0].LOCAL_LOGISTICA, desc.LOCAL_LOGISTICA  )
                    try {
                      let save = await Retiradas.findOneAndUpdate({ _id: findPed[0]._id }, { LOCAL_LOGISTICA: desc.LOCAL_LOGISTICA }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                    } catch (err) {

                    }

                  }

                  if (findPed[0].PRODUTOS.length != desc.PRODUTOS.length) {
                    try {
                      //console.log('alterou produtos: ', findPed[0].REL )
                      let save = await Retiradas.findOneAndUpdate({ _id: findPed[0]._id }, { PRODUTOS: desc.PRODUTOS }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                    } catch (err) {

                    }

                  } else {

                    let produtosCloud = findPed[0].PRODUTOS
                    //let change = false

                    for (let i in produtosCloud) {

                      if (produtosCloud[i].RELITEM != desc.PRODUTOS[i].RELITEM || produtosCloud[i].QTD != desc.PRODUTOS[i].QTD) {
                        // console.log('alterou produtos2: ', findPed[0].REL )
                        try {
                          let save = await Retiradas.findOneAndUpdate({ _id: findPed[0]._id }, { PRODUTOS: desc.PRODUTOS }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                        } catch (err) {

                        }

                      }

                    }

                  }

                  if (desc.LOCAL_LOGISTICA == 3) {
                    //Retira balcao


                    if ((moment(desc.TIMESTAMP).isBefore(moment().subtract(10, 'minutes'))) && (findPed[0].push == false)) {

                      for (let i in users) {
                        //  
                        let push = {}
                        push.id = users[i]._id
                        push.header = "ALERTA! Entrega sem baixa!"
                        let message = desc.LOCAL_LOGISTICA == 0 ? 'Central' : desc.LOCAL_LOGISTICA == 1 ? 'Expedição' : desc.LOCAL_LOGISTICA == 2 ? 'Pendências' : desc.LOCAL_LOGISTICA == 3 ? 'Retira Balcão' : desc.LOCAL_LOGISTICA == 4 ? 'Retira Expedição' : desc.LOCAL_LOGISTICA == 91 ? 'Retira no caixa' : desc.LOCAL_LOGISTICA == 92 ? ' Futura' : ' '
                        push.msg = 'Pedido: ' + desc.RELVENDA + ' - Vendedor: ' + desc.VENDEDOR + ' - Tipo: ' + message
                        // console.log(push.msg)
                        PushController.pushNotification(push)
                      }
                      try {
                        let save = await Retiradas.findOneAndUpdate({ _id: findPed[0]._id }, { push: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                      } catch (err) {

                      }

                    }

                  }

                  if (desc.LOCAL_LOGISTICA == 4) {


                    if ((moment(desc.TIMESTAMP).isBefore(moment().subtract(60, 'minutes'))) && (findPed[0].push == false)) {



                      for (let i in users) {
                        // 
                        let push = {}
                        push.id = users[i]._id
                        push.header = "ALERTA! Entrega sem baixa!"
                        let message = desc.LOCAL_LOGISTICA == 0 ? 'Central' : desc.LOCAL_LOGISTICA == 1 ? 'Expedição' : desc.LOCAL_LOGISTICA == 2 ? 'Pendências' : desc.LOCAL_LOGISTICA == 3 ? 'Retira Balcão' : desc.LOCAL_LOGISTICA == 4 ? 'Retira Expedição' : desc.LOCAL_LOGISTICA == 91 ? 'Retira no caixa' : desc.LOCAL_LOGISTICA == 92 ? ' Futura' : ' '
                        push.msg = 'Pedido: ' + desc.RELVENDA + ' - Vendedor: ' + desc.VENDEDOR + ' - Tipo: ' + message
                        // console.log(push.msg)
                        PushController.pushNotification(push)
                      }
                      try {
                        let save = await Retiradas.findOneAndUpdate({ _id: findPed[0]._id }, { push: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                      } catch (err) {

                      }

                    }

                  }

                }

                desc = {}
                desc.PRODUTOS = []

                desc.VALOR = result[i].VALOR
                let hora = result[i].HORA_CREDIARIO.split(':')
                let datahora = moment(result[i].DATA_CREDIARIO).set('hour', hora[0]).set('minute', hora[1])
                desc.TIMESTAMP = datahora
                desc.DATA_CREDIARIO = result[i].DATA_CREDIARIO
                desc.HORA_CREDIARIO = result[i].HORA_CREDIARIO
                desc.NOMECLI = result[i].NOMECLI
                desc.RELVENDA = result[i].RELVENDA
                desc.DATA = result[i].DATA
                desc.VENDEDOR = result[i].VENDEDOR
                desc.D_ENTREGA = result[i].D_ENTREGA
                desc.OBS = result[i].OBS
                desc.BAIRRO = result[i].BAIRRO
                desc.CIDADE = result[i].CIDADE
                desc.TIPO = result[i].TIPO
                desc.ENDERECO = result[i].ENDERECO
                desc.LOCAL_LOGISTICA = result[i].LOCAL_LOGISTICA
                desc.REL = result[i].REL
                desc.PRODUTOS = []


                desc.PRODUTOS.push({
                  RELITEM: result[i].RELITEM,
                  DESCRICAO: result[i].DESCRICAO,
                  CAT: result[i].CAT,
                  QTD: result[i].QTD,
                  QTD_2: result[i].QTD_2,
                  UNITARIO: result[i].UNITARIO,
                  PRECO: result[i].PRECO,

                })

              }
              prevPed = result[i].REL

            } // end for


            let findPed = {}
            let saved = {}
            try {

              findPed = await Retiradas.find({ REL: desc.REL }).exec()

            } catch (err) {
              console.log('Erro ao buscar produto novo: ' + desc.REL)
            }

            if (findPed.length == 0) {
              // console.log('retirou')
              let retiradas = new Retiradas(desc);


              try {
                saved = await retiradas.save()



                if (desc.LOCAL_LOGISTICA == 3) {
                  //Retira balcao


                  if (moment(desc.TIMESTAMP).isBefore(moment().subtract(10, 'minutes'))) {


                    for (let i in users) {

                      let push = {}
                      push.id = users[i]._id
                      push.header = "ALERTA! Entrega sem baixa!"
                      let message = desc.LOCAL_LOGISTICA == 0 ? 'Central' : desc.LOCAL_LOGISTICA == 1 ? 'Expedição' : desc.LOCAL_LOGISTICA == 2 ? 'Pendências' : desc.LOCAL_LOGISTICA == 3 ? 'Retira Balcão' : desc.LOCAL_LOGISTICA == 4 ? 'Retira Expedição' : desc.LOCAL_LOGISTICA == 91 ? 'Retira no caixa' : desc.LOCAL_LOGISTICA == 92 ? ' Futura' : ' '
                      push.msg = 'Pedido: ' + desc.RELVENDA + ' - Vendedor: ' + desc.VENDEDOR + ' - Tipo: ' + message
                      // console.log(push.msg)
                      PushController.pushNotification(push)
                    }
                    try {
                      let save = await Retiradas.findOneAndUpdate({ REL: desc.REL }, { push: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                    } catch (err) {

                    }

                  }

                }

                if (desc.LOCAL_LOGISTICA == 4) {

                  if (moment(desc.TIMESTAMP).isBefore(moment().subtract(60, 'minutes'))) {


                    for (let i in users) {

                      let push = {}
                      push.id = users[i]._id
                      push.header = "ALERTA! Entrega sem baixa!"
                      let message = desc.LOCAL_LOGISTICA == 0 ? 'Central' : desc.LOCAL_LOGISTICA == 1 ? 'Expedição' : desc.LOCAL_LOGISTICA == 2 ? 'Pendências' : desc.LOCAL_LOGISTICA == 3 ? 'Retira Balcão' : desc.LOCAL_LOGISTICA == 4 ? 'Retira Expedição' : desc.LOCAL_LOGISTICA == 91 ? 'Retira no caixa' : desc.LOCAL_LOGISTICA == 92 ? ' Futura' : ' '
                      push.msg = 'Pedido: ' + desc.RELVENDA + ' - Vendedor: ' + desc.VENDEDOR + ' - Tipo: ' + message
                      // console.log(push.msg)
                      PushController.pushNotification(push)
                    }
                    try {
                      let save = await Retiradas.findOneAndUpdate({ REL: desc.REL }, { push: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                    } catch (err) {

                    }


                  }


                }

                if (desc.LOCAL_LOGISTICA == 91) {

                  //Retira Caixa

                  for (let i in users) {

                    let push = {}
                    push.id = users[i]._id
                    push.header = "ALERTA! Entrega sem baixa!"
                    let message = desc.LOCAL_LOGISTICA == 0 ? 'Central' : desc.LOCAL_LOGISTICA == 1 ? 'Expedição' : desc.LOCAL_LOGISTICA == 2 ? 'Pendências' : desc.LOCAL_LOGISTICA == 3 ? 'Retira Balcão' : desc.LOCAL_LOGISTICA == 4 ? 'Retira Expedição' : desc.LOCAL_LOGISTICA == 91 ? 'Retira no caixa' : desc.LOCAL_LOGISTICA == 92 ? ' Futura' : ' '
                    push.msg = 'Pedido: ' + desc.RELVENDA + ' - Vendedor: ' + desc.VENDEDOR + ' - Tipo: ' + message
                    // console.log(push.msg)
                    PushController.pushNotification(push)
                  }
                  try {
                    let save = await Retiradas.findOneAndUpdate({ REL: desc.REL }, { push: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                  } catch (err) {

                  }


                }

                if (desc.LOCAL_LOGISTICA == 92) {

                  //Futura

                  for (let i in users) {

                    let push = {}
                    push.id = users[i]._id
                    push.header = "ALERTA! Entrega sem baixa!"
                    let message = desc.LOCAL_LOGISTICA == 0 ? 'Central' : desc.LOCAL_LOGISTICA == 1 ? 'Expedição' : desc.LOCAL_LOGISTICA == 2 ? 'Pendências' : desc.LOCAL_LOGISTICA == 3 ? 'Retira Balcão' : desc.LOCAL_LOGISTICA == 4 ? 'Retira Expedição' : desc.LOCAL_LOGISTICA == 91 ? 'Retira no caixa' : desc.LOCAL_LOGISTICA == 92 ? ' Futura' : ' '
                    push.msg = 'Pedido: ' + desc.RELVENDA + ' - Vendedor: ' + desc.VENDEDOR + ' - Tipo: ' + message
                    // console.log(push.msg)
                    PushController.pushNotification(push)
                  }
                  try {
                    let save = await Retiradas.findOneAndUpdate({ REL: desc.REL }, { push: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                  } catch (err) {

                  }

                }



                qtd++

              }
              catch (err) {
                console.log('Erro ao inserir produto novo: ' + desc.REL + err)
              }

            }

            else {

              if (findPed[0].LOCAL_LOGISTICA != desc.LOCAL_LOGISTICA) {
                // console.log('alterou local: ', findPed[0].REL,findPed[0].LOCAL_LOGISTICA, desc.LOCAL_LOGISTICA  )
                try {
                  let save = await Retiradas.findOneAndUpdate({ _id: findPed[0]._id }, { LOCAL_LOGISTICA: desc.LOCAL_LOGISTICA }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                } catch (err) {

                }

              }

              if (findPed[0].PRODUTOS.length != desc.PRODUTOS.length) {
                try {
                  //  console.log('alterou produtos: ', findPed[0].REL )
                  let save = await Retiradas.findOneAndUpdate({ _id: findPed[0]._id }, { PRODUTOS: desc.PRODUTOS }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                } catch (err) {

                }

              } else {

                let produtosCloud = findPed[0].PRODUTOS
                //let change = false

                for (let i in produtosCloud) {

                  if (produtosCloud[i].RELITEM != desc.PRODUTOS[i].RELITEM || produtosCloud[i].QTD != desc.PRODUTOS[i].QTD) {
                    try {
                      // console.log('alterou produtos2: ', findPed[0].REL )
                      let save = await Retiradas.findOneAndUpdate({ _id: findPed[0]._id }, { PRODUTOS: desc.PRODUTOS }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                    } catch (err) {

                    }

                  }

                }

              }

              if (desc.LOCAL_LOGISTICA == 3) {
                //Retira balcao


                if ((moment(desc.TIMESTAMP).isBefore(moment().subtract(10, 'minutes'))) && (findPed[0].push == false)) {


                  for (let i in users) {

                    let push = {}
                    push.id = users[i]._id
                    push.header = "ALERTA! Entrega sem baixa!"
                    let message = desc.LOCAL_LOGISTICA == 0 ? 'Central' : desc.LOCAL_LOGISTICA == 1 ? 'Expedição' : desc.LOCAL_LOGISTICA == 2 ? 'Pendências' : desc.LOCAL_LOGISTICA == 3 ? 'Retira Balcão' : desc.LOCAL_LOGISTICA == 4 ? 'Retira Expedição' : desc.LOCAL_LOGISTICA == 91 ? 'Retira no caixa' : desc.LOCAL_LOGISTICA == 92 ? ' Futura' : ' '
                    push.msg = 'Pedido: ' + desc.RELVENDA + ' - Vendedor: ' + desc.VENDEDOR + ' - Tipo: ' + message
                    // console.log(push.msg)
                    PushController.pushNotification(push)
                  }
                  try {
                    let save = await Retiradas.findOneAndUpdate({ _id: findPed[0]._id }, { push: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                  } catch (err) {

                  }

                }

              }

              if (desc.LOCAL_LOGISTICA == 4) {



                if ((moment(desc.TIMESTAMP).isBefore(moment().subtract(60, 'minutes'))) && (findPed[0].push == false)) {


                  for (let i in users) {

                    let push = {}
                    push.id = users[i]._id
                    push.header = "ALERTA! Entrega sem baixa!"
                    let message = desc.LOCAL_LOGISTICA == 0 ? 'Central' : desc.LOCAL_LOGISTICA == 1 ? 'Expedição' : desc.LOCAL_LOGISTICA == 2 ? 'Pendências' : desc.LOCAL_LOGISTICA == 3 ? 'Retira Balcão' : desc.LOCAL_LOGISTICA == 4 ? 'Retira Expedição' : desc.LOCAL_LOGISTICA == 91 ? 'Retira no caixa' : desc.LOCAL_LOGISTICA == 92 ? ' Futura' : ' '
                    push.msg = 'Pedido: ' + desc.RELVENDA + ' - Vendedor: ' + desc.VENDEDOR + ' - Tipo: ' + message
                    // console.log(push.msg)
                    PushController.pushNotification(push)
                  }
                  try {
                    let save = await Retiradas.findOneAndUpdate({ _id: findPed[0]._id }, { push: true }, { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false }).exec();
                  } catch (err) {

                  }

                }

              }

            }

            // db.detach()
            resolve()
          }
        }
        else {

          console.log('Erro - ', err)
          var query = {}
          var update = {
            tipo: 'RETIRADA',
            data: moment().format('D.M.YYYY'),
            hora: moment().format('HH:mm'),
            erro: err
          }
          var options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
          let save = await Erros.findOneAndUpdate(query, update, options).exec();
          //db.detach()
        }

      })
    }

    // }); //fire
  })


};



module.exports = checkRetiradas