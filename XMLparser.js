const reader = require('xlsx')
  
// Reading our test file
const file = reader.readFile('JsonFiles/TestsParFeuille.xlsx')    

let data = [[],[],[],[]];

const sheets = file.SheetNames
for(let i = 0; i < sheets.length; i++)
{
   const temp = reader.utils.sheet_to_json(
        file.Sheets[sheets[i]])
   temp.forEach((res) => {
      data[i].push(res)
   })
}

// Printing data
var dataExigences = JSON.stringify(data[0]);
var dataTests = JSON.stringify(data[1]);
var dataExecutions = JSON.stringify(data[2]);
var dataDefauts = JSON.stringify(data[3]);

var fs = require('fs');
fs.writeFile("JsonFiles/ListeExigences.json", dataExigences, function(err, result) {
    if(err) console.log('error', err);
});
fs.writeFile("JsonFiles/ListeTests.json", dataTests, function(err, result) {
   if(err) console.log('error', err);
});
fs.writeFile("JsonFiles/ListeExecutions.json", dataExecutions, function(err, result) {
   if(err) console.log('error', err);
});
fs.writeFile("JsonFiles/ListeDefauts.json", dataDefauts, function(err, result) {
   if(err) console.log('error', err);
});
