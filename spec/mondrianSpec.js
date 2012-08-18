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

function redraw() {}

/**
 *    local storage stub
 */

var storage = {}; 

function localStore(key, value) {
  $.extend(storage, {key : value});
}

describe('Mondrian', function() {
  beforeEach(function() {
    setup(1263, 903);
    reset();
    storage = {};
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
    add();
    expect(current).toEqual(1);    
    expect(list.length).toEqual(1);
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
  }); 
  
  it('Test not finding an item', function() {
    add();
    add();
    expect(findBox(200,100)).toEqual(-1);
  });

  
  it('Test find first item', function() {
    add();
    add();
    expect(findBox(5,5)).toEqual(0);
  });
  
  it('Test find second item', function() {
    add();
    add();
    expect(findBox(XFACTOR + 5, YFACTOR + 5)).toEqual(1);
  });
  
  it('delete an item', function() {
    times(4, add);
    expect(list[0].x).toEqual(0);
    expect(list[1].x).toEqual(XFACTOR);
    expect(list[2].x).toEqual(2*XFACTOR);
    expect(list[3].x).toEqual(3*XFACTOR);
    remove(2);
    expect(list.length).toEqual(3);
    expect(list[0].x).toEqual(0);
    expect(list[1].x).toEqual(XFACTOR);
    expect(list[2].x).toEqual(3*XFACTOR);
  });
  
  it('Set position', function() {
    add();
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});

    var before = new Object();
    before.x = list[0].x;
    before.y = list[0].y;
    
    after = new Object();
    after.x = 50;
    after.y = 60;
    assignMove(0, before, after);
      
    expect(list[0]).toEqual({x:50, y:60, w:50, h:50, c:'000000'});
  });
  
  it('Set size', function() {
    add();
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    var before = {w : 50, h:50};
    var after = {w :30, h : 20};
    
    assignResize(0, before, after);  
    expect(list[0]).toEqual({x:0, y:0, w:30, h:20, c:'000000'});
  });
  
  it('Set colour', function() {
    add();
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    assignColour(0, 'ff8844');  
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'ff8844'});
  });
  
  it('2 adds, 1 undo, 2 redos', function() {
    expect(point).toBe(root);
    expect(root.down).toBe(null);
    expect(root.across).toBe(null);
    expect(root.up).toBe(null);
    
    add();
    add();
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
    add();
    add();
    undo();
    undo();
    undo();
    expect(point.id).toEqual(root.id);
  }); 
  
  it('Delete undo/redo', function() {
    add();
    add();
    add();
    remove(1);

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
    
    add();
    expect(list[0]).toEqual({x:0, y:0, w:50, h:50, c:'000000'});
    
    assignMove(0, oldPlace, newPlace);
    expect(list[0]).toEqual({x:20, y:30, w:50, h:50, c:'000000'});
    assignResize(0, oldSize, newSize);
    expect(list[0]).toEqual({x:20, y:30, w:100, h:70, c:'000000'});
    assignColour(0, newColour);
    
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

    add();
    add();
    undo();
    assignMove(0, {x:0, y:0}, newPlace);
    
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
    
    add();
    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(root.down.id).toEqual(1);
    expect(point.id).toEqual(1);
    expect(root.down.down).toEqual(null);
    expect(list.length).toEqual(1);

    add();
    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(point.id).toEqual(2);
    expect(list.length).toEqual(2);

    add();
    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(point.id).toEqual(3);
    expect(list.length).toEqual(3);

    remove(1);
    expect(root.across).toEqual(null);
    expect(root.down).not.toEqual(null);
    expect(point.id).toEqual(4);
    expect(list.length).toEqual(2);

    remove(1);
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

    add();    
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
    times(2, add);
    undo();
    times(2, add);
    times(2, undo);
    times(3, add);
    times(4, undo);
  
    var next = root.down;
    var target = next.down;
    expect(target.across).not.toEqual(null);
    target = target.across;
    expect(target.across).not.toEqual(null);   
    expect(list.length).toEqual(0);
  
  });
  
  it('Tree display - 1 column', function() {
    add();
    var context = new Context();
    drawTree(context, {x:0, y:0}, 0, 5, 1, root);
    
    expect(context.list.length).toEqual(2);
    expect(context.list[0]).toEqual({x:0, y:0, h:5, w:TREE_WIDTH, s:'#FFFFFF'});
    expect(context.list[1]).toEqual({x:0, y:6, h:5, w:TREE_WIDTH, s:'#000000'});
  });

  it('Tree display - 2 column', function() {
    add();
    undo();
    add();
    var context = new Context();
    drawTree(context, {x:0, y:0}, 0, 5, 1, root);
    
    expect(context.list.length).toEqual(4);
    expect(context.list[0]).toEqual({x:0, y:0, h:5, w:TREE_WIDTH, s:'#FFFFFF'});
    expect(context.list[1]).toEqual({x:0, y:6, h:5, w:TREE_WIDTH, s:'#000000'});
    expect(context.list[3]).toEqual({x:TREE_WIDTH + 1, y:6, h:5, w:TREE_WIDTH, s:'#000000'});
  });

  it('Tree display - 3 column', function() {
    add();
    undo();
    add();
    undo();
    add();
    var context = new Context();
    drawTree(context, {x:0, y:0}, 0, 5, 1, root);
    
    expect(context.list.length).toEqual(6);
    expect(context.list[0]).toEqual({x:0, y:0, h:5, w:TREE_WIDTH, s:'#FFFFFF'});
    expect(context.list[1]).toEqual({x:0, y:6, h:5, w:TREE_WIDTH, s:'#000000'});
    expect(context.list[3]).toEqual({x:TREE_WIDTH + 1, y:6, h:5, w:TREE_WIDTH, s:'#000000'});
    expect(context.list[5]).toEqual({x:2*(TREE_WIDTH+1), y:6, h:5, w:TREE_WIDTH, s:'#000000'});
  });
  
  it('Search for branched undo/redo', function() {
    add();
    add()
    undo();
    add();
    undo()
    undo();
    add();

   var find = findUndoRedo(0, root, {depth:1, column:1});
   expect(find.found).toEqual(false);
   var find = findUndoRedo(0, root, {depth:1, column:2});
   expect(find.found).toEqual(true);
   expect(find.element.id).toEqual(4);     
  });
  
  it('Search for wider branched undo/redo', function() {
    add();
    add();
    undo();
    add();
    undo();
    undo();
    add();
    add();
    undo();
    add();

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
    add();
    undo();
    add();
    undo()
    add();
    undo();
    add();

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
    add();
    add();
    undo();
    add();
    toRoot();
    expect(point.id).toEqual(root.id);
  });

  it('getpath', function() {
    add();
    add();
    undo();
    add();
    var dest = point;
    toRoot();
    expect(point.id).toEqual(root.id);
    var path = getPath(dest);
    expect(path).toEqual([{parent:1,child:3}]);
  });

  it('followPath', function() {
    add();
    add();
    undo();
    add();
    var dest = point;
    toRoot();
    expect(point.id).toEqual(root.id);
    var path = getPath(dest);
    expect(path).toEqual([{parent:1,child:3}]);
    followPath(path, dest.id);
    expect(point.id).toEqual(3);
  });
  
  it('bigger followPath', function() {
    add();
    add();
    undo();
    add();
    var dest = point;
    add();
    add();
    undo()
    add();
    toRoot();
    expect(point.id).toEqual(root.id);
    var path = getPath(dest);
    expect(path).toEqual([{parent:1,child:3}]);
    followPath(path, dest.id);
    expect(point.id).toEqual(3);
  });  
  
  it('test save header', function() {
    
  });
});
