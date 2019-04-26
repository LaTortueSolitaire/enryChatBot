var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var db = require('./db/db.js');

var axios = require('axios');

const BootBot = require('bootbot');
// const registerscorephone = require('./modules/register_score_phone');
// const registerscorealias = require('./modules/register_score_alias');

var settings = require('./config/settings.js');
var facebook = settings.facebook;

var app = express();
//FBBOTFramework
// var bot = new FBBotFramework({
//     page_token: config.fb_page_token,
//     verify_token: config.fb_verify_token
// })
// app.use('/webhook', bot.middleware());
// BootBot
const bot = new BootBot({
    accessToken: facebook.fb_page_token,
    verifyToken: facebook.fb_verify_token,
    appSecret: facebook.fb_app_secret
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/facebookChat', indexRouter);
app.use('/facebookChat/users', usersRouter);
app.use(function (req, res, next) {
    next(createError(404));
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

bot.setGetStartedButton(getStarted);

bot.setGreetingText("Welcome to Enry.Chat - your Table Tennis Chatbot 🤖! Choose a username followed by the PIN code provided by Enry:Box. Example: \n\n Register CoolUser 1234 \n\n Enry.Chat can then link your card swipes and games to create your very own table tennis statistics. Write <stats> or click the menu button to retrieve your stats 📠.");

bot.hear(['hello', 'hi', /hey( there)?/i], (payload, chat) => {
	chat.getUserProfile().then((user) => {
		chat.say(`Hi there !`);
	});
});

bot.hear(/register \w+ \d{4}/gi, (payload, chat) => {
	chat.getUserProfile().then((user) =>{
		var text = payload.message.text;
		var userId = payload.sender.id;
		var mess = text.split(' ');
		db.registerUsername(mess[1], parseInt(mess[2]), userId, function(res){
			if(res == 1) {
				chat.say('Your username '+mess[1]+' has now been correctly linked to your card. Try another match!');
			}
			else {
				chat.say('There was no player with this pin code');
			}
		});
	})
});

bot.hear(/stats/gi, (payload, chat) => {
	chat.getUserProfile().then((user) => {
		var text = payload.message.text;
		var userId = payload.sender.id;
		db.getStats(userId, function(res){
			if(!res){
				chat.say('Make sure to register your username with Enry.Chat before your ask for your statistics. Thanks!');
			}
			else {
				var nbGames = res.games;
				var nbWins = res.wins;
				var percents = Math.round((nbWins/nbGames)*100);
				chat.say("Your statistics are : \n\n - "+nbWins.toString()+" wins over "+nbGames.toString()+" games. \n\n - "+percents.toString()+" % of wins.");
			}
		});
	})
});

bot.on('message', (payload, chat, data) => {
   chat.getUserProfile().then((user) => {
	   if(!data.captured){
	       chat.say(`Hello, ${user.first_name}!`);
	       chat.say(`I am a simple mind and your message was too complicated for me 😥. Please try one of the menu buttons 👍.`);
	   }
   });
});


bot.setPersistentMenu([
	{
		"locale":"default",
		"composer_input_disabled":false,
		"call_to_actions":[
			{
				"title":"Help",
				"type":"postback",
				"payload":"GET_HELP"
			},
			{
				"title":"Stats",
				"type":"postback",
				"payload":"GET_STATS"
			}
		]
	}
]);


bot.on('postback:GET_HELP', (payload, chat) => {
	chat.say("Let me help you: I am Enry.Chat - your Table Tennis Chatbot 🤖! Choose a username followed by the PIN code provided by Enry:Box. Example: \n\n CoolUser 1234 \n\nI can then link your card swipes and games to create your very own table tennis statistics. Write <stats> or click the menu button to retrieve your stats 📠.");
})

bot.on('postback:GET_STATS', (payload, chat) => {
	chat.getUserProfile().then((user) => {
		var userId = payload.sender.id;
		db.getStats(userId, function(res){
			if(!res){
				chat.say('Make sure to register your username with Enry.Chat before your ask for your statistics. Thanks!');
			}
			else {
				var nbGames = res.games;
				var nbWins = res.wins;
				var percents = Math.round((nbWins/nbGames)*100);
				chat.say("Your statistics are : \n\n - "+nbWins.toString()+" wins over "+nbGames.toString()+" games. \n\n - "+percents.toString()+" % of wins.");
			}
		});
	})
})

// bot.module(registerscorephone);
// bot.module(registerscorealias);
//
function getStarted(userId) {
    bot.say(userId, "Welcome to Enry.Chat - your Table Tennis Chatbot 🤖! Choose a username followed by the PIN code provided by Enry:Box. Example: \n Register CoolUser 1234 \n Enry.Chat can then link your card swipes and games to create your very own table tennis statistics. Write <stats> or click the menu button to retrieve your stats 📠.");
}

// function report_score(userId) {
//     bot.sendTextMessage(userId, "Please provide me with the score in the following format: (Your score) (Opponents score) (Opponents name) example: 10 9 Sebastian");
// }
//
// function report_score_phone(userID) {
//     bot.sendTextMessage(userId, "Please provide me with the score in the following format: (Your score) (Opponents score) (Opponents Phone nr) example: 10 9 98542548");
// }
//
// function NewPlayer(userId, user_profile) {
//     var newplayer = new Player({
//         first_name: user_profile["first_name"],
//         last_name: user_profile["last_name"],
//         profile_pic: user_profile["profile_pic"],
//         // locale : user_profile["locale"],
//         // timezone: user_profile["timezone"],
//         // gender: user_profile["gender"],
//         fb_id: userId,
//         created_at: Date.now(),
//         updated_at: Date.now()
//     });
//     newplayer.save(function (err) {
//         if (err) throw err;
//
//         console.log('Made a new player for' + userId);
//     });
// }



module.exports = app;


bot.start();
