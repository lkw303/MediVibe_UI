const express = require("express");
// const { Server } = require("http");
const path = require("path");
socket = require("socket.io");

const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

const app = express();

server = app.listen(process.env.PORT || 8080, () => console.log("Server running..."));
app.use("/front_end", express.static(path.resolve(__dirname,"front_end")));
app.get("/*",(req, res) =>{
    res.sendFile(path.resolve(__dirname,"front_end","index.html"));
});

var io = socket(server);



function connect(){
    console.log("connecting to serial port...")
    port = new SerialPort("COM25", {
        baudRate: 9600,
    });
    parser = new Readline();
    port.pipe(parser);
    parser.on("data", (line)=> {
        console.log(line);
        io.emit("Read_return",{data:line});
        console.log("returning read info");
    });
    console.log("connected to serial");
    // alert("Serial Connected");
}

function sendSerial(data){//sends line ending
    console.log("writing "+ data )
    port.write(data + "\n");
}

function readRFID(){
    console.log("serial sending read")
    sendSerial("READ");
    
}

function writeRFID(block1_data, block2_data){
    console.log("serial sending write")
    console.log("Block 1 is " + block1_data);
    console.log("Block 2 is " + block2_data);
    sendSerial("WRITE");
    sendSerial(block1_data);
    // sendSerial(block2_data);

}
function writeRFID2(block1_data, block2_data){
    console.log("Serial Sending Block 2");
    console.log("Block 1 is " + block1_data);
    console.log("Block 2 is " + block2_data);
    sendSerial(block2_data);
}

io.on('connection', function(socket){
    console.log('made socket connection ', socket.id);
    socket.on('Connect', ()=>connect());
    socket.on('Read', ()=>readRFID());
    socket.on('Write',(data)=> writeRFID(data.block1, data.block2));
    socket.on('Write2',(data)=> writeRFID2(data.block1, data.block2));
})


// app.use("/static", express.static(path.resolve(__dirname,"front_end", "static")));
