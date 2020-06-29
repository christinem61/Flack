This is an online messaging service (similar to Slack) using Python Flask,
HTML, CSS and Javascript. Once users sign into the site with a display name, 
they can create their own channels/chatrooms to communicate in and join existing
channels. Users are able to send and receive messages with one another in real 
time. Websockets are used to make this real-time communication possible. Socket.IO 
is the JavaScript library that suppports this protocol. This web app also allows for 
users to private/direct message other users who have signed in. 

Video Demonstration: https://youtu.be/fkf4RgwGrBA


application.py

This is the server side of the site. All the information about the users, messages,
and channels are located in dictionaries here. Flask_socketio allows for websockets
inside a Flask application. This library lets the web server and client emit events
to all the other users, while also listening and receiving for events being broadcasted
by others. You can see all the instructions for each event emitted by the client (index.js).
When the client makes an HTTP request to the server, the Python code at the top of 
the file is used to interpret what the client is asking for and then sends back the 
HTML and CSS content rendered in the client's browser.  

index.js

This is the client side of the site. This code is all run inside the web browser.  
Information retrived from the web server (such as usernames, channel names and messages)
are displayed here. In other words, the DOM is manipulated for every action taken 
on the site. 

index.html

This is where the main layout of the webpage is outlined. I used Bootstrap 4's grid
system to arrange the channels and private messages inbox, as well as the messaging
screen of each channel. 

styles.css

This is where all the information for styling the website is. In other words, 
you can find more details as to the color scheme, spacing, buttons, fonts, etc. 
