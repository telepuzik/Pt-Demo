window.onload = function () {
    LoadMyProfile();
}

function LoadMyProfile() {
    var clientContext = new SP.ClientContext.get_current();

    //Получение данных о сайте
    this.currentSite = clientContext.get_web();
    clientContext.load(currentSite);

    //Получение текущего пользователя
    this.currentUser = currentSite.get_currentUser();
    clientContext.load(currentUser);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededMyProfile), Function.createDelegate(this, this.onQueryFailed));
}

function onQuerySucceededMyProfile() {
    var hostUrl = GetHostUrl();
    var div = $("<div/>", {
            id: "currentUser",
            css: { height: "150px", width: "150px", 'background-color': '#92a840', 'position': 'relative'  }
    });
    var href = $("<a/>", {
        text: "Мой профиль",
        href: hostUrl + "/_layouts/15/userdisp.aspx?ID=" + currentUser.get_id(),
        target: '_top',
        css: { 'font-size': '14pt', 'color': '#ffffff', 'position': 'absolute', 'bottom': '10px' }
    });
    div.css('width', $("#MyProfile").parent().parent().width());
    div.append(href);
    $("#MyProfile").append(div);
    console.log();
}

function onQueryFailed() {
    console.log('request failed ' + args.get_message() + '\n' + args.get_stackTrace());
}

function GetHostUrl() {
    var hostUrl = '';
    if (document.URL.indexOf('?') != -1) {
        var params = document.URL.split('?')[1].split('&');
        for (var i = 0; i < params.length; i++) {
            var p = decodeURIComponent(params[i]);
            if (/^SPHostUrl=/i.test(p)) {
                hostUrl = p.split('=')[1];
                break;
            }
        }
    }
    return hostUrl;
}