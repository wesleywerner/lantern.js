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
   * Define various options that lantern looks at during world simulation.
   */
	var _options = {
		ignores: ['an', 'a', 'the', 'for', 'to', 'at', 'of', 'with', 'about', 'on'],
		synonymns: [
			['attack', 'hit', 'smash', 'kick', 'cut', 'kill'],
			['insert', 'put'],
      ['take', 'get', 'pick'],
      ['inventory', 'i'],
      ['examine', 'x', 'l', 'look'],
		],
    vowels: ['a', 'e', 'i', 'o', 'u'],
    responses: {
      'locked': 'It is locked.',
      'not openable': 'That is not openable',
      'opened': 'You open it',
      'already open': 'It is already open.',
      'no such thing': 'You don\'t see any such thing'
      }
	};
  

  //  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  
  //  PARSER


	/*
   * A basic parser that understands verbs, directions and nouns, and translates these into an action object.
   */
	function _parse (sentence, known_nouns) {
		
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
	
	
  //  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  
  //  MANAGING WORLD OBJECT HIERARCHY
  
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
   * Find an item by name limited to room scope.
   */
  function _findInScope (name, scope) {
    var list = scope;
    var match = null;
    
    // check that the scope is given
    if (scope == undefined) {
      throw ('findInScope() requires the scope parameter, a parent object or an array of children to search.');
    }
    
    // ensure the scope points to an array of children
    if (typeof scope == 'object' && scope.hasOwnProperty('children')) {
      list = scope.children;
    }
    
    for (var i=0; i<list.length; i++) {
      if (match != null) break;
      var item = list[i];
      if (item.name == name)
        match = item;
      else
        match = _findInScope.call(this, name, item.children);
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
   * Call without parameters to iterate all world items.
   */
  function _rebuildParents (root) {
    if (root == null) {
      var list = this.data.world;
      for (var i=0; i<list.length; i++) {
        _rebuildParents (list[i]);
      }
    }
    else {
      root.children.forEach(function(c){
        c.parent = root.name;
        _rebuildParents(c);
      });
    }
  }
  
  
  /*
   * Get the list of visible nouns (the current room is assumed when no parent is specified).
   * Does not consider visiblity of things in closed containers.
   */
  function _locationNouns (parent) {
    var nouns = [];
    if (parent) nouns.push(parent.name);
    parent = parent || _currentRoom.call(this);
    for (var n=0; n<parent.children.length; n++) {
      nouns = nouns.concat( _locationNouns.call(this, parent.children[n]) );
    }
    return nouns;
  }


  //  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  
  //  VISIBILITY
  
  
  /*
   * Get a list of all visible things in the player's room.
   */
  function _currentRoom () {
    return _whichRoom.call(this, this.data.player);
  }

  
  /*
   * Determine if the children of an object are visible.
   */
  function _childrenVisible (item) {
    var obj = _toObject.call(this, item);
    // don't list person inventory
    if (obj.type == 'person') return false;
    // don't list closed containers
    if (obj.type == 'container' && obj.open == false) return false;
    return true;
  }


  /*
   * Determine if the object is visible.
   */
  function _itemVisible (item) {
    var obj = _toObject.call(this, item);
    // don't list the player
    if (obj == this.data.player) return false;
    return true;
  }
  
  
  /*
   * Boils an item down to only it's visible parts.
   * Mainly used when returning an item to the player.
   */
  function _boilItem (parent) {
    
    var that = this;
    var copy = JSON.parse(JSON.stringify(parent))
    
    for (var i=0; i<copy.children.length; i++) {
    
      var child = copy.children[i];
      
      // if this child is not visible
      if (_itemVisible.call(that, child) == false) {
        copy.children.splice(i, 1);
        i--;
        continue;
      }
      
      // ignore the player
      if (child.name == this.data.player.name) {
        copy.children.splice(i, 1);
        i--;
        continue;
      }
      
      // hide children
      if (_childrenVisible.call(this, child) == false) {
        child.children = [];
        continue;
      }
      
      // iterate grand children
      for (var n=0; n<child.children.length; n++) {
        if (_itemVisible.call(that, child.children[n]) == false) {
          child.children.splice(n, 1);
        }
      };

    };
    return copy;
  }

  
  //  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  
  //  DESCRIBING THINGS

  
  /*
   * Describe the given list of things.
   */
  function _describeList (parent) {
    var that = this;
    var mentions = [];
    
    // can't look in closed containers
    if (parent.type == 'container' && parent.open == false) {
      // try opening the container. This only happens when looking in the container directly, not if it is a child.
      var result = _openContainer.call(this, parent);
      if (parent.open == false) return result;
    }
    
    parent.children.forEach(function (listItem) {
      
      // ignoring scenery items
      if (listItem.scenery == undefined || listItem.scenery == false) {
        
        var itemName = _withArticle.call(this, listItem);
        
        var itemChildren = [];
        listItem.children.forEach(function (itemChild) {
          itemChildren.push(_withArticle.call(this, itemChild));
        });
        
        // list the children
        if (itemChildren.length > 0) {
          var prefix = ' (on it ';
          if (listItem.type == 'container') prefix = ' (inside it ';
          mentions.push(itemName + prefix + _joinNames(itemChildren) + ')');
        }
        else {
          mentions.push(itemName);
        }
      
      }
    });
    
    if (mentions.length == 0) {
      return '';
    }
    else {
      var lead = 'You see ';
      if (parent.type == 'supporter') lead = 'On it is ';
      if (parent.type == 'container') lead = 'Inside it is ';
      return lead + _joinNames(mentions) + '.';
    }
  }
  
  
  /*
   * Joins an array of items to read naturally.
   */
  function _joinNames (arr) {
    if (arr.length == 0) {
      return '';
    } else if (arr.length < 3) {
      return arr.join(' and ');
    } else {
      var s = arr.slice(0, -1).join(', ');
      s = s + ' and ' + arr.slice(-1);
      return s;
    }
  }
  
  
  /*
   * Returns the given name with the article prefixed.
   */
  function _withArticle (item) {
    var obj = _toObject.call(this, item);
    if (obj.type == 'person') {
      return obj.name;
    }
    else if (obj.article) {
      return obj.article + ' ' + obj.name;
    } else {
      if (_options.vowels.indexOf(obj.name[0].toLowerCase()) == -1)
        return 'a ' + obj.name;
      else
        return 'an ' + obj.name;
    }
  }
  

  //  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  
  //  EVENTS
  
  var _events = {};
  
  /*
   * Get the default response for an event.
   */
  _events.getDefaultResponse = function (item, type) {
    var response = _options.responses[type] || 'Nothing happens.';
    return response;
  }
  
  
  /*
   * Called when a turn requires the room to be put into words.
   * The object passed is a trimmed copy which only contains children
   * visible to the player.
   */
  _events.getDescription = function (item) {
    return item.description + ' ' + _describeList.call(this, item);
  }
  
  
  /*
   * Game action against some item.
   */
  _events.actionItem = function (item, verb) {
    return 'You '+verb+' the '+item.name+' but nothing happens.';
  }
  
  
  //  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  --  
  //  WORLD ACTIONS
  
  
	/*
   * looks at a parsed action and decides which objects to act upon.
   * It should be aware of the things visible in the current room.
   * It will also handle special cases where the verb acts upon the player, or the current room.
   */
	function _turn (sentence, known_nouns) {
    // parse the sentence
    known_nouns = known_nouns || _locationNouns.call(this);
		var translation = _parse.call(this, sentence, known_nouns);
    // Boil the room down
    var boiledRoom = _boilItem.call(this, _currentRoom.call(this));
    // match the item by name
    var item = _findInScope.call(this, translation.item, boiledRoom);
    // an empty translation item defaults to the current location
    if (translation.item == null) {
      // Put the room into words
      var description = _events.getDescription.call(this, boiledRoom);
      _events.reportDescription(boiledRoom, description);
    }
    else {
      if (item == null) {
        // the item is not visible
        var description = _events.getDefaultResponse.call(this, item, 'no such thing');
        _events.reportDescription(boiledRoom, description);
      }
      else {
        if (translation.verb == 'examine') {
          // Examine the item in question
          var description = _events.getDescription.call(this, item);
          _events.reportDescription(item, description);
        }
        else {
          // Perform some other perfunctionary action
          _events.actionItem(item, translation.verb);
        }
      }
    }
		return {
      translation:translation,
      room:boiledRoom,
      item:item
      };
	}
	
  
  /*
   * Try open a container.
   */
  function _openContainer (item) {
    var obj = _toObject.call(this, item);
    var result = 'Nothing happens.';
    if (obj.type != 'container') {
      result = _events.getDefaultResponse.call(this, item, 'not openable');
    }
    else if (obj.open) {
      result = _events.getDefaultResponse.call(this, item, 'already open');
    }
    else if (obj.locked) {
      result = _events.getDefaultResponse.call(this, item, 'locked');
    }
    else {
      obj.open = true;
      result = _events.getDefaultResponse.call(this, item, 'opened');
    }
    return result;
  }
  
	
	/*
   * Return the lantern object.
   */
	var obj = {
		options: _options,
		turn: _turn,
    loadWorld: _loadWorld,
    data: null,
    events: _events
  }
  
  // Add debugging functions to the lantern object if LANTERN_DEBUG is truthy.
  if (typeof LANTERN_DEBUG !== 'undefined' && LANTERN_DEBUG == true) {
    obj.describeList = _describeList;
    obj.findByName = _findByName;
    obj.whichRoom = _whichRoom;
    obj.parse = _parse;
    obj.boilItem = _boilItem;
    obj.locationNouns = _locationNouns;
	}
  
  return obj;
  
})();
