const express = require("express");
const bodyParser = require("body-parser");
const mongo = require("mongodb");
const client = require('mongodb').MongoClient;

const app = express();

const omdbapi = require('./functions/omdbApi.js');
const movies = require('./functions/listMovies.js');

const url =
    "mongodb+srv://nativapps_test:Curramba2020@omdb-movies.es1o0.mongodb.net/<OMDb-Movies>?retryWrites=true&w=majority";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*")
    res.removeHeader('X-Powered-By')
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    next()

});

app.get("/get_movies", async (req, res, next) => {
    await client.connect(url, async (err, db) => {
        if (err) {
            res.status(401).json({
                status: "Fail",
                message: 'No tiene autorización a la base de datos.'
            });
            next();
        } else {
            let bd = db.db("OMDb-Movies");
            //Consulto si existe la colección, para no insertar data duplicada.
            bd.listCollections({ "name": "movielist_Fecha(202102071230)jramos" }).next(async (err, coll) => {
                if (coll) {
                    //Si existe la colección, solo busco los datos;
                    let document = await movies.getMovies(bd);
                    res.status(200).json({
                        status: 'Ok',
                        document: document,
                        count: document.length
                    });
                    next();
                } else {
                    //Si no existe la colección inserto los datos.
                    let status = await omdbapi.insertMovies(bd);
                    if (status) {
                        let document = await movies.getMovies(bd);
                        res.status(200).json({
                            status: 'Ok',
                            document: document,
                            count: document.length
                        });
                        next();
                    }
                }
            })
        }
    })
});

app.listen(process.env.PORT || 3000, () => {
    console.log(' API is listening on port ', process.env.PORT || 3000)
})