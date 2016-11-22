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
  logtitle('Test visible room items');
  var described = lantern.describeList(lantern.whichRoom(lantern.data.player).children);
  logresult(described);
  var expected = "wesley,desk,laptop,mug";
  if (described == expected)
    logsuccess();
  else
    logexpected(expected);
}
