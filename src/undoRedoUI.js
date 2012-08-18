/**
 *    Undo/redo functions that address the UI
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

var SMALLEST = 25;

var versionHover = NOOP;
var versionClick = NOOP;
var zoomHover = NOOP;
var zoomClick = NOOP;
var selectButton = NOOP;
var item;

function setupUndoRedoUI(width, height) {
  setupDialog($("#redoDialog"), "Select action to redo", {});
  setupVersions(width, height);
  setupZoom();
  setupSelect();
}
 
function closeVersions(dialog) {
  $(dialog).off('mousemove.hover');
  closeAll();
}

function setupVersions(width, height) {
  var title = 'Version History - Key: ';
  title += 'Start=<span id="root-block">&nbsp;&nbsp;&nbsp;&nbsp;</span> | '; 
  title += 'Add=<span id="add-block">&nbsp;&nbsp;&nbsp;&nbsp;</span> | '; 
  title += 'Delete=<span id="delete-block">&nbsp;&nbsp;&nbsp;&nbsp;</span> | '; 
  title += 'Move=<span id="move-block">&nbsp;&nbsp;&nbsp;&nbsp;</span> | '; 
  title += 'Resize=<span id="resize-block">&nbsp;&nbsp;&nbsp;&nbsp;</span> | '; 
  title += 'Colour=<span id="colour-block">&nbsp;&nbsp;&nbsp;&nbsp;</span>'; 

  var buttons = Array();
  buttons[0] = {id: 'zoomButton', text: 'Magnify', click: function(){zoom();}};
  buttons[1] = {id: 'versionsCancel', text:'Cancel', 
                  click : function(){$(this).dialog('close');}};
                  
                  
  var options = {width : width - 2 * BUFFER,
                  height: height - 2 * BUFFER,
                  open: versionEvents,
                  close: function(){closeVersions(this);},
                  buttons:buttons};
  var dialog = $('#versions');
  setupDialog(dialog, title, options);
}

function setupZoom() {
  var buttons = Array();
  buttons[0] = {id: 'zoomCancel', text:'Cancel', click : function(){$(this).dialog("close");}};
  $("#zoom").dialog({ autoOpen: false, title:"Magnify", open: linkZoom, 
                        close: unlinkZoom, buttons:buttons}); 
}

function setupSelect() {
  $("#select").dialog({autoOpen: false}); 
}

/**
 */
 
function versionEvents() {
  $("#select").dialog('open'); 
  setVersionHover();
  setVersionClick();
}

function drawSelect(event) {
  allDraw();
  fixOffsets(event);
  var column = Math.floor(event.offsetX / (TREE_WIDTH + 1));
  var depth = Math.floor(event.offsetY / (itemHeight() + 1));
  var find = findUndoRedo(0, root, {depth:depth, column:column});
  if (find.found) {
    showSelect(find.element);
    item = find.element;
  }
  else {
    clearSelect();
  }
}  

function setVersionHover() {
  if ($('#useClick')[0].checked) {
    versionHover = NOOP;
  }
  else {
    versionHover = drawSelect;
  }
  $("#versionCanvas").on("mousemove.hover", function(event){versionHover(event);}); 
}     

function revert(element) {
  toRoot();
  var path = getPath(element);
  followPath(path, element.id);
  closeAll();
  redraw();
};

function revertSelected(event) {
  fixOffsets(event);
  var column = Math.floor(event.offsetX / (TREE_WIDTH + 1));
  var depth = Math.floor(event.offsetY / (itemHeight() + 1));
  var find = findUndoRedo(0, root, {depth:depth, column:column});
  if (find.found) {
    revert(find.element);
  }
}

function setVersionClick() {
  if ($('#useClick')[0].checked) {
    versionClick = drawSelect;
  }
  else {
    versionClick = revertSelected;
  }
  $('#versionCanvas').on('click.select', function(event){versionClick(event);});
}

function doClose(name) {
  var dialog = $(name);
  if (dialog.dialog('isOpen')) {
    dialog.dialog('close');
  }
}

function closeAll() {
  doClose('#versions');
  doClose('#zoom');
  doClose('#select');
}

function showSelect(element) {  
  var drawContext = getContext('#selectCanvas');
  var image = new Image();
  image.onload = function(){    
    var ratio = 2 / (displayWidth / displayHeight);
    var localWidth = Math.max(250, 250 / ratio);
    var localHeight = Math.max(125, 125 * ratio);
    
    drawContext.drawImage(image,0,0, localWidth, localHeight);
  };
  image.src = element.context;  
  
  $('#select').dialog('option', 'title', element.label());
}

function clearSelect() {
  var drawContext = getContext('#selectCanvas');
  drawContext.fillStyle="#E0E0E0";
  drawContext.fillRect(0, 0, 250, 125);

  $('#select').dialog('option', 'title', 'No Element Selected');
}

/**
 */

function zoomEvents(displacement) {
  setZoomHover(displacement);
  setZoomClick(displacement);
}

 
function setZoomHover(displacement) {
  if ($('#useClick')[0].checked) {
    zoomHover = NOOP;
  }
  else {
    zoomHover = zoomDrawSelect(displacement);
  }
  $("#zoomCanvas").on('mousemove.hover', function(event) {zoomHover(event);});
}   

function zoomDrawSelect(displacement) {
  return function(event) {
    fixOffsets(event);
    var column = Math.floor((event.offsetX + displacement.x)/ (TREE_WIDTH + 1));
    var depth = Math.floor((event.offsetY + displacement.y) / (SMALLEST + 1));
    var find = findUndoRedo(0, root, {depth:depth, column:column});
    if (find.found) {
      showSelect(find.element);
      item = find.element;
    }
  }  
}

function setZoomClick(displacement) {
  if ($('#useClick')[0].checked) {
    zoomClick = zoomDrawSelect(displacement);
  }
  else {    
    zoomClick = zoomRevertSelected(displacement);
  }
  $('#zoomCanvas').on('click.select', function(event){zoomClick(event);});
}

function zoomRevertSelected(displacement) {
  return function(event) {
    fixOffsets(event);
    var column = Math.floor((event.offsetX + displacement.x) / (TREE_WIDTH + 1));
    var depth = Math.floor((event.offsetY + displacement.y) / (SMALLEST + 1));
    var find = findUndoRedo(0, root, {depth:depth, column:column});
    if (find.found) {
      revert(find.element);
      closeAll();
      redraw();
    }
  }
}

     

function zoomNoEvents() {
  $('#zoomCanvas').off('mousemove.hover');
  $('#zoomCanvas').off('click.select');
}

/**
 *  @param {left: num, top:num} offset      Change of origin
 *  @return function ({event}, {ui.offset}) Function to redraw zoomed tree during drags
 */
     
function makeDrag(offset) {
  return function(event, ui) {   
    fixOffsets(event);
    var displacement = new Object();
    displacement.x = ui.offset.left - offset.left;
    displacement.y = (ui.offset.top - offset.top) * (SMALLEST / itemHeight());
    
    zoomDraw(displacement);
    zoomNoEvents();
    zoomEvents(displacement);
  }
}

function setVersionsDisable(value) {
  $('#zoomButton').attr('disabled', value);
  $('#versionsCancel').attr('disabled', value);
}

function linkZoom(event, ui) {
  setVersionsDisable(true);

  var offset = $("#versions").offset();
  dragZoom = makeDrag(offset);
  $("#zoom").on("dialogdrag", dragZoom); 

  zoomEvents({x:0, y:0});
}

function unlinkZoom() {
  setVersionsDisable(false);
  zoomNoEvents();
  $("#zoom").off("dialogdrag", dragZoom); 
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
 *    @param {{x:num,, y:num}} displacement     amount to offset the drawing
 *    
 *    Fixed size display for magnifying large trees.
 */
 
    
function zoomDraw(displacement) {
  var context = $("#zoomCanvas")[0].getContext("2d");
  versionDraw(context, ZOOM_WIDTH, ZOOM_HEIGHT, displacement, SMALLEST);
}                                        

function itemHeight() {
  return Math.min(SMALLEST, (Math.floor(VERSION_HEIGHT / (maxDepth + 1)) - 1));  
}

function allDraw() {
  var context = $("#versionCanvas")[0].getContext("2d");
  versionDraw(context, VERSION_WIDTH, VERSION_HEIGHT, {x:0, y:0}, itemHeight());
}

function versionDraw(context, width, height, displacement, itemHeight) {
  context.fillStyle="#E0E0E0";
  context.fillRect(0, 0, width, height);
  
  drawTree(context, displacement, 0, itemHeight, 1, root);
}

function zoom() {
  var dialog = $("#zoom");
              
  dialog.dialog("option", "width", ZOOM_WIDTH + BUFFER);
  var versionsPos = $("#versions").offset();
  dialog.dialog("option", "position", [versionsPos.left, versionsPos.top]);  
  zoomDraw({x:0, y:0});
  
  dialog.dialog("open");
}

function versions() {
  var versionsDialog = $("#versions");  
  allDraw();  
  if ($('#useClick')[0].checked) {
    var buttons = Array();
    buttons[0] = {id: 'revertButton', text: 'Revert', click: function(){revert(item);}};
    $('#select').dialog('option', 'buttons', buttons);
  }

  versionsDialog.dialog("open");
}
