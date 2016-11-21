var logel = document.getElementById('sidebar');

function logerr(m) {
		var el = document.createElement('span');
		el.className = 'test-fail';
		el.innerHTML = m;		
		logel.appendChild(el);
}
function assert(a, b, message) {
	if (a != b) {
		logerr(message + ' expected "' + b + '". ');
	}
}
function loghead(m, cls) {
	var el = document.createElement('div');
	el.className = cls;
	el.innerHTML = m;
	logel.appendChild(el);
}

function run_test(sentence, known_nouns, expected) {
	if (logel == undefined) throw 'the log element is not found';
	loghead(sentence, 'test');
  o = lantern.turn(sentence, known_nouns);
	loghead(JSON.stringify(o), 'test-detail');
  //console.log(o);
  assert(o.verb, expected.verb, 'wrong verb, ');
  assert(o.item, expected.item, 'wrong item, ');
  assert(o.dir, expected.dir, 'wrong direction, -');
  if (expected.nouns == null && o.nouns != null) {
    logerr('expected no nouns, but I got some anyway.');
  }
  else if (expected.nouns != null && o.nouns == null) {
		logerr('expected nouns '+ expected.nouns +', but found none.');
	}
  else if (expected.nouns != null && o.nouns != null) {
    // compare array elements
    var equal = expected.nouns.length==o.nouns.length && expected.nouns.every(function(v,i) { return v === o.nouns[i]})
    if (!equal) logerr('nouns wrong expected ' + expected.nouns);
  }
}

run_test('open door', [], 
  {
    verb:'open',
    item:'door',
    }
  );
  
run_test('open the door', [], 
  {
    verb:'open', 
    item:'door',
  });
  
run_test('give sword to gargoyle', [], 
  {
    verb:'give', 
    item:'sword', 
    nouns:['gargoyle']
  });
  
run_test('look at gate', [], 
  {
    verb:'look', 
    item:'gate',
  });
  
run_test('eat an apple', [], 
  {
    verb:'eat', 
    item:'apple'
  });
  
run_test('eat the apple', [], 
  {
    verb:'eat', 
    item:'apple'
  });
  
run_test('get an apple', [], 
  {
    verb:'take', 
    item:'apple'
  });
  
run_test('take a banana', [], 
  {
    verb:'take', 
    item:'banana'
  });
  
run_test('talk to the old man', ['old man'], 
  {
    verb: 'talk', 
    item: 'old man'
  });
  
run_test('take red', ['red stone', 'blue stone'], 
  {
    verb:'take', 
    item:'red stone'
  });
  
run_test('take blue stone', ['red stone', 'blue stone'], 
  {
    verb:'take', 
    item:'blue stone'
  });
  
run_test('eat wormwood', ['wormwood herb'], 
  {
    verb:'eat', 
    item:'wormwood herb'
  });
  
run_test('unlock the gate with the skeleton key', ['gate', 'skeleton key'], 
  {
    verb: 'unlock', 
    item: 'gate', 
    nouns:['skeleton key']
  });
  
run_test('unlock gate skel', ['gate', 'skeleton key'], 
  {
    verb: 'unlock', 
    item: 'gate', 
    nouns:['skeleton key']
  });

run_test('ask the wise guy about the computer', ['wise guy', 'computer'], 
  {
    verb: 'ask', 
    item: 'wise guy', 
    nouns:['computer']
  });
  
run_test('ask the wise guy about an unseen tablet', ['wise guy', 'computer'], 
  {
    verb: 'ask', 
    item: 'wise guy', 
    nouns:['unseen','tablet']
  });
  
run_test('ask guy the comp', ['wise guy', 'computer'], 
  {
    verb: 'ask', 
    item: 'wise guy', 
    nouns:['computer']
  });
  
run_test('put the box on the table', ['box', 'table'], 
  {
    verb: 'insert', 
    item: 'box', 
    nouns:['table']
  });
  
run_test('pick up shovel', [], 
  {
    verb:'take', 
    item:'shovel',
    dir:'up'
  });

run_test('go northwest', [], 
  {
    verb: 'go', 
    item: null, 
    nouns:null,
    dir:'northwest'
  });

run_test('look e', [], 
  {
    verb: 'look', 
    item: null, 
    nouns:null,
    dir:'e'
  });

run_test('unlock security gate with bronze key', ['security gate', 'bronze key'], 
  {
    verb: 'unlock', 
    item: 'security gate', 
    nouns:['bronze key'],
    dir:null
  });

run_test('look in mirror', [], 
  {
    verb: 'look', 
    item: 'mirror', 
    nouns:null,
    dir:'in'
  });

run_test('attack the demon', ['demon'], 
  {
    verb: 'attack', 
    item: 'demon', 
    nouns:null,
    dir:null
  });

run_test('cut apple with craft knife', ['craft knife', 'red apple'], 
  {
    verb: 'attack', 
    item: 'red apple', 
    nouns:['craft knife'],
    dir:null
  });

run_test('x red apple', ['craft knife', 'red apple'], 
  {
    verb: 'examine', 
    item: 'red apple', 
    nouns:null,
    dir:null
  });

run_test('i', [], 
{
  verb: 'inventory', 
  item: null, 
  nouns:null,
  dir:null
});

/*
 run_test('', [], 
  {
    verb: '', 
    item: '', 
    nouns:null,
    dir:null
  });
*/
