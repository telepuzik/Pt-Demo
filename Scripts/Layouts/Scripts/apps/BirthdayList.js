// define a namespace
window.Communica = window.Communica || {};

$(document).ready(function () {
    // initialise
    Communica.Part.init();
});

Communica.Part = {
    senderId: '',      // the App Part provides a Sender Id in the URL parameters,
    // every time the App Part is loaded, a new Id is generated.
    // The Sender Id identifies the rendered App Part.
    previousHeight: 0, // the height
    minHeight: 0,      // the minimal allowed height
    firstResize: true, // On the first call of the resize the App Part might be
    // already too small for the content, so force to resize.

    init: function () {
        // parse the URL parameters and get the Sender Id
        var params = document.URL.split("?")[1].split("&");
        for (var i = 0; i < params.length; i = i + 1) {
            var param = params[i].split("=");
            if (param[0].toLowerCase() == "senderid")
                this.senderId = decodeURIComponent(param[1]);
        }

        // find the height of the app part, uses it as the minimal allowed height
        this.previousHeight = this.minHeight = $('body').height();

        // display the Sender Id
        $('#senderId').text(this.senderId);

        // make an initial resize (good if the content is already bigger than the
        // App Part)
        this.adjustSize();
    },

    adjustSize: function () {
        // Post the request to resize the App Part, but just if has to make a resize



        var step = 30, // the recommended increment step is of 30px. Source:
                       // http://msdn.microsoft.com/en-us/library/jj220046.aspx
            width = $("#BirthdayList").children().width() + 7,        // the App Part width
            height = $('body').height() + 70,  // the App Part height
                                              // (now it's 7px more than the body)
            newHeight,                        // the new App Part height
            contentHeight = $('#BirthdayList').height(),
            resizeMessage =
                '<message senderId={Sender_ID}>resize({Width}, {Height})</message>';

        // if the content height is smaller than the App Part's height,
        // shrink the app part, but just until the minimal allowed height
        if (contentHeight < height - step && contentHeight >= this.minHeight) {
            height = contentHeight;
        }

        // if the content is bigger or smaller then the App Part
        // (or is the first resize)
        if (this.previousHeight !== height || this.firstResize === true) {
            // perform the resizing

            // define the new height within the given increment
            newHeight = Math.floor(height / step) * step +
                step * Math.ceil((height / step) - Math.floor(height / step));

            // set the parameters
            resizeMessage = resizeMessage.replace("{Sender_ID}", this.senderId);
            resizeMessage = resizeMessage.replace("{Height}", newHeight);
            resizeMessage = resizeMessage.replace("{Width}", width);
            // we are not changing the width here, but we could

            // post the message
            window.parent.postMessage(resizeMessage, "*");

            // memorize the height
            this.previousHeight = newHeight;

            // further resizes are not the first ones
            this.firstResize = false;
        }
    },

    addItem: function () {
        // add an item to the list
        $('#itemsList').append('<li>Item</li>');
        Communica.Part.adjustSize();
    },

    removeItem: function () {
        // remove an item from the list
        $('#itemsList li:last').remove();
        Communica.Part.adjustSize();
    }
};

window.onload = function () {
    LoadBirthdayList();
}

var context;
var web;
var user;
var spHostUrl;
var parentContext;

function LoadBirthdayList() {
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
        "<And>" +
        "<Eq>" +
            "<FieldRef Name=\'MonthBirthdate\' /><Value Type=\'Number\'>" + mm+  "</Value>" +
        "</Eq>" +
        "<Eq>" +
            "<FieldRef Name=\'DayBirthdate\' /><Value Type=\'Number\'>" + dd + "</Value>" +
        "</Eq></And></Where></Query></View>");

    this.listItems = list.getItems(camlQuery);
    context.load(listItems);
    context.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededBirthdayList), Function.createDelegate(this, this.onQueryFailed));
}

function onQuerySucceededBirthdayList() {
    $("#BirthdayList").empty();

    var div = $("<div/>", {
        css: { height:"100%", width: "100%", 'background-color': "#477aa0", 'position': 'relative' }
    });
    var href = $("<a/>", {
        text: "Дни рождения",
        href: "/",
        target: '_top',
        css: { 'font-size': '14pt', 'color': '#ffffff', 'position': 'absolute', 'top': '0px' }
    });
    div.append(href);
    var table = $("<table/>", {
        css: {
            'top': '30px', 'width': '320px', 'position': 'absolute'
        }
    });

    var listEnumerator = listItems.getEnumerator();
    var hostUrl = GetHostUrl();
    while (listEnumerator.moveNext()) {
        var listItem = listEnumerator.get_current();
        var date = listItem.get_item('Birthdate');
        table.append("<tr><td style='color: #ffffff'>" + date.format("dd.MM.yyyy") + "</td><td><a style='color: #ffffff' href='" + hostUrl + "/Lists/EmployeesList/DispForm.aspx?ID=" + (listItem.get_id()) + "' target='_top' >" + listItem.get_item('Title') + "</a></td></tr>");
    }

    //div.append(table);
    //$("#BirthdayList").append(div);

    div.css('width', $("#BirthdayList").parent().parent().width());
    div.append(table);
    $("#BirthdayList").append(div);
    Communica.Part.adjustSize();
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