// Ant colony simulation.
// Author : Sujeet Gholap <sujeetgholap@gmail.com>
// 
// The following are variables are used to configure the simulation.
// The text accompanying each variable describes its role in the simulation.
// Note that many of these can be configured in the graphical interface also.

// The time unit for simulation. The value is in milliseconds.
var TIME_SLICE = 50;          

// Every these many time units the simulation updates its state.
var UPDATE_DURATION = 1;    

// The amount of exploration and trail pheromones an ant puts
// on the terrain at a time respectively.
var EXPL_AMT_MAX      = 7000;
var EXPL_AMT_MIN      = 700;
var TRAIL_AMT_MAX     = 7000;
var TRAIL_AMT_MIN     = 150;

// Per update of the simulation, this is the amount of pheromones
// which will get evaporated from a cell.
var EVAP_RATE_EXPL    = 2; 
var EVAP_RATE_TRAIL   = 2; 

// The maximum distance from which an ant can smell the pheromones
// and food respectively.
// TODO : A non unity value for these two does not work with obstacles
//        in the map.
var SMELL_RADIUS      = 1;
var FOOD_SMELL_RADIUS = 3;

// An ant remembers these many recently visited cells.
var N_POSNS_TRACKED   = 10;

// Every time an ant is on exploration, it randomly chooses from 
// following 5 direction.
// 1) go straight.
// 2) go right. (45 degrees)
// 3) go right. (90 degrees) aka right right.
// 4) go left. (45 degrees)
// 5) go left. (90 degrees) aka left left.
// Probability "proportions" that ants go in the given direction
var PROBAB_STRAIGHT = 8;      // go in current direction.
var PROBAB_MOVE_BIT = 4;      // go to right.
var PROBAB_MOVE_LOT = 2;      // got to right right.
                              // symmetrically for left.
// In case of the direction returned by the random probabilistic
// process turns out to be a wall, repeat the random process
// these many times. After that, go to the opposite of current
// direction.
var MAX_RANDOM_ATTEMPTS = 3;

// This applies to exploration phase of an ants journey.
// The ant determines its direction based on immediately
// previous position if it is DIRECTIONLESS. This, many times
// leads to ants forming a loop of exploration pheromones.
// If set to false, the ants will determine upon a random direction before
// leaving home for exploration. Then, each move, the above mentioned
// left, right right, straight etc directions are calculated taking
// this direction as base direction.
var DIRECTIONLESS_ANTS = false;

// The html page allows to place food on map. Each click results
// into this much amount of food being placed in a cell.
// This is actually number of times the food carried by an ant in
// one trip. (that is, ants always carry 1 food back to home)
var DEFAULT_FOOD_AMT = 30;

// Every these many time units, one ant is generated at nest.
var GENERATE_DURATION = 5;

// If set true, out of all neighbouring pheromone cells,
// (excluding the recently visited ones) the ant will go to
// the cell having the highest pheromone in it.
var SMELL_PREFERENCE = true;

// Whenever the ant comes home, it will explore if there is no
// trail in SMELL_RADIUS, but in case of availability of trail,
// the ant will randomly choose to explore with the following 
// probability.
var PROBAB_INIT_EXPL = 0.5;

// These settings are for visualization. Setting them to true
// will lead to the corresponding pheromones being visible on the map.
// TODO : Makes the rendering too slow.
var EXPL_VISIBLE = false;
var TRAIL_VISIBLE = false;

// Visualization related
var CELL_SIZE = 3;              // pixels
var N_CELLS   = 150;

// Coordinates of home
var HOME_X = 0;
var HOME_Y = 0;



// ---------------------- END CONFIGURATION VARIABLES ---------------

var PAUSED = false;

function make_sim ()
{
    CELL_SIZE = parseInt (document.control.CELL_SIZE.value);
    N_CELLS = parseInt (document.control.N_CELLS.value);
    HOME_X = parseInt (document.control.HOME_X.value);
    HOME_Y = parseInt (document.control.HOME_Y.value);
    simulator = new Simulator (N_CELLS, CELL_SIZE, "antsim");
}

function start ()
{
    TRAIL_VISIBLE = document.control.TRAIL_VISIBLE.checked;
    EXPL_VISIBLE = document.control.EXPL_VISIBLE.checked;
    DIRECTIONLESS_ANTS = document.control.DIRECTIONLESS_ANTS.checked;
    simulator.start ();
}

function bind (func, obj)
{
    // Returns a function in which the value of 
    // "this" is obj
    // Used for implementing callbacks
    function binded (event)
    {
        func.call (obj, event);
    }
    return binded;
}

// Takes number of time slices as argument and returns the equivalent 
// time in milliseconds.
function unit_time (n_slices) 
{
    return n_slices * TIME_SLICE;
}

//            (1)
//        0,-1      
//  -1,-1  ^  1,-1  (2)
//       \ | /      
// -1,0___\|/___1,0  (3)
//        /|\       
//       / | \      
//   -1,1  v  1,1  (4) 
//        0,1       
//
//     ___   ___
//    /         \
//   v           v
// left         right

function right (direction)
{
    // (1)
    if (direction [0] == 0) {
        return [0 - direction [1],
                direction [1]];
    }
    // (4)
    else if (direction [0] == direction [1]) {
        return [0,
                direction [1]];
    }
    // (3)
    else if (direction [1] == 0) {
        return [direction [0],
                direction [0]];
    }
    // (2)
    else {
        return [direction [0],
                0];
    }
}

function left (direction)
{
    // (1)
    if (direction [0] == 0) {
        return [direction [1],
                direction [1]];       
    }
    // (4)
    else if (direction [0] == direction [1]) {
        return [direction [0],
                0];
    }
    // (3)
    else if (direction [1] == 0) {
        return [direction [0],
                0 - direction [0]];
    }
    // (2)
    else {
        return [0,
                direction [1]];
    }
}

function generate_random_component ()
{
    // Returns 0 1 -1 with equal probabilities.
    var rand  = Math.random () * 3;
    if (rand < 1) return 0;
    if (rand < 2) return 1;
    return -1;
}

function generate_random_direction ()
{
    var x = 0;
    var y = 0;
    while (x == 0 && y ==0) {
        x = generate_random_component ();
        y = generate_random_component ();
    }
    return [x, y];
}

String.prototype.toIntList = function ()
{
    // operates on comma separated string of integers
    // and returns an array.
    // input  : "9,8,99,0"
    // output : [9,8,99,0]

    return eval ("[" + this + "]");

    // return this.split (",").map (function (x) {return parseInt (x, 10);});
};

Array.prototype.contains = function (potential_member)
{
    // Check if the potential member is an array.
    if (potential_member.constructor.toString().indexOf("Array") != -1) {
        // Covnert to string and then compare.
        var str = potential_member.toString ();
        for (var i = 0; i < this.length; ++i) {
            if (this [i].toString () == str) {
                return true;
            }
        }
    }
    else {
        // Compare the elements directly.
        for (var i = 0; i < this.length; ++i) {
            if (this [i] == potential_member) {
                return true;
            }
        }
    }
    return false;
};

// Stores size number of objects in it.
// adding an object to the list results in
// deleting the object which was added 
// at the farthest point in time.
function RecencyList (size)
{
    this.size = size;  
    this.oldest_object_index = 0;
    this.array = new Array (size);
    for (var i = 0; i < this.size; ++i) {
        this.array [i] = 0;
    }
};

RecencyList.prototype.add = function (obj)
{
    this.array [this.oldest_object_index] = obj;
    this.oldest_object_index =
        (this.oldest_object_index + 1) % this.size;
};

RecencyList.prototype.get_recent = function (index)
{
    // Return the index'th most recent object.
    if (index >= this.size) {
        throw ("Recency list is only of size " + this.size
               + ". It does not have " + index +
               "'th recent element.");
    }
    index = ((((this.oldest_object_index - (index + 1)) % this.size)
              + this.size)
             % this.size);
    return this.array [index];
};

RecencyList.prototype.get_most_recent = function ()
{
    return this.get_recent (0);
};

RecencyList.prototype.contains = function (obj)
{
    return this.array.contains (obj);
};

// Two types of pheromones : exploration and trail
// exploration : - Unique to each ant.
//               - Visible only to the ant who laid it.
//               - Is laid when the ant is going in seach of food.
//               - Ant follows its ows exploration pheromone while coming
//                 back after collecting food, masks it with a trail
//                 pheromone which is visible to all.
// 
// trail       : - Same for all the ants.
//               - Any ant can see the trail pheromone laid by any other
//                 ant.
//               - An ant, when it wants to go for food, can either
//                 choose to follow some trail pheromone or to explore 
//                 on its own as described above.

// A class for cells. Cells make-up the map. Each cell has same size 
// as an ant; but still they can have more than one ants. Also, a cell
// keeps track of pheromones in it (that is how long are they going to 
// last)
// Cells keep track of trail pheromone.
function Cell (x, y, display)
{
    this.x = x;
    this.y = y;
    this.display = display;
    this.is_wall = false;

    // The amount of pheromone (trail) currently in cell.
    this.trail_amt = 0;

    // The collective amount of expl pheromone in cell.
    // This is purely for rendering purposes.
    this.expl_amt = 0;

    // Required for display purposes.
    this.n_ants = 0;

    this.food_amt = 0;

    // Toggle variables for rendering purposes.
    this.expl_toggle = false;
    this.trail_toggle = false;
    this.food_toggle = false;
    this.wall_rendered = false;
}

// Use as cell.has ("food") or cell.has ("trail")
Cell.prototype.has = function (property)
{
    return (this [property + "_amt"] > 0);
};

Cell.prototype.add_food = function (more_amount)
{
    if (this.food_amt == 0) {
        this.food_toggle = true;
    }
    else {
        // this.food_toggle = false;
    }
    if (typeof more_amount === "undefined") {
        this.food_amt += DEFAULT_FOOD_AMT;
    }
    else {
        this.food_amt += more_amount;
    }
};

Cell.prototype.decrement_food = function () 
{
    this.food_amt -= 1;
    if (this.food_amt <= 0) {
        this.food_toggle = true;
        this.food_amt = 0;
    }
    else {
        // this.food_toggle = false;
    }
};

Cell.prototype.add_expl = function (amt)
{
    if (this.expl_amt == 0) {
        this.expl_toggle = true;
    }
    else {
        // this.expl_toggle = false;
    }
    this.expl_amt += amt;
};

Cell.prototype.decrement_expl = function () 
{
    if (this.expl_amt <= 0) {
        this.expl_amt = 0;
        this.expl_toggle = false;
        return;
    }
    this.expl_amt -= EVAP_RATE_EXPL;
    if (this.expl_amt <= 0) {
        this.expl_amt = 0;
        this.expl_toggle = true;
    }
};

Cell.prototype.add_trail = function (amt)
{
    if (this.trail_amt == 0) {
        this.trail_toggle = true;
    }
    else {
        // this.trail_toggle = false;
    }
    this.trail_amt += amt;
};

Cell.prototype.decrement_trail = function () 
{
    if (this.trail_amt <= 0) {
        this.trail_amt = 0;
        this.trail_toggle = false;
        return;
    }
    this.trail_amt -= EVAP_RATE_TRAIL;
    if (this.trail_amt <= 0) {
        this.trail_amt = 0;
        this.trail_toggle = true;
    }
};

Cell.prototype.add_ant = function ()
{
    this.n_ants += 1;
};

Cell.prototype.remove_ant = function ()
{
    this.n_ants -= 1;
};

// A class for map. Map consists of cells.
function Map (n_cells,         // number of cells in a row.
              cell_width,
              display)
{
    this.n_cells = n_cells;
    this.cell_array = [];
    this.display = display;

    for (var i = 0; i < this.n_cells; i++) {
        this.cell_array [i] = new Array (n_cells);
        for (var j = 0; j < this.n_cells; j++) {
            this.cell_array [i] [j] = new Cell (i, j, display);
        }
    }
}

Map.prototype.add_wall = function (x, y)
{
    var cell= this.get_cell (x, y);
    cell.is_wall = true;
    cell.expl_amt = 0;
    cell.trail_amt = 0;
    cell.food_amt = 0;
    cell.n_ants = 0;
};

Map.prototype.add_food = function (x, y)
{
    this.get_cell (x, y).add_food ();
};

Map.prototype.wrap = function (coord) 
{
    // -1 % 5 is -1
    return ((coord % this.n_cells) + this.n_cells) % this.n_cells;
};

Map.prototype.kings_distance = function (x1, y1, x2, y2)
{
    // Remember, it is a donut topology.
    var x_diff = Math.abs (x1 - x2);
    var y_diff = Math.abs (y1 - y2);
    var x = Math.min (x_diff, this.n_cells - x_diff);
    var y = Math.min (y_diff, this.n_cells - y_diff);
    return Math.max (x, y);
};

Map.prototype.get_cell = function (x, y)
{
    // console.log ("get cell : " + x + ", " + y);
    return this.cell_array [this.wrap (x)] [this.wrap (y)];
};

Map.prototype.add_ant = function (x, y)
{
    this.get_cell (x, y).add_ant ();
};

Map.prototype.remove_ant = function (x, y)
{
    this.get_cell (x, y).remove_ant ();
};

Map.prototype.put_trail = function (x, y, amt)
{
    this.get_cell (x, y).add_trail (amt);
};

Map.prototype.put_expl = function (x, y, amt)
{
    this.get_cell (x, y).add_expl (amt);
};


Map.prototype.get_cells_around_satisfying = function (x,
                                                      y,
                                                      radius, 
                                                      filter,
                                                      max_n_cells,
                                                      sorter)
{
    // Gives a list of at max n_cells number of cells 
    // around x, y, which satisfy the boolean function 
    // filter, within the radius given.

    var lst = [-1, 1];
    var ret_lst = [];
    var count = 0;
    var x_, y_, cell;

    for (var i = 0; i <= radius; i++) {
        for (var j = 0; j <= radius; j++) {
            for (var k = 0; k < lst.length; ++k) {
                for (var l = 0; l < lst.length; ++l) {
                    x_ = x + lst [k] * i;
                    y_ = y + lst [l] * j;
                    cell = this.get_cell (x_, y_);
                    if (filter (cell)) {
                        count ++;
                        ret_lst.push (cell);
                        if (count == max_n_cells) {
                            if (typeof sorter === "undefined") {
                                return ret_lst;
                            }
                            return ret_lst.sort (sorter);
                        }
                    }
                }
            }
        }   
    }
    if (typeof sorter === "undefined") {
        return ret_lst;
    }
    return ret_lst.sort (sorter);
};

Map.prototype.get_all_cells_around_satisfying = function (x,
                                                          y,
                                                          radius, 
                                                          filter,
                                                          sorter)
{
    return this.get_cells_around_satisfying (x,
                                             y,
                                             radius,
                                             filter,
                                             ((radius * 2 + 1) *
                                              (radius * 2 + 1)),
                                             sorter);
};

Map.prototype.get_all_cells_around = function (x,
                                               y,
                                               radius,
                                               sorter)
{
    return this.get_all_cells_around_satisfying (x,
                                                 y,
                                                 radius,
                                                 function () {return true;},
                                                 sorter);
};

Map.prototype.get_nearest_cell_satisfying = function (x,
                                                      y,
                                                      filter,
                                                      sorter) 
{
    return this.get_cells_around_satisfying (x,
                                             y,
                                             this.n_cells / 2,
                                             filter,
                                             1,
                                             sorter);
};

Map.prototype.has_around = function (x, y, property, rad)
{
    var has_property = function (cell) {
        return (cell.has (property) &&
                ((cell.x != x) || (cell.y != y)));
    };
    var cell_list = this.get_cells_around_satisfying (x,
                                                      y,
                                                      rad,
                                                      has_property,
                                                      1);
    if (cell_list.length != 0) return true;
    return false;
};

Map.prototype.get_directions_leading_to = function (src_x, src_y,
                                                    dest_x, dest_y)
{
    // Returns the cell among the [ src_x, scr_y ]'s neighbours
    // which is closest to [ dest_x, dest_y ]

    var diff_x, diff_y, diff;
    // Go right when
    // |..s..d....| diff is +ve and (10 - diff) is bigger than diff
    // |..d.....s.| diff is -ve and (10 + diff) is smaller than |diff|
    diff = dest_x - src_x;
    if (((diff > 0) && ((10 - diff) >= diff)) ||
        ((diff < 0) && ((10 + diff) < Math.abs (diff)))) {
        diff_x = 1;
    }
    else if (diff == 0) diff_x = 0;
    else diff_x = -1;

    // Simalrly, for y
    diff = dest_y - src_y;
    if (((diff > 0) && ((10 - diff) > diff)) ||
        ((diff < 0) && ((10 + diff) < Math.abs (diff)))) 
        diff_y = 1;
    else if (diff == 0) diff_y = 0;
    else diff_y = -1;

    return [diff_x, diff_y];
};

Map.prototype.get_cell_leading_to = function (src_x, src_y,
                                              dest_x, dest_y) 
{
    var diffs = this.get_directions_leading_to (src_x, src_y,
                                                dest_x, dest_y);
    return this.get_cell (src_x + diffs [0],
                          src_y + diffs [1]);
};

Map.prototype.get_next_trail_cell = function (x,
                                              y,
                                              already_visited)
{
    // returns the cell leading to the closest cell in the radius 
    // which has the trail pheromone in it.
    // and which is different from the current cell.
    var filter = function (cell) {
        var _x = x;
        var _y = y;
        var cond = ((cell.has ("trail")) &&
                    ((cell.x != _x) || (cell.y != _y)));
        return cond;
    };

    var sorter = function (cell1, cell2) {
        // if answer is -ve, then the sort which uses this sorter
        // will produce the array such that cell1 comes before cell2
        return (cell2.trail_amt - cell1.trail_amt);
    };
    

    if (SMELL_PREFERENCE) {
        var cell_list = this.get_all_cells_around_satisfying (x,
                                                              y,
                                                              SMELL_RADIUS,
                                                              filter,
                                                              sorter);
    }
    else {
        var cell_list = this.get_all_cells_around_satisfying (x,
                                                              y,
                                                              SMELL_RADIUS,
                                                              filter);
    }
    // first, try to get a cell which has not been visited.
    // if that is not possible, then go for a visited cell.
    for (var i = 0; i < cell_list.length; ++i) {
        var cell = cell_list [i];
        if (! already_visited.contains ([cell.x, cell.y])) {
            return this.get_cell_leading_to (x, y,
                                             cell.x, cell.y);
        }
    }
    for (i = 0; i < cell_list.length; ++i) {
        var cell = cell_list [i];
        return this.get_cell_leading_to (x, y,
                                         cell.x, cell.y);
    }

    // throw ("Trail ended abruptly " + x + "," + y);
    return 0;
};

Map.prototype.get_neighboar_food_cell = function (x, y)
{
    var has_food = function (cell) {
        return cell.has ("food");
    };
    var cell_list = this.get_cells_around_satisfying (x,
                                                      y,
                                                      1,
                                                      has_food,
                                                      1);

    if (cell_list.length != 0) {
        return cell_list [0];
    }

    throw ("No food found around " + x + "," + y);
    return 0;
};

Map.prototype.update = function ()
{
    // No need to be recursive, because
    // once the cells start updating, they will
    // go on.
    var cell;
    for (var i = 0; i < this.n_cells; i++) {
        for (var j = 0; j < this.n_cells; j++) {
            cell = this.cell_array [i] [j];
            cell.decrement_trail ();
            this.display.render_cell (i, j);
        }
    }
    if (! PAUSED) {
        setTimeout (bind (this.update, this),
                    unit_time (UPDATE_DURATION));
    }
};

// A class for the simulator.
function Simulator (n_cells,
                    cell_width,
                    canv_id)
{
    this.display = new Display (n_cells, cell_width, canv_id, this);
    this.map = new Map (n_cells, cell_width, this.display);
    this.ants = new Array ();
    this.home_x = HOME_X;
    this.home_y = HOME_Y;
}

Simulator.prototype.generate_ants = function ()
{
    var x = this.home_x;
    var y = this.home_y;
    var ant = new Ant (this, x, y);
    this.ants.push (ant);  
    this.map.add_ant (ant.x, ant.y);
    ant.update ();
    if (! PAUSED) {
        setTimeout (bind (this.generate_ants, this),
                    unit_time (GENERATE_DURATION));
    }
};

Simulator.prototype.start = function ()
{
    // Note that once started, these things go on.
    this.map.update ();
    this.generate_ants ();
};


// A class for ants.
function Ant (sim, x_coord, y_coord) 
{
    // A hash table. key   : [x, y]
    //               value : pheromone amount 
    // x and y are cell coordinates
    this.exploration_pheromones = {};

    this.simulator = sim;
    this.x = x_coord;
    this.y = y_coord;
    this.has_food = false;
    this.on_trail = false;
    this.display = sim.display;
    
    // How much trail has it put in previous cell?
    this.prev_trail_amt = 0;
    this.prev_expl_amt = 0;

    // Generate a direction randomly.
    this.prev_posns = new RecencyList (N_POSNS_TRACKED);
    
    // This direction will be followed whenever exploring.
    this.direction = generate_random_direction ();
    this.prev_posns.add ([this.x + this.direction [0],
                          this.y + this.direction [1]]);
}

Ant.prototype.get_previous_position = function ()
{
    return this.prev_posns.get_most_recent ();
};

Ant.prototype.get_current_direction = function ()
{
    var prev = this.get_previous_position ();

    // Note : can't use direct subtraction because of the
    //        donut shape.
    return this.simulator.map.get_directions_leading_to (prev [0],
                                                         prev [1],
                                                         this.x,
                                                         this.y);
};

Ant.prototype.update_position = function (x_increment,
                                          y_increment,
                                          ignore_stationary) 
{
    // If the ant has food, it has to trail.
    if ((Math.abs (x_increment) > 1) ||
        (Math.abs (y_increment) > 1)) {
        throw ("Incorrect direction " + x_increment + "," + y_increment);
    }
    if (this.has_food) { 
        this.lay_trail ();
    }
    
    // if the ant is on trail,
    // or it is exploring,
    // it has to lay exploration pheromone
    // in order for it to be able to come back.
    else this.lay_exploration ();

    if ((x_increment == 0) &&
        (y_increment == 0)) {
        if (typeof ignore_stationary === "undefined") {
            throw ("ant did not move!");
        }
        return;
    }

    // move the ant from one cell to another.
    this.simulator.map.remove_ant (this.x, this.y);
    var new_x = this.simulator.map.wrap (this.x + x_increment);
    var new_y = this.simulator.map.wrap (this.y + y_increment);
    // console.log ("ant moved to : " + new_x + ", " + new_y);
    this.simulator.display.render_ant (new_x, new_y, "fill");
    if (this.simulator.map.get_cell (this.x, this.y).n_ants == 0) {
        this.simulator.display.render_ant (this.x, this.y, "clear");
    }
    // Before updating the coordinates, store the previous coords.
    this.prev_posns.add ([this.x, this.y]);
    this.x = new_x;
    this.y = new_y;
    this.simulator.map.add_ant (this.x, this.y);
};

Ant.prototype.update_position_by_cell = function (cell)
{
    var diffs = this.simulator.map.get_directions_leading_to (this.x,
                                                              this.y,
                                                              cell.x,
                                                              cell.y);
    this.update_position (diffs [0], diffs [1]);
};

function next_expl (amt)
{
    return Math.max (amt - Math.floor (EXPL_AMT_MAX / N_CELLS),
                     EXPL_AMT_MIN); 
}

Ant.prototype.lay_exploration = function ()
{
    // console.log ("lay expl " + this.x + "," + this.y);
    var amt = next_expl (this.prev_expl_amt);
    if (! this.exploration_pheromones.hasOwnProperty ([this.x,
                                                       this.y])) {
        this.exploration_pheromones [[this.x, this.y]] = amt;
    }
    else {
        this.exploration_pheromones [[this.x, this.y]] += amt;
    }

    this.prev_expl_amt = amt;
    // Rendering purpose.
    this.simulator.map.put_expl (this.x, this.y, amt);
};

function next_trail (amt)
{
    return Math.max (amt - Math.floor (TRAIL_AMT_MAX / N_CELLS),
                     TRAIL_AMT_MIN); 
};

Ant.prototype.lay_trail = function ()
{
    // Note that trail is laid on pre-existing
    // exploration pheromone only.
    // console.log ("lay trail " + this.x + "," + this.y);
    if (! this.exploration_pheromones.hasOwnProperty ([this.x,
                                                       this.y])) {
        throw ("Can't put trail : not explored : " 
               + this.x + " " + this.y);
    }
    else {
        var amt = next_trail (this.prev_trail_amt);
        this.simulator.map.put_trail (this.x, this.y, amt);
        this.prev_trail_amt = amt;
    }
};

Ant.prototype.follow_trail = function ()
{
    this.on_trail = true;
    var cell = this.simulator.map.get_next_trail_cell (this.x,
                                                       this.y,
                                                       this.prev_posns);
    if (cell == 0) {
        this.on_trail = false;
        this.make_a_move ();
    }
    else {
        this.update_position_by_cell (cell);
    }
};

Ant.prototype.follow_expl = function ()
{
    // The cell has to be in ant's list of expl pheromones
    // The cell should be only SMELL_RADIUS distance away.
    
    // First, try to go to an exploration_pheromone
    // which was not recently visited.
    // Among all possible, go to the neighbouring cell
    // which has the maximum amount of exploration pheromon.
    var directions;
    var max_expl_coord;

    var max_expl = 0;
    var found_here = false;
    for (var coords in this.exploration_pheromones) {
        coords = coords.toIntList ();
        if ((! this.prev_posns.contains (coords)) &&
            ((coords [0] != this.x) || (coords [1] != this.y)) &&
            (this.simulator.map.kings_distance (coords [0], coords [1],
                                                this.x, this.y)
             <= SMELL_RADIUS)) {
            if (SMELL_PREFERENCE) {
                if (this.exploration_pheromones [coords] > max_expl) {
                    max_expl_coord = coords;
                    max_expl = this.exploration_pheromones [coords];
                    found_here = true;
                }
            }
            else {
                max_expl_coord = coords;
                found_here = true;
                break;
            }
        }
    }
    if (found_here) {
        directions =
            this.simulator.map.get_directions_leading_to (this.x,
                                                          this.y,
                                                          max_expl_coord[0],
                                                          max_expl_coord[1]);
        this.update_position (directions [0], directions [1]);
        return;
    }

    max_expl = 0;
    found_here = false;
    // If no such found, then go to any in your neighbourhood.
    for (coords in this.exploration_pheromones) {
        coords = coords.toIntList ();
        if (((coords [0] != this.x) || (coords [1] != this.y)) &&
            (this.simulator.map.kings_distance (coords [0], coords [1],
                                                this.x, this.y)
             <= SMELL_RADIUS)) {
            if (SMELL_PREFERENCE) {
                if (this.exploration_pheromones [coords] > max_expl) {
                    max_expl_coord = coords;
                    max_expl = this.exploration_pheromones [coords];
                    found_here = true;
                }
            }
            else {
                max_expl_coord = coords;
                found_here = true;
                break;
            }
        }
    }
    if (found_here) {
        directions =
            this.simulator.map.get_directions_leading_to (this.x,
                                                          this.y,
                                                          max_expl_coord[0],
                                                          max_expl_coord[1]);
        this.update_position (directions [0], directions [1]);
        return;
    }

    throw ("No exploration pheromone fonud around " + 
           this.x + "," + this.y);
};

Ant.prototype.explore = function ()
{    
    var random, dirn;
    var count = 0;
    while (MAX_RANDOM_ATTEMPTS > count ++) {
        if (DIRECTIONLESS_ANTS) {
            dirn = this.get_current_direction ();
        }
        else {
            dirn = this.direction;
        }
        random = Math.random () * (PROBAB_MOVE_LOT * 2 +
                                   PROBAB_MOVE_BIT * 2 +
                                   PROBAB_STRAIGHT);
        if (random < PROBAB_STRAIGHT) {
            // Do nothing here as it is already set.
        }
        else if ((PROBAB_STRAIGHT <= random) &&
                 (random < PROBAB_STRAIGHT + PROBAB_MOVE_BIT)) {
            dirn = right (dirn);
        }
        else if ((PROBAB_STRAIGHT + PROBAB_MOVE_BIT <= random) &&
                 (random < PROBAB_STRAIGHT + 2 * PROBAB_MOVE_BIT)) {
            dirn = left (dirn);
        }
        else if ((PROBAB_STRAIGHT + 2 * PROBAB_MOVE_BIT < random) &&
                 (random < 1 - PROBAB_MOVE_LOT)) {
            dirn = right (right (dirn));
        }
        else {
            dirn = left (left (dirn));
        }
        if (! this.simulator.map.get_cell (this.x + dirn [0],
                                           this.y + dirn [1]).is_wall) {
            return this.update_position (dirn [0], dirn [1]);
        }
        // Met with a wall. Turn 90 deg right or left and set
        // it as the new direction.
        if (Math.random () < 0.5) {
            this.direction = right (right (this.direction));
        }
        else {
            this.direction = left (left (this.direction));
        }
    }
    // All the MAX_RANDOM_ATTEMPTS random attemptes met with a wall.
    // Better go right back the way we came in. (one place we are sure
    // of not having a wall.)
    dirn = this.get_current_direction ();
    return this.update_position (0 - dirn [0], 0 - dirn [1]);
};

Ant.prototype.can_smell_trail = function ()
{
    return this.simulator.map.has_around (this.x,
                                          this.y,
                                          "trail",
                                          SMELL_RADIUS);
};

Ant.prototype.pick_up_food = function ()
{
    var food_filter = function (cell) {
        return cell.has ("food");
    };
    var cell_list 
        = this.simulator.map.get_cells_around_satisfying (this.x,
                                                          this.y,
                                                          FOOD_SMELL_RADIUS,
                                                          food_filter,
                                                          1);
    var ignore_stationary = 1;
    if (cell_list.length > 0) {
        // In this case, the ant has not laid the expl in its current
        // position yet. Let's do that here.
        var cell = cell_list [0];
        var neighbours = this.simulator.map.get_all_cells_around (this.x,
                                                                  this.y,
                                                                  1);
        if (neighbours.contains (cell)) {
            // Neighbour has food.
            this.has_food = true;
            this.on_trail = false;
            
            this.prev_trail_amt = TRAIL_AMT_MAX;

            cell.decrement_food ();
            this.lay_exploration ();
            this.update_position (0, 0, ignore_stationary);
            return;
        }
        else {
            var dirn = this.simulator.map.get_directions_leading_to (this.x,
                                                                     this.y,
                                                                     cell.x,
                                                                     cell.y);
            this.update_position (dirn [0], dirn [1]);
            return;
        }
    }
    throw ("No food found around " + this.x + "," + this.y);
};

Ant.prototype.go_towards_food = function ()
{
    
};

Ant.prototype.can_smell_food = function ()
{
    return this.simulator.map.has_around (this.x,
                                          this.y,
                                          "food",
                                          FOOD_SMELL_RADIUS);
};

Ant.prototype.is_at_home = function ()
{
    if ((this.x == this.simulator.home_x) && 
        (this.y == this.simulator.home_y)) {
        this.prev_expl_amt = EXPL_AMT_MAX;
        return true;
    }
    return false;
};

Ant.prototype.make_a_move = function () 
{
    // Decide whether to go explore or follow a trail.
    // Once following a trail, just keep on following.
    if ((! this.has_food) && this.can_smell_food ()) {
        this.pick_up_food ();
    }
    else if (this.on_trail) {
        this.follow_trail ();
    }
    else if (this.has_food) {
        // if it is at home, deposit food.
        if (this.is_at_home ()) {
            this.has_food = false;
            this.on_trail = false;
        }
        else {
            this.follow_expl ();
        }
    }
    else {
        // Does not have food, nor is it on a trail arleady.
        // Choose to explore or follow trail.
        
        // Right now, if it has a trail nearby, follw trail
        // or else explore.
        if (this.can_smell_trail ()) {
            if (this.is_at_home () && Math.random () < PROBAB_INIT_EXPL) {
                this.explore ();
            }
            else {
                this.follow_trail ();
            }
        }
        else {
            if (! this.is_at_home ()) {
                // The ant is not at home, it does not have any food
                // it can't smell any trail either. Poor thing is lost!
                // Die ant die! RIP
                this.die ();
            }
            this.explore ();
        }
    }
};

Ant.prototype.die = function ()
{
    clearTimeout (this.updateTimeout);  
    var the_last_time = true;
    this.update (the_last_time);
};

Ant.prototype.update = function (the_last_time)
{
    // Make the exploration pheromone evoparate.
    var amt;
    var signal;
    for (var i in this.exploration_pheromones) {
        i = i.toIntList ();
        this.exploration_pheromones [i] -= EVAP_RATE_EXPL;
        this.simulator.map.get_cell (i [0], i [1]).decrement_expl ();
        amt = this.exploration_pheromones [i];
        if (amt <= 0) {
            delete this.exploration_pheromones [i];
        }
    }

    // if this is the last time, then don't do anything further.
    if (typeof the_last_time === "undefined") {
        // Make a move and repeat.
        this.make_a_move ();
        if (! PAUSED) {
            this.updateTimeout = setTimeout (bind (this.update, this),
                                             unit_time (UPDATE_DURATION));
        }
    }
};

function Display (nCells, cellWidth, canv_id, sim)
{
    this.cell_width = cellWidth;
    this.n_cells = nCells;

    this.simulator = sim;
    // console.log ("came in display");

    this.canv_expl = document.getElementById (canv_id + "_expl");
    this.canv_trl = document.getElementById (canv_id + "_trl");
    this.canv_ants = document.getElementById (canv_id + "_ants");
    this.canv_food = document.getElementById (canv_id + "_food");


    this.expl_layer = this.canv_expl.getContext ("2d");
    this.ants_layer = this.canv_ants.getContext ("2d");
    this.food_layer = this.canv_food.getContext ("2d");
    this.trl_layer = this.canv_trl.getContext ("2d");

    this.canv_expl.width = this.canv_expl.height = nCells * cellWidth;
    this.canv_trl.width = this.canv_trl.height = nCells * cellWidth;
    this.canv_ants.width = this.canv_ants.height = nCells * cellWidth;
    this.canv_food.width = this.canv_food.height = nCells * cellWidth;

    var container_div = document.getElementById ("container");
    container_div.width = container_div.height = nCells * cellWidth;

    // As ants is the top canvas layer, add event listeners to it.
    this.drag_on = false;
    this.canv_ants.addEventListener ("click",
                                     bind (this.clicked, this), 
                                     false);
    this.canv_ants.addEventListener ("mousedown",
                                     bind (this.drag_started, this), 
                                     false);
    this.canv_ants.addEventListener ("mouseup",
                                     bind (this.drag_ended, this), 
                                     false);
    this.canv_ants.addEventListener ("mousemove",
                                     bind (this.moved_over, this), 
                                     false);

    // Variables indicating the cell in which the
    // mouse was the last time the mousemove event
    // of the canvas was triggered.
    this.previous_cell_x = -1;
    this.previous_cell_y = -1;

    this.control = document.control.drawables;
}

Display.prototype.get_control = function ()
{
    var radioObj =  this.control;
	var radioLength = radioObj.length;
	for(var i = 0; i < radioLength; i++) {
		if(radioObj[i].checked) {
			return radioObj[i].value;
		}
	}
	return "wall";
};

Display.prototype.moved_over = function (event)
{
    var cell = this.get_event_cell (event);
    var x = cell [0], y = cell [1];

    // Toggle only if it has entered the cell.
    // If not done this way, even staying in a cell
    // keeps on toggling the cell if the drag is on.
    if ((x != this.previous_cell_x) || (y != this.previous_cell_y)) {
        if (this.drag_on) {
            var thing = this.get_control ();
            this.simulator.map ["add_" + thing] (x, y);
            if (thing == "food") {
                this.render_food (x, y, DEFAULT_FOOD_AMT, "fill");
            }
            else if (thing == "wall") {
                this.render_wall (x, y);
            }
        }
        this.previous_cell_x = x;
        this.previous_cell_y = y;
    }
};

Display.prototype.drag_started = function (event)
{
    this.drag_on = true;
};

Display.prototype.drag_ended = function (event)
{
    this.drag_on = false;
};

Display.prototype.clicked = function (event) 
{
    var object = this.get_control ();
    var coords = this.get_event_cell (event);  
    if (object == "wall") {
        this.simulator.map.add_wall (coords [0], coords [1]);
        this.render_wall (coords [0], coords [1]);
    }
    else if (object == "food") {
        var amt = DEFAULT_FOOD_AMT;
        this.simulator.map.get_cell (coords [0], coords [1]).add_food (amt);
        this.render_food (coords [0], coords [1], amt, "fill");
    }
};

Display.prototype.get_event_cell = function (event)
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
    x -= this.canv_food.offsetLeft;
    y -= this.canv_food.offsetTop;
    // Now, x and y are co-ords relative to the canvas
    // where click happened.
    // Now, get the cell number from them.
    x = Math.floor (x / this.cell_width);
    y = Math.floor (y / this.cell_width);

    return new Array (x, y);
};

Display.prototype.render_food = function (x, y, amt, fill_or_clear)
{
    if (fill_or_clear == "fill") {
        this.food_layer.fillStyle = "red";
        // console.log (amt + " food at " + x + "," + y);
    }
    this.food_layer [fill_or_clear + "Rect"] (x * this.cell_width,
                                              y * this.cell_width,
                                              this.cell_width,
                                              this.cell_width);
};

Display.prototype.render_expl = function (x, y, amt, fill_or_clear)
{
    if (fill_or_clear == "fill") {
        this.expl_layer.fillStyle = "cyan";
    }
    // console.log (amt + " " + fill_or_clear + " expl at " + x + "," + y);
    if (EXPL_VISIBLE) {
        this.expl_layer [fill_or_clear + "Rect"] (x * this.cell_width,
                                                  y * this.cell_width,
                                                  this.cell_width,
                                                  this.cell_width);
    }
    // console.log ("==============");
};

Display.prototype.render_trail = function (x, y, amt, fill_or_clear)
{
    if (fill_or_clear == "fill") {
        this.trl_layer.fillStyle = "gray";
        // console.log (amt + " trl at " + x + "," + y);
    }
    if (TRAIL_VISIBLE) {
        this.trl_layer [fill_or_clear + "Rect"] (x * this.cell_width,
                                                 y * this.cell_width,
                                                 this.cell_width - 1,
                                                 this.cell_width - 1);
    }
};

Display.prototype.render_ant = function (x, y, fill_or_clear)
{
    if (fill_or_clear == "fill") {
        this.ants_layer.fillStyle = "black";
    }
    this.ants_layer [fill_or_clear + "Rect"] (x * this.cell_width,
                                              y * this.cell_width,
                                              this.cell_width - 0,
                                              this.cell_width - 0);
};

Display.prototype.render_wall = function (x, y)
{
    this.simulator.map.get_cell (x, y).wall_rendered = true;
    this.food_layer.fillStyle = "blue";
    this.food_layer.fillRect (x * this.cell_width,
                              y * this.cell_width,
                              this.cell_width,
                              this.cell_width);
};

Display.prototype.render_cell = function (x, y)
{
    // Render food, trail and cumulative expl.

    var cell = this.simulator.map.get_cell (x, y);

    if (cell.is_wall && (! cell.wall_rendered)) {
        // if it is wall, nothing else can be there.
        this.render_wall (x, y);
    }

    else {
        if (cell.food_toggle) {
            var render_food = cell.food_amt != 0 ? "fill" : "clear";
            this.render_food (x, y, cell.food_amt, render_food);
            cell.food_toggle = false;
        }
        if (cell.trail_toggle) {
            var render_trail = cell.trail_amt != 0 ? "fill" : "clear";
            this.render_trail (x, y, cell.trail_amt, render_trail);
            cell.trail_toggle = false;
        }
        if (cell.expl_toggle) {
            var render_expl = cell.expl_amt != 0 ? "fill" : "clear";
            this.render_expl (x, y, cell.expl_amt, render_expl);
            cell.expl_toggle = false;
        }
    }
};
