// HTML Maker

//  Simple functions to ease construction of HTML strings

var mh = {

// single : a tag with no contents, includes its own terminator and options

// tag      :  HTML tag
// options  : an array of objects with name and value variables

  single : function(tag, options) {
    var result = '<' + tag;
    
    for (i = 0 ; i < options.length ; i++) {
      result += ' ' + options[i].name + '="' + options[i].value + '"';
    }
    result += ' />';
    return result;
  },

// paired : a tag with contents and options

// tag      :  HTML tag
// contents :  contents of tag
// options  : an array of objects with name and value variables
  
  paired : function(tag, contents, options) {
    var result = '<' + tag;
    for (i = 0 ; i < options.length ; i++) {
      result += ' ' + options[i].name + '="' + options[i].value + '"';
    }
    result += '>';
    result += contents;
    result += '</' + tag + '>';
    return result;
  },
  
  
// a convenience function to create an options object

// name   : name of option
// value  : value of option

  nv : function(name, value) {
    return {name: name, value: value};
  }
};