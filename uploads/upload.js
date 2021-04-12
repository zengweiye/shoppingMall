var express = require('express')
var multer  = require('multer')
var fs = require('fs');
var router = express.Router();
var upload = multer({ dest: './uploads/images' })

router.post('/singleUpload', upload.single('avatar'), function (req, res, next) {  
    console.log(req.file);  
    console.log(req.body);
    // var form = fs.readFileSync('./routes/form.html', {encoding: 'utf8'});
    res.end();
});

router.get('/form', function(req, res, next){
    var form = fs.readFileSync('./uploads/form.html', {encoding: 'utf8'});
    res.send(form);
});

router.get('/images/*', function (req, res) {
    console.log(req)
    console.log( __dirname  + req.url )
    res.sendFile( __dirname + req.url );
    console.log("Request for " + req.url + " received.");
})
module.exports = router