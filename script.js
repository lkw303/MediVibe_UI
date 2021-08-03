const express = require("express");
const path = require("path");
const app = express();

const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");


app.listen(process.env.PORT || 8080, () => console.log("Server running..."));

app.use("/static", express.static(path.resolve(__dirname,"front_end", "static")));

app.get("/*",(req, res) =>{
    res.sendFile(path.resolve(__dirname,"front_end","index.html"));
});


// module.exports.connect = connect
// module.exports.byte_to_hex = byte_to_hex
// module.exports.int_to_hex = int_to_hex
// module.exports.getBlock_1 = getBlock_1
// module.exports.getBlock_2 = getBlock_2
// module.exports.readRFID = readRFID
// module.exports.writeRFID = writeRFID

module.exports= {
    connect: function connect(){
        console.log("connecting to serial port...")
        const port = new SerialPort("COM5", {
            baudRate: 9600,
        });
        const parser = new Readline();
        port.pipe(parser);
        parser.on("data", (line)=> console.log(line));
    },
    
    
    byte_to_hex : function (byte_val){ // byte val should be <16 i.e 4bits long
          var hex_str
          if (byte_val < 10){
                hex_str = byte_val;
          }
          else if (byte_val >= 10 && byte_val <= 16 ){
            hex_str = (String.fromCharCode(byte_val - 10 +"A".charCodeAt(0)).toUpperCase());
          }
          return hex_str;
    },
    
    int_to_hex : function (len,int_string){//length of hex digits 
        var hex_str = "";
        var val = parseInt(int_string,10)
        for (var i =0; i < len; i++){
            var hex_val = (val & (2**((len-i)*4) - 2**((len-i-1)*4))) >> (4*(len-i-1));
            hex_char = byte_to_hex(hex_val)
            hex_str += hex_char;
        }   
        
        return hex_str;
      },
    
      getBlock_1 : function (){
        var info_stream = ""
        var ls_id = ["patient_id", "staff_id", "cart_serial", "id" ]
        var ls_size = [8, 6 , 4, 6]
        var ls_info = ["CB",,,"AF",,"02",,"BA"]
        var ls_pos = [1,2,4,6]
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
    },
    
    getBlock_2 : function (){
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
    
    },
    
    prepareData : function (){ //converts from numerical strings to hex strings
        var info_stream = "01"
        var info_list = [1]
        doc_id_list.forEach((info)=>{
          var elem = document.getElementById(info);
          var val = elem.value;
          var byte_val = parseInt(val,10);
          var hex_str;
          hex_str += int_to_hex(2,val)
        //   if (byte_val < 10){
        //         hex_str = "0" + byte_to_hex(byte_val);
        //   }
        //   else if (byte_val >= 10 && byte_val <= 16 ){
        //     hex_str = "0" + byte_to_hex(byte_val);
        //   }
        //   else{
        //         var hex_1 = (byte_val & 0x0F)
        //         var hex_2 =(byte_val & 0xF0) >>4
        //         hex_str = byte_to_hex(hex_2)+ byte_to_hex(hex_1)
        //   }
    
          info_stream = info_stream.concat(hex_str);
          info_list.push(parseInt(hex_str));
        })
        info_list.push(11);
        info_stream = info_stream.concat("11");
        console.log(info_list);
        console.log(info_stream)
        return info_stream;
    },
    
    sendSerial : function (data){//sends line ending
        console.log("writing "+ data )
        port.write(data + "\n");
    },
    
    readRFID : function (){
        sendSerial("READ");
    },
    
    writeRFID : function (){
        sendSerial("WRITE");
        sendSerial(getBlock_1());
        sendSerial(getBlock_2());
    }

}







