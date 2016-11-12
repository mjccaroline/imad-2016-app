var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool=require('pg').Pool;

var app = express();
app.use(morgan('combined'));

var config= {
    database:'mjccaroline',
    user: 'mjccaroline',
    host:'db.imad.hasura-app.io',
    port: '5432',
    password:process.env.DB_PASSWORD
};



var articles ={
 'article_one':{
   title:'Article-one',
   date:'Oct 29, 2016',
   content:`<p> This is article-one.Welcome </p>
   <p> Learning server side templating</p>`
    },

  'article_two':{
   title:'Article two',
   date:'Nov 1, 2016',
   content:`<p> Second article.</p>
   <p>Keep going!!!</p>`
 }

};
function createTemplate(data)  {
  var title=data.title;
  var date=data.date;
  var content=data.content;

 var htmltemplate=`<!doctype html>
 <html>
 <head>
   <title> ${title}</title>
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <link href="/ui/style.css" rel="stylesheet" />
   <link href="/download.ico" rel="shortcut icon" type="image/png"/>
 </head>
 <body>
   <div class="container">
     <div>
       <a href="/">Home</a>
     </div>
     <hr/>
   <h3> ${title} </h3>
   <div>
     ${date}
   </div>
   <div>
       ${content}
     </div>
 </div>
 </body>
 </html>
`;

return htmltemplate;
}
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

var pool=new Pool(config);

app.get('/test_db',function(req,res){
   pool.query('SELECT * FROM user',function(){
       if(err) {
           res.status(500).send(err.toString());
       }
       else {
           res.send(JSON.stringify(result));
       }
   }); 
});

var names=[];
app.get('/submit_name',function (req,res) {
  var name=req.query.name;
  names.push(name);
  res.send(JSON.stringify(names));
});

var counter=0;
app.get('/counter',function(req,res) {
  counter=counter+1;
  res.send(counter.toString());
});

app.get('/ui/pr.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'pr.jpg'));
});

app.get('/download.ico', function (req, res) {
  res.sendFile(path.join(__dirname,  'download.ico'));
});

app.get('/:articleName', function (req, res) {
  var articleName=req.params.articleName;
  res.send(createTemplate(articles[articleName]));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});





var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
