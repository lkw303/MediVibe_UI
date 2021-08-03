var socket = io.connect("http://localhost:8080");


socket.on('Read_return', function(data){
    console.log('front end read return');
    console.log("read data is "+ data.data);
    alert("read " + data.data);
})

function byte_to_hex(byte_val){ // byte val should be <16 i.e 4bits long
    var hex_str
    if (byte_val < 10){
          hex_str = byte_val;
    }
    else if (byte_val >= 10 && byte_val <= 16 ){
      hex_str = (String.fromCharCode(byte_val - 10 +"A".charCodeAt(0)).toUpperCase());
    }
    return hex_str;
}

function int_to_hex(len,int_string){//length of hex digits 
  var hex_str = "";
  var val = parseInt(int_string,10)
  for (var i =0; i < len; i++){
      var hex_val = (val & (2**((len-i)*4) - 2**((len-i-1)*4))) >> (4*(len-i-1));
      hex_char = byte_to_hex(hex_val);
      hex_str += hex_char;
  }   
  
  return hex_str;
}

function getBlock_1(){
  var info_stream = "";
  var ls_id = ["start_hr", "start_min", "end_hr", "end_min", "frequency", "dosage", "size", "capacity"]
  var ls_size = [2, 2 , 2, 2, 2, 2, 2, 2];
  var ls_info = [];
  var ls_pos = [0,1,2,3,4,5,6,7];
  for (var i = 0 ; i < ls_id.length; i++){
      var elem = document.getElementById(ls_id[i]);
      var val = elem.value;
      hex_str = int_to_hex(ls_size[i], val);
      ls_info[ls_pos[i]] = hex_str;
  }
  for (i = 0 ; i < ls_info.length ; i ++){
      info_stream += ls_info[i];
      
  }
  return info_stream;
}

function getBlock_2(){
  var info_stream = "BC"
  var ls_id = ["cart_id", "capacity", "dosage", "frequency", "start_hr", "start_min", "size" ];
  var ls_size = [2,2,2,2,2,2,2];
  for (var i = 0 ; i < ls_id.length; i++){
      var elem = document.getElementById(ls_id[i]);
      var val = elem.value;
      var hex_str = int_to_hex(ls_size[i], val);
      info_stream += hex_str;
  }
  info_stream += "DE";
  for (var i = 0 ;i < 16 - (info_stream.length/2); i++){
      info_stream += "00";
  }
  return info_stream;

}

function connect(){
    socket.emit('Connect');
}

function sendSocket(data){//sends line ending
    console.log("writing "+ data);
    socket.emit(data + "\n");
    // port.write(data + "\n");
}

function writeRFID(){
    block_1 = getBlock_1();
    block_2 = getBlock_2();
    console.log("writing rfid block1: " + block_1 + " block_2: " + block_2 );
    socket.emit('Write', {
        block1: block_1,
        block2: block_2
    })
    alert("block 1: " + block_1 +" block_2: " + block_2);
}

function readRFID(){
    console.log("reading rfid");
    socket.emit("Read");
}



