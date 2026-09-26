import dns from 'dns';
import mongoose from "mongoose";
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = process.env.MongoDb_URI;

export const connect_database = async () => {
    if (!uri) {
        console.error("MongoDB URI is Required");
        return;
    }

    try {
        await mongoose.connect(uri, {
            dbName: "Nook-Social-App"
        });
        console.log("mongoose is connected");
    } catch (error) {
        console.error(error);
        console.log("mongoose is disconnected");
    }
};