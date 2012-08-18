/*
 *    scripts
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

function big() {
  var adds = 0;
  adds = leg(adds, 35, {x:300, y:60}, {w:200,h:60}, '00FFFF', 30);
  adds = leg(adds, 30, {x:30, y:160}, {w:20,h:60}, 'FFFF00', 20);
  adds = leg(adds, 40, {x:500, y:70}, {w:200,h:160}, '0000FF', 35);
  adds = leg(adds, 37, {x:300, y:180}, {w:100,h:100}, '00FF00', 50);
  adds = leg(adds, 40, {x:500, y:20}, {w:200,h:200}, 'FF0000', 35);
  adds = leg(adds, 35, {x:500, y:20}, {w:200,h:200}, 'FF00FF', 0);
}

function small() {
  var adds = 0;
  adds = leg(adds, 15, {x:300, y:60}, {w:200,h:60}, 'FF0000', 12);
  adds = leg(adds, 12, {x:30, y:160}, {w:20,h:60}, '00FF00', 10);
  adds = leg(adds, 15, {x:500, y:70}, {w:200,h:160}, '0000FF', 9);
  adds = leg(adds, 15, {x:300, y:180}, {w:100,h:100}, 'FFFF00', 25);
  adds = leg(adds, 15, {x:500, y:20}, {w:200,h:200}, '00FFFF', 0);
}

function leg(existing, adds, place, size, colour, undoes) {
  times(adds, add);

  var index = existing + adds - 1;
  var element = list[index];

  var begin ={x:element.x, y:element.y};
  assignMove(index, begin, place);

  begin = {w:element.w, h:element.h};
  assignResize(index, begin, size);

  doColour(index, colour);
  
  times(undoes, undo);
  
  redraw();
  return existing + adds - (undoes - 3);
} 