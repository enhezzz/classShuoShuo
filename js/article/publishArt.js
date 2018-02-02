//阻止冒泡和bootstrap的一些切换操作有冲突(最后用event.target和event.currentTarget做比较判断是否冒泡)
var E = window.wangEditor;
var editor = new E('#editor');
editor.customConfig.uploadImgShowBase64 = true// 使用 base64 保存图片
// 或者 var editor = new E( document.getElementById('#editor') )
editor.create()
//---------------------------------------------------------------------------------------
$('#publishIt').on('click', function () {
    $(this).text("发布中...");
    var flag = $('#flag').val().split(',');
    var tags = [];
    $('.sf-typeHelper-item').each(function(i) {
        
        tags.push(this.innerText.replace('×',''));
    });
    var data = new FormData();
    data.append('type', '原创');
    data.append('articleName', $('#myTitle').val());
    data.append('articleBlogid', $('#articleBlogid').val());
    data.append('newsType', $('#newsType').val());
    data.append('content', editor.txt.html().replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/"/g, ''));
    data.append('flag', flag);
    data.append('tags',tags);

    fetch('/classShuoShuo/homePage/publishedArt', {
        method: 'POST',
        credentials: 'same-origin',
        body: data
    }).then(function () {
        $(this).text("发布文章");
        alert('发表成功,自动跳转到我的主页');
        location.pathname = '/classShuoShuo/homePage';
    })
});
var tagList = [];
$('.taglist--inline a').on('click',function() {
    var that = this;
    if(tagList.indexOf($(this).data('tag')['name'] !== -1)){
         $('.sf-typeHelper-item').each(function(){
             if($(this).text() === $(that).data('tag')['name']+'×'){
                this.style.animation = 'repeat 1s';
                setTimeout(() => {
                 this.style.animation = '';
                },1000);
             }
         })
       
    }
        if($('.sf-typeHelper-item').length < 5 && tagList.indexOf($(this).data('tag')['name']) == -1){
            var newOne = $('<span class="sf-typeHelper-item">'+ $(this).data('tag')['name'] + '<span data-role="remove">' + '×' + '</span></span>');
            newOne.children('span').on('click',function() {
                console.log(1)
                $(this).parent().remove();
            })
            // var new = $(ele)
            $('.sf-typeHelper').prepend(newOne);
          
        }
      
       tagList.push($(this).data('tag')['name']);
    
});
$('#flag').on('focus',function(event) {
    $('#tags').css('display','block');
});
$('*:not(#tags *,#tags,#flag)').on('click',function(event) {
    // event.stopPropagation?event.stopPropagation() : event.cancleBubble = true;
    if(event.target == event.currentTarget)
    $('#tags').css('display','none');
});
// $('#tags').on('click',function(event) {
//     event.stopPropa
// });
$('.sf-typeHelper').on('click',function(event) {
    event.stopPropagation?event.stopPropagation() : event.cancleBubble = true;
    $('#flag').focus();
})