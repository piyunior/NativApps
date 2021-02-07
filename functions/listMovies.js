// Función que me permite obtener los documentos de la colección almacenada en MongoDB

async function getMovies(dataBase) {
    let data = await dataBase.collection('movielist_202102071230jramos').find({}, { projection: { _id: 0 } }).toArray();
    return data;
}

module.exports = {
    getMovies
}