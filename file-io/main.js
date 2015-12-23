(function(ext) {

ext.read = function(dir, callback) {
    makeRequestToHelperApp('GET', dir, callback);
};

ext.write = function(text, dir, callback) {
    makeRequestToHelperApp('PUT', dir, callback, text);
};

ext.make = function(dir, callback) {
    makeRequestToHelperApp('POST', dir, callback);
};

ext._shutdown=function(){};
ext._getStatus=function(){status};

var status = {status:1,msg:'Waiting for helper app'};

ScratchExtensions.register('Simple File I/O',
  {
    blocks: [
        ['R', 'read from file %s', 'read', 'text.txt'],
        ['w', 'write %s to file %s', 'write', 'hello world', 'text.txt'],
        ['w', 'create file %s', 'make', 'text.txt']
    ],
    url: 'https://github.com/Znapi/scratchx/wiki/Simple-File-IO'
  },
  ext);

function makeRequestToHelperApp(method, uri, callback, body) {
    var intervalID;
    function request(method, uri, body, onSuccess, onFailure) {
        var r = new XMLHttpRequest();

        r.onreadystatechange = function() {
            if(r.readyState===4) {
                if(r.getResponseHeader('X-Is-ScratchX-File-IO-Helper-App') == 'yes')
                    onSuccess(r.responseText);
                else
                    onFailure();
            }
        }
        r.open(method, 'http://localhost:8080/'+uri, true);
        if(body!==undefined)
            r.send(body);
        else
            r.send();
    }
    request(method, uri, body,
        callback,
        function() {
            status = {status:1,msg:'Waiting for helper app'};
            intervalID = window.setInterval(request, 5000, method, uri, body,
                function(rsp){window.clearInterval(intervalID); status = {status:2,msg:'Ready'}; callback(rsp)},
                function(){}
            );
        }
    );
}

makeRequestToHelperApp('OPTIONS', '', function(){
    status = {status:2,msg:'Ready'};
});

})({});
