///create comment

var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool=require('pg').Pool;
var crypto=require('crypto');
var bodyParser=require('body-parser');
var session=require('express-session');

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
  secret:'randomValue',
  cookie:{maxAge:1000*60*60*24*30}
}));

var config= {
    database:'mjccaroline',
    user: 'mjccaroline',
    host:'db.imad.hasura-app.io',
    port: '5432',
    password:process.env.DB_PASSWORD
};

var pool=new Pool(config);

var sidebar=`<ul id="sidebar">
  <li><a href="/">Home</a></li>
  <li><a href="/AboutMe">About Me</a></li>
  <li><a href="/SignUp">Sign up</a></li>
  <li><a href="/SignIn">Sign in</a></li>
  <li><a href="/Articles">Articles</a></li>
  <li><a href="#" id="logout"></a></li>
</ul>`;

var maincontents={
'AboutMe':`<h3>Personal Info</h3>

            <p>
              Hi, I am Maria Caroline Jose from, Kerala - the God's Own Country.
            </p>

            <p>
              My hobbies are:
              <ul>
                <li>Travelling</li>
                <li>Driving</li>
                <li>Reading books</li>
              </ul>
            </p>
            <br>
            <h3>Professional Info</h3>

            <p>
              I am a B Tech graduate from Government Engineering College, Thrissur
            </p>

            <p>
              I like to code.
            </p>`,
'SignUp':`<form>
            <label for="username">username</label>
            <br>
            <input type="text" id="username" placeholder="username" required="true">
            <br>
            <br>

            <label for="password">password</label>
            <br>
            <input type="password" id="password" placeholder="password" required="true">
            <br>
            <br>

            <label for="password">confirm password</label>
            <br>
            <input type="password" id="confirm_password" required="true">
            <br>
            <br>

            <input type="submit" id="new_user" value="Sign Up" />
          </form>`,
'SignIn':`<form>
            <label for="username">username</label>
            <br>
            <input type="text" id="username" placeholder="username" required="true">
            <br>
            <br>

            <label for="password">password</label>
            <br>
            <input type="password" id="password" placeholder=password required="true">
            <br>
            <br>

            <input type="submit" id="login" value="Login" />
          </form>`
};

function createTemplate(data) {
  var htmltemplate=`<!doctype html>
  <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="/ui/style.css" rel="stylesheet" />
        <link href="/download.ico" rel="shortcut icon" type="image/png"/>
        <title> Tripping!!! </title>
      </head>

      <body>

          ${sidebar}

        <div class="content-text" >
          ${data}
        </div>
      </body>
  </html>
`
return htmltemplate;
}

///////////////////////////articles//////////////////////////////////////////////////////////


function createArticle(article,username) {
  var htmltemplate=`<!doctype html>
  <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="/ui/style.css" rel="stylesheet" />
        <link href="/download.ico" rel="shortcut icon" type="image/png"/>
        <title> Tripping!!! </title>
      </head>

      <body>

          ${sidebar}

        <div class="content-text" >
          <h3>${article.title}</h3>
          <div id="content">
            ${article.content}
          </div>
          <hr>
          <p id="details">
            Created by ${username} on ${(article.date).toDateString()}
            </p>
          <p id="${article.article_id}">Article_id:${article.article_id}
          </p>
          <hr>
          <br>
          <div id="comment_section">
            <button type="button" id="comment">View commments</button>
            <button type="button" id="addComment" disabled>Comment</button>
      </div>`;
      return htmltemplate;
}
/////////////////////////////</article>//////////////////////////////////////////////////////
function hash(input,salt) {
  var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
  return ['pbkdff2',"10000",salt,hashed.toString('hex')].join('$');
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

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
      res.status(500).send('Something wrong with the server. Try Again.');
    }
    else{
      if(result.rows.length===0){
        res.status(403).send('Invalid username or password');

        }
        else{
          var hashp=result.rows[0].password;
          var salt=hashp.split('$')[2];
          var hashed=hash(password,salt);
          if(hashp===hashed){
            req.session.auth={userId:result.rows[0].userid};
            res.send('Login successfull');///INCLUDE STATUS FOR successfull COMPLETION OF REQUEST
          }else{
            res.status(403).send('Invalid username or password');
          }
        }
      }

  });
});

app.get('/chk-login',function(req,res){
  if(req.session&& req.session.auth && req.session.auth.userId){
    res.send('Logged in');
  }
  else{
    res.send('not logged in');
  }
});

app.get('/logout',function(req,res){
  delete req.session.auth;
  res.send('Successfully logged out');
});

//implement username using span and client side scripting
app.get('/username',function(req,res){
  var userid=req.query.id;                        //check whether it is req.query.userid
  pool.query('SELECT username FROM "user" u,articles a WHERE u.userid=a.userid AND $1=u.userid',[userid],function(err,result){
    if(err){
      res.status(500).send(err.toString());
    }
    else{
      if(result.rows.length===0){
        res.status(403).send('Error. Unknown User');
      }
      else {
        res.send((result.rows[0].username).toString());               //is toString really needed???
      }
    }
  });

});

app.get('/Articles',function(req,res){
    pool.query("SELECT article_id,title FROM articles",function(err,result){
      if(err){
        res.status(500).send(err.toString());
      }
      else{
        if(result.rows.length===0){
          res.status(404).send('No articles found!!!');
        }
      else{
        var articlelist=`<div class="content-text" >
          <h3>Aricles</h3>
          <ol id="list">`;
        for (var i = 0; i < result.rows.length; i++) {
          var article=result.rows[i];
          //articles.push(article);
          articlelist+=`<li><a href="/Articles/${article.ariticle_id}>${article.title} (article_id: ${article.ariticle_id})</a></li>"``;          `
        }
        articlelist+='</ol>';
        res.send(createTemplate(articlelist));
      }
      }
    });
});

app.get('/Articles/:id',function(req,res){
  var id=req.params.id;

  pool.query("SELECT * FROM articles WHERE id=$1",[id],function(err,result){
    if(err){
      res.status(500).send(err.toString());
    }
    else{
      if(result.rows.length===0){
        res.status(404).send('No article found!!!');
      }
      else{
        var username;
        var article=result.rows[0];
        username=findUsername(article.userid);  //findUsername doesnot exists!!!
        res.send(createArticle(article,username))
    }
    }
  });
});

app.get('/Articles/comments',function(req,res){
  ariticle_id=req.query.article_id;
  pool.query('SELECT * FROM comments WHERE article_id=$1',[article_id],function(err,result){
    if(err){
      res.status(500).send(err.toString());
    }
    else{
      var comments=result.rows;
      if(result.rows.length===0){
        res.status(404).send('No comments found.');
      }
      else{
        res.send(JSON.stringify(commments));
      }
    }
  });
});

app.get('/Article/addComment',function(req,res){
  //extract comment, date and userid
  var comment;
  var userid;
  var date;
  var article_id;

  pool.query('INSERT INTO comments (comment,userid,date,article_id) VALUES ($1,$2,$3)',[comment,userid,date,article_id],function(err,result){
    if(err){
      res.status(500).send(err.toString());
    }
    else{
      res.send('Comment successfully added');
    }
  });
});

app.get('/:maincontent',function(req,res){
  var maincontent=req.params.maincontent;
  res.send(createTemplate(maincontents[maincontent]));
});

app.get('/ui/pr.jpg',function(req,res){
  res.sendFile(path.join(__dirname,'ui','pr.jpg'));
});



var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
