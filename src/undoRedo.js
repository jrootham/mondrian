/*
 *    Undo Redo 
 */

/**
 *    Mondrian is a test bed for branching undo/redo (or zero effort version 
 *    contol).  It places and colours rectangles on a white background, similar
 *    to the paintings of Piet Mondrian. 
 *    
 *    Copyright 2012 Jim Rootham
 *     
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program (see COPYING.txt).  
 *    If not, see <http://www.gnu.org/licenses/>.
 *    
 *    jrootham@gmail.com
 *    
 *    Jim Rootham
 *    210 - 25 Eden Place
 *    Toronto, OM
 *    M5T 2V6       
 *
 */

// Undo redo data

var id = 0;
var root;
var point;
var maxDepth = 0;

function resetUndoRedo() {
  id = 0;
  root = new Root();
  point = root;
  maxDepth = 1;
}


//  Undo redo functions
function link(next) {
  if (point.down == null) {
    next.depth = point.depth + 1;
    maxDepth = Math.max(maxDepth, next.depth);
    point.down = next;
    next.up = point;
  }
  else {
    var other = point.down;
    while (other.across != null) {
      other = other.across;
    }
    
    other.across = next;
    next.depth = other.depth; 
    next.up = other.up;
  }

  point = next;
}

function action(undo) {
  link(undo);
  undo.redo();
  redraw();
  undo.context = $('#myCanvas')[0].toDataURL();
}

function BaseUndoRedo() {
  this.id = id++;
  this.down = null;
  this.across = null;
  this.up = null;
 
  return this;
}
 
function Root() {
  var that = new BaseUndoRedo();
  
  that.name = "Root";
  that.depth = 0;
  that.colour = "#FFFFFF";
    
  that.label = function() {
    return this.name + " " + this.id;
  }

  that.undo = function() {};
  
  return that;
}

function Add() {
  var that = new BaseUndoRedo();
  
  that.name = "Add";
  that.colour = "#000000";

  that.current = current;
  
  that.label = function() {
    var state = make(this.current);
    return this.name + ' ' + this.id + ' x=' + state.x + ' y=' + state.y;
  }

  that.undo = function() {
    current--;
    list.splice(list.length-1, 1);    
  };
  
  that.redo = function() {
    addCommand();
  };
  
  return that;
}

function Remove(index) {
  var that = new BaseUndoRedo();
  that.colour = "#FF0000";

  that.name = "Delete";

  var data = new Object;
  var local = new Object;
  $.extend(local, list[index]);
  data.index = index;
  data.item = local;
  that.data = data;
  
  that.label = function() {
    return this.name + ' ' + this.id + ' ' + this.data.index;
  }

  that.undo = function(){
    var local = new Object();
    $.extend(local, this.data.item);
    list.splice(this.data.index, 0, local);
  };
  
  that.redo = function() {
    removeCommand(this.data.index);
  };
  
  return that;
}

function Colour(index, arg) {
  var that = new BaseUndoRedo();
  
  that.name = "Colour";
  that.colour = "#00FF00";

  var item = list[index];

  var data = new Object;
  var local = new Object;
 
  local.c = item.c;
  
  data.item = local;
  data.index = index;
  data.arg = arg;
  that.data = data;
  
  that.label = function() {
    return this.name + ' ' + this.id + ' ' + this.data.arg;
  }

  that.undo = function() {
    var item = list[this.data.index];
    
    item.c = this.data.item.c;
  };
  
  that.redo = function() {
    colourCommand(this.data.index, this.data.arg);
  };
  
  return that;
}

//  Assume begin and finish are objects not otherwise referenced.

function Move(index, begin, finish) {
  var that = new BaseUndoRedo();

  that.name = "Move";
  that.colour = "#0000FF";
  
  var data = new Object;
  
  data.begin = begin;
  data.finish = finish;
  data.index = index;

  that.data = data;
  
  that.label = function() {
    return this.name + ' ' + this.id + ' x=' + this.data.finish.x +' y=' + this.data.finish.y;
  }

  that.undo = function() {
    var item = list[this.data.index];
    
    item.x = this.data.begin.x;
    item.y = this.data.begin.y;
  };
  
  that.redo = function() {
    moveCommand(this.data.index, this.data.finish);
  };
  
  return that;
}

//  Assume finish is object not otherwise referenced.

function Resize(index, begin, finish) {
  var that = new BaseUndoRedo();

  that.name = "Resize";
  that.colour = "#00FFFF";
  
  var data = new Object;
  var item = list[index];
  
  data.begin = begin;  
  data.finish = finish;
  data.index = index;

  that.data = data;
  
  that.label = function() {
    return this.name + ' ' + this.id + ' ' + this.data.finish.w + 'x' + this.data.finish.h;
  }

  that.undo = function() {
    var item = list[this.data.index];
    
    item.w = this.data.begin.w;    
    item.h = this.data.begin.h;    
  };
  
  that.redo = function() {
    resizeCommand(this.data.index, this.data.finish);
  };
  
  return that;
}

function undo() {
  point.undo();
  if (point.up != null) {
    point = point.up;
  }
}

function redo() {
  redoWhere(point.down);
}

function redoWhere(where) {
  if (where != null) {
    point = where;
    point.redo();
  }  
}
 
/**
 *    
 *  Undo from current point back to root
 */
 
function toRoot() {
  while (point.up != null) {
    undo();
  }
}

/**
 *  @param {BaseUndoRedo} target  node in tree
 *  
 *  @return {[{parent:num, child:num}] path  list of branch points to get to the node from the root
 *       
 */
 
function getPath(target) {
  var node = target;
  var result = Array();
  
  while (node.up != null) {
    if (node.up.down.id != node.id) {
      result.push({parent:node.up.id, child:node.id});
    }
    
    node = node.up;
  }
  
  return result;
}
    
/**
 *  @param {[{parent:num, child:num}] path  list of branch points to get to the node from the root
 *  @param {num} targetId                   id of node to reach
 */
 
function followPath(path, targetId) {
  while (path.length != 0) {
    var branch = path.pop();
    
    while (point.id != branch.parent) {
      redo();
    }
    
    for (var fork = point.down ; fork.id != branch.child ; fork = fork.across) {}
    
    redoWhere(fork);
  }
  
  while (point.id != targetId) {
    redo();
  }
}     

/**
 *    Debugging and logging function
 *    
 *    @param {string} branch      list of branch nodes
 *    @param {BaseUndoRedo} node  node in tree
 */
    
function logTree(branch, node) {
  var up = node.up != null ? node.up.id : "root";
  var across = node.across != null ? node.across.id : "null";
  console.log("b", branch, "id", node.id, node.name, "depth", node.depth, 
    "up", up, "across", across);
  
  if (node.down != null) {
    logTree(branch, node.down);
  }
  
  if (node.across != null) {
    logTree(branch + " " + node.id, node.across);
  } 
}