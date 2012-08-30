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
  root = new Root(id++);
  point = root;
  maxDepth = 1;
}

// Storage functions

function newPicture(storageCopy) {
  var index = 1;
  
  while (storageCopy.getItem('mondrian.' + index + '.exists')) {
    index++;
  }
  
  storageCopy.setItem('mondrian.' + index + '.exists', 'yes');
  
  var nameNumber = index;
  
  while(nameExists(storageCopy, nameNumber)) {
    nameNumber++;
  }  

  var name = 'Picture ' + nameNumber;
  displayName(name);
  storageCopy.setItem('mondrian.' + index + '.name', name);
  
  return index;
}

function isPicture(storageCopy, index) {
  var test = storageCopy.getItem('mondrian.' + index + '.exists');
  return test != false && test == 'yes';
}

function nameExists(storageCopy, nameNumber) {
  var index = 1;
  
  while (storageCopy.getItem('mondrian.' + index + '.exists')) {    
    if (isPicture(storageCopy, index)) {
      if(storageCopy.getItem('mondrian.' + index + '.name') == 'Picture ' + nameNumber) {
        return true;
      }
    }
    index++;
  }
  
  return false;
}

function load(storgeCopy, picIndex) {
  pictureIndex = picIndex;
  displayName(storageCopy.getItem('mondrian.' + pictureIndex + '.name'));
  var pointId = storageCopy.getInt('mondrian.' + pictureIndex + '.point.id');  
  root = loadNode(storageCopy, pictureIndex, 0, null, pointId);
  
  id++;
  var path = getPath(point);
  var target = point.id;
  point = root;
  followPath(path, target);
  redraw();
}

function loadNode(storageCopy, pictureIndex, index, up, pointId) {
  var node = makeNode(storageCopy, pictureIndex, index);
  
  node.up = up;
  
  var downId = storageCopy.getInt(saveName(pictureIndex, index, 'down'));
  if (downId >= 0) {
    node.down = loadNode(storageCopy, pictureIndex, downId, node, pointId);
  }
  
  var acrossId = storageCopy.getInt(saveName(pictureIndex, index, 'across'));
  if (acrossId >= 0) {
    node.across = loadNode(storageCopy, pictureIndex, acrossId, up, pointId);
  }
  
  maxDepth = Math.max(maxDepth, node.depth);
  if (node.id == pointId) {
    point = node;
  }
  id = Math.max(id, node.id);
  return node;  
}

function reBuild(node, id) {
  node.redo();
  var newNode = node;
  
  if (node.id != id) {
    newNode = node.down;
    
    for (var across = newNode.across; across != null && across.id <= id ; across = across.across)
    {
      newNode = across;
    }

    newNode = reBuild(newNode, id);
  }
  
  return newNode;  
}

function makeNode(storageCopy, pictureIndex, index) {
  var name = storageCopy.getItem(saveName(pictureIndex, index, 'name'));
  var node;
  
  if (name == 'Root') {
    node = makeRoot(storageCopy, pictureIndex, index);
  }
  else if (name == 'Add'){
    node = makeAdd(storageCopy, pictureIndex, index);
  }
  else if (name == 'Delete'){
    node = makeRemove(storageCopy, pictureIndex, index);
  }
  else if (name == 'Move'){
    node = makeMove(storageCopy, pictureIndex, index);
  }
  else if (name == 'Resize'){
    node = makeResize(storageCopy, pictureIndex, index);
  }
  else if (name == 'Colour'){
    node = makeColour(storageCopy, pictureIndex, index);
  }
  
  return node;
}

function makeRoot(storageCopy, pictureIndex, index) {
  var node = new Root(index);
  fillBase(storageCopy, pictureIndex, index, node);
  return node;
}

function makeAdd(storageCopy, pictureIndex, index) {
  var node = new Add(index);
  fillBase(storageCopy, pictureIndex, index, node);
  return node;
}

function makeRemove(storageCopy, pictureIndex, index) {
  var itemIndex = storageCopy.getItem(saveName(pictureIndex, index, 'data.index'));
  
  var item = new Object();    
  item.x = storageCopy.getInt(saveName(pictureIndex, index, 'data.item.x'));    
  item.y = storageCopy.getInt(saveName(pictureIndex, index, 'data.item.y'));    
  item.w = storageCopy.getInt(saveName(pictureIndex, index, 'data.item.w'));    
  item.h = storageCopy.getInt(saveName(pictureIndex, index, 'data.item.h'));    
  item.c = storageCopy.getItem(saveName(pictureIndex, index, 'data.item.c'));    

  var node = new Remove(index, itemIndex, item);
  fillBase(storageCopy, pictureIndex, index, node);
  return node;
}

function makeMove(storageCopy, pictureIndex, index) {
  var itemIndex = storageCopy.getItem(saveName(pictureIndex, index, 'data.index'));

  var begin = new Object();    
  begin.x = storageCopy.getInt(saveName(pictureIndex, index, 'data.begin.x'));    
  begin.y = storageCopy.getInt(saveName(pictureIndex, index, 'data.begin.y'));

  var finish = new Object();    
  finish.x = storageCopy.getInt(saveName(pictureIndex, index, 'data.finish.x'));
  finish.y = storageCopy.getInt(saveName(pictureIndex, index, 'data.finish.y'));    

  var node = new Move(index, itemIndex, begin, finish);
  fillBase(storageCopy, pictureIndex, index, node);
  return node;
}

function makeResize(storageCopy, pictureIndex, index) {
  var itemIndex = storageCopy.getItem(saveName(pictureIndex, index, 'data.index'));

  var begin = new Object();    
  begin.w = storageCopy.getInt(saveName(pictureIndex, index, 'data.begin.w'));    
  begin.h = storageCopy.getInt(saveName(pictureIndex, index, 'data.begin.h'))

  var finish = new Object();    
  finish.w = storageCopy.getInt(saveName(pictureIndex, index, 'data.finish.w'));
  finish.h = storageCopy.getInt(saveName(pictureIndex, index, 'data.finish.h'));    

  var node = new Resize(index, itemIndex, begin, finish);
  fillBase(storageCopy, pictureIndex, index, node);
  return node;
}

function makeColour(storageCopy, pictureIndex, index) {
  var itemIndex = storageCopy.getItem(saveName(pictureIndex, index, 'data.index'));

  var arg = storageCopy.getItem(saveName(pictureIndex, index, 'data.arg'));    
  var before = storageCopy.getItem(saveName(pictureIndex, index, 'data.c'));    

  var node = new Colour(index, itemIndex, before, arg);
  fillBase(storageCopy, pictureIndex, index, node);
  return node;
}

function fillBase(storageCopy, pictureIndex, index, base) {
  base.depth = storageCopy.getInt(saveName(pictureIndex, index, 'depth'));
  base.context = storageCopy.getItem(saveName(pictureIndex, index, 'context'));
}

function save() {
  if (root.down.down == null) {         // This is the first action
    pictureIndex = newPicture(storageCopy);
    root.save(storageCopy, pictureIndex);
    makeOpenList();
    disableActions(false);
  }
  
  point.save(storageCopy, pictureIndex);
  savePoint();
}

function savePoint() {
  storageCopy.setItem('mondrian.' + pictureIndex + '.point.id', point.id);
}

function getId(pointer) {
  return (pointer == null) ? -1 : pointer.id;
}

function saveName(pictureIndex, id, name) {
  return 'mondrian.' + pictureIndex + '.' + id + '.' + name;
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
  save();
  undo.redo();
  redraw();
  undo.setContext(storageCopy, pictureIndex, $('#myCanvas')[0].toDataURL());
}

function BaseUndoRedo(idArg) {
  this.id = idArg;
  this.down = null;
  this.across = null;
  this.up = null;

  this.setContext = function(storageCopy, pictureIndex, context) {
    this.context = context;
    storageCopy.setItem(saveName(pictureIndex, this.id, 'context'), context);
  }
   
  this.saveBase = function(storageCopy, pictureIndex) {
    storageCopy.setItem(saveName(pictureIndex, this.id, 'name'), this.name);
    storageCopy.setItem(saveName(pictureIndex, this.id, 'depth'), this.depth);
    storageCopy.setItem(saveName(pictureIndex, this.id, 'down'), getId(this.down));
    storageCopy.setItem(saveName(pictureIndex, this.id, 'across'), getId(this.across));
    storageCopy.setItem(saveName(pictureIndex, this.id, 'up'), getId(this.up));

    this.updateRelative(storageCopy, pictureIndex); 
  }
  
  this.updateRelative = function(storageCopy, pictureIndex) {
    if (this.up != null) {                      // check for root
      if (this.up.down.id == this.id) {
        storageCopy.setItem(saveName(pictureIndex, this.up.id, 'down'), this.id);
      }
      else {
        var pointer = this.up.down;
        while (pointer.across.id != this.id) {
          pointer = pointer.across;
        }
        
        storageCopy.setItem(saveName(pictureIndex, pointer.id, 'across'), this.id);
      }
    }    
  }

  return this;
}
 
function Root(idArg) {
  var that = new BaseUndoRedo(idArg);
  
  that.name = "Root";
  that.depth = 0;
  that.colour = "#FFFFFF";
    
  that.label = function() {
    return this.name + " " + this.id;
  }

  that.undo = function() {};
  
  that.redo = function() {};

  that.save = function(storageCopy, pictureIndex) {
    this.saveBase(storageCopy, pictureIndex);
  }
  
  return that;
}

function Add(idArg) {
  var that = new BaseUndoRedo(idArg);
  
  that.name = "Add";
  that.colour = "#000000";

  that.label = function() {
    var state = make(this.localCurrent);
    return this.name + ' ' + this.id + ' x=' + state.x + ' y=' + state.y;
  }

  that.undo = function() {
    current--;
    list.splice(list.length-1, 1);    
  };
  
  that.redo = function() {
    addCommand();
  };
  
  that.save = function(storageCopy, pictureIndex) {
    this.saveBase(storageCopy, pictureIndex);
  }
  
  return that;
}

function Remove(idArg, index, listData) {
  var that = new BaseUndoRedo(idArg);
  that.colour = "#FF0000";

  that.name = "Delete";

  var data = new Object;
  var local = new Object;
  $.extend(local, listData);
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
  
  that.save = function(storageCopy, pictureIndex) {
    this.saveBase(storageCopy, pictureIndex);
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.index'), this.data.index);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.item.x'), this.data.item.x);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.item.y'), this.data.item.y);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.item.w'), this.data.item.w);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.item.h'), this.data.item.h);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.item.c'), this.data.item.c);    
  }
  
  return that;
}

function Colour(idArg, index, before, arg) {
  var that = new BaseUndoRedo(idArg);
  
  that.name = "Colour";
  that.colour = "#00FF00";

  var data = new Object;
  var local = new Object;
 
  data.c = before;
  data.index = index;
  data.arg = arg;
  that.data = data;
  
  that.label = function() {
    return this.name + ' ' + this.id + ' ' + this.data.arg;
  }

  that.undo = function() {
    var item = list[this.data.index];
    
    item.c = this.data.c;
  };
  
  that.redo = function() {
    colourCommand(this.data.index, this.data.arg);
  };
  
  that.save = function(storageCopy, pictureIndex) {
    this.saveBase(storageCopy, pictureIndex);

    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.index'), this.data.index);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.arg'), this.data.arg);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.c'), this.data.c);    
  }
  
  return that;
}

//  Assume begin and finish are objects not otherwise referenced.

function Move(idArg, index, begin, finish) {
  var that = new BaseUndoRedo(idArg);

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
  
  that.save = function(storageCopy, pictureIndex) {
    this.saveBase(storageCopy, pictureIndex);
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.index'), this.data.index);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.begin.x'), this.data.begin.x);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.begin.y'), this.data.begin.y);
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.finish.x'), this.data.finish.x);
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.finish.y'), this.data.finish.y);    
  }
  
  return that;
}

//  Assume finish is object not otherwise referenced.

function Resize(idArg, index, begin, finish) {
  var that = new BaseUndoRedo(idArg);

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
  
  that.save = function(storageCopy, pictureIndex) {
    this.saveBase(storageCopy, pictureIndex);
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.index'), this.data.index);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.begin.w'), this.data.begin.w);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.begin.h'), this.data.begin.h);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.finish.w'), this.data.finish.w);    
    storageCopy.setItem(saveName(pictureIndex, this.id, 'data.finish.h'), this.data.finish.h);    
  }
  
  return that;
}

function undo() {
  point.undo();
  if (point.up != null) {
    point = point.up;
    savePoint();
  }
}

function redo() {
  redoWhere(point.down);
}

function redoWhere(where) {
  if (where != null) {
    point = where;
    point.redo();
    savePoint();
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
 *    @param {context2d} context        HTML canvas context for drawing
 *    @param {{num, num}} displacement  display displacement 
 *    @param {num} offset               horizontal positioning for this tree
 *    @param {num} itemHeight           height of an item box                                               
 *    @param {num} separation           separation between items
 *    @param {BaseUndoRedo} tree        tree to draw
 *   
 *    @return (num) columns       number of columns in the tree 
 *    Draw the tree on a canvas
 */
        
function drawTree(context, displacement, offset, itemHeight, separation, tree) {
  var columns = 1;

  context.fillStyle=tree.colour;
  context.fillRect(offset - displacement.x, 
    (tree.depth * (itemHeight + separation)) - displacement.y, 
    TREE_WIDTH, itemHeight);

  if (tree.down != null){
    columns = drawTree(context, displacement, offset, itemHeight, separation, tree.down);    
  }

  if (tree.across != null) {
    context.fillStyle="#606060";
    context.fillRect(offset + TREE_WIDTH - displacement.x, 
      (tree.depth * (itemHeight + separation)) - displacement.y, 
      columns * TREE_WIDTH, 1);

    var delta = offset + (TREE_WIDTH + separation) * columns;
    columns += drawTree(context, displacement, delta, itemHeight, separation, tree.across);
  }
  
  return columns;
}

/**
 *    @param {num} column               current column
 *    @param {BaseUndoRedo} tree        tree to search
 *    @param {column: nuum, depth:num} location to find
 *     
 *    @return {found: bool,column: num, element:BaseUndoRedo) result of search, columns, element found 
 */
        
function findUndoRedo(column, tree, target) {
  if (tree.depth == target.depth && column == target.column) {
    return {found: true, element: tree};
  }
  var newColumns = 1;

  if (tree.down != null){
    result = findUndoRedo(column, tree.down, target); 
    if (result.found){
      return result;
    }
    else
    {
      newColumns = result.columns;
    }
  }

  if (tree.across != null) {
    result = findUndoRedo(column + newColumns, tree.across, target);
    if (result.found) return result;
    newColumns += result.columns;
  }
  
  return {found : false, columns: newColumns};
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