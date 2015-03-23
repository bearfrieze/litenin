describe('OPML', function() {
    var opml;
    describe('load', function() {
        it('True when loaded', function() {
            opml = new OPML('xml/valid.xml');
            assert.isTrue(opml.load());
        });
        it('False when loading xml fails', function() {
            opml = new OPML('xml/missing.xml');
            assert.isFalse(opml.load());
        });
    });
    describe('parse', function() {
        it('True when xml is parsed', function() {
            opml = new OPML('xml/valid.xml');
            opml.load();
            assert.isTrue(opml.parse());
        });
        it('False when parsing xml fails', function() {
            opml = new OPML('xml/invalid.xml');
            opml.load();
            assert.isFalse(opml.parse());
        });
    });
    describe('parseUrls', function() {
        it('Array contains expected urls', function() {
            opml = new OPML('xml/valid.xml');
            var urls = [
                'http://www.xkcd.com/rss.xml',
                'https://github.com/blog.atom'
            ];
            assert.deepEqual(urls, opml.parseUrls());
        });
    });
});