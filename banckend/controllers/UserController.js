
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createUserToken = require('../helpers/create_user_token');
const getToken = require('../helpers/get_token');
const getUserByToken = require('../helpers/get_user_by_token');


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
            await createUserToken(newUser,req,res);
        }catch(err){

            res.status(500).json({menssage: `Usuário não registrado: ${err}`});
            
        }
    }


    static async login(req,res){
        const email = req.body.email;
        const password = req.body.password;

        if(!email){
            res.status(422).json({menssage: `O e-mail é obrigatório`});
            return;
        }
        if(!password){
            res.status(422).json({menssage: `A senha é obrigatória`});
            return;
        }

        //verificando se o usuário está cadastrado de fato no sistema
        const user = await User.findOne({email: email}); //procura usuário pelo e-mail no banco de dados
        if(!user){ 
            res.status(422).json({menssage: `E-mail ou senha inserido está incorreto (200)`});
            return;
        }
        
        //verificando se a senha está correta, usando o bcrypt
        const passwordCheck = await bcrypt.compare(password,user.password); //utiliza bcrypt para verificar se a senha inserida está correta, uma vez que "user.password" seria o hash da senha produido pelo bcrypt armazenado no banco de dados
        if(!passwordCheck){
            res.status(422).json({menssage: `E-mail ou senha inserido está incorreto (201)`});
            return;
        }

        await createUserToken(user,req,res);
        
    }




    static async userCheck(req,res){ //verificar usário e extrair os atributos dele a partir do token de autenticação

        let currentUser;

        if(req.headers.authorization){
            const token = getToken(req); // passa a requisicao por parametro para pegar o "parametro" authentication e assim conseguir extrair somente o token
            const decoded = jwt.verify(token,'nossosecret'); // utiliza o secret setado no helpers/create_user_token.js 
            currentUser = await User.findById(decoded.id) //depois de jwt descriptografar ele retornar o objeto e aqui é pego o objeto do usuário no banco
            currentUser.password = undefined; // retira a senha por segurança

        } else{
            currentUser = null;
        }
        res.status(200).send(currentUser);
    }


    static async getUserById(req,res){

        const id = req.params.id;

        const user = await User.findById(id).select("-password"); //retira o campo senha para segurança

        if(!user){
            res.status(422).json({menssage: `Usuário não encontrado`});
            return;
        }
        res.status(200).json({ user });
    }


    static async editUser(req,res){

        // const id = req.params.id;
        const { name, email, phone, password, confirmpassword } = req.body;
        let image = '';

        const token = getToken(req);
        const user = await getUserByToken(token);


        if(!name){
            res.status(422).json({menssage: `O nome é obrigatório`});
            return;
        }
        user.name = name;

        if(!email){
            res.status(422).json({menssage: `O e-mail é obrigatório`});
            return;
        }

        const userExists = await User.findOne({email: email});

        if(user.email !== email && userExists){

            res.status(422).json({menssage: `Informe outro e-mail!`});
            return;

        }

        user.email = email;


        if(!phone){
            res.status(422).json({menssage: `O telefone é obrigatório`});
            return;
        }

        user.phone = phone;

        //verificando se as senhas conferem
        if (password != confirmpassword) {
            res.status(422).json({ error: 'As senhas não conferem.' });
            return;
            // mudando senha
        } else if (password == confirmpassword && password != null) {
            // criando senha e inserindo no usuário
            const salt = await bcrypt.genSalt(12);
            const reqPassword = req.body.password;
      
            const passwordHash = await bcrypt.hash(reqPassword, salt);
      
            user.password = passwordHash;
        }
        
        
        try {
            //atualizando de fato o usuário
            await User.findOneAndUpdate(
              { _id: user._id },
              { $set: user },
              { new: true },
            )
            res.status(200).json({menssage: `Usuário atualizado com sucesso!`});

        } catch (error) {

            res.status(500).json({ message: error });
            return;
        }
        
        
        
    }
    


}