/**
 * Created by Administrator on 2017/10/2.
 */
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

var isConnected = false;
var serverPath = null;
var dataBase = null;
// Use connect method to connect to the server
exports.connect = function(sp,db) {
    if(arguments.length == 1) {
        serverPath = 'mongodb://localhost:27017';
        dataBase = sp;
        return;
    }
    serverPath = sp;
    dataBase = db;

}
function _connnect(handler,collection,document){
    // Connection URL
    // var url = 'mongodb://localhost:27017/school';
    // console.log(serverPath + "/" + dataBase)
    var url = serverPath + "/" + dataBase;
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        handler(db,collection,document);
        if(!isConnected){
            console.log("Connected successfully to server");
            isConnected = true;
        }

        // db.close();
    });

}
//插入一个json或json数组
exports.insert = function(collection,document,callback){
    "use strict";
    function handler(db,collection,document) {
        var collection = db.collection(collection);
        // Insert some documents
        var tempArr = [];
        var insertedData = document instanceof Array?document : tempArr.push(document)==1?tempArr : [];
        console.log(insertedData)
        collection.insertMany(insertedData,{
             serializeFunctions: true//serialize function
        }, function(err, result) {
            assert.equal(err, null);
            // assert.equal(3, result.result.n);
            // assert.equal(3, result.ops.length);
            callback(result);

            if(isConnected)
            db.close()
        });
    }
     _connnect(handler,collection,document);
    // Get the documents collection

}

exports.find = function(collection,document,option,callback){//需要逻辑优化
    if(!callback){
        callback = option;
        function handler(db,collection,document) {
            var collection = db.collection(collection);
            // Find some documents
            collection.find(document).toArray(function(err, docs) {
                assert.equal(err, null);
                console.log("Found the following records");
                callback(docs);
                if(isConnected)
                    db.close();
            });
        }
        _connnect(handler,collection,document);
    }
    else {
        if (!option.sort) option.sort = {};
        if (option.sort && option.limit) {
            option.skip = option.skip || 0;
            console.log("skip & limit")
            function handler(db, collection, document) {
                var collection = db.collection(collection);
                // Find some documents
                collection.find(document).sort(option.sort).skip(option.skip).limit(option.limit).toArray(function (err, docs) {
                    assert.equal(err, null);
                    console.log("Found the following records");
                    callback(docs);
                    if (isConnected)
                        db.close();
                });
            }

            _connnect(handler, collection, document);
        }else if(option.sort){
            function handler(db, collection, document) {
                var collection = db.collection(collection);
                // Find some documents
                collection.find(document).sort(option.sort).toArray(function (err, docs) {
                    assert.equal(err, null);
                    console.log("Found the following records");
                    callback(docs);
                    if (isConnected)
                        db.close();
                });
            }

            _connnect(handler, collection, document);
        } else if (option.limit) {
            function handler(db, collection, document) {
                console.log("limit:" + option.limit)
                var collection = db.collection(collection);
                // Find some documents
                collection.find(document).limit(option.limit).toArray(function (err, docs) {
                    assert.equal(err, null);
                    console.log("Found the following records");
                    // let ss = [];

                    // for(let index = 0;index<option.limit;index++){
                    //     if(docs[0].content.length > 0)
                    //     ss.push(docs[0].content.pop().content);
                    // }  这里之前是可以用的,但是只是在说说那里,所以应该以后把它抽离出来

                    callback(docs);
                    if (isConnected)
                        db.close();
                });
            }

            _connnect(handler, collection, document);
        }
        else if (option.skip) {
            function handler(db, collection, document) {
                console.log("skip:" + option.skip)
                var collection = db.collection(collection);
                // Find some documents
                collection.find(document).skip(option.skip).toArray(function (err, docs) {
                    assert.equal(err, null);
                    console.log("Found the following records");
                    callback(docs);
                    if (isConnected)
                        db.close();
                });
            }

            _connnect(handler, collection, document);
        }
    }



    // Get the documents collection
}
// exports.getCursor = function (collection,document,callback) {
//     function handler(db,collection,document) {
//         var collection = db.collection(collection);
//         // Find some documents
//         collection.find(document).toArray(function(err, docs) {
//             assert.equal(err, null);
//             console.log("Found the following records");
//             callback(docs);
//             if(isConnected)
//                 db.close();
//         });
//     }
//     _connnect(handler,collection,document);
// }
exports.update = function (collection,document,operation,isMulti,callback) {
    function handler(db,collection,document) {
        var collection = db.collection(collection);
        if(typeof isMulti != "boolean"){
            callback = isMulti;
            isMulti = false;
        }
        if(!isMulti)
        collection.updateOne(document
            , operation,{

            },function(err, result) {
                assert.equal(err, null);
                assert.equal(1, result.result.n);
                callback(result);
                if(isConnected)
                    db.close();
    })
        else
            collection.updateMany(document
                , operation,{

                },function(err, result) {
                    assert.equal(err, null);
                    // assert.equal(1, result.result.n);
                    callback(result);
                    if(isConnected)
                        db.close();
                });

}
    _connnect(handler,collection,document);
}
exports.remove = function (collection,document,callback) {
    function handler(db,collection,document) {
        var collection = db.collection(collection);
        collection.deleteMany(document,{
            single : true
        }, function(err, result) {
            assert.equal(err, null);
            // assert.equal(1, result.result.n);
            callback(result);
            if(isConnected)
                db.close();
        });
    }

    _connnect(handler,collection,document);
}