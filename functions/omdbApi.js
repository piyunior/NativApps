const axios = require('axios').default;
const urlOmdb =
    "http://www.omdbapi.com";

//Función que me permite buscar en OMDB las películas e insertar en la BD de MongoDB

async function insertMovies(dataBase) {
    let params = {
        apikey: '5eec5adc',
        s: 'love',
        y: '2020',
        type: 'movie'
    };
    let resto;
    let size;
    let status;

    size = await (axios.get(urlOmdb, {
        params
    })).then(result => {
        return Number(result.data.totalResults).valueOf();
    });
    resto = size % 10 == 0 ? (size / 10) : ((size + (size % 10)) / 10);

    for (let index = 0; index < resto; index++) {
        doc = await (axios.get(urlOmdb, {
            params: {
                apikey: params.apikey,
                s: params.s,
                y: params.y,
                type: params.type,
                page: index + 1
            }
        })).then(async (document) => {
            //Mapeo los datos que voy a guardar en la colección
            auxArr = document.data.Search.map((x) => {
                return {
                    title: x.Title,
                    year: x.Year,
                    type: x.Type,
                    poster: x.Poster
                }
            });
            dataBase.collection('movielist_202102071230jramos').insertMany(auxArr, (err, res) => {
                if (err) {
                    status = false;
                };
                status = true;
            })
        });
    };
    return Promise.resolve(status);
}

module.exports = {
    insertMovies
}