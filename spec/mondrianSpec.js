//  Test mondrian.js

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

describe('Jasmine is present', function() {
  it('true is true', function() {
    expect(true).toBe(true);
  });
});

/**
 *    canvas context stub
 */
 
  
function Context() {
  this.fillStyle = '000000';
  this.list = Array();
  
  this.fillRect = function (x, y, w, h){
    this.list[this.list.length] = {x:x, y:y, w:w, h:h, s:this.fillStyle};
  }
};

function displayName(name) {
}

function redraw() {}

function makeOpenList(){}

function disableActions(){}

/**
 *    local storage stub
 */

function LocalStore(key, value) {
  this.storage = new Object();
  
  this.setItem = function(key, value) {
    this.storage[key] = value.toString();
  }
  
  this.getItem = function(key) {
    return this.storage[key];
  } 
  
  this.getInt = function(key) {
    return parseInt(this.getItem(key));
  } 
}

storageCopy = new LocalStore();

describe('Mondrian', function() {
  beforeEach(function() {
    setup(1263, 903);
    reset();
    storageCopy = new LocalStore();
  });
  
  it('create(0) is at the top left corner, 50x50, black', function() {
    expect(make(0)).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
  });  

  it('create(5) is at 265, 265, 50x50, black', function() {
    expect(make(5)).toEqual({x:(5 * XFACTOR) % displayWidth, y:(5 * YFACTOR) % displayHeight, w:50, h:50, c:'000000'});
  });  

  it('create(100) is at 180, 140, 50x50, black', function() {
    expect(make(100)).toEqual({x:(100 * XFACTOR) % displayWidth, y:(100 * YFACTOR) % displayHeight, w:50, h:50, c:'000000'});
  });  

  it('create(102) is at 286, 246, 10x10, black', function() {
    expect(make(102)).toEqual({x:(102 * XFACTOR) % displayWidth, y:(102 * YFACTOR) % displayHeight, w:50, h:50, c:'000000'});
  }); 
  
  it('Add creates one item', function() {
    expect(current).toEqual(0);
    expect(list.length).toEqual(0);
    add(id++);

    expect(root.id).toEqual(0);
    expect(root.down.id).toEqual(1);
    expect(current).toEqual(1);    
    expect(list.length).toEqual(1);
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
  }); 
  
  it('Test not finding an item', function() {
    add(id++);
    add(id++);
    expect(root.id).toEqual(0);
    expect(root.down.id).toEqual(1);
    expect(root.down.down.id).toEqual(2);
    expect(findBox(200,100)).toEqual(-1);
  });

  
  it('Test find first item', function() {
    add(id++);
    add(id++);
    expect(findBox(5,5)).toEqual(0);
    expect(root.id).toEqual(0);
    expect(root.down.id).toEqual(1);
  });
  
  it('Test find second item', function() {
    add(id++);
    add(id++);
    expect(root.id).toEqual(0);
    expect(root.down.id).toEqual(1);
    expect(root.down.down.id).toEqual(2);
    expect(findBox(XFACTOR + 5, YFACTOR + 5)).toEqual(1);
  });
  
  it('delete an item', function() {
    times(4, function(){add(id++)});
    expect(list[0].x).toEqual(0);
    expect(list[1].x).toEqual(XFACTOR);
    expect(list[2].x).toEqual(2*XFACTOR);
    expect(list[3].x).toEqual(3*XFACTOR);
    remove(id++, 2);
    expect(list.length).toEqual(3);
    expect(list[0].x).toEqual(0);
    expect(list[1].x).toEqual(XFACTOR);
    expect(list[2].x).toEqual(3*XFACTOR);
  });
  
  it('Set position', function() {
    add(id++);
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});

    var before = new Object();
    before.x = list[0].x;
    before.y = list[0].y;
    
    after = new Object();
    after.x = 50;
    after.y = 60;
    assignMove(id++, 0, before, after);
      
    expect(list[0]).toEqual({x:50, y:60, w:50, h:50, c:'000000'});
  });
  
  it('Set size', function() {
    add(id++);
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    var before = {w : 50, h:50};
    var after = {w :30, h : 20};
    
    assignResize(id++, 0, before, after);  
    expect(list[0]).toEqual({x:0, y:0, w:30, h:20, c:'000000'});
  });
  
  it('Set colour', function() {
    add(id++);
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    assignColour(id++, 0, 'ff8844');  
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'ff8844'});
  });
  
  it('2 adds, 1 undo, 2 redos', function() {
    expect(point).toBe(root);
    expect(root.down).toBe(null);
    expect(root.across).toBe(null);
    expect(root.up).toBe(null);
    
    add(id++);
    add(id++);

    expect(root.id).toEqual(0);
    expect(root.down.id).toEqual(1);
    expect(root.down.down.id).toEqual(2);
    
    expect(current).toEqual(2);    
    expect(list.length).toEqual(2);
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    expect(list[1]).toEqual({x:XFACTOR, y:YFACTOR, w:50, h:50, c:'000000'});
    
    expect(point.id).not.toEqual(root.id);
    expect(point.depth).toEqual(2);
    expect(maxDepth).toEqual(2);
    expect(root.down).not.toBe(null);
    expect(root.across).toBe(null);
    expect(root.up).toBe(null);
    
    undo();  

    expect(current).toEqual(1);    
    expect(list.length).toEqual(1);
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    
    redo();
    redo();
    
    expect(current).toEqual(2);    
    expect(list.length).toEqual(2);
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    expect(list[1]).toEqual({x:XFACTOR, y:YFACTOR, w:50, h:50, c:'000000'});
  });
  
  it('many undos', function() {
    add(id++);
    add(id++);

    expect(root.id).toEqual(0);
    expect(root.down.id).toEqual(1);
    expect(root.down.down.id).toEqual(2);

    undo();
    undo();
    undo();
    expect(point.id).toEqual(root.id);
  }); 
  
  it('Delete undo/redo', function() {
    add(id++);
    add(id++);
    add(id++);
    remove(id++, 1);

    expect(root.id).toEqual(0);
    expect(root.down.id).toEqual(1);
    expect(root.down.down.id).toEqual(2);
    expect(root.down.down.down.id).toEqual(3);
    expect(root.down.down.down.down.id).toEqual(4);

    expect(list.length).toEqual(2);
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    expect(list[1]).toEqual({x:2 * XFACTOR, y:2*YFACTOR, w:50, h:50, c:'000000'});
    
    undo();
    
    expect(list.length).toEqual(3);
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    expect(list[1]).toEqual({x:XFACTOR, y:YFACTOR, w:50, h:50, c:'000000'});
    expect(list[2]).toEqual({x:2*XFACTOR, y:2*YFACTOR, w:50, h:50, c:'000000'});
    
    redo();    
    
    expect(list.length).toEqual(2);
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    expect(list[1]).toEqual({x:2*XFACTOR, y:2*YFACTOR, w:50, h:50, c:'000000'});
  });
  
  it('Modify undo/redo', function() {
    var oldPlace ={x:0, y:0};
    var newPlace = {x:20, y:30};
    
    var oldSize = {w:50, h:50};
    var newSize = {w:100, h:70};
    
    var newColour = '405060';
    
    add(id++);
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    
    assignMove(id++, 0, oldPlace, newPlace);
    expect(list[0]).toEqual({x:20, y:30, w:50, h:50, c:'000000'});
    assignResize(id++, 0, oldSize, newSize);
    expect(list[0]).toEqual({x:20, y:30, w:100, h:70, c:'000000'});
    assignColour(id++, 0, newColour);
    
    expect(list[0]).toEqual({x:20, y:30, w:100, h:70, c:'405060'});

    undo();
    
    expect(list[0]).toEqual({x:20, y:30, w:100, h:70, c:'000000'});

    undo();

    expect(list[0]).toEqual({x:20, y:30, w:50, h:50, c:'000000'});

    undo();

    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
  }); 
  
  it('branch undo', function() {
    var newPlace = {x:20, y:30};

    add(id++);
    add(id++);
    undo();
    assignMove(id++, 0, {x:0, y:0}, newPlace);
    
    expect(root.down.name).toEqual('Add');
    expect(root.down.down.name).toEqual('Add');
    expect(root.down.down.across.name).toEqual('Move');
    expect(maxDepth).toEqual(2);
    expect(point.depth).toEqual(2);        
  });
  
  it('Undo/redo bug', function() {
    expect(root.across).toEqual(null);
    expect(root.down).toEqual(null);
    expect(list.length).toEqual(0);
    
    add(id++);
    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(root.down.id).toEqual(1);
    expect(point.id).toEqual(1);
    expect(root.down.down).toEqual(null);
    expect(list.length).toEqual(1);

    add(id++);
    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(point.id).toEqual(2);
    expect(list.length).toEqual(2);

    add(id++);
    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(point.id).toEqual(3);
    expect(list.length).toEqual(3);

    remove(id++, 1);
    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(point.id).toEqual(4);
    expect(list.length).toEqual(2);

    remove(id++, 1);
    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(point.id).toEqual(5);
    expect(list.length).toEqual(1);

    undo();
    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(point.id).toEqual(4);
    expect(list.length).toEqual(2);

    undo();
    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(point.id).toEqual(3);
    expect(list.length).toEqual(3);

    add(id++);    
    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(point.id).toEqual(6);
    expect(point.up.id).toEqual(3);
    expect(list.length).toEqual(4);
    
    undo();
    expect(point.id).toEqual(3);
    expect(list.length).toEqual(3);

    undo();
    expect(point.id).toEqual(2);
    expect(list.length).toEqual(2);

    undo();
    expect(point.id).toEqual(1);
    expect(list.length).toEqual(1);

    undo();
    expect(point.id).toEqual(0);
    expect(list.length).toEqual(0);
    
    times(4, redo);

    expect(point.across).not.toEqual(null);

    times(4, redo);

    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(point.id).toEqual(5);
    expect(list.length).toEqual(1);

    times(9, undo);
    
    expect(point.id).toEqual(0);
    expect(list.length).toEqual(0);
    
    times(4, redo);
    expect(point.across).not.toEqual(null);
    redoWhere(point.across);
    
    expect(point.across).toEqual(null);
    expect(point.down).toEqual(null);
  });
  
  it('Undo/redo bug try 2', function() {
    times(2, function(){add(id++)});
    undo();
    times(2, function(){add(id++)});
    times(2, undo);
    times(3, function(){add(id++)});
    times(4, undo);
  
    var next = root.down;
    var target = next.down;
    expect(target.across).not.toEqual(null);
    target = target.across;
    expect(target.across).not.toEqual(null);   
    expect(list.length).toEqual(0);
  
  });
  
  it('Tree display - 1 column', function() {
    add(id++);
    var context = new Context();
    drawTree(context, {x:0, y:0}, 0, 5, 1, root);
    
    expect(context.list.length).toEqual(2);
    expect(context.list[0]).toEqual({x:0, y:0, h:5, w:TREE_WIDTH, s:'#FFFFFF'});
    expect(context.list[1]).toEqual({x:0, y:6, h:5, w:TREE_WIDTH, s:'#000000'});
  });

  it('Tree display - 2 column', function() {
    add(id++);
    undo();
    add(id++);
    var context = new Context();
    drawTree(context, {x:0, y:0}, 0, 5, 1, root);
    
    expect(context.list.length).toEqual(4);
    expect(context.list[0]).toEqual({x:0, y:0, h:5, w:TREE_WIDTH, s:'#FFFFFF'});
    expect(context.list[1]).toEqual({x:0, y:6, h:5, w:TREE_WIDTH, s:'#000000'});
    expect(context.list[3]).toEqual({x:TREE_WIDTH + 1, y:6, h:5, w:TREE_WIDTH, s:'#000000'});
  });

  it('Tree display - 3 column', function() {
    add(id++);
    undo();
    add(id++);
    undo();
    add(id++);
    var context = new Context();
    drawTree(context, {x:0, y:0}, 0, 5, 1, root);
    
    expect(context.list.length).toEqual(6);
    expect(context.list[0]).toEqual({x:0, y:0, h:5, w:TREE_WIDTH, s:'#FFFFFF'});
    expect(context.list[1]).toEqual({x:0, y:6, h:5, w:TREE_WIDTH, s:'#000000'});
    expect(context.list[3]).toEqual({x:TREE_WIDTH + 1, y:6, h:5, w:TREE_WIDTH, s:'#000000'});
    expect(context.list[5]).toEqual({x:2*(TREE_WIDTH+1), y:6, h:5, w:TREE_WIDTH, s:'#000000'});
  });
  
  it('Search for branched undo/redo', function() {
    add(id++);
    add(id++)
    undo();
    add(id++);
    undo()
    undo();
    add(id++);

   var find = findUndoRedo(0, root, {depth:1, column:1});
   expect(find.found).toEqual(false);
   var find = findUndoRedo(0, root, {depth:1, column:2});
   expect(find.found).toEqual(true);
   expect(find.element.id).toEqual(4);     
  });
  
  it('Search for wider branched undo/redo', function() {
    add(id++);
    add(id++);
    undo();
    add(id++);
    undo();
    undo();
    add(id++);
    add(id++);
    undo();
    add(id++);

   var find = findUndoRedo(0, root, {depth:1, column:1});
   expect(find.found).toEqual(false);
   var find = findUndoRedo(0, root, {depth:1, column:2});
   expect(find.found).toEqual(true);
   expect(find.element.id).toEqual(4); 
   var find = findUndoRedo(0, root, {depth:2, column:3});
   expect(find.found).toEqual(true);
   expect(find.element.id).toEqual(6); 
  });

  it('Search for chained across undo/redo', function() {
    add(id++);
    undo();
    add(id++);
    undo()
    add(id++);
    undo();
    add(id++);

   var find = findUndoRedo(0, root, {depth:1, column:0});
   expect(find.found).toEqual(true);
   expect(find.element.id).toEqual(1); 
   var find = findUndoRedo(0, root, {depth:1, column:1});
   expect(find.found).toEqual(true);
   expect(find.element.id).toEqual(2); 
   var find = findUndoRedo(0, root, {depth:1, column:2});
   expect(find.found).toEqual(true);
   expect(find.element.id).toEqual(3); 
   var find = findUndoRedo(0, root, {depth:1, column:3});
   expect(find.found).toEqual(true);
   expect(find.element.id).toEqual(4); 
  });
  
  it('toRoot', function() {
    add(id++);
    add(id++);
    undo();
    add(id++);
    toRoot();
    expect(point.id).toEqual(root.id);
  });

  it('getpath', function() {
    add(id++);
    add(id++);
    undo();
    add(id++);
    var dest = point;
    toRoot();
    expect(point.id).toEqual(root.id);
    var path = getPath(dest);
    expect(path).toEqual([{parent:1,child:3}]);
  });

  it('followPath', function() {
    add(id++);
    add(id++);
    undo();
    add(id++);
    var dest = point;
    toRoot();
    expect(point.id).toEqual(root.id);
    var path = getPath(dest);
    expect(path).toEqual([{parent:1,child:3}]);
    followPath(path, dest.id);
    expect(point.id).toEqual(3);
  });
  
  it('bigger followPath', function() {
    add(id++);
    add(id++);
    undo();
    add(id++);
    var dest = point;
    add(id++);
    add(id++);
    undo()
    add(id++);
    toRoot();
    expect(point.id).toEqual(root.id);
    var path = getPath(dest);
    expect(path).toEqual([{parent:1,child:3}]);
    followPath(path, dest.id);
    expect(point.id).toEqual(3);
  });  
  
  it('test save header', function() {
    expect(isPicture(storageCopy, 1)).toEqual(false);
    newPicture(storageCopy);
    expect(storageCopy.getItem('mondrian.1.name')).toEqual('Picture 1');
    expect(isPicture(storageCopy, 1)).toEqual(true);
    expect(isPicture(storageCopy, 2)).toEqual(false);
  });

  it('test save 2 headers', function() {
    expect(isPicture(storageCopy, 1)).toEqual(false);
    newPicture(storageCopy);
    newPicture(storageCopy);
    expect(storageCopy.getItem('mondrian.1.name')).toEqual('Picture 1');
    expect(storageCopy.getItem('mondrian.2.name')).toEqual('Picture 2');
    expect(isPicture(storageCopy, 1)).toEqual(true);
    expect(isPicture(storageCopy, 2)).toEqual(true);
    expect(isPicture(storageCopy, 3)).toEqual(false);
  });
  
  it('test save Root', function() {
    pictureIndex = newPicture(storageCopy);
    point.save(storageCopy, pictureIndex);
    
    expect(storageCopy.getItem('mondrian.1.0.name')).toEqual('Root');
    expect(storageCopy.getInt('mondrian.1.0.depth')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.0.up')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.0.down')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.0.across')).toEqual(-1);
  });

  it('test save Add', function() {
    add(id++);
    
    expect(storageCopy.getItem('mondrian.1.0.name')).toEqual('Root');
    expect(storageCopy.getInt('mondrian.1.0.depth')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.0.up')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.0.down')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.0.across')).toEqual(-1);

    expect(storageCopy.getItem('mondrian.1.1.name')).toEqual('Add');
    expect(storageCopy.getInt('mondrian.1.1.depth')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.1.up')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.1.down')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.1.across')).toEqual(-1);

    expect(storageCopy.getInt('mondrian.1.point.id')).toEqual(1);
  });

  it('test save Move', function() {
    add(id++);
    var before = {x: list[0].x, y:list[0].y};
    var after = {x:100, y:35};
    assignMove(id++, 0, before, after);  
    
    expect(storageCopy.getItem('mondrian.1.0.name')).toEqual('Root');
    expect(storageCopy.getInt('mondrian.1.0.depth')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.0.up')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.0.down')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.0.across')).toEqual(-1);

    expect(storageCopy.getItem('mondrian.1.1.name')).toEqual('Add');
    expect(storageCopy.getInt('mondrian.1.1.depth')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.1.up')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.1.down')).toEqual(2);
    expect(storageCopy.getInt('mondrian.1.1.across')).toEqual(-1);

    expect(storageCopy.getItem('mondrian.1.2.name')).toEqual('Move');
    expect(storageCopy.getInt('mondrian.1.2.depth')).toEqual(2);
    expect(storageCopy.getInt('mondrian.1.2.up')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.2.down')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.2.across')).toEqual(-1);

    expect(storageCopy.getInt('mondrian.1.2.data.index')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.2.data.begin.x')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.2.data.begin.y')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.2.data.finish.x')).toEqual(100);
    expect(storageCopy.getInt('mondrian.1.2.data.finish.y')).toEqual(35);

    expect(storageCopy.getInt('mondrian.1.point.id')).toEqual(2);
  });

  it('test save Resize', function() {
    add(id++);
    var before = {w: list[0].w, h:list[0].h};
    var after = {w:110, h:30};
    assignResize(id++, 0, before, after);  
    
    expect(storageCopy.getItem('mondrian.1.0.name')).toEqual('Root');
    expect(storageCopy.getInt('mondrian.1.0.depth')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.0.up')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.0.down')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.0.across')).toEqual(-1);

    expect(storageCopy.getItem('mondrian.1.1.name')).toEqual('Add');
    expect(storageCopy.getInt('mondrian.1.1.depth')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.1.up')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.1.down')).toEqual(2);
    expect(storageCopy.getInt('mondrian.1.1.across')).toEqual(-1);

    expect(storageCopy.getItem('mondrian.1.2.name')).toEqual('Resize');
    expect(storageCopy.getInt('mondrian.1.2.depth')).toEqual(2);
    expect(storageCopy.getInt('mondrian.1.2.up')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.2.down')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.2.across')).toEqual(-1);

    expect(storageCopy.getInt('mondrian.1.2.data.index')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.2.data.begin.w')).toEqual(50);
    expect(storageCopy.getInt('mondrian.1.2.data.begin.h')).toEqual(50);
    expect(storageCopy.getInt('mondrian.1.2.data.finish.w')).toEqual(110);
    expect(storageCopy.getInt('mondrian.1.2.data.finish.h')).toEqual(30);

    expect(storageCopy.getInt('mondrian.1.point.id')).toEqual(2);
  });

  it('test save Colour', function() {
    add(id++);
    assignColour(id++, 0, 'ff0000');  
    
    expect(storageCopy.getItem('mondrian.1.0.name')).toEqual('Root');
    expect(storageCopy.getInt('mondrian.1.0.depth')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.0.up')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.0.down')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.0.across')).toEqual(-1);

    expect(storageCopy.getItem('mondrian.1.1.name')).toEqual('Add');
    expect(storageCopy.getInt('mondrian.1.1.depth')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.1.up')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.1.down')).toEqual(2);
    expect(storageCopy.getInt('mondrian.1.1.across')).toEqual(-1);

    expect(storageCopy.getItem('mondrian.1.2.name')).toEqual('Colour');
    expect(storageCopy.getInt('mondrian.1.2.depth')).toEqual(2);
    expect(storageCopy.getInt('mondrian.1.2.up')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.2.down')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.2.across')).toEqual(-1);

    expect(storageCopy.getInt('mondrian.1.2.data.index')).toEqual(0);
    expect(storageCopy.getItem('mondrian.1.2.data.c')).toEqual('000000');
    expect(storageCopy.getItem('mondrian.1.2.data.arg')).toEqual('ff0000');

    expect(storageCopy.getInt('mondrian.1.point.id')).toEqual(2);
  });

  it('test save Remove', function() {
    add(id++);
    remove(id++, 0);  
    
    expect(storageCopy.getItem('mondrian.1.0.name')).toEqual('Root');
    expect(storageCopy.getInt('mondrian.1.0.depth')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.0.up')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.0.down')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.0.across')).toEqual(-1);

    expect(storageCopy.getItem('mondrian.1.1.name')).toEqual('Add');
    expect(storageCopy.getInt('mondrian.1.1.depth')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.1.up')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.1.down')).toEqual(2);
    expect(storageCopy.getInt('mondrian.1.1.across')).toEqual(-1);

    expect(storageCopy.getItem('mondrian.1.2.name')).toEqual('Delete');
    expect(storageCopy.getInt('mondrian.1.2.depth')).toEqual(2);
    expect(storageCopy.getInt('mondrian.1.2.up')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.2.down')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.2.across')).toEqual(-1);

    expect(storageCopy.getInt('mondrian.1.2.data.index')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.2.data.item.x')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.2.data.item.y')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.2.data.item.w')).toEqual(50);
    expect(storageCopy.getInt('mondrian.1.2.data.item.h')).toEqual(50);
    expect(storageCopy.getItem('mondrian.1.2.data.item.c')).toEqual('000000');

    expect(storageCopy.getInt('mondrian.1.point.id')).toEqual(2);
  });

  it('test save branch', function() {
    add(id++);

    expect(storageCopy.getInt('mondrian.1.point.id')).toEqual(1);

    remove(id++, 0);

    expect(storageCopy.getInt('mondrian.1.point.id')).toEqual(2);

    undo();  

    expect(storageCopy.getInt('mondrian.1.point.id')).toEqual(1);

    assignColour(id++, 0, 'ff0000');  

    expect(storageCopy.getInt('mondrian.1.point.id')).toEqual(3);
    
    undo();  

    expect(storageCopy.getInt('mondrian.1.point.id')).toEqual(1);

    redoWhere(point.down.across);
    
    expect(storageCopy.getInt('mondrian.1.point.id')).toEqual(3);

    expect(storageCopy.getItem('mondrian.1.0.name')).toEqual('Root');
    expect(storageCopy.getInt('mondrian.1.0.depth')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.0.up')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.0.down')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.0.across')).toEqual(-1);

    expect(storageCopy.getItem('mondrian.1.1.name')).toEqual('Add');
    expect(storageCopy.getInt('mondrian.1.1.depth')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.1.up')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.1.down')).toEqual(2);
    expect(storageCopy.getInt('mondrian.1.1.across')).toEqual(-1);

    expect(storageCopy.getItem('mondrian.1.2.name')).toEqual('Delete');
    expect(storageCopy.getInt('mondrian.1.2.depth')).toEqual(2);
    expect(storageCopy.getInt('mondrian.1.2.up')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.2.down')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.2.across')).toEqual(3);

    expect(storageCopy.getInt('mondrian.1.2.data.index')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.2.data.item.x')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.2.data.item.y')).toEqual(0);
    expect(storageCopy.getInt('mondrian.1.2.data.item.w')).toEqual(50);
    expect(storageCopy.getInt('mondrian.1.2.data.item.h')).toEqual(50);
    expect(storageCopy.getItem('mondrian.1.2.data.item.c')).toEqual('000000');

    expect(storageCopy.getItem('mondrian.1.3.name')).toEqual('Colour');
    expect(storageCopy.getInt('mondrian.1.3.depth')).toEqual(2);
    expect(storageCopy.getInt('mondrian.1.3.up')).toEqual(1);
    expect(storageCopy.getInt('mondrian.1.3.down')).toEqual(-1);
    expect(storageCopy.getInt('mondrian.1.3.across')).toEqual(-1);

    expect(storageCopy.getInt('mondrian.1.3.data.index')).toEqual(0);
    expect(storageCopy.getItem('mondrian.1.3.data.c')).toEqual('000000');
    expect(storageCopy.getItem('mondrian.1.3.data.arg')).toEqual('ff0000');
    
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'ff0000'});
  });

  it('test ioad of save branch', function() {
    add(id++);
    remove(id++, 0);
    undo();  
    assignColour(id++, 0, 'ff0000');  
    undo();  
    redoWhere(point.down.across);
    reset();
    expect(root.down).toEqual(null);
    load(storageCopy, 1);

    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'ff0000'});
  });

  it('test ioad of all saved types', function() {
    add(id++);
    add(id++);
    remove(id++, 1);
    assignColour(id++, 0, 'ff0000');  
    assignMove(id++, 0, {x:list[0].x, y:list[0].y}, {x:140,y:120});
    assignResize(id++, 0, {w:list[0].w, h:list[0].h}, {w:40,h:20});
    
    reset();

    expect(root.down).toEqual(null);

    load(storageCopy, 1);
    
    expect(point.id).toEqual(6); 
    expect(list[0]).toEqual({x:140, y:120, w:40, h:20, c:'ff0000'});

    undo();
    expect(point.id).toEqual(5); 
    expect(list[0]).toEqual({x:140, y:120, w:50, h:50, c:'ff0000'});

    undo();
    expect(point.id).toEqual(4); 
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'ff0000'});

    undo();
    expect(point.id).toEqual(3); 
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});

    undo();
    expect(point.id).toEqual(2); 
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    expect(list[1]).toEqual({x:33, y:79, w:50, h:50, c:'000000'});
  });

  it('test ioad bug', function() {
    add(id++);
    add(id++);
    undo();
    add(id++);
    undo();
    add(id++);
    undo();
    add(id++);
    undo();
    add(id++);
       
    reset();

    expect(root.down).toEqual(null);

    load(storageCopy, 1);
    
    expect(point.id).toEqual(6); 
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    expect(list[1]).toEqual({x:33, y:79, w:50, h:50, c:'000000'});
  });
});
