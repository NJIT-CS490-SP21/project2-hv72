import os
from flask import Flask, send_from_directory, json
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
app = Flask(__name__, static_folder='./build/static')

# Point SQLAlchemy to your Heroku database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
# Gets rid of a warning
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
import models
db.create_all()
# IMPORTANT: This must be AFTER creating db variable to prevent
# circular import issues
# from models import Person
cors = CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    json=json,
    manage_session=False
)

# global variable to keep track of how many times we update the database
counter = 0

@app.route('/', defaults={"filename": "index.html"})
@app.route('/<path:filename>')
def index(filename):
    return send_from_directory('./build', filename)

# When a client connects from this Socket connection, this function is run
@socketio.on('connect')
def on_connect():
    everything = db.session.query(models.Person).all()
    print(everything)
    tempDict = {}
    for person in everything:
        print(str(person.username) + "\tScore: " + str(person.userscore))
        tempDict[person.username] = person.userscore
    socketio.emit("from_db", tempDict, broadcast=True, include_self=True)
    print('User connected!')

# When a client disconnects from this Socket connection, this function is run
@socketio.on('disconnect')
def on_disconnect():
    print('User disconnected!')

@socketio.on("tiktaktoe")
def on_tictak(data):
    global counter
    if(data["arr"] == ['', '', '', '', '', '', '', '','']):
        counter = 0
    print(data)
    socketio.emit("tiktaktoe", data, broadcast=True, include_self=False)

@socketio.on("login_info")
def on_loginInfo(data):
    print(data  )
    socketio.emit("login_info", data, broadcast=True, include_self=False)
    
@socketio.on("add_user")
def add_user_to_db(data):
    db.session.add(models.Person(username=data, userscore=100))
    db.session.commit()
    on_connect()
    print(data)

@socketio.on("on_win")
def update_winner(data):
    global counter
    counter += 1
    if counter == 1:
        winner = db.session.query(models.Person).filter_by(username=data[0]).first()
        winner.userscore = winner.userscore + 1
        loser = db.session.query(models.Person).filter_by(username=data[1]).first()
        loser.userscore = loser.userscore - 1
        db.session.commit()
        on_connect()
    print(data)

# When a client emits the event 'chat' to the server, this function is run
# 'chat' is a custom event name that we just decided
@socketio.on('chat')
def on_chat(data): # data is whatever arg you pass in your emit call on client
    print(str(data))
    # This emits the 'chat' event from the server to all clients except for
    # the client that emmitted the event that triggered this function
    socketio.emit('chat',  data, broadcast=True, include_self=False)

# Note we need to add this line so we can import app in the python shell
if __name__ == "__main__":
# Note that we don't call app.run anymore. We call socketio.run with app arg
    socketio.run(
        app,
        host=os.getenv('IP', '0.0.0.0'),
        port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
    )
