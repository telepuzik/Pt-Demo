window.onload = function () {
    LoadNewEmployees();
}

var context;
var web;
var user;
var spHostUrl;
var parentContext;

function LoadNewEmployees() {
    spHostUrl = decodeURIComponent(GetHostUrl());
    context = new SP.ClientContext.get_current();
    parentContext = new SP.AppContextSite(context, spHostUrl);
    web = parentContext.get_web();
    var list = web.get_lists().getByTitle("EmployeesList");
    var camlQuery = new SP.CamlQuery();
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    camlQuery.set_viewXml("<View><Query><Where>" +
        "<Geq><FieldRef Name='Comedate' Type='DateTime'/><Value Type='DateTime'><Today OffsetDays='-10' /></Value></Geq>" +
        "</Where></Query></View>");

    this.listItems = list.getItems(camlQuery);
    context.load(listItems);
    context.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededBirthdayList), Function.createDelegate(this, this.onQueryFailed));
}

function onQuerySucceededBirthdayList() {
    $("#NewEmployees").empty();

    var div = $("<div/>", {
        css: { height: "150px", width: "300px", 'background-color': "#d5524a", 'position': 'relative' }
    });
    var href = $("<a/>", {
        text: "Новые сотрудники",
        href: "/",
        target: '_top',
        css: { 'font-size': '14pt', 'color': '#ffffff', 'position': 'absolute', 'top': '0px' }
    });
    div.append(href);
    var table = $("<table/>", {
        css: {
            'top': '30px', 'position':'absolute'}
    });

    var listEnumerator = listItems.getEnumerator();
    var hostUrl = GetHostUrl();
    while (listEnumerator.moveNext()) {
        var listItem = listEnumerator.get_current();
        var date = listItem.get_item('Comedate');
        table.append("<tr><td style='color: #ffffff'>" + date.format("dd.MM.yyyy") + "</td><td><a style='color: #ffffff' href='" + hostUrl + "/Lists/EmployeesList/DispForm.aspx?ID=" + (listItem.get_id()) + "' target='_top' >" + listItem.get_item('Title') + "</a></td></tr>");
    }
    div.css('width', $("#NewEmployees").parent().parent().width());
    div.append(table);
    $("#NewEmployees").append(div);
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