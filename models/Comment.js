var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;