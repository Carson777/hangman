const express = require('express');
const app = express();
const parseurl = require('parseurl');
const mustache = require('mustache-express');
const bodyparser = require('body-parser');

app.engine('mustache', mustache())
app.set('view engine', 'mustache');
app.set('views', './views');
app.use(express.static('public'))
app.use(bodyparser.urlencoded({ extended:false}))
app.listen(3000, function(){})

const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

var answer = ''
var letters =[];
var progress = [];
var message = ''
var incorrectGuesses= [];
var remainingGuesses = 8;
var previousGuesses = [];
var matches = 0

var letterCheck = function(char){
	if(char.length === 1){
		if( /[^a-zA-Z]/.test( char ) ) {
	       return false
		} else {
			return true
		}
	} else {
		return false
	}
}
var checkPreviousGuesses = function(guess){
	if(previousGuesses.length > 0){
		if(previousGuesses.indexOf(guess) > -1){
			return false
		} else {
			return true
		}
	} else {
		return true
	}
}

app.get('/startGame', function (req, res){
	progress = [];
	letters =[];
	remainingGuesses = 8;
	previousGuesses = [];
	incorrectGuesses = [];
	answer = words[Math.floor((Math.random() * 235887) + 1)];
	for (var i = 0; i < answer.length; i++) {
		letters.push(answer[i])
		progress.push('_')
	}
	res.redirect('/')
})
app.get('/', function (req, res){
	res.render("home",{
		answer: answer,
		letters: letters,
		progress: progress,
		message: message,
		remainingGuesses: remainingGuesses,
		incorrectGuesses: incorrectGuesses,
		previousGuesses: previousGuesses
    })
})
app.post('/', function (req, res){
	message = ''
	var guess = req.body.guess;
//Check for remaining Guesses
	if(remainingGuesses > 0){
//Check guess validity
		if(letterCheck(guess)){
//Make Sure it hasn't been guessed before
			if(checkPreviousGuesses(guess)){
				previousGuesses.push(guess)
//Is the guess Correct?
				for (var i = 0; i < letters.length; i++) {
					if(guess === letters[i]){
						progress[i] = guess
						matches = matches + 1;
					}
				}
//If Correct
				if(matches > 0){
					var tempProgress = progress.join('');
					var tempLetters = letters.join('');
					if(tempProgress === tempLetters){
						message = "Congrats, you win!";
					} else {
						message = 'Correct, nice guess!'
					}
//If Incorrect
				} else {

					incorrectGuesses.push(guess);
					remainingGuesses--
					message = 'Incorrect, guess again'
				}
				matches = 0;
			} else {
				message = 'You have already guessed that'
			}
		} else {
			message = 'You must enter a single letter for a guess.'
		}
	} else {
		message = 'You are out of guesses, you suck'
	}
	res.redirect('/')
})