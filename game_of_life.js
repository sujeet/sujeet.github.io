var num = 50;
var live_color = "green";
var dead_color = "black";
var table = "<table border = '0' cellspacing='0'>";
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

function InitBoard(){ // generates the tables and corrosponding arrays
    for ( i=0; i<num; i++ ){
        table = table + "<tr>";
        for ( j=0; j<num; j++ ){
            var id = i.toPrecision(2).toString() + j.toPrecision(2).toString();
            var clickedfunc = "Clicked("+i.toPrecision(2).toString()+","+ j.toPrecision(2).toString()+")";
            var draggedfunc = "DraggedOver("+i.toPrecision(2).toString()+","+ j.toPrecision(2).toString()+")";
            table = table + "<td id='"+id+"' onclick='"+clickedfunc+"' onmousedown='javascript:dragstarted=1;' onmouseup='javascript:dragstarted=0;' onmouseout='"+draggedfunc+"' bgColor='black' width='7px' height='7px'><img src='1.png' onclick='"+clickedfunc+" 'onmousedown='javascript:dragstarted=1;' onmouseup='javascript:dragstarted=0;' onmouseout='"+draggedfunc+"'></td>";
            board[i][j] = dead_color;
            board2[i][j] = dead_color; 
        }
        table = table + "</tr>";
    }
    table = table + "</table>";
    document.getElementById("game_of_life").innerHTML = 'recetting...';
    document.getElementById("game_of_life").innerHTML = table;
}

function UpdateBoard(){
    for ( i=0; i<num; i++ ){
        for ( j=0; j<num; j++ ){
            var id =  i.toPrecision(2).toString() + j.toPrecision(2).toString();
            document.getElementById(id).bgColor = board[i][j];        
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
    board[i][j] = live_color;
    document.getElementById(id).bgColor = live_color;
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

