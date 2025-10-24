const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const getConnect = async () => {
    try {
        await mongoose.connect("mongodb+srv://newton1727:newton1728@cluster0.rnbkcz2.mongodb.net/");
        console.log("Mongoose Connected Successfully");
        
    } catch (error) {
        console.log(error);
        
    }
}

module.exports = getConnect;