const dotenv = require('dotenv');
dotenv.config();

const connectDb = require('./config/Db');

const express = require('express');

const app = express();
const cookieParser = require("cookie-parser");



const AuthUser = require("./Routes/auth.routes")



app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", AuthUser);

connectDb();


app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})