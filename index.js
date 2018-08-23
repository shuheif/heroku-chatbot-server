'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
	//res.send('here')
	/*request({
			    url: 'https://friends-chatbot.herokuapp.com/prediction',
			    method: 'POST',
			    body: {message: 'test'},
			    headers: {'User-Agent': 'request'},
				json: true 
			}, function(error, response, body) {
				res.send(response)
				res.semd(response.body)
			})*/
	res.send('Hello, world')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
	    let event = req.body.entry[0].messaging[i]
	    let sender = event.sender.id
	    if (event.message && event.message.text) {
	    	let text = event.message.text
			request({
			    url: 'https://friends-chatbot.herokuapp.com/prediction',
			    method: 'POST',
			    body: {message: text.substring(0, 200)},
			    headers: {'User-Agent': 'request',
						'Content-Type': "application/json"},
				json: true 
			}, function(error, response, body) {
				sendTextMessage(sender, response.body)
			})
	    }
    }
    res.sendStatus(200)
})

// const token = "EAAHn8e0ZBExwBALjArT2fm61WGz2cMWQcIOQSiodDAa4ZCwzrXp7IhFHrggYqXPZC8JUOZBZCZButTgEojIVkHtzsO49tWC98Gk0sQ59DlFu2nrUK1owKzrktbJr4YUEeU1oDAcXtZAcPHy3WTc86ZBQgDBAnCpfZC850ZACyiZCZB5bSAZDZD"

const token = process.env.FB_PAGE_ACCESS_TOKEN

function sendTextMessage(sender, text) {
    let messageData = {text: text}
    request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token: token},
	    method: 'POST',
		json: {
		    recipient: {id: sender},
			message: messageData,
		}
	}, function(error, response, body) {
		console.log(response)
		if (error) {
		    console.log('Error sending messages: ', error)
		} else if (response.body.error) {
		    console.log('Error: ', response.body.error)
	    }
    })
}

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})