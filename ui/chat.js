$(function () {
  "use strict";

  let div = document.querySelector('#flag');
  const x = 15;
  const y = 9;
  let color = 'black';
  let down = false;
  for (var i = 0; i < x*y; i++) {
    let box = document.createElement('span');
    box.id = i;
    div.appendChild(box)
      .classList.add('pixel');
  }
  document.querySelectorAll('#colselect>span').forEach(s=>{
    s.addEventListener('click',e=>{
    color = e.target.id;
    })
  });
  document.querySelectorAll('.pixel').forEach(s=>{
    s.addEventListener('mouseover',e=>{
      if (down) {
        e.target.style.background=color;
        document.querySelector('#selected').innerHTML=validate();
        console.log('clicked on ' + e.target.id + ' with color ' + color); 
        sendClick(e.target.id, color);
      }
    });
    s.addEventListener('mousedown',e=>{
      e.target.style.background=color;
      document.querySelector('#selected').innerHTML=validate();
      console.log('clicked on ' + e.target.id + ' with color ' + color); 
      sendClick(e.target.id, color);
    })
  });
  div.addEventListener('mousedown',e=>{
    down=true;
  });
  div.addEventListener('mouseup',e=>{
    down=false;
  });
  function getArr() {
    const ret = [];
    document.querySelectorAll('.pixel').forEach(s=>{
      ret.push(s.style.background);
    });
    return ret;
  }

  function validate() {
    let a=getArr().map(x=>{return x==''?'white':x});
    for (i = 0; i < flags.length; i++) {
      if (JSON.stringify(flags[i].map(x=>{return x==''?'white':x})) == JSON.stringify(a)) {
        return flagnames[i];
      }
    }
    return 'none';
  }

  function sendClick(id, color) {
    var obj = {
      type: 'click',
      color: color,
      id: id
    };
    sendMessage(obj);
  }

  // for better performance - to avoid searching in DOM
  var content = $('#content');
  var input = $('#input');
  var status = $('#status');

  status.text("Connecting ...");

  var myColor = false;
  var myName = false;

  // if user is running mozilla then use it's built-in WebSocket
  window.WebSocket = window.WebSocket || window.MozWebSocket;

  if (!window.WebSocket) {
    content.html($('<p>',
      { text:'Your browser doesn\'t support WebSockets :('}
    ));
    input.hide();
    $('span').hide();
    return;
  }

  var connection = new WebSocket('ws://127.0.0.1:1999');

  function sendMessage(obj) {
    connection.send(JSON.stringify(obj));
  }

  connection.onopen = function () {
    input.removeAttr('disabled');
    status.text('Choose name:');
    input.val('');
  };

  connection.onerror = function (error) {
    // just in there were some problems with connection...
    content.html($('<p>', {
      text: 'It seems the server is down :('
    }));
  };

  connection.onmessage = function (message) {
    try {
      var json = JSON.parse(message.data);
    } catch (e) {
      console.log('Invalid JSON :( ', message.data);
      return;
    }

    if (json.type === 'color') { 
      myColor = '#' + json.data;
      status.text(myName + ': ').css('color', myColor);
      input.removeAttr('disabled').focus();
    } else if (json.type === 'message') {
      input.removeAttr('disabled');
      addMessage(json.data.author, json.data.text, json.data.color, new Date(json.data.time));
    } else if (json.type === 'click') {
      console.log('received click for id ' + json.id + ' with color ' + json.color)
      document.getElementById(json.id).style.background = json.color;
    } else {
      console.log('Unsupported syntax :(');
    }
  };

  input.keydown(function(e) {
    if (e.keyCode === 13) {
      var msg = $(this).val();
      if (!msg) {
        return;
      }
      var obj = {
          type: 'message',
          text: msg
      };
      sendMessage(obj);
      $(this).val('');
      // disable the input field to make the user wait until server
      // sends back response
      input.attr('disabled', 'disabled');

      if (myName === false) {
        myName = msg;
      }
    }
  });

  /**
   * This method is optional. If the server wasn't able to
   * respond to the request in 3 seconds then show some error message
   * to notify the user that something is wrong.
   */
  setInterval(function() {
    if (connection.readyState !== 1) {
      status.text('Error');
      input.attr('disabled', 'disabled').val(
          'Unable to communicate with the WebSocket server.');
    }
  }, 3000);

  /**
   * Add message to the chat window
   */
  function addMessage(author, message, color, dt) {
    content.prepend('<p class="chat-message"><span class="chat-name" style="color:#' + color + '">'
        + author + '</span> @ ' + (dt.getHours() < 10 ? '0'
        + dt.getHours() : dt.getHours()) + ':'
        + (dt.getMinutes() < 10
          ? '0' + dt.getMinutes() : dt.getMinutes())
        + ': ' + message + '</p>');
  }
});