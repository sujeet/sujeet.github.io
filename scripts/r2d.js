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



