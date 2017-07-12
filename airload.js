$.loadPage = function(url, options, skip_state){
    var that = this;
    $.ajax(url, $.extend(options, {
      headers: {'X-Airload': 'true'},
      success:function(rsp, status, request){
        if( typeof(rsp) == "string" ){
            if(!skip_state){
              window.history.pushState(null , "" ,url);
            }
          var el = document.createElement('div');
          el.innerHTML = rsp;
          if($('title', el)){
            document.title = $('title', el).html();
          }
          $('.main-content', document.body).html($('.main-content', el).html());
          $('body').scrollTop(0)
          $.pageReady.call(that, $('.main-content'));
        }
        that.success();
      },
      error:function(rsp){
        if(rsp.readyState==4 && rsp.status==320){
            options.method = 'GET';
            options.data = undefined;
            $.loadPage.call(that, rsp.getResponseHeader('location'), options, skip_state);
            return;
        }
        that.error(rsp);
      },
      complete: function(){
        that.complete();
      }
    }));
    that.start();
}

$.pageReady = function(el){
  var that = this;
  $('form', el).each(function(_, frm){
    frm = $(frm);
    if(!frm.hasClass('external') && !frm.attr('airload')){
      frm.bind('submit', function(e){
        e.stopPropagation();
        var url = frm.attr('action');
        if(!url){
          url = document.location.href;
        }
        $.loadPage.call(that, url, {
          method: frm.attr('method'),
          data: frm.serialize()
        });
        return false;
      })
      frm.attr('airload', 'true');
    }
  })

  $('a[href]', el).each(function(_, a){
    a = $(a);
    if(!a.hasClass('external') && !a.attr('airload')){
      a.attr('airload', 'true');
      a.bind('click', function(e){
        var href = a.attr('href');
        if( href == '' ){
          href = document.location.href;
        }
        if(href.substr(0,1)!='#' && e.metaKey==false){
          e.stopPropagation();
          $.loadPage.call(that, href);
          return false;
        }
      })
    }
  })
}