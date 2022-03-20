const button_submit = document.getElementsByTagName('button')[0];

function sendPut(){
    let data = {};
    let description = document.getElementById('name').value;
    data.description = description;
    let url = window.location.pathname;
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(data);
}
button_submit.addEventListener('click',sendPut())