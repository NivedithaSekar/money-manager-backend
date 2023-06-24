import express from 'express';
import cors from 'cors';
import DbClient from './database/client-connectivity.js';
import authenticationRouter from './routers/authentication/authentication.js';
import entryRouter from './routers/entries/entry.js'
import jwt from 'jsonwebtoken'
const app = express()

await DbClient.connect();
app.use(express.json());
//While connecting the backend server to frontend react app, received error ->
//Access to XMLHttpRequest at 'http://localhost:5000/auth/health' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
//Therefore, enabling cors in this express backend server
app.use(cors());
app.use("/auth", authenticationRouter);
app.use("/entry", entryRouter);


app.get('/', function (req, res) {
  jwt.verify(req.headers['accesstoken'], process.env.JWT_KEY, async function (err, decoded) {
    if (err) {
      res.send({ msg: 'Please Login!' });
    }else{
        res.send('Hello World');
    }
});
})

app.listen(5000)