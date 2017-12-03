
document.getElementById('shuldGoTo2').addEventListener('click',() => {
    location.pathname = '/classShuoShuo/homePage/publishArt';
});
document.getElementById('shuldGoTo1').addEventListener('click',() => {
    location.pathname = '/classShuoShuo/homePage/publishArt';
});
let websocket = new WebSocket(`ws://192.168.1.108:8080?id=<%=cardId%>`);
websocket.onopen = open => {
    console.log('request connect...')
    websocket.send(1)
}
websocket.onmessage = message => {
    console.log(message.data)
    $('.people').text(message.data);
}