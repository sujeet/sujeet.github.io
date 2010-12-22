//---------------------- Function to give "typing" effect to text ---------------------
var x=0;

var heading = "Sujeet Gholap's personal webpage";

function type_heading()
{
  document.getElementById('heading_text').innerHTML = heading.slice(0,x+1)+"_";
  x++;
  if (x==heading.length-1)
  {
    document.getElementById('heading_text').innerHTML = heading.slice(0,x+1);
    setTimeout("type_heading2()",1500);
  }
  else
  setTimeout("type_heading()",150);
}

function type_heading2()
{
x=0;
 setTimeout("type_heading()",150);
}

//---------------------- Function to give "typing" effect to text ENDS---------------------

function browser_check()
{
        var userAgent = navigator.userAgent;
        browsers = ["MSIE","Firefox","Iceweasel","Chrome","Konqueror","Opera","Safari"];
        var i = 0;
        while ((userAgent.search(browsers[i])==-1)&&(i<browsers.length)){i++;}
        if (i<browsers.length)
        {
            document.getElementById('browser_img').src= "./images/"+browsers[i]+".png";
        }
}

function os_check()
{
        var userAgent = navigator.userAgent;
        os = ["Windows","Linux","Mac OS X"];
        var i = 0;
        while ((userAgent.search(os[i])==-1)&&(i<os.length)){i++;}
        if (i<os.length)
        {
            document.getElementById('os_img').src= "./images/"+os[i]+".png";
        }
}

function show_infi_alert()
{
        var userAgent = navigator.userAgent;
        browsers = ["MSIE","Firefox","Iceweasel","Chrome","Konqueror","Opera","Safari"];
        var i = 0;
        while ((userAgent.search(browsers[i])==-1)&&(i<browsers.length)){i++;}
        if ((browsers[i] == "Firefox")||(browsers[i] == "Iceweasel")||(browsers[i] == "Konqueror"))
        {
          document.getElementById('LMHFWYB').innerHTML = '<h3>Some fun...<\/h3><button type="button" onclick="infi_alert()"><img src="./images/devil.png"><\/img><\/button><table border="0"><tr><td valign="top">Caution!<\/td><td>: DO NOT press this button if some important work is going on in your browser!<\/td><\/tr><tr><td valign="top">Curious?<\/td><td>: If you want to know what "LMHFWYB!" stands for, finish the important work going on in your browser and press the button.<\/td><\/tr><\/table>';
        }
}

function infi_alert()
{
  while(1)
  {
    alert("Let Me Have Fun With Your Browser !");
  }
}

function set_theme(n)
{
  document.getElementById('style_sheet').href="./themes/"+n+"/style.css";
}





