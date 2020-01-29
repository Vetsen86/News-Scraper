$(document).ready(function() {
    $(".scrape").click(function(event) {
        event.preventDefault();
        $.get("/scrape").then(function(res) {
            setTimeout(function(){ window.location.reload(); }, 3000);
        });
    });

    $("#comment-submit").click(function(event) {
        event.preventDefault();
        
        var dataObj = {};

        dataObj.user = $("#user").val().trim();
        dataObj.comment = $("#comment").val().trim();
        dataObj.article = $(this).attr("data-article");

        console.log(dataObj);

        $.post("/comment", dataObj).then(function(res) {
            window.location.reload();
        });
    });

    $("body").on("click", ".comment-delete", function() {
        var ajaxData = {
            commentId: $(this).attr("data-comment"),
            articleId: $(this).attr("data-article")
        };

        $.ajax({
            url: '/comment',
            type: 'DELETE',
            data: ajaxData,
            success: function(result) {
                window.location.reload();
            }
        });
    });
});