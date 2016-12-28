var logel = document.getElementById('sidebar');

function logresult(m) {
		var el = document.createElement('span');
		el.className = 'test-result';
		el.innerHTML = m;		
		logel.appendChild(el);
}
function logexpected(m) {
		var el = document.createElement('span');
		el.className = 'test-fail';
		el.innerHTML = 'expected: ' + m;		
		logel.appendChild(el);
}
function logsuccess() {
		var el = document.createElement('span');
		el.className = 'test-win';
		el.innerHTML = 'Pass';		
		logel.appendChild(el);
}
function assert(a, b, message) {
	if (a != b) {
		logerr(message + ' expected "' + b + '". ');
	}
}
function logtitle(m) {
	var el = document.createElement('div');
	el.className = 'test';
	el.innerHTML = m;
	logel.appendChild(el);
}
function run_model_tests () {
  lantern.loadWorld(window.testData);
  test_visible_room_items();
  lantern.loadWorld(window.testData);
  test_closed_unlocked_container_items();
  lantern.loadWorld(window.testData);
  test_open_container_items();
  lantern.loadWorld(window.testData);
  test_closed_locked_container_items();
  lantern.loadWorld(window.testData);
  test_boiling();
}
function test_boiling() {
  logtitle('Test boiling');
  var boiled = lantern.boilItem(lantern.findByName('The Lab'));
  logresult(JSON.stringify(boiled));
}
function test_open_container_items() {
  logtitle('Test listing open container items');
  var drawer = lantern.findByName('drawer');
  drawer.open = true;
  var described = lantern.describeList(drawer);
  logresult(described);
  var expected = 'Inside it is a usb drive.';
  if (described == expected)
    logsuccess();
  else
    logexpected(expected);
}
function test_closed_locked_container_items() {
  logtitle('Test listing closed locked container items');
  var drawer = lantern.findByName('drawer');
  drawer.open = false;
  drawer.locked = true;
  var described = lantern.describeList(drawer);
  logresult(described);
  var expected = 'It is locked.';
  if (described == expected)
    logsuccess();
  else
    logexpected(expected);
}
function test_closed_unlocked_container_items() {
  logtitle('Test listing closed unlocked container items');
  var drawer = lantern.findByName('drawer');
  drawer.open = false;
  drawer.locked = false;
  var described = lantern.describeList(drawer);
  logresult(described);
  var expected = 'Inside it is a usb drive.';
  if (described == expected)
    logsuccess();
  else
    logexpected(expected);
}
function test_visible_room_items() {
  logtitle('Test visible room items');
  var room = lantern.boilItem( lantern.whichRoom(lantern.data.player) );
  var described = lantern.describeList(room);
  logresult(described);
  var expected = 'You see neo, a couch and a desk (on it your laptop, a mug and an eclair).';
  if (described == expected)
    logsuccess();
  else
    logexpected(expected);
}
