console.log('Loaded!');
var img=document.getElementById('dp');
var margintop=0;
var timer=0;

img.onclick=function () {
  timer=setInterval(entry,100);
};

function entry() {
  margintop=margintop+5;
  if(margintop==50)  {
    clearInterval(timer);
  }
  img.style.marginTop=margintop+'px';
}
