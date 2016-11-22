/**
   
   Copyright 2016 wesley werner <wesley.werner@gmail.com>
   
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program. If not, see http://www.gnu.org/licenses/.
   
*/

var lantern = lantern || {};

lantern = (function(){
	
	/*
   * A basic parser that understands verbs, directions and nouns, and translates these into an action object.
   */
	function parse (sentence, known_nouns) {
		
		if (sentence == null) return;
		var directions = [
			'north', 'n',
			'south', 's',
			'east', 'e',
			'west', 'w',
			'northeast', 'ne',
			'southeast', 'se',
			'northwest', 'nw',
			'southwest', 'sw',
			'up', 'down', 'in', 'out'];
		
		// split the parts of the sentence. Always work in lowercase.
		var parts = sentence.toLowerCase().split(' ');
		var sense = { };
		
		// find directions
		sense.dir = parts.find(function (item) { return directions.indexOf(item) > -1 });
		
		// remove ignored and directions from further processing
		parts = parts.filter(function (item) { return _options.ignores.indexOf(item) == -1 });
		parts = parts.filter(function (item) { return directions.indexOf(item) == -1 });

		// replace any partial nouns with the known nouns.
		// this works for the most part, except if a partial can
		// match multiple known nouns, it will match the last one.
		if (known_nouns) {
			parts.forEach(function (singlepart, i, arr) {
				// match start of word boundary, but allow a wildcard ending.
				// this allows for more relaxed noun matching.
				var re = new RegExp('\\b'+singlepart);
				known_nouns.forEach(function (noun) {
					var match = noun.match(re);
					if (match != null) {
						arr[i] = noun;
					}
				});
			});
		}
		
		// remove duplicates.
		// this can happen when known nouns are matched to multiple parts.
		parts = parts.filter(function (item, index, arr) {
			return arr.indexOf(item) == index;
		});
		
		sense.verb = (parts.length > 0) && parts[0] || null;
		sense.item = (parts.length > 1) && parts[1] || null;
		sense.nouns = (parts.length > 2) && parts.slice(2) || null;
		sense.all = parts;
		
		// change verbs to their root synonymn. The first entry is the root word.
		_options.synonymns.forEach(function(wordlist) {
			if (wordlist.indexOf(sense.verb) > 0) {
				sense.verb = wordlist[0];
			}
		});
		
		return sense;
		
	}
	
	
	/*
   * looks at a parsed action and decides which objects to act upon.
   * It should be aware of the things visible in the current room.
   * It will also handle special cases where the verb acts upon the player, or the current room.
   */
	function _interpret (sentence, known_nouns) {
		var translation = parse(sentence, known_nouns);
		return translation;
	}
	
  
	/*
   * Define various options that lantern looks at during world simulation.
   */
	var _options = {
		ignores: ['an', 'a', 'the', 'for', 'to', 'at', 'of', 'with', 'about', 'on'],
		synonymns: [
			['attack', 'hit', 'smash', 'kick', 'cut', 'kill'],
			['insert', 'put'],
      ['take', 'get', 'pick'],
      ['inventory', 'i'],
      ['examine', 'x'],
		],
	};
  
  
  /*
   * Loads the world model from a JSON string.
   */
  function _loadWorld (definition) {
    try {
      var model = JSON.parse(definition);
      this.data = model;
      
      // find the player object as defined in the data
      if (typeof this.data.player == 'string') {
        this.data.player = this.findByName(this.data.player);
      }
      
      // rebuild the child-parent links
      _rebuildParents.call(this);

    }
    catch (e) {
      console.warn('Could not load the world definition:');
      console.warn(e);
    }
  }
  
  
  /*
   * Helper that converts an object name to the object.
   */
  function _toObject (name) {
    if (typeof name == "object")
      return name;
    else
      return _findByName.call(this, name);
  }
    
  
  /*
   * Find a world item by name. Not limited to any scope.
   */
  function _findByName (name, parentChildren) {
    var match = null;
    var list = parentChildren || this.data.world;
    for (var i=0; i<list.length; i++) {
      if (match != null) break;
      var item = list[i];
      if (item.name == name)
        match = item;
      else
        match = _findByName(name, item.children);
    }
    return match;
  }
  
  
  /*
   * Find the enclosing room of any item.
   */
  function _whichRoom (item) {
    var search = _toObject.call(this, item);
    while (search.hasOwnProperty('parent')) {
      search = _findByName.call(this, search.parent);
    }
    return search;
  }
  
  
  /*
   * Rebuild the parent list of objects.
   */
  function _rebuildParent (o) {
    o.children.forEach(function(c){
      c.parent = o.name;
      _rebuildParent(c);
    });
  }
  function _rebuildParents () {
    var list = this.data.world;
    for (var i=0; i<list.length; i++) {
      _rebuildParent (list[i]);
    }
  }
  
	
	/*
   * Return the lantern object.
   */
	return {
		options: _options,
		turn: _interpret,
    loadWorld: _loadWorld,
    data: null,
    findByName: _findByName,
    whichRoom: _whichRoom
	}
})();
