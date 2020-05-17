document.addEventListener("DOMContentLoaded", function(event) {

  let div = document.querySelector('#flag');
  x=15;
  y=9;
  let color = 'black';
  let down = false;
  for (i = 0; i < x*y; i++) {
    div.appendChild(document.createElement('span'))
      .classList.add('pixel');
  }
  document.querySelectorAll('#colselect>span').forEach(caller_object=>{
    caller_object.addEventListener('click',e=>{
      color = e.target.id;
    })
  });
  document.querySelectorAll('.pixel').forEach(caller_object=>{
    caller_object.addEventListener('mouseover',e=>{
      if (down) {
        e.target.style.background=color;
        document.querySelector('#selected').innerHTML=validate();
      }
    });
    caller_object.addEventListener('mousedown',e=>{
      e.target.style.background=color;
      document.querySelector('#selected').innerHTML=validate();
    })
  });
  div.addEventListener('mousedown',e=>{
    down=true;
  });
  div.addEventListener('mouseup',e=>{
    down=false;
  });
  function getArr() {
    ret = [];
    document.querySelectorAll('.pixel').forEach(caller_object=>{
      ret.push(caller_object.style.background);
    });
    return ret;
  }
  let flags = [[ "blue", "blue", "blue", "blue", "blue", "blue", "red", "red", "red", "red", "red", "red", "red", "red", "red", "blue", "white", "blue", "white", "blue", "blue", "white", "white", "white", "white", "white", "white", "white", "white", "white", "blue", "blue", "white", "blue", "white", "blue", "red", "red", "red", "red", "red", "red", "red", "red", "red", "blue", "blue", "blue", "blue", "blue", "blue", "white", "white", "white", "white", "white", "white", "white", "white", "white", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red" ],[ "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "red", "red", "red", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "red", "red", "red", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "red", "red", "red", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white" ],["white", "white", "white", "white", "white", "white", "white", "red", "white", "white", "white", "white", "white", "white", "white",
  "white", "white", "white", "white", "white", "white", "white", "red", "white", "white", "white", "white", "white", "white", "white",
  "white", "white", "white", "white", "white", "white", "white", "red", "white", "white", "white", "white", "white", "white", "white",
  "white", "white", "white", "white", "white", "white", "white", "red", "white", "white", "white", "white", "white", "white", "white",
  "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red", "red",
  "white", "white", "white", "white", "white", "white", "white", "red", "white", "white", "white", "white", "white", "white", "white",
  "white", "white", "white", "white", "white", "white", "white", "red", "white", "white", "white", "white", "white", "white", "white",
  "white", "white", "white", "white", "white", "white", "white", "red", "white", "white", "white", "white", "white", "white", "white",
  "white", "white", "white", "white", "white", "white", "white", "red", "white", "white", "white", "white", "white", "white", "white"]];
  let flagnames=['USA','Japan','England'];
  function validate() {
    a=getArr().map(x=>{return x==''?'white':x});
    for (i = 0; i < flags.length; i++) {
      if (JSON.stringify(flags[i].map(x=>{return x==''?'white':x})) == JSON.stringify(a)) {
        return flagnames[i];
      }
    }
    return 'none';
  }

});
