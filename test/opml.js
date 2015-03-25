var getFile = function(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    return request.responseText;
};

describe('OPML', function() {
    describe('parse', function() {
        it('True when xml is parsed', function() {
            var opml = new OPML(getFile('opml/valid.xml'));
            assert.isTrue(opml.parse());
        });
        it('False when parsing xml fails', function() {
            var opml = new OPML(getFile('opml/invalid.xml'));
            assert.isFalse(opml.parse());
        });
    });
    describe('parseUrls', function() {
        it('Array contains expected urls', function() {
            var opml = new OPML(getFile('opml/valid.xml'));
            var urls = [
                'http://www.xkcd.com/rss.xml',
                'https://github.com/blog.atom'
            ];
            assert.deepEqual(urls, opml.parseUrls());
        });
    });
});