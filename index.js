const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const multer = require('multer');
const csvModel = require('./models/csv')
const csv = require('csvtojson');
const path = require('path');
const PORT = 5000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './assets/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
  
const uploads = multer({ storage: storage });
  
//connect to db
mongoose.connect('mongodb://localhost:27017/CSV_uploads', { 
    useNewUrlParser: true  })
    .then(() => console.log('Successfuly connected to Mongodb !!!'))
    .catch((err) => console.log(err)
);

const app = express();

//set the template engine
app.set('view engine', 'ejs');

//fetch data from the request
app.use(bodyParser.urlencoded({ extended: false }));

//static folder
app.use(express.static(path.resolve(__dirname, 'assets')));

//default pageload
app.get('/', (req, res) => {
    csvModel.find((err, data) => {
        if (err) {
        console.log(err);
        } else {
            if (data != '') {
                res.render('main', { data: data });
            } else {
                res.render('main', { data: '' });
            }
        }
    });
});
var temp;
app.post('/', uploads.single('csv'), (req, res) => {
//convert csvfile to jsonArray   
    csv()
    .fromFile(req.file.path)
    .then((jsonObj) => {
        console.log(jsonObj);
        for (var x = 0; x < jsonObj; x++) {
            temp = parseFloat(jsonObj[x].Test1)
            jsonObj[x].Test1 = temp;
            temp = parseFloat(jsonObj[x].Test2)
            jsonObj[x].Test2 = temp;
            temp = parseFloat(jsonObj[x].Test3)
            jsonObj[x].Test3 = temp;
            temp = parseFloat(jsonObj[x].Test4)
            jsonObj[x].Test4 = temp;
            temp = parseFloat(jsonObj[x].Final)
            jsonObj[x].Final = temp;
        }
        csvModel.insertMany(jsonObj, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    });
});

app.listen(PORT, console.log(`server running on port: ${PORT}`));