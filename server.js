var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo Database.

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraped_news_db2";

mongoose.connect(MONGODB_URI);

//Routes

app.get("/", function (req, res) {
    db.Article.find({})
        .sort({createdAt: 1})
        .limit(30)
        .then(function (data) {

            var hbsobject = {
                articles: data
            };

            res.render("index", hbsobject);
        });
});

app.get("/scrape", function (req, res) {
    axios.get("https://www.gameinformer.com/").then(function (response) {
        var $ = cheerio.load(response.data);
        $(".article-summary").each(function (i, element) {

            var result = {};

            result.headline = $(this)
                .children(".article-title")
                .children("a")
                .text();

            result.headline = result.headline.replace(/\n/g, "");
            result.headline = result.headline.replace(/\t/g, "");

            result.url = "https://www.gameinformer.com" + $(this)
                .children(".article-title")
                .children("a")
                .attr("href");

            result.summary = $(this)
                .children(".promo-summary")
                .text();

            result.createdAt = new Date();

            var query = db.Article.where({ headline: result.headline });

            query.findOne().then(function (article) {
                if (article) {
                    return;
                } else {
                    db.Article.create(result)
                        .then(function (dbArticle) {
                            // View the added result in the console
                        })
                        .catch(function (err) {
                            // If an error occurred, log it
                            console.log(err);
                        });
                }
            });
        });

    });
    res.end();
});

app.get("/article/:id", function(req, res) {
    db.Article.where({ _id: req.params.id })
        .findOne()
        .populate("comments")
        .exec(function(err, dbArticle) {
            if (err) throw err;
            var article = {
                _id: dbArticle._id,
                headline: dbArticle.headline,
                url: dbArticle.url,
                summary: dbArticle.summary,
                createdAt: dbArticle.createdAt
            };

            for (i = 0; i < dbArticle.comments.length; i++) {
                dbArticle.comments[i].articleId = dbArticle._id;
            }
            
            var hbsobject = {
                article: article,
                comments: dbArticle.comments
            };

            console.log(hbsobject);

            res.render("comments", hbsobject);
        });    
});

app.post("/comment", function(req, res) {
    console.log(req.body);

    var commentObj = {
        user: req.body.user,
        comment: req.body.comment
    };

    db.Comment.create(commentObj)
        .then(function(dbComment) {
            return db.Article.findOneAndUpdate({ _id: req.body.article }, { $push: { comments: dbComment._id } }, { new: true });
        })
        .then(function(dbArticle) {
            res.status(200).end();
        });
});

app.delete("/comment", function(req, res) {
    db.Comment.deleteOne({ _id: req.body.commentId })
        .then(function (data) {
            return db.Article.findOneAndUpdate({ _id: req.body.articleId }, { $pull: { comments: req.body.commentId }}, { new: true })    
        }).then(function(dbArticle) {
            console.log(dbArticle);
            res.end();
        });
});

app.listen(PORT, function () {
    console.log("App now listening at localhost:" + PORT);
});