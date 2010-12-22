// functions to be able to use format strings as those in c
/**
sprintf() for JavaScript 0.6

Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of sprintf() for JavaScript nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


Changelog:
2007.04.03 - 0.1:
 - initial release
2007.09.11 - 0.2:
 - feature: added argument swapping
2007.09.17 - 0.3:
 - bug fix: no longer throws exception on empty paramenters (Hans Pufal)
2007.10.21 - 0.4:
 - unit test and patch (David Baird)
2010.05.09 - 0.5:
 - bug fix: 0 is now preceeded with a + sign
 - bug fix: the sign was not at the right position on padded results (Kamal Abdali)
 - switched from GPL to BSD license
2010.05.22 - 0.6:
 - reverted to 0.4 and fixed the bug regarding the sign of the number 0
 Note:
 Thanks to Raphael Pigulla <raph (at] n3rd [dot) org> (http://www.n3rd.org/)
 who warned me about a bug in 0.5, I discovered that the last update was
 a regress. I appologize for that.
**/

function str_repeat(i, m) {
	for (var o = []; m > 0; o[--m] = i);
	return o.join('');
}

function sprintf() {
	var i = 0, a, f = arguments[i++], o = [], m, p, c, x, s = '';
	while (f) {
		if (m = /^[^\x25]+/.exec(f)) {
			o.push(m[0]);
		}
		else if (m = /^\x25{2}/.exec(f)) {
			o.push('%');
		}
		else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
			if (((a = arguments[m[1] || i++]) == null) || (a == undefined)) {
				throw('Too few arguments.');
			}
			if (/[^s]/.test(m[7]) && (typeof(a) != 'number')) {
				throw('Expecting number but found ' + typeof(a));
			}
			switch (m[7]) {
				case 'b': a = a.toString(2); break;
				case 'c': a = String.fromCharCode(a); break;
				case 'd': a = parseInt(a); break;
				case 'e': a = m[6] ? a.toExponential(m[6]) : a.toExponential(); break;
				case 'f': a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a); break;
				case 'o': a = a.toString(8); break;
				case 's': a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a); break;
				case 'u': a = Math.abs(a); break;
				case 'x': a = a.toString(16); break;
				case 'X': a = a.toString(16).toUpperCase(); break;
			}
			a = (/[def]/.test(m[7]) && m[2] && a >= 0 ? '+'+ a : a);
			c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
			x = m[5] - String(a).length - s.length;
			p = m[5] ? str_repeat(c, x) : '';
			o.push(s + (m[4] ? a + p : p + a));
		}
		else {
			throw('Huh ?!');
		}
		f = f.substring(m[0].length);
	}
	return o.join('');
}

//functions to be able to use format strings as those in c end here


var num = 50;
var dimension = 9;
var live_color = "green";
var dead_color = "black";
var divboard = sprintf("<div id='divboard' style='width: %dpx; height: %dpx; margin: 0pt; padding: 0pt; border: 0pt none; background: %s;'>", num*dimension, num*dimension, dead_color);
board = new Array(num);
board2 = new Array(num);
play = new Array(1);
play[0] = 0;
var t;
var dragstarted = 0;

for ( i=0; i<num; i++ ){
    board[i] = new Array(num);
    board2[i] = new Array(num);
} 

function InitBoard(){ // generates the div arrangement and corrosponding arrays
    for ( i=0; i<num; i++ ){
        for ( j=0; j<num; j++ ){
            var id = i.toPrecision(2).toString() + j.toPrecision(2).toString();
            var clickedfunc = "Clicked("+i.toPrecision(2).toString()+","+ j.toPrecision(2).toString()+")";
            var draggedfunc = "DraggedOver("+i.toPrecision(2).toString()+","+ j.toPrecision(2).toString()+")";
	    var mousedownfunc = "javascript:dragstarted=1;"
	    var mouseupfunc =  "javascript:dragstarted=0;"
	    var newdiv = sprintf("<div id = '%s' onclick = '%s' onmousedown = '%s' onmouseup='%s' onmouseout='%s' style='width: %dpx; height: %dpx; background: %s; margin: 0pt; padding: 0pt; float: left;'></div>", id, clickedfunc, mousedownfunc, mouseupfunc, draggedfunc, dimension, dimension, dead_color);
	    divboard = divboard + newdiv;
            board[i][j] = dead_color;
            board2[i][j] = dead_color; 
        }
    }
    divboard = divboard + "</div>";
    document.getElementById("game_of_life").innerHTML = 'resetting...';
    document.getElementById("game_of_life").innerHTML = divboard;
}

function UpdateBoard(){
    for ( i=0; i<num; i++ ){
        for ( j=0; j<num; j++ ){
            var id =  i.toPrecision(2).toString() + j.toPrecision(2).toString();
            document.getElementById(id).style.background = board[i][j];        
        }    
    }
}

function CopyBoard(){
    for ( i=0; i<num; i++ ){
        for ( j=0; j<num; j++ ){
            board[i][j] = board2[i][j];
        }
    }
}


function Clicked(i,j){
    var id =  i.toPrecision(2).toString() + j.toPrecision(2).toString();
    if (board[i][j] == live_color){
	board[i][j] = dead_color;
	document.getElementById(id).style.background = dead_color;
    }
    else {
	board[i][j] = live_color;
	document.getElementById(id).style.background = live_color;
    }
}

function DraggedOver(i,j){
     if (dragstarted==1){
	  Clicked(i,j);
     }
}

function CountNeighbours(i,j){
    var count = 0;
        for ( x=1; x<4; x++ ){
            for ( y=1; y<4; y++ ){
                var a = i+x-2; if (a<0) a = num + a; else a = a % num;
                var b = j+y-2; if (b<0) b = num + b; else b = b % num;
                if ( board[a][b] == live_color ) count++ ;
            }
        }
    if ( board[i][j] == live_color ) count-- ;
    
    return count ;
}

function Simulate(){
    for ( var i=0; i<num; i++ ){
        for ( var j=0; j<num; j++ ){
            live_neighbours = CountNeighbours (i,j) ;
            if ( (live_neighbours < 2)||(live_neighbours > 3) )  board2[i][j] = dead_color ;
            else if ( (board[i][j] == dead_color )&&(live_neighbours == 3) )  board2[i][j] = live_color ;
            else if ( (board[i][j] == dead_color )&&(live_neighbours == 2) )  board2[i][j] = dead_color ;
            else board2[i][j] = live_color ;
        }
    }
}
// functions to control the flow of simulation start here
function Start(){
    Simulate ();
    CopyBoard ();
    UpdateBoard ();
}

function Loop(){
    if (play[0]){
        Simulate ();
        CopyBoard ();
        UpdateBoard ();
        var t= setTimeout("Loop()",500);
    }
}


function Play(x){
    if (x=="play"){
        play[0]=1;
        document.getElementById("play").innerHTML = "Faster";
    }
    if (x=="pause"){
        play[0]=0;
        document.getElementById("play").innerHTML = "Play";
    }
    Loop();
}

function Reset(){
    Play("pause");
    for ( i=0; i<num; i++ ){
        for ( j=0; j<num; j++ ){
            board[i][j] = dead_color;
        }
    }
    UpdateBoard();
}

// functions to control the flow of simulation end here

