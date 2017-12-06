/**
 * Created by Administrator on 2017/10/5.
 */
var express = require("express");
var path  = require("path");
var formidable = require('formidable');
var fs = require("fs");
var os = require('os');
var session = require('express-session');
var ws = require('ws');
var dateFormat = require('dateformat');
const url = require('url');
var db = require("./mongodb");
const uuidv1 = require('uuid/v1');
db.connect("school");
var compress = require('compression');
var app = express();
app.set("view engine","ejs");//设置渲染引擎默认后缀(扩展名)
app.set("views",path.join(__dirname,"../public"))//设置视图渲染路径
app.use(compress());
app.use(express.static(path.join(__dirname,"../ejs")));
app.use("/",express.static(path.join(__dirname,"../node_modules")));
app.use(express.static(path.join(__dirname,"../")));
app.use(express.static(path.join(__dirname,"../")));
app.use(express.static(path.join(__dirname,"../dir")));
app.use(express.static(path.join(__dirname,"../lib")));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 600000000 }}));
app.engine('html', require('ejs').__express);//include标签所用
// app.use(express.static(path.join(__dirname,"../public")))

//-------------------------websocket------------------------------
let socketServer = new ws.Server({port: 8080});
socketServer.on('connection',(ws,req) => {
    socketServer.clients.forEach((e,i) => {
        console.log('state:'+e.readyState);
        if(e.readyState === ws.OPEN){
            e.send(socketServer.clients.size)
        }
    })

    const location = url.parse(req.url, true);
    // console.log(location)
    // console.log(location.query.id)
    "use strict";
    // console.log(req.url)
    console.log('server connect successfully...');
    // console.log(req);
    // console.log(ws.flag);
    ws.flag = location.query.id;//为当前ws设置唯一标识
    // console.log(ws.flag)

    // console.log(socketServer.clients)//一个Set集合

    ws.on('message',message => {
        "use strict";
        console.log(`received message:${message}`);
        // console.log(socketServer.clients)
        console.log(socketServer.clients.size)
    });
    ws.on('close',(e) => {
        console.log('当前连接数:'+socketServer.clients.size);
        console.log(e);//一个CLOSED的状态码
        socketServer.clients.forEach((e,i) => {
            if(e.readyState === ws.OPEN){
                e.send(socketServer.clients.size)
            }
        })

    })
})
//-------------------------websocket------------------------------

app.get("/classShuoShuo",function (req,res) {
    // res.set({'Content-Encoding': 'gzip'})
    if(req.session.info){
        res.render("index",req.session.info);
    }
    else
    res.render("index",{"msg" : "注册","name" : "登录"});
});
app.get("/classShuoShuo/regist",function (req,res) {

    // fs.readFile(path.join(__dirname,"../public/regist.html"),function (err,data) {
    //     if(err) throw  err;
    //     res.end(data);
    // })
    res.render("regist.html");
});
app.post("/classShuoShuo/doRegist",function (req,res) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.parse(req, function(err, fields, files) {
        if(err) throw err;
        console.log(fields)
       db.insert("student",fields,function (result) {

       });

        res.redirect("login");
    });
});
app.post("/classShuoShuo/registValidate",function (req,res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(err) throw err;
        db.find("student",{ "cardId" : fields.cardId},function (result) {
            if(result.length == 0)
                res.end("1");
            else res.end("0");

        });
    });
});
app.get("/classShuoShuo/login",function (req,res) {
    // fs.readFile(path.join(__dirname,"../public/login.html"),function (err,data) {
    //     if(err) throw err;
        res.render("login.html");
    // })
});
app.post("/classShuoShuo/doLogin",function (req,res) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.parse(req, function (err, fields, files) {
        if (err) throw err;
        db.find("student",fields,function (result) {
            if(result.length === 0){
                res.send("0");
                res.end();
            }
            else{
                var obj = {};
                obj.msg = "消息";
                obj.name = result[0].name;
                obj.cardId = result[0].cardId;
                req.session.info = obj;
                console.log(req.session.info);
                req.session.regenerate(function(err) {
                    // will have a new session here
                })
                res.send("1");
                res.end();
                // res.render("index", req.session.info);
            }

        });

    })
});
app.get("/classShuoShuo/trends",function (req,res,next) {
    if(req.session.info) {
        if(req.query.r){
            db.update("shuoshuo",{"cardId" : req.session.info.cardId},
                {$pull : {"content" : {"serialCode" : req.query.r}}},function (result) {
                    console.log("删除说说成功!")
                });
            db.remove('comment',{serialCode: req.query.r},() => {
                "use strict";
                console.log('删除对应的评论成功!')
            })
            res.send("deleted")
            res.end();
        }
        else {
            db.find("shuoshuo", {}, function (rs) {
                var shuoshuos = [];
                if(rs.length === 0) res.render("trends.html", {
                    name: req.session.info.name,
                    cardId: req.session.info.cardId,
                    shuoshuos:[]
                });//这里是对无任何说说时的处理
                rs.forEach((e, index) =>{
                    console.log(index+"!")

                    e.content.sort(function (a,b) {
                         return  b.date.getTime() - a.date.getTime();
                     });
                    let comments = null;
                    e.content.forEach(function (ele, i) {
                        db.find("comment",{"cardId" : e.cardId,serialCode: ele.serialCode},function (result) {
                            if(result[0]){
                                comments = result[0].comments;
                                shuoshuos.push({
                                    "cardId":e.cardId,
                                    "name": e.name,
                                    "serialCode": ele.serialCode,
                                    "content": ele.content,
                                    "date": ele.date,
                                    "comments": comments
                                });
                            }
                            // else{
                            //     throw Error("Corresponding comment is not found!");
                            // }
                            console.log(rs.length+"!");
                            console.log(i,e.content.length-1)
                            console.log(index,rs.length-1)
                            console.log(i === e.content.length-1);
                            console.log(index === rs.length-1);

                                if(rs.length-1 === index&&i === e.content.length-1){
                                setTimeout(()=> {
                                    shuoshuos.sort(function (a, b) {
                                        return b.date.getTime() - a.date.getTime();
                                    });
                                    shuoshuos.forEach(function (e,i) {
                                        e.date = dateFormat(e.date, "yyyy-mm-dd HH:MM:ss");
                                    })
                                    console.log(shuoshuos)
                                    var info = {};
                                    info.shuoshuos = shuoshuos;
                                    info.name = req.session.info.name;
                                    info.cardId = req.session.info.cardId;
                                    res.render("trends.html", info);
                                },199);//因为所有的查询都是异步操作,所以无法对什么时候全部查询操作结束判断
                                    //这里暂且设置延时操作(当然了,这样影响用户体验),以后看看有没有其他方法

                            }


                        });

                    });

                });

                // if(shuoshuos.length < 20)

            });
        }
    }
    else
        res.redirect("/classShuoShuo");
    // next();
});
app.post("/classShuoShuo/trends/publishSS",function (req,res) {
    "use strict";
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.parse(req, function (err, fields, files) {
        fields.date = new Date();
        fields.serialCode = uuidv1();
        db.find("shuoshuo",{cardId : req.session.info.cardId},function (result) {
           if(result.length === 0){
                db.insert("shuoshuo",{
                    "cardId" : req.session.info.cardId,
                    "name" : req.session.info.name,
                    "content" : [fields]
                },function (result) {
                    console.log(req.session.info.name + "发表第一条说说成功");
                    db.insert('comment',{
                        "cardId" : req.session.info.cardId,
                        "serialCode":fields.serialCode,
                        "comments" : []
                    },function () {
                        console.log('发表说说并创建空评论成功');
                    });
                    res.end();
                })
           }
           else{
               db.update("shuoshuo",{cardId : req.session.info.cardId},
                   {$push : {"content" : fields}},function () {
                       console.log(req.session.info.name + "发表说说成功!");
                       db.insert('comment',{
                           "cardId" : req.session.info.cardId,
                           "serialCode":fields.serialCode,
                           "comments" : []
                       },function () {
                           console.log('发表说说并创建空评论成功');
                       });
                       res.end();
                   });
           }
        });

    });

    // res.redirect("/classShuoShuo/trends");
});
app.post("/classShuoShuo/trends/comment",function (req,res) {
    "use strict";
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.parse(req, function (err, fields, files){
        let serialCode = fields.serialCode;
        let cardId = fields.cardId;
        Reflect.deleteProperty(fields,'cardId');
        Reflect.deleteProperty(fields,'serialCode');
        db.find("comment",{cardId : cardId,serialCode:serialCode},function (result) {
            fields.date = new Date();

            if(result.length === 0){
                console.log(cardId+serialCode+"------------insert")
                db.insert("comment",{
                    "cardId" : cardId,
                    "serialCode":serialCode,
                    "comments" : [fields]
                },function (result) {
                    console.log(req.session.info.name + "发表第一条"+cardId+"的评论成功");
                    res.send(fields.date);
                    res.end();
                })
            }
            else{
                console.log(cardId+serialCode+"------------update")
                db.update("comment",{cardId : cardId,serialCode:serialCode},
                    {$push : {"comments" : fields}},function () {
                        let date = new Date();
                        console.log(req.session.info.name + "发表"+cardId+"的评论成功!");
                        res.send(fields.date);
                        res.end();
                    });
            }
        });
    })
});
app.get("/classShuoShuo/homePage",function (req,res,next) {
    if(req.session.info){
        db.find("shuoshuo", {cardId : req.session.info.cardId},{limit:3}, function (result) {
            // var shuoshuos = [];
            // result.forEach(function (e, i) {
            //     e.content.forEach(function (ele, i) {
            //         shuoshuos.push({
            //             "name": e.name,
            //             "serialCode": ele.serialCode,
            //             "content": ele.content,
            //             "date": ele.date
            //         });
            //     });
            //     // shuoshuos.sort(function (a, b) {
            //     //     return b.date.getTime() - a.date.getTime();
            //     // });
            // });
            var info = {};
            info.shuoshuos = result;
            info.name = req.session.info.name;
            info.cardId = req.session.info.cardId;
            res.render("personalHP", info);
        });
        // res.render("personalHP",req.session.info);
    }

    else
        res.redirect("/classShuoShuo");
    // next();
});
app.get("/classShuoShuo/homePage/:desc",function (req,res) {
    if(req.session.info) {
        if (req.params.desc === "querySS") {
            console.log('查询个人说说...')
            db.find("shuoshuo", {cardId: req.session.info.cardId}, function (result) {
                res.send(result[0].content);
                res.end();
            });

        }
        else if (req.params.desc === 'publishArt') {
            res.render('writeArtical', req.session.info);
        }
    }
    else
    res.redirect("/classShuoShuo/homePage");
})
app.get("/classShuoShuo/logout",function (req,res) {
   if(req.session.info){
       // req.session.info = null;//结束当前会话
       req.session.destroy(function(err) {
           console.log('结束当前会话');
       })
       res.redirect("/classShuoShuo");//重定向做会话判断
   }
});
app.get("/classShuoShuo/upload",function (req,res) {
    if(req.session.info){
        fs.readdir("classShuoShuo/dir",function (err,files) {
            if(err)
                throw err;
            let obj = {};
            Object.assign(obj,req.session.info,{
                dirName : files
            });
            res.render("upload",obj);
        })
    }
    else
        res.redirect("/classShuoShuo");//重定向做会话判断
});
app.post('/classShuoShuo/doUpload',(req,res) => {
    "use strict";
    if(req.session.info) {
        var form = new formidable.IncomingForm();
        form.encoding = 'utf-8';
        form.uploadDir = path.join(__dirname,"../tempDir") ;

        form.keepExtensions = true;
        form.parse(req, function (err, fields, files) {
            // console.log(fields);
            // form.uploadDir = path.join(__dirname,"../dir/")+fields.dir;
            // console.log('-----------------'+path.join(__dirname,"../dir/")+fields.dir)
            // console.log(files.file.path)
            // form.uploadDir = "../uploadDir";
            // form.keepExtensions = true;
            fs.rename(files.file.path,path.resolve(__dirname,"../dir/"+fields.dir + "/" +files.file.name));
            console.log('文件路径:'+files.file.path);
            console.log("上传的路径为" + form.uploadDir);
            console.log(files);
        });
        res.end("upload succeed!")
    }
    else
        res.redirect("/classShuoShuo");//重定向做会话判断
});
app.post('/classShuoShuo/homePage/publishedArt',(req,res) => {
    "use strict";
    if(req.session.info) {

        var form = new formidable.IncomingForm();
        form.encoding = 'utf-8';
        form.parse(req, function (err, fields, files) {
            let articleCode = uuidv1();
            Object.assign(fields, req.session.info,{date: new Date(),articleCode: articleCode});
            db.insert('article', fields, () => {
                res.end();
            });
        });
    }
    else
        res.redirect("/classShuoShuo");//重定向做会话判断
    // res.render('writeArtical');
});
app.get('/classShuoShuo/myArticle',(req,res) => {
    "use strict";
    if(req.session.info){
        if(req.query.articleCode){
            db.find('article',{articleCode: req.query.articleCode},(result) => {
                let obj = new Object();
                Object.assign(obj,req.session.info,{articleDetail: result[0]});
                res.render('articleDetail',obj);
            });
        }else
        db.find('article',req.session.info,{sort:{'date': -1}},(result) => {
            let obj = new Object();
            Object.assign(obj,req.session.info,{articleItems: result});
            res.render('article',obj);
        });

    }
    else
        res.redirect("/classShuoShuo");//重定向做会话判断
});
app.get('/classShuoShuo/downLoad',(req,res) => {
    "use strict";
    if(req.session.info){
        if(req.query.dirName&&!req.query.fileName){
            let dirName = req.query.dirName;
            fs.readdir("classShuoShuo/dir/"+dirName, function (err, files) {
                if (err)
                    throw err;
                let fileSizes = [];
                files.forEach((file,index) => {
                    let stat = fs.statSync("classShuoShuo/dir/"+dirName+'/'+file);
                    let size = stat.size/1024;
                    if(size > 1024)
                        size = (size/1024).toFixed(2) + 'M';
                    else size = size.toFixed(2) + 'KB';
                    fileSizes.push('文件大小: '+size);
                });

                let obj = {};
                Object.assign(obj, req.session.info, {
                    dest: {dirName: dirName,fileName: files,fileSizes: fileSizes}
                });
                res.render('downLoadList', obj);
            });
        }else if(req.query.fileName&&req.query.dirName){
            let fileName = req.query.fileName,
            dirName = req.query.dirName;
            res.download('classShuoShuo/dir/'+dirName+'/'+fileName);
        }
        else {
            fs.readdir("classShuoShuo/dir", function (err, files) {
                if (err)
                    throw err;
                let obj = {};
                Object.assign(obj, req.session.info, {
                    dirName: files
                });
                res.render('downLoad', obj);
            });
        }
    }
    else
        res.redirect("/classShuoShuo");//重定向做会话判断
});
app.post('/classShuoShuo/uploadTouXiang',(req,res) => {
    "use strict";
    if(req.session.info){
        let dir = path.join(__dirname,"../touxiang");
        if(!fs.existsSync(dir)) fs.mkdir(dir,function () {
            console.log('头像文件夹创建成功')
        });
        var form = new formidable.IncomingForm();
        form.encoding = 'utf-8';
        form.uploadDir = dir ;
        form.keepExtensions = true;
        form.parse(req, function (err, fields, files) {
            let extension;
            if(/\w*\./.test(files.pic.name)){
                extension = files.pic.name.substr(files.pic.name.indexOf('.'));
            }
            let touxiangDir = path.resolve(__dirname,"../touxiang/"+req.session.info.cardId);
            if(!fs.existsSync(touxiangDir)){
                fs.mkdir(touxiangDir,function () {
                    fs.rename(files.pic.path,
                        touxiangDir+'/'+uuidv1()+extension);
                });
                res.end();
            }else {
                let file = fs.readdirSync(touxiangDir);
                fs.unlink(touxiangDir + '/' + file[0],function () {
                    console.log('删除原有图片成功');
                    res.end();
                });
                fs.rename(files.pic.path,
                    touxiangDir + '/' + uuidv1() + extension);
            }
        })

    } else
        res.redirect("/classShuoShuo");//重定向做会话判断
});
app.get('/classShuoShuo/touxiang',(req,res) => {
    "use strict";
        let touxiangDir = path.resolve(__dirname,"../touxiang/"+req.session.info.cardId);
        if(fs.existsSync(touxiangDir)) {
            let file = fs.readdirSync(touxiangDir);
            fs.readFile(touxiangDir + '/' + file[0], (err, data) => {
                if (err) throw err;
                res.end(data);
            });
        }else{
            let file = path.resolve(__dirname,'../img/school.jpg')
            fs.readFile(file, (err, data) => {
                if (err) throw err;
                res.end(data);
            });
        }

});
app.listen("80","localhost",function () {
    console.log("服务器监听80端口成功!!!");
});
//http----------------------------ws


