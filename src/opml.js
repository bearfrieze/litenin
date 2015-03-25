OPML = function(text) {
    this.xml = text;
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

OPML.prototype.urls = function() {
    var i = this.xpath("/opml//outline[@type='rss']/@xmlUrl");
    var urls = [];
    for (var node = i.iterateNext(); node; node = i.iterateNext()) {
        urls.push(node.nodeValue);
    }
    return urls;
};

OPML.prototype.parseUrls = function() {
    if (!this.parse()) return false;
    return this.urls();
};