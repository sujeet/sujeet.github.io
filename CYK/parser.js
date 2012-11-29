// var print = console.log;

function print (foo) 
{
    var console = $("#console") [0].children [0];
    console.style.display = "block";
    console.innerHTML = (
        console.innerHTML
            + foo
            + "<br/>"
    );
};

String.prototype.strip = function ()
{
    var first_non_space_char_index = 0;
    while (this [first_non_space_char_index] == " ") {
        first_non_space_char_index++;
    }
    var last_non_space_char_index = this.length - 1;
    while (this [last_non_space_char_index] == " ") {
        last_non_space_char_index--;
    }
    return this.substring (first_non_space_char_index,
                           last_non_space_char_index + 1);
};

String.prototype.join = function (list)
{
    var answer = "";
    for (var i = 0; i < list.length - 1; ++i) {
        answer += list [i] + this;
    }
    answer += list [list.length - 1];
    return answer;
};

Array.prototype.consolidate = function ()
{
    return this.filter (function (foo) {return foo;});
};

Array.prototype.pushUnique = function (value)
{
    for (var i = 0; i < this.length; ++i) {
        if (this [i] == value) return;
    }
    this.push (value);
};

function GrammarRule (rule_as_str)
{
    var components = rule_as_str.split ('->').map (function (str) {
                                                       return str.strip ();
                                                   });
    this.LHS = components [0];
    this.RHS = components [1].split (" ");
    if (this.RHS.length == 1) {
        this.isTerminalRule = true;
    }
    else {
        this.isTerminalRule = false;
    }
}

GrammarRule.prototype.debugPrint = function ()
{
    print (this);
    print ("LHS      : '" + this.LHS + "'");
    print ("RHS      : '" + this.RHS [0] + "'");
    if (! this.isTerminalRule) {
        print ("         : '" + this.RHS [1] + "'");
    }
    print ("Terminal : '" + (this.isTerminalRule ? "Yes" : "No"));
};

GrammarRule.prototype.toString = function ()
{
    if (this.isTerminalRule) {
        return (this.LHS
               + " -> " 
               + this.RHS [0]);
    }
    return (this.LHS
           + " -> " 
           + this.RHS [0]
           + " "
           + this.RHS [1]);
    
};

GrammarRule.prototype.matches = function ()
{
    if (this.isTerminalRule && (arguments.length == 1)) {
        return this.RHS [0] == arguments [0];
    }
    else if (arguments.length == 2) {
        return ((this.RHS [0] == arguments [0])
                && (this.RHS [1] == arguments [1]));
    }
    else return false;
};

function Animator (parser,
                   rule_textarea) {
    this.animations = new Array ();
    this.parser = parser;
    this.table = $("#table")[0];
    
    // Transform the rule_textarea into a div with one rule per line.
    // Each rule having its own span.
    var uneditable_rules = $("#rules-later")[0];
    for (var i = 0; i < this.parser.rules.length; ++i) {
        uneditable_rules.innerHTML = 
            uneditable_rules.innerHTML
            +
            "<span>" + this.parser.rules [i].toString () + "</span><br/>"
        ;
    }
    rule_textarea.style.display = "none";
    uneditable_rules.style.display = "block";
    
    this.visual_rules = uneditable_rules.getElementsByTagName ('span');
}

Animator.prototype.createTable = function (words) {
    // Make a table based on the sentence and parse_table.
    var table_markup = "";
    this.sentence = words;
    for (var i = 0; i < words.length; ++i) {
        table_markup += "<tr>";
        for (var j = 0; j < words.length; ++j) {
            table_markup += "<td id='" + i + " " + j + "'";
            if (i > j) {
                table_markup += "style='border:none;'";
            }
            table_markup += ">";
            if (i == j) {
                table_markup += words [i];
            }
            table_markup += "</td>";
        }
        table_markup += "</tr>";
    }
    this.table.innerHTML = table_markup;
};

Animator.prototype.getCell = function (x, y) {
    var id = x + " " + y;
    return document.getElementById (id);
};

Animator.prototype.addAnimation = function (animation_function) {
    this.animations.push (animation_function);
};

// The animation when a rule is being checked against something.
// Only one rule can be active with this animation.
Animator.prototype.checkRule = function (rule_number) {
    var animator = this;
    var animation = {
        old_rule_index : null,
        invoke : function () {
            for (var i = 0; i < animator.visual_rules.length; ++i) {
                if (animator.visual_rules [i].classList.contains (
                        "ruleBeingChecked"
                    )) {
                        animator.visual_rules [i].classList.remove (
                            "ruleBeingChecked"
                        );
                        this.old_rule_index = i;
                    }
            }
            animator.visual_rules [rule_number].classList.add (
                "ruleBeingChecked"
            );
        },
        revert : function () {
            animator.visual_rules [rule_number].classList.remove (
                "ruleBeingChecked"
            );
            animator.visual_rules [this.old_rule_index].classList.add (
                "ruleBeingChecked"
            );
        }
    };
    this.addAnimation (animation);
};

// Just set the style of this rule to indicate rule-match.
// Other rule-status is taken care by resetRules
Animator.prototype.ruleMatched = function (rule_no) {
    var animator = this;
    var animation = {
        invoke : function () {
            animator.visual_rules [rule_no].classList.add ('ruleMatched');
        },
        revert : function () {
            animator.visual_rules [rule_no].classList.remove ('ruleMatched');
        }
    };
    this.addAnimation (animation);
    
};

// Remove any styles added to any rules.
Animator.prototype.resetRules = function () {
    var animator = this;
    var animation = {
        old_class_lists : new Array (),
        invoke : function () {
            for (var i = 0; i < animator.visual_rules.length; ++i) {
                var classlist = animator.visual_rules [i].classList;
                this.old_class_lists.push (
                    classlist.toString ().split (" ")
                );
                classlist.remove ('ruleBeingChecked');
                classlist.remove ('ruleMatched');
            }
        },
        revert : function () {
            for (var i = 0; i < animator.visual_rules.length; ++i) {
                var classlist = animator.visual_rules [i].classList;
                for (var j = 0; j < this.old_class_lists [i].length; ++j) {
                    classlist.add (this.old_class_lists [i] [j]);
                }
            }
        }
    };
    this.addAnimation (animation);
};

// There can be only one target cell at any given time.
Animator.prototype.setTargetCell = function (x, y) {
    var animator = this;
    var animation = {
        old_id : null,
        invoke : function () {
            var old_target = document.getElementsByClassName ('targetCell');
            if (old_target.length) {
                this.old_id = old_target [0].id;
                old_target [0].classList.add ('oldTargetCell');
                old_target [0].classList.remove ('targetCell');
            }
            animator.getCell (x, y).classList.add ('targetCell');
        },
        revert : function () {
            animator.getCell (x, y).classList.remove ('targetCell');
            if (this.old_id) {
                document.getElementById (
                    this.old_id
                ).classList.add ('targetCell');
                document.getElementById (
                    this.old_id
                ).classList.remove ('oldTargetCell');
            }
        }
    };
    this.addAnimation (animation);
};

Animator.prototype.setCellContent = function (x, y, array_of_strings) {
    var animator = this;
    var animation = {
        old_content : null,
        invoke : function () {
            this.old_content = animator.getCell (x, y).innerHTML;
            var inner_markup = "";
            for (var i = 0; i < array_of_strings.length; ++i) {
                inner_markup += "<span>" + array_of_strings [i] + "</span>, ";
            }
            animator.getCell (x, y).innerHTML = inner_markup.substr (
                0,
                inner_markup.length - 2 // don't include last comma and space
            );
            animator.getCell (x, y).title = " ".join (
                animator.sentence.slice (x, y+1)
            );
        },
        revert : function () {
            animator.getCell (x, y).innerHTML = this.old_content;
        }
    };
    this.addAnimation (animation);
    
};

Animator.prototype.setCellUnderScanner = function (x, y) {
    var animator = this;
    var animation = {
        invoke : function () {
            animator.getCell (x, y).classList.add ('cellUnderScanner');
        },
        revert : function () {
            animator.getCell (x, y).classList.remove ('cellUnderScanner');
        }
    };
    this.addAnimation (animation);
};

Animator.prototype.removeUnderScanner = function (x, y) {
    var animator = this;
    var animation = {
        invoke : function () {
            animator.getCell (x, y).classList.remove ('cellUnderScanner');
        },
        revert : function () {
            animator.getCell (x, y).classList.add ('cellUnderScanner');
        }
    };
    this.addAnimation (animation);
};

// At any time, only one element of cell can be being checked.
Animator.prototype.checkCellContent = function (x, y, content) {
    var animator = this;
    var animation = {
        old_content : null,
        invoke : function () {
            var cell = animator.getCell (x, y);
            var content_list = cell.getElementsByTagName ('span');
            for (var i = 0; i < content_list.length; ++i) {
                if (content_list [i].classList.contains (
                        'contentBeingChecked')
                   ) {
                       this.old_content = content_list [i];
                       this.old_content.classList.remove (
                           'contentBeingChecked'
                       );
                   }
                if (content_list [i].innerHTML == content) {
                    content_list [i].classList.add ('contentBeingchecked');
                    break;
                }
            }
        },
        revert : function () {
            var cell = animator.getCell (x, y);
            var content_list = cell.getElementsByTagName ('span');
            for (var i = 0; i < content_list.length; ++i) {
                content_list [i].classList.remove (
                    'contentBeingChecked'
                );
                if (this.old_content) {
                    this.old_content.classList.add ('contentBeingChecked');
                }
            }
        }
    };
    this.addAnimation (animation);
};

Animator.prototype.cellContentMatched = function (x, y, content) {
    var animator = this;
    var animation = {
        invoke : function () {
            var cell = animator.getCell (x, y);
            var content_list = cell.getElementsByTagName ('span');
            for (var i = 0; i < content_list.length; ++i) {
                if (content_list [i].innerHTML == content) {
                    content_list [i].classList.add ('contentMatched');
                    break;
                }
            }
        },
        revert : function () {
            var cell = animator.getCell (x, y);
            var content_list = cell.getElementsByTagName ('span');
            for (var i = 0; i < content_list.length; ++i) {
                if (content_list [i].innerHTML == content) {
                    content_list [i].classList.remove ('contentMatched');
                    break;
                }
            }
        }
    };
    this.addAnimation (animation);
    
};

Animator.prototype.resetCellContents = function (x, y) {
    var animator = this;
    var animation = {
        old_cell_content : null,
        invoke : function () {
            var cell = animator.getCell (x, y);
            this.old_cell_content = cell.innerHTML;
            var content_list = cell.getElementsByTagName ('span');
            for (var i = 0; i < content_list.length; ++i) {
                content_list [i].classList.remove ('contentMatched');
                content_list [i].classList.remove ('contentBeingChecked');
            }
        },
        revert : function () {
            var cell = animator.getCell (x, y);
            cell.innerHTML = this.old_cell_content;
        }
    };
    this.addAnimation (animation);
    
};


function Parser (rule_textare) {
    var rules = rule_textare.value.strip ().split ('\n').consolidate ();
    this.rules = new Array ();
    for (var i = 0; i < rules.length; ++i) {
        this.addRule (new GrammarRule (rules [i]));
    }
    this.parse_table = new Array ();
    this.animator = new Animator (this,
                                  rule_textare);
    this.descending = true;
}

Parser.prototype.addRule = function (rule)
{
    this.rules.push (rule);
};

Parser.prototype.parseFirstLevel = function (sentence)
{
    var input = sentence.strip ().split (" ").consolidate ();
    var output = new Array (input.length);
    for (var i = input.length - 1; i >= 0; --i) {
        this.animator.resetRules ();
        this.animator.setTargetCell (i, i);
        for (var j = 0; j < this.rules.length; ++j) {
            this.animator.checkRule (j);
            if (! this.rules [j].isTerminalRule) continue;
            if (this.rules [j].matches (input [i])) {
                if (! output [i]) {
                    this.animator.ruleMatched (j);
                    output [i] = new Array ();
                }
                output [i].pushUnique (this.rules [j].LHS);
                this.animator.setCellContent (i, i, output [i]);
            }
        }
    }
    this.animator.createTable (input);
    return output;
};

//      y -->
//    x
//    |
//    v
// Returns true if this.to_be_filled was updated.
Parser.prototype.fillOneCell = function ()
{
    var x = this.to_be_filled [0];
    var y = this.to_be_filled [1];
    this.animator.setTargetCell (x, y);
    var rules = this.rules;
    for (var i = y; i > x; --i) {
        this.animator.setCellUnderScanner (x, i-1);
        this.animator.setCellUnderScanner (i, y);
        this.animator.resetRules ();
        var RHS1 = this.parse_table [x] [i-1];
        var RHS2 = this.parse_table [i] [y];
        for (var rul_no = 0; rul_no < rules.length; ++rul_no) {
            var rule = rules [rul_no];
            this.animator.checkRule (rul_no);
            if (rule.isTerminalRule) continue;
            for (var r1 = 0; r1 < RHS1.length; ++r1) {
                for (var r2 = 0; r2 < RHS2.length; ++r2) {
                    this.animator.checkCellContent (x, i-1, RHS1 [r1]);
                    this.animator.checkCellContent (i, y, RHS2 [r2]);
                    if (rule.matches (RHS1 [r1], RHS2 [r2])) {
                        this.animator.cellContentMatched (x, i-1, RHS1 [r1]);
                        this.animator.cellContentMatched (i, y, RHS2 [r2]);
                        this.animator.ruleMatched (rul_no);
                        this.parse_table [x] [y].pushUnique (rule.LHS);
                        this.animator.setCellContent (
                            x,
                            y,
                            this.parse_table [x][y]
                        );
                    }
                }
            }
        }
        this.animator.resetCellContents (x, i-1);
        this.animator.resetCellContents (i, y);
        this.animator.removeUnderScanner (x, i - 1);
        this.animator.removeUnderScanner (i, y);
    }

    if ((y == this.parse_table.length - 1) && this.descending) {
        this.to_be_filled [0] = x - 1;
        this.descending = false;
    }
    else if ((x == 0) && (! this.descending)) {
        this.to_be_filled [1] = y + 1;
        this.descending = true;
    }
    else {
        if (this.descending) {
            this.to_be_filled [0] = x + 1;
            this.to_be_filled [1] = y + 1;
        }
        else {
            this.to_be_filled [0] = x - 1;
            this.to_be_filled [1] = y - 1;
        }
    }
    
    return (! ((x == 0) && (y == this.parse_table.length -1)));
};

Parser.prototype.parse = function (sentence)
{
    var diagonal = this.parseFirstLevel (sentence);
    for (var i = 0; i < diagonal.length; ++i) {
        this.parse_table.push (new Array ());
        for (var j = 0; j < diagonal.length; ++j) {
            this.parse_table [this.parse_table.length - 1].push (
                new Array ()
            );
            if (i == j) {
                this.parse_table [i] [j] = diagonal [i];
            }
        }
    }
    // print (this.parse_table);
    this.to_be_filled = [0, 1];
    while (this.fillOneCell ()) {};
    // print (this.parse_table);
};

index = 0;
timeout = 0;

function step () {
    parser.animator.animations [index++].invoke ();
    if (index >= parser.animator.animations.lenght) {
        $("#play")[0].onclick = null;
        $("#play")[0].classList.add ('inactive-button');
        $("#next")[0].onclick = null;
        $("#next")[0].classList.add ('inactive-button');
    }
    $("#back")[0].onclick = backstep;
    $("#back")[0].classList.remove ('inactive-button');
}

function backstep () {
    parser.animator.animations [index--].revert ();
    if (index <= 0) {
        $("#back")[0].onclick = null;
        $("#back")[0].classList.add ('inactive-button');
    }
    if ($("#play")[0].innerHTML == "Pause") {
        $("#play")[0].onclick = pause;
    }
    else {
        $("#play")[0].onclick = play;
    }
    $("#play")[0].classList.remove ('inactive-button');
    $("#next")[0].onclick = step;
    $("#next")[0].classList.remove ('inactive-button');
}

function pause () {
    window.clearTimeout (timeoutid);
    $("#play")[0].onclick = play;
    $("#play")[0].innerHTML = "▸";
    $("#next")[0].onclick = step;
    $("#next")[0].classList.remove ('inactive-button');
    $("#back")[0].onclick = backstep;
    $("#back")[0].classList.remove ('inactive-button');
}

timeout_value = 1;

function play () {
    step ();
    timeoutid = window.setTimeout (play, timeout_value);
    $("#play")[0].onclick = pause;
    $("#play")[0].innerHTML = "Pause";
    $("#next")[0].onclick = null;
    $("#next")[0].classList.add ('inactive-button');
    $("#back")[0].onclick = null;
    $("#back")[0].classList.add ('inactive-button');
}

function start () {
    parser = new Parser ($("#rules")[0]);

    var sentence = $("#sentence")[0].value.strip ();
    parser.parse (sentence);
    $("#startButton")[0].onclick = null;
    $("#startButton")[0].classList.add ('inactive-button');
    $("#play")[0].onclick = play;
    $("#play")[0].classList.remove ('inactive-button');
    $("#next")[0].onclick = step;
    $("#next")[0].classList.remove ('inactive-button');
}

pairs = null;

function getGetParam (param) {
    if (! pairs) {
        pairs = window.location.search.replace ("?", "").split ("&").map (
            function (pair) {return pair.split("=");}
        );
    }
    for (var i = 0; i < pairs.length; ++i) {
        if (pairs [i] [0] == param) return pairs [i] [1];
    }
    return null;
}

$("#startButton")[0].onclick = start;
timeout_value = getGetParam ('timeout') * 1;
if ((example = getGetParam ('example'))) {
    if (example == 1) {
        $("#sentence")[0].value = "I saw the man with the telescope on the hill";
        $("#rules")[0].value = "S -> NP VP \nNP -> DET N \nNP -> NP PP \nPP -> P NP \nVP -> V NP \nVP -> VP PP \nDET -> the \nNP -> I \nN -> man \nN -> telescope \nP -> with \nV -> saw \nN -> cat \nN -> dog \nN -> pig \nN -> hill \nN -> park \nN -> roof \nP -> from \nP -> on \nP -> in";
    }
    if (example == 2) {
        $("#sentence")[0].value = "a b c d";
        $("#rules")[0].value = "A -> a \nB -> b \nC -> c \nD -> d \nE -> A B \nF -> B C \nG -> C D \nH -> E F \nI -> F G \nS -> E G \nR -> A F \nT -> R D"
    }
}
