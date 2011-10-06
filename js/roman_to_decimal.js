var gblData = {
    romanNums   : ["I", "V", "X", "L", "C", "D", "M"],
    decimalNums : [1, 5, 10, 50, 100, 500, 1000],
    roman_array : [ ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
                    ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"],
                    ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"],
                    ["", "M", "MM", "MMM", "MMMM"] ],
    query       : ""
};

function D2R (num)
{
    var roman_value = "";
    var i = 0;
    while (i < 4 && num > 0) {
        roman_value = gblData.roman_array [i] [num % 10] + roman_value;
        num = Math.floor (num / 10);
        // Note : javascript / operator is NOT integer division.
        i ++;
    }
    return roman_value;
}


function R2D (roman_string)
{
    // scan the string from left to right
    // keep on adding the value of the character,
    // if the current value being added is lesser than
    // the one added previously, subtract the previously
    // added value twice.
    var ans = 0;
    var previously_added = 0;
    var to_be_added, i;
    if (roman_string.length == 1) {
        ans = gblData.decimalNums [gblData.romanNums.indexOf (roman_string) ];
    }
    else {
        for (i = 0; i < roman_string.length; i++) {
            to_be_added = gblData.decimalNums [gblData.romanNums.indexOf (roman_string.charAt (i)) ];
            ans += to_be_added;
            if (to_be_added > previously_added) { 
                ans -= previously_added * 2;
            }
            previously_added = to_be_added;
        }
    }
    if (ans < 4000) {
        return ans;
    }
    else {
        // This will make sure that roman numbers
        // greater than 3999 will follow the
        // following relation
        // num != D2R (R2D (num))
        return -10;
    }  
}


function pressed (ch)
{
    // Update the displays only if the entered
    // roman string so far is a valid roman number.
    function foo () {
        if (gblData.query + ch == D2R (R2D (gblData.query + ch))) {
            gblData.query = gblData.query + ch;
            document.getElementById('roman').innerHTML = gblData.query;
            document.getElementById('decimal').innerHTML = R2D (gblData.query);
        }
    }
    return foo;
}


function reset ()
{
    gblData.query = "";
    document.getElementById('roman').innerHTML = "";
    document.getElementById('decimal').innerHTML = "";
}


function backspace()
{
    if (gblData.query.length > 1) {
        gblData.query = gblData.query.slice (0,-1);
        document.getElementById('roman').innerHTML = gblData.query;
        document.getElementById('decimal').innerHTML = R2D(gblData.query);
    }
    else {
        reset ();
    }
}

function attach_handlers ()
{
    // Get the buttons and attach their onlclick handlers.
    var button_list = document.getElementsByClassName ("romanCharButton");
    var button, i;
    for (i = 0; i < button_list.length; i++) {
        button = button_list [i];
        button.onclick = pressed (button.innerHTML.trim());
    }
    document.getElementById ("resetButton").onclick = reset;
    document.getElementById ("backSpaceButton").onclick = backspace;
}

window.onload = attach_handlers;
