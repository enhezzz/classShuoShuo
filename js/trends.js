/**
 * Created by Administrator on 2017/10/10.
 */

$("#nav").html($(".navi").html());
$("#foot").html($(".ft").html());
$("#allSS").html($(".as").html());
$(".del").on("click",function (e) {
    var that = this;
    e.preventDefault();
    var url = $(this).attr("href");
    $.ajax({
        url : url,
        success : function (data) {
            if(data === "deleted"){
                $(that).parent().parent().hide(889);
                $(that).parent().parent().next().hide(889);
                setTimeout(function () {
                    $(that).parent().parent().remove();
                    $(that).parent().parent().next().remove();
                },889)
            }
        },
        error : function (err) {
            throw err;
        }
    })
    // console.log(<%=shuoshuos[i].serialCode%>);
});
$("#ssArea").on("focus",function (e) {
    $('#collapse').collapse('show');
});
function isBottomed() {
    var winH = $(window).height(),
        scrollH = $(window).scrollTop(),
        toTop = $("#more").offset().top,
        moreH = $("#more").height();
    if(moreH < scrollH + winH - toTop){
        return true;
    }
    else return false;
}
$(window).on("scroll",function (e) {
    if(isBottomed()){
        console.log("到底啦!")
        // $.ajax({
        //     url : "/classShuoShuo/trends?more=" + Array.from($(".ss")).length,
        //     success : function (result) {
        //
        //     }
        // })
    }
});
console.log($("#more").offset().top)
// $(document).not($("#head_bar")[0]).on("click",function (e) {
//     e.stopPropagation?e.stopPropagation() : e.cancelBubble = true;
//     $('#collapse').collapse('hide');
// });
$("#publishSS").on("click",function (e) {
    console.log($("#ssArea").val() !== "")
    if($("#ssArea").val() !== "") {
        $.ajax({
            type: "post",
            url: "/classShuoShuo/trends/publishSS",
            data: {
                content: $("#ssArea").val()
            },
            success : function (data) {
                history.go();
            },
            error : function (err) {
                throw err;
            }
        });
    }
});
function show(id) {
    $("#"+id).css("display","block");
}
$('.comment').on('click',function (e) {
    $(this).parent().parent().parent().prev().css('display','inline');
    fetch("/classShuoShuo/trends/comment",{
        method: 'POST',
        credentials: 'same-origin',
        body: new FormData($(this)[0].parentNode)
    }).then(function(date) {
        "use strict";
        $(this).parent().parent().parent().prev().css('display','none');
        date.json().then(function(result){
            $(this).parent().parent().parent().prev().prev().append(`<div class="row">
    <p class="col-xs-10 col-sm-10 col-md-10">
        
        ${$(this).siblings('.form-group').children()[0].value}<br>
        ${dateFormat(result, "yyyy-mm-dd HH:MM:ss")}
    </p>
</div>`)
            console.log(dateFormat(result, "yyyy-mm-dd HH:MM:ss"))
        });
        // console.log(typeof date.json())
    });//返回一个resolve时间的promise,待解决
    $(this)[0].parentNode.parentNode.parentNode.style.display = 'none';
});
function cancle(id) {
    $("#"+id).css("display","none");
}