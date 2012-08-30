// Mondrian code

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
   
var displayWidth = 1000;
var displayHeight = 500;
var XFACTOR = 33;
var YFACTOR = 79;
var VERSION_WIDTH = 1000;
var VERSION_HEIGHT = 500;
var BUFFER = 40;
var ZOOM_WIDTH = 500;
var ZOOM_HEIGHT = 250;
var TREE_WIDTH = 25;
var NOOP = function(){};

var current = 0;
var list = Array();
var pictureIndex = 0;
var storageCopy;

function setup(width, height) {
  displayWidth = width - 263;
  displayHeight = height - 403;
}

function reset() {
  current = 0;
  list = Array();
  
  resetUndoRedo();
}

function times(n, fn) {
  for (var i = 0; i < n ; i++) {
    fn();
  }
}

function newPic() {
  reset();
  displayName('');
  disableActions(true);
  redraw();
}
//  Command functions

function make(index) {
  return {x:(index * XFACTOR) % displayWidth, 
          y:(index * YFACTOR) % displayHeight, 
          w:50, h:50, c:"000000"};
}

function addCommand() {
  var item = make(current++);
  list[list.length] = item;
}

function removeCommand(index) {
  list.splice(index, 1);
}

function moveCommand(index, arg) {
  var item = list[index];
  
  item.x = arg.x;
  item.y = arg.y;
}

function resizeCommand(index, arg) {
  var item = list[index];
  
  item.w = arg.w;
  item.h = arg.h;
}

function colourCommand(index, arg) {
  var item = list[index];
  
  item.c = arg;
}

// Command interfaces - used by GUI and jasmine

function  add(id) {
  action(new Add(id));    
}

function remove(id, index) {
  action(new Remove(id, index, list[index]));
}

function assignMove(id, index, before, after) {
  action(new Move(id, index, before, after));
}

function assignResize(id, index, before, after) {
  action(new Resize(id, index, before, after));
}

function assignColour(id, index, arg) {
  action(new Colour(id, index, list[index].c, arg));
}

// Application functions

function findBox(x, y) {
  var result = -1;
  
  for (var i = list.length - 1 ; i >= 0 ; i--)
  {
    var item = list[i];
    if (item.x <= x && item.x + item.w >= x && item.y <= y && item.y + item.h >= y) {
      result = i;
      break;
    }
  }
  
  return result;
}

function fill(count) {
  var context = getContext("#myCanvas");
  context.fillStyle="#FFFFFF";
  context.fillRect(0, 0, displayWidth, HEIGHT);
  
  reset();

  for (var i = 0 ; i < count ; i++) {
    doAdd(id++);
  }
}

