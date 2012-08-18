/*
 *      Mondrian functions that listen to the mouse and talk to the screen \
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

var VERSIONS_HEIGHT = 500;
var MINIMUM_SIZE = 10;
var NOOP = function(event){};

function setupDialog(selectDialog, title, options) {
  selectDialog.dialog(jQuery.extend({autoOpen: false, modal: true, title:title}, options));
}

function eventLog(name) {
}
 
function setupUI() {
  $("#myCanvas").attr("width", displayWidth);
  $("#myCanvas").attr("height", displayHeight);
  
  $("#myCanvas").mousemove(function(event){eventLog('move');tracking(event);});
  $("#myCanvas").mouseleave(function(event){eventLog('leave');mouseAction.done(event)});
  $("#myCanvas").mousedown(function(event){eventLog('down');mouseAction.down(event)});
  $("#myCanvas").mouseup(function(event){eventLog('up');mouseAction.done(event)});
  setupDialog($("#help"), "Help", {width:500});
  setupDialog($("#about"), "About Mondrian", {width:500});
  setupDialog($("#colourBox"), "Select colour", {height:300, width:300});
}

function ActionBase() {
this.name = "base";
  this.down = NOOP;
  this.click = NOOP;
  this.drag = NOOP;
  this.done = NOOP;
  
  this.tracking = true;
  this.isDragging = false;
}

function DeleteAction() {
  var that = new ActionBase();
  that.name = "delete";

  that.down = function(event) {
    fixOffsets(event);
    var index = findBox(event.offsetX, event.offsetY);
    
    if (index > -1) { 
      doRemove(index);
    }
    else {
      mouseAction = new ActionBase();      
    }
  };
    
  return that;   
}

var thingId = 0;

function ColourAction() {
  var that = new ActionBase();
  that.name = 'colour';
    
  that.down = function(event) {
    fixOffsets(event);
    this.index = findBox(event.offsetX, event.offsetY);
     
    if (this.index > -1) {  
      this.tracking = false;
      var item = list[this.index];
      $("#picker")[0].color.fromString(item.c);
      
      var showPicker = function() {
        $("#picker")[0].color.showPicker();
      }
      
      var closeFn = function(that) {
        return function() {
          $("#picker")[0].color.hidePicker();
          that.tracking = true;
        }
      }(this);
  
      var okFn = function (index) {
        return function() {
          doColour(index, $("#picker").val());
          $(this).dialog("close");
        }
      }(this.index);
          
      var buttons = {
        "OK" : okFn,
        "Cancel" : function() {$(this).dialog("close");}
      };
    
      var colourDialog = $("#colourBox");
      colourDialog.dialog("option", "buttons", buttons);
      colourDialog.dialog({open: showPicker, close: closeFn});
      colourDialog.dialog("open");
    }
  };
  
  return that;   
}


function MoveAction(index) {
  var that = new ActionBase();

  that.name = "move";
    
  var index = index;  
  var startOffsetX;
  var startOffsetY;
  var begin = new Object();

  
  that.down = function(event) {
    fixOffsets(event);
    startOffsetX = event.offsetX;
    startOffsetY = event.offsetY;
    
    var item = list[index];

    begin.x = item.x;
    begin.y = item.y;
    
    this.isDragging = true;
  };

  that.setPosition = function(event) {
    fixOffsets(event);
    var deltaX = event.offsetX - startOffsetX;
    var deltaY = event.offsetY - startOffsetY;
    
    var item = list[index];
    item.x = begin.x + deltaX;
    item.y = begin.y + deltaY;
 
    redraw();
    
    moveTip(item);

    return item;
  }  

  that.drag = function(event) {
    this.setPosition(event);
    return index;
  }
  
  that.done = function(event) {
    if (this.isDragging) {
      var item = this.setPosition(event);
      
      this.isDragging = false;
      
      finish = new Object();
      finish.x = item.x;
      finish.y = item.y;
  
      assignMove(index, begin, finish);
    }  
  }

  return that;   
}

function ResizeAction(index) {
  var that = new ActionBase();
  that.name = 'resize';
  
  var index = index;  
  var startOffsetX;
  var startOffsetY;
  var begin = new Object();

  
  that.down = function(event) {
    fixOffsets(event);
    startOffsetX = event.offsetX;
    startOffsetY = event.offsetY;
    
    var item = list[index];

    begin.w = item.w;
    begin.h = item.h;
    
    this.isDragging = true;
  };

  that.setSize = function(event) {
    fixOffsets(event);
    var deltaX = event.offsetX - startOffsetX;
    var deltaY = event.offsetY - startOffsetY;
    
    var item = list[index];
    item.w = Math.max(MINIMUM_SIZE, begin.w + deltaX);
    item.h = Math.max(MINIMUM_SIZE, begin.h + deltaY);
 
    redraw();
    
    resizeTip(item);

    return item;
  }  

  that.drag = function(event) {
    this.setSize(event);
    return index;
  }
  
  that.done = function(event) {
    if (this.isDragging) {
      var item = this.setSize(event);
      
      this.isDragging = false;
      
      finish = new Object();
      finish.w = item.w;
      finish.h = item.h;
  
      assignResize(index, begin, finish);
    }  
  }

  return that;   
}

var mouseAction = new ActionBase();

// Actions with display
 
function doAdd() {
  add();
  var context = getContext("#myCanvas");
  draw(context, list[list.length - 1]);
}

function doRemove(index) {
  remove(index);
  redraw();
}

function doColour(index, colour) {
  assignColour(index, colour);
  redraw();
}

// Drawing functions

function getContext(canvas) {
  return $(canvas)[0].getContext("2d");
}

function draw(context, item) {
  context.fillStyle= "#" + item.c;
  context.fillRect(item.x, item.y, item.w, item.h);
}

function redraw() {
  var context = getContext("#myCanvas");
  context.fillStyle="#FFFFFF";
  context.fillRect(0, 0, displayWidth, displayHeight);

  for (var i = 0 ; i < list.length ; i++) {
    draw(context, list[i]);
  }
}

function fixOffsets(event) {
  if(typeof event.offsetX === "undefined" || typeof event.offsetY === "undefined") {
    var targetOffset = $(event.target).offset();
    event.offsetX = event.pageX - targetOffset.left;
    event.offsetY = event.pageY - targetOffset.top;
  }
}

function clickCanvas(event) {
  fixOffsets(event); 
  var index = findBox(event.offsetX, event.offsetY);
  if (index >= 0) {
    if (clickFunction != null) {
      clickFunction(event, index);
    }
  }
}

function aRedo(ref) {
  return function() {
    redoWhere(ref);
    $("#redoDialog").dialog("close");
    redraw();
  }
}

function doRedo() {
  if (point.down != null) {
    if (point.down.across == null) {
      redoWhere(point.down);
      redraw();
    }
    else {
      var redoDialog = $("#redoDialog");
      redoDialog.draggable({ disabled: true });
      var buttons = new Object();
      var count = 1;
      
      buttons[point.down.label()] = function(){redoWhere(point.down);$(this).dialog("close");redraw();};
      
      for (var toRedo = point.down.across ; toRedo != null ; toRedo = toRedo.across) {
        buttons[toRedo.label()] = aRedo(toRedo);
      }
      
      buttons["Cancel"] = function(){$(this).dialog("close");};
      
      redoDialog.dialog("option", "buttons", buttons);
      redoDialog.dialog("open");
    }
  }  
}

function makeQuarter(item) {
  var q = new Object();
  
  q.x = item.x;
  q.y = item.y;
  
  q.hLast = q.x + item.w;
  q.vLast = q.y + item.h;
  
  q.hMid = Math.round(item.w / 2);
  q.vMid = Math.round(item.h / 2);
  
  q.hFirst = q.x + q.hMid - 2;
  q.hSecond = q.x + q.hMid + 2;
  
  q.vFirst = q.y + q.vMid - 2;
  q.vSecond = q.y + q.vMid + 2;
  
  return q;
}

function overlay(item) {
  var context = getContext("#myCanvas");
  var q = makeQuarter(item);

  context.beginPath();
  
  context.moveTo(q.x, q.vFirst);
  context.lineTo(q.hFirst, q.vFirst);
  context.lineTo(q.hFirst, q.y);
  
  context.moveTo(q.x, q.vSecond);
  context.lineTo(q.hFirst, q.vSecond);
  context.lineTo(q.hFirst, q.vLast);
  
  context.moveTo(q.hSecond, q.y);
  context.lineTo(q.hSecond, q.vFirst);
  context.lineTo(q.hLast, q.vFirst);
  
  context.moveTo(q.hLast, q.vSecond);
  context.lineTo(q.hSecond, q.vSecond);
  context.lineTo(q.hSecond, q.vLast);
  
  context.strokeStyle = "#FFFFFF";
  
  context.stroke(); 
}

var clickAction = null;
var tip = null;

var TIP_HEIGHT = 15;
var TIP_VERTICAL_BUFFER = 3;
var TIP_HORIZONTAL_BUFFER = 3;

function tooltip(canvas, event) {
  if (tip != null) {
    var context = getContext(canvas);
    context.font = "15px arial;";
    
    var tipWidth = context.measureText(tip).width + TIP_HORIZONTAL_BUFFER * 2;

    context.fillStyle= "#FFFFFF";    
    context.fillRect(event.offsetX, event.offsetY - TIP_HEIGHT, tipWidth, TIP_HEIGHT + TIP_VERTICAL_BUFFER * 2);

    context.strokeStyle= "#000000";   
    context.strokeRect(event.offsetX, event.offsetY - TIP_HEIGHT, tipWidth, TIP_HEIGHT + TIP_VERTICAL_BUFFER * 2);

    context.fillStyle= "#000000";
    context.fillText(tip, event.offsetX + TIP_HORIZONTAL_BUFFER, event.offsetY);
  }
}

function moveTip(item) {
  tip = "Move " + item.x + " " + item.y;
}

function resizeTip(item) {
  tip = "Resize " + item.w + "x" + item.h;
}

function quarter(event, index) {
  var item = list[index];
  tip = null;
  var q = makeQuarter(item);
  
  var x = event.offsetX;
  var y = event.offsetY;
  
  if (x >= q.x && x <= q.hFirst && y >= q.y && y <= q.vFirst) {             //  Top left corner
    moveTip(item);
    mouseAction = new MoveAction(index);   
  }
  else if (x >= q.hSecond && x <= q.hLast && y >= q.y && y <= q.vFirst) {   //  Top right corner
    tip = "Colour";   
    mouseAction = new ColourAction(index);   
  }
  else if (x >= q.x && x <= q.hFirst && y >= q.vSecond && y <= q.vLast) {   //  Bottom left corner
    tip = "Delete";
    mouseAction = new DeleteAction(index);
  }
  else if (x >= q.hSecond && x <= q.hLast && y >= q.vSecond && y <= q.vLast) {   //  Bottom right corner 
    resizeTip(item);
    mouseAction = new ResizeAction(index);   
  }

  return this;    
}

function displayHover(event, index) { 
  if (index >= 0) {
    redraw();
    var item = list[index];
    overlay(item);
    tooltip("#myCanvas", event);   
  }
  else {
    redraw();
  }
}

//  mousemove function (tracks the mouse)

function tracking(event) {
  if (mouseAction.tracking) {
    var index
    
    fixOffsets(event); 
    
    if (mouseAction.isDragging) {
      index = mouseAction.drag(event);
    } 
    else {
      index = findBox(event.offsetX, event.offsetY);
      if (index >= 0) {
        quarter(event, index);
      }
    }
  
    displayHover(event, index);
  }
}  
