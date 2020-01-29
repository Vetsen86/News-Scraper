var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    // `headline` is required and of type String
    headline: {
      type: String,
      required: true,
      unique: true
    },
    // `url` is required and of type String
    url: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      required: true
    },
    comments: [ {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    } ]
  });

  var Article = mongoose.model("Article", ArticleSchema);

  module.exports = Article;