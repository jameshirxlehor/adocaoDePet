const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = class UseController{
    
    static async register(req,res){
        // const name = req.body.name;
        // const email = req.body.email;
        // const phone = req.body.phone;
        // const password = req.body.phone;
        // const confirmpassword = req.body.confirmpassword;
        const {name, email,phone,password,confirmpassword} = req.body; // declaração de váriavel tem o mesmo efeito que o código acima

        //validações
        if(!name){
            res.status(422).json({menssage: `O nome é obrigatório`});
            return;
        }

        if(!email){
            res.status(422).json({menssage: `O e-mail é obrigatório`});
            return;
        }
        if(!phone){
            res.status(422).json({menssage: `O telefone é obrigatório`});
            return;
        }
        if(!password){
            res.status(422).json({menssage: `A senha é obrigatória`});
            return;
        }
        if(!confirmpassword){
            res.status(422).json({menssage: `A confirmação da senha é obrigatório`});
            return;
        }
        if(password !== confirmpassword){
            res.status(422).json({menssage: `A senha e a confirmação da senha precisam ser iguais`});
            return;
        }


        //verificando se o usuário já existe
        const userExists = await User.findOne({email: email});

        if(userExists){
            res.status(422).json({menssage: `E-mail inserido já possui cadastro, tente utilizar outro e-mail.`});
            return;
        }


        //criando a senha do cliente
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password,salt);


        //criando usuário
        const user = User({
            name: name,
            email: email,
            phone: phone,
            password: passwordHash,
        })

        try{
            const newUser = await user.save();
            res.status(201).json({menssage: `Usuário registrado com sucesso`});
            return;
        }catch(err){

            res.status(500).json({menssage: `Usuário não registro: ${err}`});
            
        }


    }
}