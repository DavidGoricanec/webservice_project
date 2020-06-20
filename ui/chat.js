$(function() {
  "use strict";

  $("#dialogDiv, #dialogLoginDiv").dialog({
    autoOpen: false,
	closeOnEscape: false
  });



  var token = null;

  if (token == null)
  {
	$("#dialogLoginDiv").dialog("open");
  }

  let div = document.querySelector('#flag');
  const x = 15;
  const y = 9;
  var answer = "";
  let color = 'black';
  let down = false;
  for (var i = 0; i < x * y; i++) {
    let box = document.createElement('span');
    box.id = i;
    div.appendChild(box)
      .classList.add('pixel');
  }

  document.getElementById("start_game").style.display = "none";

  document.getElementById('start_game').addEventListener('click', () => {
    var obj = {
      type: 'gamesettings',
      value: 'start_game',
      token: token,
    };
    sendMessage(obj);
  });

  document.querySelectorAll('#colselect>span').forEach(s => {
    s.addEventListener('click', e => {
      color = e.target.id;
    })
  });
  document.querySelectorAll('.pixel').forEach(s => {
    s.addEventListener('mouseover', e => {
      if (down && document.getElementById("draw_rights").checked) {
        e.target.style.background = color;
        document.querySelector('#selected').innerHTML = validate();
        console.log('clicked on ' + e.target.id + ' with color ' + color);
        sendClick(e.target.id, color);
      }
    });
    s.addEventListener('mousedown', e => {
      if (document.getElementById("draw_rights").checked) {
        e.target.style.background = color;
        document.querySelector('#selected').innerHTML = validate();
        console.log('clicked on ' + e.target.id + ' with color ' + color);
        sendClick(e.target.id, color);
      }
    })
  });
  div.addEventListener('mousedown', e => {
    down = true;
  });
  div.addEventListener('mouseup', e => {
    down = false;
  });
  function getArr() {
    const ret = [];
    document.querySelectorAll('.pixel').forEach(s => {
      ret.push(s.style.background);
    });
    return ret;
  }

  function validate() {
    let a = getArr().map(x => { return x == '' ? 'white' : x });
    for (i = 0; i < flags.length; i++) {
      if (JSON.stringify(flags[i].map(x => { return x == '' ? 'white' : x })) == JSON.stringify(a)) {
        return names[i];
      }
    }
    return 'none';
  }
  function sendSelectedFlag(flagName) {
    var obj = {
      type: 'gamesettings',
      value: 'flag',
      flag: flagName,
      token: token,
    };
    sendMessage(obj);
    $.post("http://localhost:5000/api/flag", { flagName: flagName })
  }

  //Modal Selection
  document.getElementById("confirm_selection").addEventListener('click', e => {
    answer = $("#flag_selector").val();
    sendSelectedFlag(answer);
    $("#dialogDiv").dialog("close");
  });

  //Modal Login
    document.getElementById("btn_login").addEventListener('click', e => {
		var v_username = $("#username").val();
		var v_password = $("#password").val();


		if(v_username == null || v_password == null || v_username == "" || v_password == "")
		{
			alert("Please insert a username and a password")
			return
		}

		$.post( "http://localhost:5000/api/authenticate", { username: v_username, password:v_password  })
		  .done(function( data ) {
			token = data.token
      $("#input").val(v_username)
      var e = $.Event("keydown")
      e.which = 13
      e.keyCode = 13
      $("#input").trigger(e)
		}).fail(function(e) {
			alert( JSON.stringify(e) );
		}).always(function() {
			$("#dialogLoginDiv").dialog("close");
		});

	});

  //Server Connection

  function sendClick(id, color) {
    var obj = {
      type: 'click',
      color: color,
      id: id,
      token: token,
    };
    sendMessage(obj);
  }

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
      { text: 'Your browser doesn\'t support WebSockets :(' }
    ));
    input.hide();
    $('span').hide();
    return;
  }

  var connection = new WebSocket('ws://127.0.0.1:1999');

  function sendMessage(obj) {
    connection.send(JSON.stringify(obj));
  }

  connection.onopen = function() {
    input.removeAttr('disabled');
    status.text('Choose name:');
    input.val('');
  };

  connection.onerror = function(error) {
    // when we have some problems with the connection
    content.html($('<p>', {
      text: 'It seems the server is down :('
    }));
  };

  connection.onmessage = function(message) {
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
      document.getElementById("start_game").style.display = "inline";
    } else if (json.type === 'message') {
      input.removeAttr('disabled');
      addMessage(json.data.author, json.data.text, json.data.color, new Date(json.data.time));
    } else if (json.type === 'click') {
      console.log('received click for id ' + json.id + ' with color ' + json.color)
      document.getElementById(json.id).style.background = json.color;
    } else if (json.type === 'drawer') {
      console.log('my name is ' + myName + ' and drawer is ' + json.value);
      if (myName == json.value) {
        document.getElementById('draw_rights').checked = true;
        console.log('I am the drawer');
        //populate select box
        $.get("http://localhost:5000/api/flags", function(data){
          console.log('received the following flags:')
          console.log(data)
          $("#flag_selector").empty()
          data.forEach(flag => {
            $("#flag_selector").append($("<option />").val(flag.flagName).text(flag.flagName + " (" + flag.flagCounter + ")"));
          })
        });
        $("#dialogDiv").dialog("open");
      } else {
        document.getElementById('draw_rights').checked = false;
        console.log('I am the guesser');
      }
      document.getElementById("start_game").style.display = "none";
    } else if (json.type === 'flag') {
      console.log('secret answer is ' + json.value + ' - do not tell anyone!');
      answer = json.value;
    } else if (json.type === 'restart_game') {
      document.getElementById("start_game").style.display = "inline";
      $("span.pixel").css('background', 'white');
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
        text: msg,
        token: token,
      };
      sendMessage(obj);
      $(this).val('');
      // disable the input field to make the user wait until server
      // sends back response
      input.attr('disabled', 'disabled');

      if (msg.toLowerCase() == answer.toLowerCase()) {
        var obj = {
          type: 'gamesettings',
          value: 'win',
          userName: myName,
          token: token,
        };
        sendMessage(obj);
      }

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
