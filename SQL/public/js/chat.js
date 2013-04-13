/** Application init function to start chat app **/
var init = function() {
  // Initialize global variables and start automated fetch of messages
  window.friends = [];
  window.selectedRoom = '';
  window.selectedFriends = {};
  getMessages();
  setInterval(getMessages, 5000);

  // Focus on the chat message field
  $('.input-message').focus();

  // Bind enter key to send message to the server
  $('.input-message').on('keypress', function(e) {
    var username = window.location.search.substring('?username='.length).replace(/%20/g,' ') || 'anonymous';
    var message = $(this).val();
    var roomname = window.location.pathname !== '/' ?
        window.location.pathname.match(/classes\/(?!messages)([a-zA-Z0-9\-]+)$/)[1] : undefined;
    
    if(e.which == 13) {
      sendMessage(username, message, roomname);
      $(this).val('');
    }
  });
};

var getMessages = function() {
  $.ajax('http://' + window.location.host + '/classes/messages', {
    type: 'GET',
    contentType: 'json',
    success: function(data) {
      $('#messages').empty();
      var html = '';
      data = JSON.parse(data);

      // Sort the array by descending date
      data = _(data).sortBy(function(message) {
        return message.createdAt;
      }).reverse();

      // Render each message using a Handlebars template
      _(data).each(function(message) {
        // Ignore executable <script> tags in the messages
        if(message.text && message.username) {
          message.text = message.text.replace('/</g','&lt;').replace('/>/g','&gt;');
          var source = $("#message-template").html();
          var template = Handlebars.compile(source);
          var context = {
            time: moment(message.createdAt).fromNow(),
            username: message.username,
            message: message.text,
            roomname: message.roomname,
            highlight: selectedFriends[message.username]
          };
          // console.log(message);
          if(!window.selectedRoom || window.selectedRoom === 'All Rooms') {
            html += template(context);
          } else {
            if (message.roomname === window.selectedRoom) {
              html += template(context);
            }
          }
        }
      });

      // Overwrite the #messages div with our messages and bind our actions
      $('#messages').html(html);
      populateSideBar();
    }
  });
};

var sendMessage = function(username, message, roomname) {
  // Construct the message option to send to the server
  var message = {
    'username': document.username,
    'text': message,
    'roomname': roomname
  };

  // Send the message to the server via ajax
  $.ajax('http://' + window.location.host + '/classes/messages', {
    type: 'POST',
    contentType: 'json',
    data: JSON.stringify(message),
    error: function(xhr, status, msg) {
      console.log('POST ERROR!');
    },
    success: function(msg) {
      console.log('POST SUCCESS!');
    }
  });
};

/** Populates side bar with all chat rooms **/
var populateSideBar = function() {
  var roomArray = [],
      friendArray = [];
  $.ajax('http://' + window.location.host + '/classes/messages', {
    type: 'GET',
    async: false,
    contentType: 'json',
    success: function(data) {
      data = JSON.parse(data);
      _(data).each(function(message) {
        if(message.roomname) {
          roomArray.push(message.roomname);
        }
        if(message.username) {
          friendArray.push(message.username);
        }
      });
    },
    error: function() {
      console.log('ERROR populating sidebar');
    }
  });

  // Get the chatrooms DOM node that we will update
  var $chatrooms = $('#chatrooms ul');
  $chatrooms.empty();
  var $node = $('<li>All Rooms</li>');
  if(window.selectedRoom === 'All Rooms') $node.addClass('highlight');
  $chatrooms.append($node.on('click', clickRoom));

  // Iterate through all unique room names and attach jQuery event handler
  _.chain(roomArray).uniq().each(function(room) {
    var $node = $('<li>' + room + '</li>');
    if(window.selectedRoom === room || window.selectedRoom === 'All Rooms') {
      $node.addClass('highlight');
    }
    $node.on('click', clickRoom);
    $chatrooms.append($node);
  });

  var $friends = $('#friends ul');
  $friends.empty();
  $node = $('<li>All Friends</li>');

  // Determine if All Friends has been clicked previously
  if(window.selectedFriends['All Friends']) {
    $node.addClass('highlight');
  }
  $friends.append($node.on('click', clickFriend));

  // Iterate through friends and highlight the ones that are our friends
  _.chain(friendArray).uniq().each(function(friend) {
    $node = $('<li>' + friend + '</li>');

    // Add highlight class if friend has been befriended
    if(window.selectedFriends[friend]) {
      $node = $node.addClass('highlight');
    }

    // Add onClick event listener to toggle highlight
    $node.on('click', clickFriend);
    $friends.append($node);
  });
}

/** Event handler for when a room is clicked **/
var clickRoom = function(e) {
  // Check if All Rooms was clicked
  if($(this).text() === 'All Rooms') {
    // Check if 'All Rooms' is being unclicked
    if(window.selectedRoom === 'All Rooms') {
      window.selectedRoom = undefined;
      _($('#chatrooms li')).each(function(room) {
        $(room).removeClass('highlight');
      });
    } else {
      window.selectedRoom = 'All Rooms';
      _($('#chatrooms li')).each(function(room) {
        $(room).addClass('highlight');
      });
    }
  } else {
    // Grab the room name of the room clicked
    window.selectedRoom = $(this).text();
    $(this).addClass('highlight');
  }
  getMessages();
  console.log("clicked room: " + window.selectedRoom);
}

/** Event handler for when a friend name is clicked **/
var clickFriend = function(e) {
  if($(this).text() === 'All Friends') {
    if(window.selectedFriends['All Friends']) {
      window.selectedFriends = {};
      _($('#friends li')).each(function(friend) {
        $(friend).removeClass('highlight');
      });
      $('span.username').removeClass('highlight');
    } else {
      _($('#friends li')).each(function(friend) {
        window.selectedFriends[$(friend).text()] = true;
        $(friend).addClass('highlight');
      });
      $('span.username').addClass('highlight');
    }
  } else {
    // Click a friend and add it to window.selectedFriends
    if(!window.selectedFriends[$(this).text()]) {
      window.selectedFriends[$(this).text()] = true;
      $(this).addClass('highlight');
    }
    else {
      window.selectedFriends[$(this).text()] = false;
      $(this).removeClass('highlight');
    }
    // console.log(selectedFriends);
  }
}

/** On document ready, initialize our app **/
$(document).ready(function() {
  init();
});