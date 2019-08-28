
'use strict'
var results;
const fs = require('fs');
var sleep = require('system-sleep');
var dataArray=[];
const config = require('config');
var http = require("http");
var mysql=require("mysql");
let sqlSorgusu = `SELECT * FROM names`;
let sqlSorgusu2 = `UPDATE names SET isMeaningful = 'Yes' WHERE name = ?;`;
let sqlSorgusu3 =`UPDATE names SET isMeaningful = 'No' WHERE name = ?;`;
var con=mysql.createConnection(config.get("NameVerifyConfig.mySqlDbConfig"));
var output=config.get("NameVerifyConfig.filePath.path")+config.get("NameVerifyConfig.filePath.fileName");//ok

if(config.get("NameVerifyConfig.Options.choosen")===0){

con.query(sqlSorgusu, function (err, results, fields) {
  if (err) throw err.message;

  con.query(sqlSorgusu, function (err, results) {
    if (err) throw err.message;
    console.log(results);
    console.log(results[0].name);
    
    for(var i = 0; i < results.length; i++){
      console.log(results[i]);
     istek(results[i].name);
    sleep(0.5*1000);
       }
  });

});
}


else{
  fs.readFile(output, 'utf8', function (err, data) {//ok
    dataArray = data.split("\r\n");
    for(let i = 0; i < dataArray.length-1; i++){
    istek(dataArray[i]);
    sleep(0.5*1000);
    }
  })
  
}

function istek(name){
  
http.get(config.get("NameVerifyConfig.URLs.url")+ name +
config.get("NameVerifyConfig.URLs.key"),  (response) => {
    response.setEncoding('utf8')
   // console.log(dataArray);
    var sonuc = '';
    response.on('data',  (rawData)=> {
          console.log(name);
          console.log(rawData);
          
          var jsonSonuc = JSON.parse(rawData);
         //console.log(jsonSonuc)
         var keys = Object.keys(jsonSonuc);
         
         if(jsonSonuc[keys[0]].name === name){
          
            fs.appendFileSync(output,name+ ",Meaningful "+ "\n" );
          
              con.query(sqlSorgusu2,name, function (err, results) {
                if (err) throw err.message;
                console.log("eklendi");
          }
              
              )}
          if(jsonSonuc[keys[0]].name !== name){
            fs.appendFileSync(output,name+ ",UnMeaningful "+ "\n" );//ok
    
            con.query(sqlSorgusu3,name, function (err, results) {
              if (err) throw err.message;
              console.log("eklendi");
        }
      
            )
          }
          })
    response.on('error',  (hata)=> {
       console.log('Yüklenme sırasında bir hata oluştu:' + hata.message)
        
    })
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
  return false;
})

return true;
}

