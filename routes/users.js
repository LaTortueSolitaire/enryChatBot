var express = require('express');
var router = express.Router();
var Player = require('../models/player');
var Match = require('../models/match');


/* GET users listing. */
router.get('/users', function(req, res, next) {
    var newplayer = new Player({
        first_name: "Ed",
        last_name: "Testing",
        profile_pic: "Some url",
        // locale : user_profile["locale"],
        // timezone: user_profile["timezone"],
        // gender: user_profile["gender"],
        fb_id: "somefbid",
        created_at: Date.now(),
        updated_at: Date.now()
    });
    newplayer.save(function (err) {
        if (err) throw err;

        console.log('Made a new player for' + "somefbid");
    });
  var players = {};
    Player.find({}, function (err, player) {
        // players[player._id] = player;
        //res.render('players', { Players: player})
        res.json(Players)
    });

    // res.send(players)
});

module.exports = router;
