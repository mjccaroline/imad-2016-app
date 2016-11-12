console.log('Loaded!');
var img=document.getElementById('dp');
var margintop=0;
var timer=0;

//implementing counter
var button=document.getElementById('counter');
button.onclick=function ()  {
  var request =new XMLHttpRequest();

  request.onreadystatechange=function() {
	if(request.readyState===XMLHttpRequest.DONE) {
    //if the get request is successfully loaded
	if(request.status===200)  {
    //extracting the response
		var counter=request.responseText;
		var span=document.getElementById('count');
		span.innerHTML=counter.toString();
           }
	}

  };
  //requesting a GEt http request
  request.open('GET','http://mjccaroline.imad.hasura-app.io/counter',true);
  request.send(null);
};

//for animation
img.onclick=function () {
  timer=setInterval(entry,100);
};

function entry() {
  margintop=margintop+5;
  if(margintop==50)  {
    clearInterval(timer);
    margintop=0;
  }
  img.style.marginTop=margintop+'px';
}

//playing around with JSON; first step for adding comments
var submitbtn=document.getElementById('sbt_btn');
submitbtn.onclick=function() {
  var request=new XMLHttpRequest();
  request.onreadystatechange=function() {

    if(request.readyState===XMLHttpRequest.DONE){

      if(request.status===200){

        var names=request.responseText;
        names=JSON.parse(names);
        var list='';
        for(var i=0;i<names.length;i++)  {
          list+='<li>'+names[i]+'</li>';
        }
        var ulist=document.getElementById('namelist');
        ulist.innerHTML=list;
        }
      }
    };
    var textinput=document.getElementById('name');
    var name=textinput.value;
    request.open('GET','http://mjccaroline.imad.hasura-app.io/submit_name?name='+name);
    request.send(null);
  };
