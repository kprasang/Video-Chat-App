const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4} = require('uuid'); // generates random unique ids for rooms
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
app.set('view engine', 'ejs');  // to use ejs file(also install ejs)
app.use(express.static("public"));
app.use('/peerjs', peerServer)

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);   // when you go to main url it will automatically generate a unique id and redirect you to it
})

app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room})
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);       // emits when someone else conencts
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message)
        })

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
        })
    })
})

server.listen(process.env.PORT||3030);