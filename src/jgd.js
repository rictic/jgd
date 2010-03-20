var sys = require("sys");
var fs = require("fs");
var TripleStore = require("./TripleStore").TripleStore;
var MqlServer = require("./mqlServer").MqlServer;

var command = process.argv[2]
var args = process.argv.slice(3);

var commands = {
    serve: {
        handler: serve,
        description: "serves the given jgd on a webserver, mqlread style"
    }
}

if (!(command in commands)) {
    sys.puts("no command " + (command || "given") + "\n");
    usage();
    process.exit(1);
}

commands[command].handler.apply(null, args);

function usage() {
    sys.puts("Valid commands:")
    for (var command in commands)
        sys.puts("    " + command + " : " + commands[command].description);
}

function serve(file, host, port) {
    host = host || "127.0.0.1";
    port = port || 8000;
    
    var ts = new TripleStore();
    sys.puts("reading file...");
    var fbody = fs.readFileSync(file);
    sys.puts("parsing JSON...");
    var json = JSON.parse(fbody);
    sys.puts("indexing...");
    var load_worker = ts.load_json(json);
    load_worker.addCallback(function() {
        sys.print("\r100%\n");
        var mqlServer = new MqlServer(ts);
        mqlServer.start(host, port);
        process.addListener("SIGINT", function() {
            sys.puts("stopping server...");
            mqlServer.stop();
        });
    });
    load_worker.work_time = 50;
    load_worker.sleep_time = 0;
    load_worker.addListener("progress", function(pct) {
        sys.print("\r" + Math.round(pct) + "%");
    })
}


//To be translated:
//     parser_load = subparsers.add_parser("load", help="Load a JGD file (for debugging)")
//     parser_load.add_argument("file", type=argparse.FileType('r'), help="JGD file to load")
//     parser_load.add_argument("-s", dest="serialize", action="store_true", default=False, help="Reserialize")
// 
//     parser_cat = subparsers.add_parser("cat", help="Join two JGD files")
//     parser_cat.add_argument("file", type=argparse.FileType('r'), metavar="files", nargs="+", help="JGD files to join")
// 
//     parser_serve = subparsers.add_parser("serve", help="Start a mini-webserver with a /mqlread entrypoint")
//     parser_serve.add_argument("-u", action="store_true", default=False, help="Universal -- use internal IDs as foreign IDs", dest="universal")
//     parser_serve.add_argument("file", type=argparse.FileType('r'))
//     parser_serve.add_argument("host", nargs="?", default="localhost")
//     parser_serve.add_argument("port", type=int, default=8080)
// 
//     parser_csv = subparsers.add_parser("csv", help="Tabulate data based on properties")
//     parser_csv.add_argument("--require", "-r", dest="require", default=False, action="store_true", help="Require all fields to be filled")
//     parser_csv.add_argument("-q", "--query", dest="query_json", help="Query to limit results by")
//     parser_csv.add_argument("file", type=argparse.FileType('r'))
//     parser_csv.add_argument("columns", nargs="+")
// 
//     options = parser.parse_args()

//     # Give us a blank store to start. 
//     ts = TripleStore()
// 
//     if (options.subcommand == "load"):
//         # Load an external json file and add the FreebaseAdapter as "fb"
//         json_data = json.load(options.file)
//         options.file.close()
//         ts.load_json(json_data)
//         if options.serialize:
//             print json.dumps(ts.serialize(), indent=2)
//         else:
//             ts.add_ns_adapter("fb", FreebaseAdapter)
// 
//     elif (options.subcommand == "cat"):
//         for x in options.file:
//             json_data = json.load(x)
//             x.close()
//             ts.load_json(json_data)
//         print json.dumps(ts.serialize(), indent=2)
// 
//     elif (options.subcommand == "serve"):
//         # Load an external json file, add the FreebaseAdapter as "fb", and
//         # run the itty server to become HTTP-able
//         # Use itty to make a fake mqlread entrypoint
//         @itty.post("/mqlread")
//         def entry_mqlread(request):
//             response = {"code" : "/api/status/ok", "status" : "200 OK", "transaction_id" : "fooTID"}
//             query = json.loads(request.POST.get("query"))
//             pp(query)
//             result = ts.MQL(query["query"])
//             response["result"] = result
// 
//             return itty.Response( json.dumps(response),content_type="application/json")
// 
//         jsondata = json.load(options.file)
//         options.file.close()
//         ts.load_json(jsondata)
//         if options.universal:
//             ts.add_ns_adapter("fb", FreebaseAdapter, universal=True)
//         else:
//             ts.add_ns_adapter("fb", FreebaseAdapter)
//         itty.run_itty(host=options.host, port=options.port)
//     elif (options.subcommand == "csv"):
//         import csv
//         jsondata = json.load(options.file)
//         options.file.close()
//         ts.load_json(jsondata)
//         if options.query_json:
//             q = json.loads(options.query_json)
//         else:
//             q = [{}]
//         for key in options.columns:
//             q[0][key] = None
//         results = ts.MQL(q)
//         writer = csv.DictWriter(sys.stdout, options.columns, extrasaction="ignore")
//         for r in results:
//             cancel = False
//             for k in options.columns:
//                 if r[k] is None:
//                     cancel = options.require
//                     continue
//                 r[k] = unicode(r[k]).encode("utf-8")
//             if cancel:
//                 continue
//             writer.writerow(r)
// 
