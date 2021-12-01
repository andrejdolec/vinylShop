const mongoose = require('mongoose');
const Vinyl = require('../models/vinyl');
const axios = require('axios').default;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/vinylShop'

mongoose.connect(dbUrl);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const albums = ['2115147', '2132564', '2114700', '2115030', '2118304', '2109694', '2110743', '2110293', '2110249', '2118223', '2111343', '2118218', '2225938', '2186781'];
const images = ['https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635350277/VinylShop/vinyls/5_mkd214.jpg',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635350277/VinylShop/vinyls/2_myhwbd.jpg',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635350278/VinylShop/vinyls/1_wwbk8y.jpg',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635944359/VinylShop/vinyls/nas-illmatic_7cb9037b-57d6-4874-bbf6-496059aa7d7c_1200x1200_g8weuq.jpg',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635944594/VinylShop/vinyls/notoriousbig-readytodie-blackvinyl-1_fd141989-fd59-4068-b9db-b917f0a2f528_1000x1000_bwx2ti.jpg',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635943607/VinylShop/vinyls/abbeyroad2_akqfoa.jpg',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635943827/VinylShop/vinyls/s-l400_njadxu.jpg',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635944038/VinylShop/vinyls/71O3Gdffg6L_nl5e8w.jpg',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635944152/VinylShop/vinyls/fleetwoodmac-rumours-blackvinyl-1_1000x1000_cklndr.jpg',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635944956/VinylShop/vinyls/16ec24081f5ece55e9177b605fc3c0a8_ztlize.jpg',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635958022/VinylShop/vinyls/81O33JIXReL._SL1500__wj9jxm_l1izjn.png',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635947825/VinylShop/vinyls/81O33JIXReL._SL1500__wj9jxm.jpg',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635948702/VinylShop/vinyls/81hXOhq0jRL._SL1500__enzrlg.jpg',
    'https://res.cloudinary.com/dcsjbuzp0/image/upload/v1635949092/VinylShop/vinyls/20190427170046_1_sbxuzm.jpg']
const prices = [19.99, 39.99];

const seedDB = async () => {
    await Vinyl.deleteMany({});
    for (let i = 0; i < albums.length; i++) {
        try {
            const tracklist = [];
            const res = await axios.get(`https://theaudiodb.com/api/v1/json/2/album.php?m=${albums[i]}`);
            const tracklistRes = await axios.get(`https://theaudiodb.com/api/v1/json/2/track.php?m=${albums[i]}`);
            for (let j = 0; j < tracklistRes.data.track.length; j++) {
                tracklist.push(tracklistRes.data.track[j].strTrack)
            }
            const vinyl = new Vinyl({
                album: res.data.album[0].strAlbum,
                artist: res.data.album[0].strArtist,
                price: prices[Math.floor(Math.random() * 2)],
                available: 10,
                description: res.data.album[0].strDescriptionEN,
                released: res.data.album[0].intYearReleased,
                genre: res.data.album[0].strGenre,
                image: images[i],
                author: '61a657988c41ce30f19c60a9',
                tracklist: tracklist
            });
            await vinyl.save();
        } catch (e) {
            console.log("ERROR!", e)
        }
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})