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




//------------------------------- Roman to decimal convertor ------------------------------------------


romanNums = ['I','V','X','L','C','D','M'];
decimalNums = [1,5,10,50,100,500,1000];
I =['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
X =['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'];
C =['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'];
M =['', 'M', 'MM', 'MMM', 'MMMM'];
query="";


function D2R (q)
{
    thousands = (q-q%1000)/1000;
    hundreds = (q-1000*thousands - (q-1000*thousands)%100 )/100;
    tens = (q-1000*thousands-100*hundreds - (q-1000*thousands-100*hundreds)%10 )/10 ;
    units = q%10 ;
    x = M[thousands] + C[hundreds] + X[tens] + I[units];
    return x;
}


function R2D (q)
{
    ans = 0;
    if (q.length == 1)
    {
      ans = decimalNums[romanNums.indexOf(q)];
    }
    else
    {
        for (i=0;i<=q.length;i++)
        {
            x=decimalNums[romanNums.indexOf(q[i])];
            y=decimalNums[romanNums.indexOf(q[i+1])];
            if (x >= y){ ans += x ;}
            if (x < y ){ ans -= x ;}
        }
        ans += decimalNums[romanNums.indexOf(q[q.length-1])];
    }
    if (ans < 4000){return ans ;}
    else {return -10 ;}  
}


function pressed (ch)
{
  if (query + ch == D2R(R2D(query + ch)))
  {
    query = query + ch;
    document.getElementById('roman').innerHTML = query;
    document.getElementById('decimal').innerHTML = R2D(query);
  }
}


function reset()
{
  query = "";
  document.getElementById('roman').innerHTML = "";
  document.getElementById('decimal').innerHTML = "";
}


function backspace()
{
  if (query.length > 1)
  {
    query = query.slice(0,-1);
    document.getElementById('roman').innerHTML = query;
    document.getElementById('decimal').innerHTML = R2D(query);
  }
  else
  {
    reset();
  }
}


//------------------------------- Roman to decimal convertor ends here ---------------------------------

//------------------------------- Show date   ----------------------------------------------------------
function print_date()
{
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  currTime = new Date();
  day =days[currTime.getDay()];
  date = currTime.getDate();
  month = months[currTime.getMonth()];
  year = currTime.getFullYear();
  document.getElementById('calender').innerHTML = day + ", " + date + " " + month + " " +year;
}



