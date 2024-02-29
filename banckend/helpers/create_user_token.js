const jwt = require("jsonwebtoken");

const createUserToken = async(user,req,res) => {

    const token = jwt.sign({
        name: user.name,
        id: user._id
    },"nossosecret"); //Esse secret serve para proteger melhor o token


    //return token
    res.status(200).json({
        mensage: "Você está autenticado",
        token: token,
        userId: user._id,
    })



}

module.exports = createUserToken;