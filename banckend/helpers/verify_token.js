const jwt = require('jsonwebtoken');
const getToken = require('./get_token');


// middleware que valida token
const checkToken = (req, res, next) => {

    if(!req.headers.authorization){
        return res.status(401).json({menssage: 'Acesso não autorizado!'});
    }



    const token = getToken(req);

    if(!token){
        return res.status(401).json({menssage: 'Acesso não autorizado!'});
    }


    try{

        const verified = jwt.verify(token,'nossosecret');
        req.user = verified;
        next();


    }catch (err) {

        return res.status(400).json({menssage: 'Token inválido!'});

    }

}

module.exports = checkToken;