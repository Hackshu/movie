
import "dotenv/config";

import express, { Request, Response } from "express";
import Ctrluser from "./controller/user"
import bodyParser from "body-parser"
import Joi from "joi"
import MongoStore from "connect-mongo";
import session from "express-session"
import morgan from "morgan"
import { connect } from "mongoose";
import mongo from "./services/mongo"
import expressware from "./middleware/middleware"

const app = express()

app.use(morgan("tiny"))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: "abcde",
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
    },
    store: MongoStore.create({ mongoUrl: "mongodb://localhost/movie", collectionName: "sesions" })


}))



/**
 * creating a user
 */
app.post(
    "/users/create", expressware(async (req: Request, resp: Response) => {
        // create joi schema
        const schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });

        // validating req.body
        await schema.validateAsync(req.body);
        // creating user
        const data = await Ctrluser.create(req.body);
        
    }))

/**
 * authorization
 */
app.post(
    "/users/auth", expressware(async (req: Request, resp: Response) => {
        // create joi schema
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });

        // validating req.body
        await schema.validateAsync(req.body);

        // authenticate user
        const user = await Ctrluser.auth(req.body.email, req.body.password);
       
        // set the user session
        // @ts-ignore
        req.session.user = user;
       return user;
        
    }))


    

app.all("/", (req, resp) => {
    resp.status(200).send({ success: true, message: "Server is working" });
});

app.all("*", (req, resp) => {
    resp.status(404).send({ success: false, message: `given route [${req.method}] ${req.path} not found` });
});


// start mongo
mongo.connect()
    // listen to the express server
    .then(() => {
        app.listen(process.env.PORT)
        console.log(`Listening on ${process.env.PORT}`);
    })

