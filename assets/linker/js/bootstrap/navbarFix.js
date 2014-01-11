// This is a fix to bootstrap's navbar script that fails to retract the navbar after a menu item is 
// selected in a single page app. The github issue can be found here:
// https://github.com/twbs/bootstrap/issues/9013

$(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target).is('a') ) {
        $(this).collapse('hide');
    }
});