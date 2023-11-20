'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var divOnlineUsers = document.querySelector(".online_users");
var stompClient = null;
var username = null;
var userOnline = 0;
var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden'); //clear first page
        chatPage.classList.remove('hidden'); //open chat page

        var socket = new SockJS('/ws'); //socket
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}


function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived); //listener topic

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'}) //POST stringified data
    )

    connectingElement.classList.add('hidden'); //connected, then hide connectiong page
}




function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = ''; //clearing
    }
    event.preventDefault(); //hz
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    console.log(payload.body)
    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
        var user = document.createElement('p')
        user.textContent = message.sender + ' is online';
        user.id = message.sender;

        divOnlineUsers.appendChild(user);

    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
        var paragraphs = divOnlineUsers.querySelectorAll('p');
        paragraphs.forEach(function(paragraph) {
            // Access the text content of each paragraph
            if(paragraph.id === message.sender.toString()){
                paragraph.remove();
            }
            else{
                console.log("everything-ok")
            }
        });
    } else {
        messageElement.classList.add('chat-message');

        var paragraphs = divOnlineUsers.querySelectorAll('p');
        paragraphs.forEach(function(paragraph) {
            // Access the text content of each paragraph
            if(paragraph.id === message.sender.toString() && userOnline === 0){
                userOnline = 1;
            }
        });
        if(!userOnline){
            var user = document.createElement('p');
            user.textContent = message.sender + ' is online';
            user.id = message.sender;
            divOnlineUsers.appendChild(user);

        }


        var avatarElement = document.createElement('i');

        var avatarText = document.createTextNode(message.sender[0]);//первая буква
        avatarElement.appendChild(avatarText); // 1st letter

        avatarElement.style['background-color'] = getAvatarColor(message.sender); //hash color

        messageElement.appendChild(avatarElement); // add avatar

        var usernameElement = document.createElement('span'); //username
        var usernameText = document.createTextNode(message.sender); //username
        usernameElement.appendChild(usernameText); //username is putted
        messageElement.appendChild(usernameElement); //username element putted in message body
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i=0; i<messageSender.length; i++) {
        hash = 2*hash+messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Try to refresh';
    connectingElement.style.color = 'red';
}


usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)