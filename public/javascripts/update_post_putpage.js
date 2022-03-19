const button_submit = document.getElementById('update_post_submit');

function sendPut(){
    let url = window.location.pathname;
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(data);
}
button_submit.addEventListener('click',sendPut())