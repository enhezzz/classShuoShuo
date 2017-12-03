'use strict';

document.getElementById('shuldGoTo2').addEventListener('click', function () {
    location.pathname = '/classShuoShuo/homePage/publishArt';
});
document.getElementById('shuldGoTo1').addEventListener('click', function () {
    location.pathname = '/classShuoShuo/homePage/publishArt';
});
var websocket = new WebSocket('ws://192.168.1.108:8080?id=<%=cardId%>');
websocket.onopen = function (open) {
    console.log('request connect...');
    websocket.send(1);
};
websocket.onmessage = function (message) {
    console.log(message.data);
    $('.people').text(message.data);
};