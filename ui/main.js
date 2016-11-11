console.log('Loaded!');
var img=document.getElementById('dp');
var margintop=0;
var timer=0;
var counter=0;

var button=document.getElementById('counter');
button.onclick=function ()  {
  var request =new XMLHttpRequest();

  request.onreadystatechange=function() {
	if(request.readyState===XMLHttpRequest.DONE) {

	if(request.Status===200)  {
		var counter=request.responseText;
		var span=document.getElementById('count');
		span.innerHTML=counter.toString();
           }
	}

  };
  request.open('GET','http://mjccaroline.imad.hasura-app.io/counter',true);
  request.send(null);
};


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
