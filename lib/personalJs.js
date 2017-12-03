"use strict";

/**
 * Created by Administrator on 2017/10/8.
 */
$(".thumbnail").on("click", function (e) {
    $(".file-hidden").trigger("click");
});
$("#nav").html($(".navi").html());
$("#foot").html($(".ft").html());
history.replaceState({ title: "homePage" }, "");
$("#shuoshuo").on("click", function (e) {
    e.preventDefault();
    $.ajax({
        type: "get",
        url: "/classShuoShuo/homePage/querySS"
    }).done(function (result) {
        var shuoshuo = result.sort(function (a, b) {});
        new EJS({ url: '/shuoshuo.ejs' }).update('content', { arr: shuoshuo });
    });

    history.pushState({ title: "shuoshuo" }, "", "/classShuoShuo/homePage/shuoshuo");
    // history.pushState({title : "shuoshuo"},"","/classShuoShuo/homePage/shuoshuo1");
    // $.ajax({
    //    method : "get",
    //     url : "/classShuoShuo/homePage/shuoshuo"
    // }).done(function (result) {
    //
    // })
    // console.log(history.state)
});
window.onpopstate = function (e) {
    if (e.state) {
        if (e.state.title === "homePage") history.go();
    }
};
//    var api = $.Jcrop('#touxiang',{
////        onChange: showPreview,
////        onSelect: showPreview,
//        aspectRatio: 1
//    });
//    $('#select').on('change',function(){
//        var reader = new FileReader();
//        reader.readAsDataURL(this.files[0]);
//        reader.onload = function () {
//            console.log(this.result);
//        }
//    })
$('#file').on('change', function () {
    var reader = new FileReader();
    reader.readAsDataURL(this.files[0]);
    reader.onload = function (e) {
        var img = new Image();
        img.src = e.target.result;
        img.onload = function () {
            $('.modal-body').append(img);
            img.style.width = '100%';
            $('.modal').css({
                'display': 'block',
                'backgroundColor': 'rgba(211,211,211,0.5)'
            });
            console.log('height:' + this.height + '----width:' + this.width);
        };
    };
    //        let url = window.URL || window.webkitURL;
    //        console.log(url.createObjectURL(this.files[0]));
    //                    let img = new Image();
    //            img.src = url.createObjectURL(this.files[0]);
    //            img.onload = function () {
    //                console.log('height:'+this.height+'----width:'+this.width)
    //            }
});
$('.close').on('click', function () {
    $('#file').val(''); //清空选中文件
    $('.modal-body').children('img').remove(); //删除之前选中图片
    $("." + this.dataset['dismiss']).css('display', 'none');
});
$('.modal-footer').children('button').first().on('click', function () {
    $('#file').val(''); //清空选中文件
    $('.modal-body').children('img').remove(); //删除之前选中图片
    $("." + this.dataset['dismiss']).css('display', 'none');
}).next().on('click', function () {
    var formData = new FormData();
    formData.append('pic', $('#file')[0].files[0]);
    fetch('/classShuoShuo/uploadTouXiang', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
    }).then(function () {
        $('#touxiang')[0].src = '/classShuoShuo/touxiang?' + new Date();
    });
    $('.modal').css('display', 'none');
    $('#file').val(''); //清空选中文件
    $('.modal-body').children('img').remove(); //删除之前选中图片


    //    $.ajax({
    //        type: "POST",
    //        url: "/classShuoShuo/uploadTouXiang",
    //        data: formData,
    //        cache: false,
    //        contentType: false,
    //        processData: false,
    //        success: function(msg){
    //            alert( "Data Saved: " + msg );
    //        }
    //    })
});