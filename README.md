# lantern.js
A JavaScript library for authoring interactive fiction stories

# Overview

# Timeline

Version 0.1
* A simple world model that reflects containment via an object tree. Parents, children and siblings.
* Game logic separated from the world model.
* A basic parser that understands verbs, directions and nouns, and translates these into an action object.
* An interpreter that looks at a parsed action and decides which objects to act upon. It should be aware of the things visible in the current room. It will also handle special cases where the verb acts upon the player, or the current room.
* A list of default responses to some common verbs.
* Simple item property checking.
* Helpers for creating inanimate things, people, animals, doors, lights. This simply sets the correct properties on the object.

Version 0.2
* A concept of world time, and advancing it.
* Support triggers for future events.
* Track the game state, whether the story is in play or finished.
* Darkness and light sources.
* Versioned world models for future restoring of saved games.

# License

    lantern.js JavaScript library for authoring interactive fiction stories
    Copyright (C) 2016 Wesley Werner

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
