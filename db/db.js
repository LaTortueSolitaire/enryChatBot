/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var settings = require('../config/settings.js');

// Connection URL
var db = settings.db;
var url = 'mongodb://'+db.host+':'+db.port;

// Database Name
var dbName = db.name;

// Connection to the server
function getUser(cardId, callback){
    MongoClient.connect(url, function(err, client){
        console.log("connectDatabase");
        //assert.equal(null, err);
        console.log("Connected successfully to server");

        var  db = client.db(dbName);

        db.collection("players").findOne({
            $or: [
                {RFID:cardId},
                {NFC:cardId}
            ]
        },
        function(err,result){
            if (err) throw err;
            callback(result);
        });
        client.close();
    });
};

module.exports =  {

};
