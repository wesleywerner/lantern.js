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
  test_visible_room_items();
  test_closed_container_items();
  test_open_container_items();
}
function test_open_container_items() {
  logtitle('Test open container items');
  var drawer = lantern.findByName('drawer');
  drawer.open = true;
  var described = lantern.describeList(drawer);
  logresult(described);
  var expected = 'Inside it you see a usb drive.';
  if (described == expected)
    logsuccess();
  else
    logexpected(expected);
}
function test_closed_container_items() {
  logtitle('Test closed container items');
  var drawer = lantern.findByName('drawer');
  drawer.open = false;
  var described = lantern.describeList(drawer);
  logresult(described);
  var expected = 'It is closed.';
  if (described == expected)
    logsuccess();
  else
    logexpected(expected);
}
function test_visible_room_items() {
  logtitle('Test visible room items');
  var described = lantern.describeList(lantern.whichRoom(lantern.data.player));
  logresult(described);
  var expected = 'You see a couch and a desk (on it your laptop, a mug and an eclair).';
  if (described == expected)
    logsuccess();
  else
    logexpected(expected);
}
