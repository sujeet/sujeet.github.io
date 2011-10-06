function Board (size,           // Number of cells in a row (square board)
                cell_size,      // Side of cell in pixels (square cell)
                live_color,
                dead_color,
                canvas_id)
{
    this.size = size;
    this.cell_size = cell_size;
    this.live_color = live_color;
    this.dead_color = dead_color;

    // Variable indicating whether the mouse
    // is being dragged over the canvas.
    this.drag_on = false;

    // Boolean 2d arrays indicating whether
    // the cell i, j is alive (true) or dead (false)
    this.board = new Array (size);
    this.temp_board = new Array (size);
    for (var i = 0; i < size; i++) {
        this.board [i] = new Array (size);
        this.temp_board [i] = new Array (size);
        for (var j = 0; j < size; j++) {
            this.board [i][j] = false; // dead by default
            this.temp_board [i][j] = false;
        }
    }

    // The canvas element and its 2d context
    this.canvas = document.getElementById (canvas_id);
    this.ctx = this.canvas.getContext ("2d");

    // Set up the canvas and its event handlers.
    this.canvas.width = this.canvas.height = size * cell_size;
    this.canvas.addEventListener ("click", this._handle_canvas_click (this), false);
    this.canvas.addEventListener ("mousedown", this._drag_start (this), false);
    this.canvas.addEventListener ("mouseup", this._drag_end (this), false);
    this.canvas.addEventListener ("mousemove", this._moved_over (this), false);
}

Board.prototype._toggleCell = function (i, j)
{
    this.board [i][j] = ! this.board [i][j];
};

Board.prototype._updateCellDisplay = function (i, j)
{
    this.ctx.fillStyle = this.board [i][j] ? this.live_color : this.dead_color;
    this.ctx.fillRect (i * this.cell_size,
                       j * this.cell_size,
                       this.cell_size,
                       this.cell_size);
};

Board.prototype._toggleCellAndDisplay = function (i, j)
{
    this._toggleCell (i, j);
    this._updateCellDisplay (i, j);
};

Board.prototype._updateDisplay = function ()
{
    for (var i = 0; i < this.size; i++) {
        for (var j = 0; j < this.size; j++) {
            this._updateCellDisplay (i, j);
        }    
    }
};

Board.prototype._updateFromTemp = function ()
{
    for (var i = 0; i < this.size; i++) {
        for (var j = 0; j < this.size; j++) {
            this.board [i][j] = this.temp_board [i][j];
        }    
    }
};

Board.prototype._get_event_cell = function (event)
{
    // Returns the x and y cell co-ordinates
    // where the event occured in an array.

    var x, y;
    if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
    }
    else {
        x = event.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }
    // Now, x and y are co-ordinates where click happened.
    x -= this.canvas.offsetLeft;
    y -= this.canvas.offsetTop;
    // Now, x and y are co-ords relative to the canvas
    // where click happened.
    // Now, get the cell number from them.
    x = Math.floor (x / this.cell_size);
    y = Math.floor (y / this.cell_size);

    return new Array (x, y);
};

Board.prototype._handle_canvas_click = function (board_obj)
{
    function handler (event)
    {
        var cell = board_obj._get_event_cell (event);
        var x = cell [0], y = cell [1];
        board_obj._toggleCellAndDisplay (x, y);
    }
    return handler;
};

Board.prototype._drag_start = function (board_obj)
{
    function handler ()
    {
        board_obj.drag_on = true;
    }
    return handler;
};

Board.prototype._drag_end = function (board_obj)
{
    function handler ()
    {
        board_obj.drag_on = false;
    }
    return handler;
};

Board.prototype._moved_over = function (board_obj)
{
    function handler (event)
    {
        var cell = board_obj._get_event_cell (event);
        var x = cell [0], y = cell [1];
        if (board_obj.drag_on) {
            board_obj._toggleCellAndDisplay (x, y);
        }
    }
    return handler;
};

Board.prototype._countNeighbours = function (i, j)
{
    // returns the number of live cells surrounding
    // the i,j th cell.
    var count = 0;
    var num = this.size;
    for (var x = 1; x < 4; x++){
        for (var y = 1; y < 4; y++){
            var a = i+x-2; if (a<0) a = num + a; else a = a % num;
            var b = j+y-2; if (b<0) b = num + b; else b = b % num;
            if (this.board[a][b]) count++ ;
        }
    }
    if (this.board[i][j]) count-- ;
    return count ;
};

Board.prototype.reset = function ()
{
    for (var i = 0; i < this.size; i++) {
        for (var j = 0; j < this.size; j++) {
            this.board [i][j] = false; // dead by default
            this.temp_board [i][j] = false;
        }
    }
    this.simulateStep ();
};

Board.prototype.simulateStep = function () 
{
    for (var i = 0; i < this.size; i++){
        for (var j = 0; j < this.size; j++){
            var live_neighbours = this._countNeighbours (i, j) ;
            if ((live_neighbours < 2)||
                (live_neighbours > 3)) {
                this.temp_board [i][j] = false;
            }
            else if ((! this.board [i][j])&&
                     (live_neighbours == 3)) {
                this.temp_board [i][j] = true;
            }
            else this.temp_board [i][j] = this.board [i][j];
        }
    }

    this._updateFromTemp ();
    this._updateDisplay ();
};

function Simulator (board_size,
                    cell_size,
                    live_color,
                    dead_color,
                    canvas_id,
                    play_button_id,
                    pause_button_id,
                    step_button_id,
                    reset_button_id)
{
    this.board = new Board (board_size,
                            cell_size,
                            live_color,
                            dead_color,
                            canvas_id);

    // Variable for timeouts.
    this.timeoutVar = 0;

    this.board.simulateStep ();

    // State of the game - playing or paused
    this.playing = false;

    // Get buttons from html
    this.playButton = document.getElementById (play_button_id); 
    this.pauseButton = document.getElementById (pause_button_id); 
    this.stepButton = document.getElementById (step_button_id); 
    this.resetButton = document.getElementById (reset_button_id); 
}

Simulator.prototype.attachEventHandlers = function ()
{
    // Attach event handlers to the buttons.
    this.playButton.addEventListener ("click", this._play_pushed (this), false);
    this.pauseButton.addEventListener ("click", this._pause_pushed (this), false);
    this.stepButton.addEventListener ("click", this._step_pushed (this), false);
    this.resetButton.addEventListener ("click", this._reset_pushed (this), false);
    
};

Simulator.prototype.loop = function (simulator)
{
    function loop_ ()
    {
        if (simulator.playing) {
            simulator.board.simulateStep ();
            simulator.timeoutVar = setTimeout (simulator.loop (simulator), 500);
        }
    }
    return loop_;
};

Simulator.prototype._play_pushed = function (simulator) 
{
    function play ()
    {
        simulator.playButton.innerHTML = "Faster";
        simulator.playing = true;
        simulator.loop (simulator)();
    }
    return play;
};

Simulator.prototype._pause_pushed = function (simulator) 
{
    function pause ()
    {
        simulator.playButton.innerHTML = "Play";
        simulator.playing = false;
    }
    return pause;
};

Simulator.prototype._step_pushed = function (simulator)
{
    function step ()
    {
        simulator.board.simulateStep ();
    }
    return step;
};

Simulator.prototype._reset_pushed = function (simulator)
{
    function reset ()
    {
        simulator._pause_pushed (simulator);
        simulator.board.reset ();
    }
    return reset;
};


function init () {
    simulator = new Simulator (50,
                               9,
                               "green",
                               "black",
                               "game_of_life",
                               "play",
                               "pause",
                               "step",
                               "reset");
    simulator.attachEventHandlers ();
}

var simulator;
window.onload = init;
