var express = require('express');
var router = express.Router();
// var Player = require('../models/player');
// var Match = require('../models/match');


/* GET users listing. */
router.get('/users', function(req, res, next) {
    var players = {};
    var matches = {};
    Player.find({}, function (err, player) {
        players = player;
        res.json(players);
    });
});
router.get('/user/:userId')
    .get((req, res) => {
        Player.findById(req.params.userId, (err, player_tojson) => {
            res.json(player_tojson)
        })
    });

router.get('/matches', function(req, res, next) {
    var players = {};
    var matches = {};
    Player.find({}, function (err, player) {
        players = player;
        var matches = {};
        Match.find({}, function (err, match) {
            matches = match;
            res.json(matches);
        });
    });
    router.get('/match/:matchId')
        .get((req, res) => {
            Match.findById(req.params.userId, (err, match) => {
                res.json(match)
            })
        });

});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
