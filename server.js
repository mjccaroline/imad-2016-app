var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser=require('body-parser');

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

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
     ${date.toDateString()}
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

function hash(input,salt) {
  var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
  return ['pbkdff2',"10000",salt,hashed.toString('hex')].join('$');
}

app.get('/hash/:input',function(req,res){

  var hashed=hash(req.params.input,'random-string');
  res.send(hashed);
});

var pool=new Pool(config);

app.post('/create_user',function(req,res){
    var salt=crypto.randomBytes(128).toString('hex');
    var username=req.body.username;
    var password=req.body.password;
    var hashp=hash(password,salt);
    pool.query('INSERT INTO "user" ("username","password")  VALUES ($1,$2)',[username,password],function(err,result){
       if(err) {
           res.status(500).send(err.toString());
       } else {
           res.send('User successfully creeated.');
       }
    });
});

app.post('/login',function(req,res){
  var username=req.body.username;
  var password=req.body.password;
  pool.query('SELECT * FROM "user" WHERE username=$1',[username],function(err,result){
    if(err){
      res.status(500).send(err.toString());
    }
    else{
      if(result.rows.length===0){
        res.status(403).send('invalid username or password');

        }
        else{
          var hashp=result.rows[0].password;
          var salt=hashp.split('$')[2];
          var hashed=hash(password,salt);
          if(hashp===hashed){
            res.send('Login successfull');
          }else{
            res.status(403).send('invalid username or password');
          }
        }
      }
    }
  });
});

app.get('/test_db',function(req,res){
   pool.query('SELECT * FROM test',function(err,result){
       if(err) {
           res.status(500).send(err.toString());
       }
       else {
           res.send(JSON.stringify(result.rows));
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
//  var articleName=req.params.articleName;
  pool.query("SELECT * FROM articles WHERE title=$1",[req.params.articleName],function(err,result){
     if(err){
         res.status(500).send(err.toString());
     }
     else{
         if(result.rows.length===0){
             res.status(404).send('Article not found');
         }
         else {
             var article=result.rows[0];
             res.send(createTemplate(article));
         }
     }
  });
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
