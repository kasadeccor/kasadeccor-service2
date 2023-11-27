const axios = require('axios');
const User = require('./../user/user')
exports.pushNotification = async function (dados) {

let user = {}

try {

    const user_req = await User.findById({_id: dados.id}).exec()
     user = user_req
}
catch(err)
{console.log(err)}


    const keyToken = 'key=AAAApCcbVao:APA91bFSvmFwsc6Cpj5MYhCCgO3Yv4xhWS1F2a5RN7jmBDv9qdAY3k27sWzG8hSadKjZw0beDV7qvGuSBdxKpKxKH0rNHuSNfQzwTmWyR3xvRZfax3bt3IYyvXgGiJAwAiQYwfPEfxje'
    axios.post(`https://fcm.googleapis.com/fcm/send`, JSON.stringify({
        to: user.pushToken,
        notification: {
            title: dados.header,
            body: dados.msg,
            mutable_content: true,
            sound: "Tri-tone"
            }
    }),  {headers: {
            Authorization: keyToken,
            'Content-Type': 'application/json'      }}
            )
        .catch(err => {

           // console.log('erro' , err)
           
        })
        .then(resp => {

            //console.log('certo' , resp)
            
        })


  
}

