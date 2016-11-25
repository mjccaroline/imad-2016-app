//embed article_id with title
//check the possibility of changing userid with username in article and comment  table
//enable add  comment button when logged in

var addComment=getElementById('addComment');
addComment.onclick=function(){
  var request=new XMLHttpRequest();
  //wht to do
  request.open('GET','http://mjccaroline.imad.hasura-app.io/addComment'); //or POST request???
  request.send(null);
};

var getcomments=getElementById('comment');//fill the id of the view comment button
var article_id= document.getElementsByTagName("H3")[0].getAttribute("id");   //title should be the only element with tag name h3

getcomments.onclick=function(){
  var request=new XMLHttpRequest();
  request.onreadystatechange=function(){
      if(request.readyState===XMLHttpRequest.DONE){
          if (request.status===200){
            var comments=request.responseText;
            comments=JSON.parse(comments);
            var commentshtml='';

            for (var i = 0; i < comments.length; i++) {

              //getting username from userid
              var username;
              var userid=comments[i].userid;
              var req2=new XMLHttpRequest();
              req2.onreadystatechange=function(){
                if(req2.readyState===XMLHttpRequest.DONE){
                  if(req2.status===200){
                    username=req2.responseText;
                  }
                }

              };
              req2.open('GET','http://mjccaroline.imad.hasura-app.io/username?id='+userid,true);
              req2.send(null);


              commentshtml+='<div id="'+comments[i].commentid+'">'+''+comments[i].comment+'</li>';
            }
          }
      }
  };
  request.open('GET','http://mjccaroline.imad.hasura-app.io/Articles/comments?article_id='+article_id,true);
  request.send(null);
};

//Sign up!!!
var new_user=document.getElementById('new_user');
new_user.onclick=function(){
  var username=document.getElementById('username').value;
  var password=document.getElementById('password').value;
  var confirm_password=document.getElementById('confirm_password').value;
  if(password===confirm_password){
    var request=new XMLHttpRequest();
    request.onreadystatechange=function(){
      if(request.readyState===XMLHttpRequest.DONE){
        if(request.status===200){
          alert('New user created. Go to Sign in tab to login.');
        }
        else if(request.status===500){
          alert('Some internal error occured at the server');
        }
      }
    };
    request.open('POST','http://mjccaroline.imad.hasura-app.io/create_user',true);
    request.setRequestHeader('Content-type','application/json');
    request.send(JSON.stringify({"username":username,"password":password}));// in the lecture the double quote along the username and password missinng
  }
  else{
      alert('confirm password should match the password');
  }
};

//Sign in!!!
var login=document.getElementById('login');
login.onclick=function(){
  var username=document.getElementById('username').value;
  var password=document.getElementById('password').value;
  var request=new XMLHttpRequest();
  request.onreadystatechange=function(){
    if (request.readyState===XMLHttpRequest.DONE) {
      if (request.status===200) {
        //session

      }
      alert(request.responseText);
    }
  };
  request.open('POST','http://mjccaroline.imad.hasura-app.io/login',true);
  request.setRequestHeader('Content-type','application/json');
  request.send(JSON.stringify({"username":username,"password":password}));// in the lecture the double quote along the username and password missinng
};
