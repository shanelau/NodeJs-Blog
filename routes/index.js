var User = require('./../model/User');
var Post = require('./../model/Post');
module.exports = function(app) {
    app.get('/', function(req, res) {
        Post.get(null, function(err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '首页',
                posts: posts,
                layout:'layout'
            });
        });
    });
    app.post('/reg', checkNotLogin);
    app.get("/reg",function(req, res) {
        res.render('reg', {
            title: '注册',
            layout:'layout'
        });
    });

    app.post('/reg', checkNotLogin);
    app.post("/reg",function(req, res) {
        console.log(req.body);
        var username = req.body['username'];
        var password = req.body['password'];
        var passwordRepeat = req.body['password_repeat'];
        if(password !== passwordRepeat){
            req.flash('error', '两次输入的口令不一致');
            return res.redirect('/reg');
        }
        var newUser = new User({
            name:username,
            password:password
        });

        User.get(newUser.name,function(err,user){
            if (user){
                console.log(user);
                err = user.name+'用户名已经存在';
            }
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            newUser.save(function(err){
                if(err){
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                req.flash('success','注册成功');
                res.redirect('/');
            });
        });
    });
    app.get('/login', checkNotLogin);
    app.get('/login', function(req, res) {
        res.render('login', {
            title: '用户登入',
            layout:'layout'
        });
    });
    app.post('/login', checkNotLogin);
    app.post('/login', function(req, res) {
//生成口令的散列值
        //var md5 = crypto.createHash('md5');
        //var password = md5.update(req.body.password).digest('base64');
        var password = req.body.password;
            User.get(req.body.username, function(err, user) {
            if (!user) {
                req.flash('error', '用户不存在');
                return res.redirect('/login');
            }
            if (user.password != password) {
                req.flash('error', '用户口令错误');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success', '登入成功');
            res.redirect('/');
        });
    });
    app.get('/logout', checkLogin);
    app.get('/logout', function(req, res) {
        req.session.user = null;
        req.flash('success', '登出成功');
        res.redirect('/');
    });



    app.post('/post', checkLogin);
    app.post('/post', function(req, res) {
        var currentUser = req.session.user;
        var post = new Post(currentUser.name, req.body.post);
        post.save(function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发表成功');
            res.redirect('/u/' + currentUser.name);
        });
    });
    app.get('/u/:user', function(req, res) {
        User.get(req.params.user, function(err, user) {
            if (!user) {
                req.flash('error', '用户不存在');
                return res.redirect('/');
            }
            Post.get(user.name, function(err, posts) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    layout:'layout'
                });
            });
        });
    });

};
function checkLogin(req, res, next){
    if(!req.session.user){
        req.flash("error","未登陆");
        return res.redirect("/");
    }
    next();
}
function checkNotLogin(req, res, next){
    if(req.session.user){
        req.flash("error","已经登陆,请先退出");
        return res.redirect("/index");
    }
    next();
}
