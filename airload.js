$.loadPage = function(url, options, skip_state){
    var that = this;

    if(that.prevRequest){
      that.prevRequest.abort();
    }
    that.prevRequest = $.ajax(url, $.extend(options, {
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

          for(var i in that.slot){
            $(that.slot[i]).replaceWith($(that.slot[i], el));
            $.pageReady.call(that, that.slot[i]);
          }

          $('body').scrollTop(0)
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
        that.prevRequest = null;        
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

$.airloadSetup = function(el, cfg){
  var context = $.extend({
      requestIdx:0,
      slot: ['.main-content'],
      success: function(){},
      start: function(){},
      error: function(rsp){
        if(rsp.responseText){
          window.history.pushState(null , "" ,url);
          document.body.innerHTML = rsp.responseText;
        }
      },
      complete: function(){}
    }, cfg);
  $.pageReady.call(context, el);
  window.onpopstate=function(s){
    $.loadPage.call(context, document.location.href, {}, true);
  }
}