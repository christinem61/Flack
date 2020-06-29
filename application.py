import os
import requests

from collections import deque
from flask import Flask, render_template, request,session
from flask_socketio import SocketIO, emit


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

USERS={}
DIRECTmessages={}
CHANNELS={"general"}       #msg              date            time            sender
MESSAGES={ "general" : [deque(maxlen=100), deque(maxlen=100), deque(maxlen=100),deque(maxlen=100)]}  #dictionary of channel names : array of messages in that channel

@app.route("/")
def index():
        return render_template("index.html")

@socketio.on('new user')
def new_user(data):
    USERS[data['username']]=data['username']
    emit("chatroom")

@socketio.on('dropdown')
def dropdown():
    for user in USERS:
        emit("dropdown", {'user':user})

@socketio.on('new dm')
def create_dm(data):
    if data['channel'] not in DIRECTmessages:
        DIRECTmessages[data['channel']]=[deque(maxlen=100), deque(maxlen=100), deque(maxlen=100),deque(maxlen=100)]

@socketio.on('saved')
def saved():
    emit("chatroom")

@socketio.on('new channel')
def new_channel(data):
    if data['name'] not in CHANNELS:
        CHANNELS.add(data['name'])
        MESSAGES[data['name']]=[deque(maxlen=100), deque(maxlen=100), deque(maxlen=100),deque(maxlen=100)]
        emit("create channel", {'channel': data['name']} , broadcast=True)
    else:
        emit("try again")

@socketio.on('show channels')
def show_channels():
    for channel in CHANNELS:
        emit("display channels", {'channel':channel})

@socketio.on('show dms')
def show_dms(data):
    user = data['user']
    for dm in DIRECTmessages:
        res = dm.find(user)
        if res != -1:
            rcvr = dm.replace(user,"")
            rcvr = rcvr.replace("-","")
            emit("display dms", {'name': rcvr, 'original': dm})

@socketio.on("show latest channel")
def showLatest(data):
    emit('display channels', { "channel" : data['name']}, broadcast = True)

@socketio.on('show msgs')
def show_msgs(data):
    MessageArray = MESSAGES.get(data['channel'])
    if MessageArray is None:
        MessageArray = DIRECTmessages.get(data['channel'])
    for i in range(len(MessageArray[0])):
        emit("show msgs", {'msg': MessageArray[0][i], 'date': MessageArray[1][i], 'time':MessageArray[2][i] , 'user': MessageArray[3][i], 'channel': data['channel'] })

@socketio.on('show latest msg')
def show_latest(data):
    MessageArray = MESSAGES.get(data['channel'])
    if MessageArray is None:
        MessageArray = DIRECTmessages.get(data['channel'])
    i = len(MessageArray[0]) - 1
    emit("show msgs", {'msg': MessageArray[0][i], 'date': MessageArray[1][i], 'time':MessageArray[2][i] , 'user':MessageArray[3][i], 'channel': data['channel'] }, broadcast = True)

@socketio.on('msg')
def msg(data):
    x = MESSAGES.get(data['channel'])
    if x is None:
        x = DIRECTmessages.get(data['channel'])
    x[0].append(data['msg'])
    x[1].append(data['date'])
    x[2].append(data['time'])
    x[3].append(data['user'])



