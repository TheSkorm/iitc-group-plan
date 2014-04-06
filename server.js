var db = {draws:{}, users:{}}

var http = require('http');
http.createServer(function (req, res) {
 switch(req.url) {
    default:
      var query = require('url').parse(req.url,true).query;
      console.log (query)

      db['users'][query['agentname']] = query['y']
      db['draws'][query['agentname']] = ""
            if (query['o']){
      db['draws'][query['agentname']] =  JSON.parse(query['o'])
  }
      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.end("syncPlan("+JSON.stringify(db) +")");
      //console.log("[404] " + req.method + " to " + req.url);
  };
}).listen(8080); // listen on tcp port 8080 (all interfaces)

process.on('uncaughtException', function(e){
    console.log(e);
});