'use strict'
const Alexa = require('alexa-sdk');
const mqtt = require('mqtt');

const APP_ID = 'amzn1.ask.skill.831b9604-1887-4cb3-ad90-a35397da1870';

const WELCOME_MESSAGE = 'Welcome to the lamp control mode';
const WELCOME_REPROMT = 'If you new please say help'
const HELP_MESSAGE = 'In this skill you can controlling lamp to turn off or on, dim the lamp, change the lamp color and schedule the lamp';
const STOP_MESSAGE = 'Thanks for using this skill, Goodbye!';
const OFF_RESPONSE = 'Turning off the lamp';
const ON_RESPONSE = 'Turning on the lamp';
const DIM_RESPONSE = 'Dimming the lamp to';
const CHANGE_RESPONSE = 'Changing the lamp color to';
const AFTER_RESPONSE = 'Wanna control something again ?';
const SCHEDULE_RESPONSE = 'Scheduling the lamp to';
const UNHANDLED_RESPONSE = 'Sorry, I dont understand your request. Say help if you dont know about this skill';

var arrLocation = ['garden', 'living room', 'bedroom', 'kitchen'];
var arrColor = ['red', 'green', 'blue', 'white', 'yellow', 'cyan', 'magenta'];
var locationValidation = false;
var statusValidation = false;
var percentageValidation = false;
var colorValidation = false;
var timeValidation = false;

var options = {
	port: '1883',
  	clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  	username: 'user',
  	password: 'password',
};

const handlers = {
	'LaunchRequest': function () {
		this.emit(':ask', WELCOME_MESSAGE + ' ' + WELCOME_REPROMT, 'Wanna control something ?' );
	},
	'OnOffIntent' : function () {
		// action, status, location
		
		var payload = {};
		var status = this.event.request.intent.slots.status.value;
		var location = this.event.request.intent.slots.location.value;
		const self = this;

		for (var i = 0; i < arrLocation.length; i++) {
			if(arrLocation[i] == location) {
				locationValidation = true;
				break;
			} 
		}

		if (status == 'on' || status == 'off') {
			statusValidation = true;
		}

		if (locationValidation && statusValidation) {
			payload.action = 1;
			payload.status = status;
			payload.location = location;

			var jsonObj = JSON.stringify(payload);

			console.log(status);
			console.log(location);

			var mqttPromise = new Promise(function(resolve, reject) {
				var client  = mqtt.connect('mqtt://irfanreza.tk', options);
				client.on('connect', function() {
					client.publish("lamp_control", jsonObj, function() {
						console.log("Message is published");
						client.end();
						resolve('Done Sending');
					});
				});
			});

			if (status == 'on') {
				mqttPromise.then(
					function(data) {
						console.log('Function called succesfully', data);
						locationValidation = false;
						statusValidation = false;
						self.emit(':ask', ON_RESPONSE, AFTER_RESPONSE);
					}, function(err) {
						console.log('An error occurred: ', err);
					}
				);
			} else if (status == 'off') {
				mqttPromise.then(
					function(data) {
						console.log('Function called succesfully', data);
						locationValidation = false;
						statusValidation = false;
						self.emit(':ask', OFF_RESPONSE, AFTER_RESPONSE);
					}, function(err) {
						console.log('An error occurred: ', err);
					}
				);
			}
		} else {
			self.emit(':ask', UNHANDLED_RESPONSE, '');
		}


	},
	'DimIntent' : function () {
		// action, percentage, location
		var payload = {};
		var percentage = this.event.request.intent.slots.percentage.value;
		var location = this.event.request.intent.slots.location.value;
		const self = this;

		for (var i = 0; i < arrLocation.length; i++) {
			if(arrLocation[i] == location && arrLocation[i] != 'kitchen') {
				locationValidation = true;
				break;
			} 
		}

		if (!isNaN(percentage) && percentage >= 0) {
			percentageValidation = true;
		}

		if (locationValidation && percentageValidation) {
			payload.action = 2;
			payload.percentage = percentage;
			payload.location = location;

			var jsonObj = JSON.stringify(payload);

			var mqttPromise = new Promise(function(resolve, reject) {
				var client  = mqtt.connect('mqtt://irfanreza.tk', options);
				client.on('connect', function() {
					client.publish("lamp_control", jsonObj, function() {
						console.log("Message is published");
						client.end();
						resolve('Done Sending');
					});
				});
			});

			mqttPromise.then(
				function(data) {
					console.log('Function called succesfully', data);
					locationValidation = false;
					percentageValidation = false;
					self.emit(':ask', DIM_RESPONSE + ' ' +  percentage + ' percent', AFTER_RESPONSE);
				}, function(err) {
					console.log('An error occurred', err);
				}
			);
		} else {
			self.emit(':ask', UNHANDLED_RESPONSE, '');
		}
	},
	'ChangeColorIntent' : function () {
		// action, color, location
		var payload = {};
		var color = this.event.request.intent.slots.color.value;
		var location = this.event.request.intent.slots.location.value;
		const self = this;

		for (var i = 0; i < arrLocation.length; i++) {
			if(arrLocation[i] == location && arrLocation[i] != 'kitchen') {
				locationValidation = true;
				break;
			} 
		}

		for (var i = 0; i < arrColor.length; i++) {
			if(arrColor[i] == color) {
				colorValidation = true;
				break;
			}
		}

		if (locationValidation && colorValidation) {
			payload.action = 3;
			payload.color = color;
			payload.location = location;

			console.log(color);
			console.log(location);

			var jsonObj = JSON.stringify(payload);

			var mqttPromise = new Promise(function(resolve, reject) {
				var client  = mqtt.connect('mqtt://irfanreza.tk', options);
				client.on('connect', function() {
					client.publish("lamp_control", jsonObj, function() {
						console.log("Message is published");
						client.end();
						resolve('Done Sending');
					});
				});
			});

			mqttPromise.then(
				function(data) {
					console.log('Function called succesfully', data);
					locationValidation = false;
					colorValidation = false;
					self.emit(':ask', CHANGE_RESPONSE + ' ' + color, AFTER_RESPONSE);
				}, function(err) {
					console.log('An error occurred', err);
				}
			);
		} else {
			self.emit(':ask', UNHANDLED_RESPONSE, '');
		}
	},
	'ShceduleIntent' : function () {
		// action, status, time, location
		var payload = {};
		var status = this.event.request.intent.slots.status.value;
		var time = this.event.request.intent.slots.time.value;
		var location = this.event.request.intent.slots.location.value;
		const self = this;

		for (var i = 0; i < arrLocation.length; i++) {
			if(arrLocation[i] == location) {
				locationValidation = true;
				break;
			} 
		}

		if (status == 'on' || status == 'off') {
			statusValidation = true;
		}

		var timeSplit = time.toString().split(":");

		if (!isNaN(timeSplit[0]) && timeSplit[0] >= 0) {
			if(!isNaN(timeSplit[1]) && timeSplit[1] >= 0) {
				timeValidation = true;
			}
		}

		if (locationValidation && statusValidation && timeValidation) {
			payload.action = 4;
			payload.status = status;
			payload.time = time;
			payload.location = location;

			console.log(status);
			console.log(time);
			console.log(location);

			var jsonObj = JSON.stringify(payload);

			var mqttPromise = new Promise(function(resolve, reject) {
				var client  = mqtt.connect('mqtt://irfanreza.tk', options);
				client.on('connect', function() {
					client.publish("lamp_control", jsonObj, function() {
						console.log("Message is published");
						client.end();
						resolve('Done Sending');
					});
				});
			});

			mqttPromise.then(
				function(data) {
					console.log('Function called succesfully', data);
					locationValidation = false;
					statusValidation = false;
					timeValidation = false;
					self.emit(':ask', SCHEDULE_RESPONSE + ' turn ' + status + ' at ' + time, AFTER_RESPONSE);
				}, function(err) {
					console.log('An error occurred', err);
				}
			);
		} else {
			self.emit(':ask', UNHANDLED_RESPONSE, '');
		}
	},
	'TemperatureIntent' : function () {
		const self = this;

		var mqttPromise = new Promise(function(resolve, reject) {
			var client = mqtt.connect('mqtt://irfanreza.tk', options);
			client.on('connect', function() {
				client.subscribe('temperature')
				client.on('message', (topic, message, packet) => {
					var msg_toStr = message.toString('utf8');
					var msg_JSON = JSON.parse(msg_toStr);
					console.log('last msg : ', message.toString())
					console.log('message received on topic', topic, ' RETAIN:', packet.retain)
					client.end();
					resolve(msg_JSON);
				});
			});
		});

		mqttPromise.then(
			function(data) {
				var TEMPERATURE_RESPONSE = "You room temperature is " + data.temperature + " degree celcius";
				self.emit(':ask', TEMPERATURE_RESPONSE, AFTER_RESPONSE);
			}, function(err) {
				console.log('An error occurred', err);
			}
		);
	},
	'AMAZON.HelpIntent': function () {
		this.emit(':ask', HELP_MESSAGE, 'Wanna control something ?');
	},
	'AMAZON.StopIntent': function () {
		this.emit(':tell', STOP_MESSAGE);
	}
};

exports.handler = function (event, context, callback) {
	const alexa = Alexa.handler(event, context, callback);
	alexa.APP_ID = APP_ID;
	alexa.registerHandlers(handlers);
	alexa.execute();
}
