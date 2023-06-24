import express from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import { createEntity, findOneWithQuery } from "../../database/db-utilities.js";

const authenticationRouter = express.Router();

authenticationRouter.get('/health', (req, res) => {
    res.send({ 'msg': 'Backend server is up and running...!' });
})

//User Registration
authenticationRouter.post('/register', async (req, res) => {
    const { body:userObj } = req;
    //const userObj = {...body, registered_at: new Date().toISOString()}
    //console.log(userObj)
    var notificationMsg = { 'msg':''}
    bcrypt.hash(userObj.password, 10).then(async function(hash) {
            userObj.password = hash;
            await createEntity('users', userObj);
            notificationMsg.msg = 'User registered successfully';
            return notificationMsg;
    }).then((msg) => res.send({...msg}));
  })

//User Login
authenticationRouter.post('/login', async (req, res) => {
    const { emailId, password } = req.body;
    var notificationMsg = { 'msg':''}
    const userObj = await findOneWithQuery('users', { emailId });
    var response;
    //if user is registered, login & generate token. else, notify to signup
    if(userObj){
        //bcrypt.compare compares the 2 values & returns the result as boolean
        bcrypt.compare(password, userObj.password, (err,isValid) => {
            if(isValid) {
                let responseToken = null;
                // encryption of user in jwt payload
                responseToken = jwt.sign({ ...userObj }, process.env.JWT_KEY, { expiresIn: '1d' });
                delete userObj.password;
                let tokenIssuedAt = Date.now()
                let tokenDate = new Date();
                let tokenExpirationAt = tokenDate.setHours(tokenDate.getHours() + 24)
                //console.log(tokenIssuedAt,tokenExpirationAt)
                notificationMsg.msg = 'Login Successfull'
                // response sends the details of the user
                response = {...notificationMsg,...userObj,accessToken: responseToken, iat: tokenIssuedAt, eat:tokenExpirationAt}
              }
            else {
                notificationMsg.msg = 'Invalid Credentials'
                response = {...notificationMsg}
            }
            res.send({...response})
        });
    }else{
        response = {
            ...notificationMsg,
            msg: 'User not found. Please Sign up'
          }
        res.send({...response})
    }  
  })


export default authenticationRouter;