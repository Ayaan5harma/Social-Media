const dotenv = require('dotenv');
dotenv.config({path:"backend/config/.env"})
const express =require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const app = express();

app.use(cors());
app.use(cookieParser());

app.use(express.json());

const port = process.env.PORT;

connectDB(process.env.MONGODB_URI);

const post = require('./routes/post');
const user = require('./routes/user')

app.use('/api/v1',post);
app.use('/api/v1',user);


app.listen(port,()=>{
    console.log(`listening to the requests on ${port}`);
})

