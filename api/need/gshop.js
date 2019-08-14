const request = require('request');
const ineed = require('ineed');

// Collects google shopping results
const gShopPlugin = {
    extends: 'collect',
    name: 'shoppingResults',

    init: function (ctx) {
        this.ctx = ctx;
        this.shoppingResults = [];
        this.openItem = false;
        this.counter = 0;
        this.afterB = false;
        this.aTagCounter = 0;
    },

    onStartTag: function (startTag) {
        // do stuff in correct tag-context
        if (this.openItem) {
            // count for tracking tag-context
            if (!startTag.selfClosing) this.counter += 1;
            
            // find title to item (first <b> has price)
            if (startTag.tagName === 'b') {
                this.afterB = true;
            }
            // find link to item
            if (startTag.tagName === 'a') {
                this.aTagCounter += 1;
                !this.openItem.href ? this.openItem.href = startTag.attrs.find(e => e.name === 'href').value : null;
            }
            // find img for item
            if (startTag.tagName === 'img') {
                this.openItem.img = startTag.attrs.find(e => e.name === 'src').value;
            }
        }

        // check if correct tag-context starts
        if (startTag.tagName === 'div' && startTag.attrs.find(e => e.name === 'class' && e.value === 'pslires')) {
            this.openItem = {};
        }
    },

    onEndTag: function(endTag) {
        // count for tracking tag-context
        if (this.openItem) {
            this.counter -= 1;
        }
        // check if tag-context has ended
        if (this.counter === -1) {
            // careful with item structure, no deep clone here!
            this.shoppingResults.push(Object.assign({}, this.openItem));
            this.openItem = false;
            this.counter = this.aTagCounter = 0;
        }
        /* if (endTag.tagName === 'b') {
            this.afterB = false;
        } */
    },

    onText: function(text) {
        // find price
        if (this.afterB) {
            this.afterB = false;
            if (!this.openItem.price) {
                this.openItem.price = text
                    .match(/\d+/g) // parse price from string
                    .reduce((acc, e, i, arr) => i === arr.length-1 ? acc + '.' + e : acc + e, '');
            }
        }
        // find title
        if (this.openItem && !this.openItem.title && this.aTagCounter === 2) {
            this.openItem.title = text;
        }
    },

    getCollection: function () {
        return this.shoppingResults;
    }
};

module.exports = (req, res) => {
    console.log('got query:', req.query);

    request(`https://www.google.com/search?tbm=shop&q=${req.query.q}`, function (error, response, body) {
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received    
        if (error) {
            console.error('error:', error); // Print the error if one occurred
            res.send(error);
            return;
        }
        
        // res.send(body);

        const results = ineed.using(gShopPlugin).collect.shoppingResults.fromHtml(body);

        const noGShopSites = results.shoppingResults.filter(e => !e.href.startsWith('/'));

        res.json(noGShopSites);
    });
}

/* https://www.google.com/search?
tbm=shop&
hl=en-DE&
source=hp&
biw=&
bih=&
q=böker+knive&
oq=böker+knive&
gs_l=products-cc.3..0.8543.12813.0.13040.13.3.1.9.10.0.120.321.1j2.3.0....0...1ac.1.34.products-cc..1.12.351.kVOLa3hLwDY */