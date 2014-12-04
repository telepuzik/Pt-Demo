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
            width = $("#EventsList").children().width() + 7,        // the App Part width
            height = $('body').height() + 70,  // the App Part height
                                              // (now it's 7px more than the body)
            newHeight,                        // the new App Part height
            contentHeight = $('#EventsList').height(),
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
    LoadEventsList();
}

var context;
var web;
var user;
var spHostUrl;
var parentContext;

function LoadEventsList() {
    spHostUrl = decodeURIComponent(GetHostUrl());
    context = new SP.ClientContext.get_current();
    parentContext = new SP.AppContextSite(context, spHostUrl);
    web = parentContext.get_web();
    var list = web.get_lists().getByTitle("EventsList");
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml("<View><Query><Where>" +
        "<And>" +
        "<Geq><FieldRef Name='EventDate' Type='DateTime'/><Value Type='DateTime'><Today OffsetDays='-100' /></Value></Geq>" +
        "<Leq><FieldRef Name='EventDate' Type='DateTime'/><Value Type='DateTime'><Today OffsetDays='2' /></Value></Leq>" +
        "</And>" +
        "</Where></Query></View>");
    this.listItems = list.getItems(camlQuery);
    context.load(listItems);
    context.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededEventsList), Function.createDelegate(this, this.onQueryFailed));
}

function onQuerySucceededEventsList() {
    $("#EventsList").empty();
    $("#EventsList").css('width', '100%');
    var div = $("<div/>", {
        css: {
            width: '100%', 'background-color': "#92a840", 'position': 'relative' }
    });
    //var href = $("<a/>", {
    //    text: "События",
    //    href: "/",
    //    target: '_top',
    //    css: { 'font-size': '14pt', 'color': '#ffffff', 'position': 'absolute', 'top': '0px' }
    //});
    //div.append(href);
    var table = $("<table/>", {
        css: {
            'top': '30px',
            //'position': 'absolute',
            //'table-layout': 'fixed',
            'width': '220px'
            //'width': '100%', 'height': '100%'
        }
    });

    var listEnumerator = listItems.getEnumerator();
    var hostUrl = GetHostUrl();
    while (listEnumerator.moveNext()) {
        var listItem = listEnumerator.get_current();
        var date = listItem.get_item('EventDate');
        var desc = listItem.get_item('Description');
        var a = $(desc);
        var b = a.text();
        if (b.length > 15) {
            b = b.substring(0, 15) + "...";
        }
        table.append("<tr><td style='color: #ffffff'>" + date.format("dd.MM.yyyy") + "</td><td style='word-wrap: break-word'><a style='color: #ffffff' href='" + hostUrl + "/Lists/EventsList/DispForm.aspx?ID=" + (listItem.get_id()) + "' target='_top' >" + b + "</a></td></tr>");
    }

    //div.css('width', table.width());
    div.css('width', $("#EventsList").parent().parent().width());
    div.append(table);
    $("#EventsList").append(div);
    Communica.Part.adjustSize();
}

function UpdateSize() {
    // Post the request to resize the App Part, but just if has to make a resize

    var step = 30, // the recommended increment step is of 30px. Source:
        // http://msdn.microsoft.com/en-us/library/jj220046.aspx
        width = $("#EventsList").children().width(), // the App Part width
        height = $('body').height() + 207, // the App Part height
        // (now it's 7px more than the body)
        newHeight, // the new App Part height
        contentHeight = $("#EventsList").height(),
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