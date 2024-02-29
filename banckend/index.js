const express = require('express');
const cors = require('cors');
const UserRoutes = require('./routes/UserRoutes');



const app = express();


//Configuração JSON response
app.use(express.json());


//Resolvendo cors para fazer requisição no mesmo local que está rodando a api
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));


//Pasta publica para receber imagens
app.use(express.static('public'));



//Rotas ("Routes")
app.use('/users', UserRoutes);


app.listen(5000);