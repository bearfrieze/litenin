OPML = function(url) {
    this.url = url;
};

OPML.prototype.load = function() {
    var request = new XMLHttpRequest();
    request.open('GET', this.url, false);
    request.send(null);
    if (request.status !== 200) {
        return false;
    }
    this.xml = request.responseText;
    return true;
};

OPML.prototype.parse = function() {
    var parser = new DOMParser();
    this.doc = parser.parseFromString(this.xml, "application/xml");
    if (!this.doc) return false;
    return this.xpath("boolean(/opml//outline[@type='rss'])").booleanValue;
};

OPML.prototype.xpath = function(expr) {
    return this.doc.evaluate(expr, this.doc, null, XPathResult.ANY_TYPE, null);
};

OPML.prototype.parseUrls = function() {
    this.load();
    this.parse();
    var i = this.xpath("/opml//outline[@type='rss']/@xmlUrl");
    var urls = [];
    for (var node = i.iterateNext(); node; node = i.iterateNext()) {
        urls.push(node.nodeValue);
    }
    return urls;
};