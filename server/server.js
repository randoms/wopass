var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var record =require('./model.js');
var Promise = require('promise');
var crypto = require('crypto');
var serverKeys = require('./serverKeys');

/*
configurations
dburi db url address
maxDataSize 10M
*/
var dburi = 'mongodb://localhost:27017/wopass';
var maxDataSize = 10*1024*1024;

/*
new Promise(function(resolve, reject){
    MongoClient.connect(dburi, function(err, db){
        if(err)console.log(err);
        coll = db.collection('wopass');
        
        var testRec = new record(coll, "Randoms", "jdklsakldsa");
        testRec.save();
        record.find(coll, "Randoms", function(res){
            console.log(res.toJSON());
        })

        resolve(coll);
    })  
}).catch(function(){
    console.log('create database failed');
}).then(function(db){
    console.log('start listening on port 9999');
    // create http server
    var server = http.createServer(function(req, res){
        var data = "";
        req.on('data', function(rawData){
            rawData = rawData||"";
            data += rawData;
            if(data.length > maxDataSize){
                console.log("User data exceeds");
                return res.end(400,"user data exceeds max user data size");
            }
        })

        req.on('end', function(rawData){
            rawData = rawData || "";
            data += rawData;
            updateRecord(data)
            .then(function(result){
                console.log(JSON.stringify(result));
                if(result.code == 0){
                    return res.end(JSON.stringify({
                        'retcode': '0',
                        'desc': 'update record success',
                        'record': result.record,
                    }));
                }else{
                    return res.end(JSON.stringify({
                        'retcode': '-1',
                        'desc': result.desc,
                    }));
                }
            }); 
        });
    })
    server.listen(9999);
})
*/



function updateRecord(data){
    return new Promise(function(resolve, reject){
        // json parse
        try{
            data = JSON.parse(data);
        }catch(e){
            console.log(e);
            console.log(data);
            return resolve({
                code: -1,
                desc: 'json error',
            });
        }

        // check attr
        if(typeof data.encrypted == "undefined" || typeof data.encryptedKey == "undefined")
            return resolve({
                code: -1,
                desc: 'data formate error',
            })

        // try to decrypt data

    })
}

encrypt("this is a test", serverKeys.privateKey);

function encrypt(data, keyJSON){
    var data = new Buffer(data);
    var randomsKeys = geneRandomHexStr(64); // 128 bit keys
    var encryptedKey = new Buffer(randomsKeys, 'hex');
    var cipheriv = crypto.createCipheriv('aes-256-cbc', encryptedKey, new Buffer("000102030405060708090a0b0c0d0e0f","hex"));
    cipheriv.update(data);
    var encryptedData = cipheriv.final('hex');
    encryptedKey = crypto.publicEncrypt(keyJSON, encryptedKey);
    console.log(encryptedKey)
    return;


    return crypto.subtle.importKey("jwk", keyJSON, {name: "rsa-oaep", hash: {name: "sha-256"}},true, ['encrypt'])
        .then(function(publicKey){
            return crypto.subtle.encrypt({name: "rsa-oaep"}, publicKey, encryptedKey);
        }).then(function(res){
            encryptedKey = bytesToHexString(res)
            // use aes to encrypt data
            // import aes key
            return crypto.subtle.importKey('raw', 
                hexStringToUint8Array(randomsKeys) , aesAlgo, false, ['encrypt', 'decrypt']);
            
        }).then(function(result){
            // use aes to encode
            return crypto.subtle.encrypt(aesAlgo,
             result, data);
        }).then(function(encryptedData){
            return Promise.resolve({
                'encrypted': bytesToHexString(encryptedData),
                'encryptedKey': encryptedKey,
            });
        });

    //console.log(new TextDecoder("UTF-8").decode(data));
    // use server public key to encrypt

}

function decrypt(data, keyJSON){
    var encryptedKey = hexStringToUint8Array(data.encryptedKey);
    var encryptedData = hexStringToUint8Array(data.encrypted);
    var decryptedKey = crypto.privateDecrypt(keyJSON, hexStringToUint8Array(encryptedKey));
    console.log(decryptedKey);
}


function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function hexStringToUint8Array(hexString) {
    if (hexString.length % 2 != 0)
        throw "Invalid hexString";
    var arrayBuffer = new Uint8Array(hexString.length / 2);
    for (var i = 0; i < hexString.length; i += 2) {
        var byteValue = parseInt(hexString.substr(i, 2), 16);
        if (byteValue == NaN)
            throw "Invalid hexString";
        arrayBuffer[i/2] = byteValue;
    }
    return arrayBuffer;
}

function bytesToHexString(bytes) {
    if (!bytes)
        return null;
    bytes = new Uint8Array(bytes);
    var hexBytes = [];
    for (var i = 0; i < bytes.length; ++i) {
        var byteString = bytes[i].toString(16);
        if (byteString.length < 2)
            byteString = "0" + byteString;
        hexBytes.push(byteString);
    }
    return hexBytes.join("");
}

function geneRandomHexStr(length){
    var text = "";
    var possible = "0123456789abcdef";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}