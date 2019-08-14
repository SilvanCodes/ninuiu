const request = require('request');
const ineed = require('ineed');

// Collects google shopping results
const ebayPlugin = {
    extends: 'collect',
    name: 'shoppingResults',

    init: function (ctx) {
        this.ctx = ctx;
        this.shoppingResults = [];
        this.openItem = false;
        this.counter = 0;
        this.afterStrong = false;
        this.aTagCounter = 0;
    },

    onStartTag: function (startTag) {
        // do stuff in correct tag-context
        if (this.openItem) {
            // count for tracking tag-context
            if (!startTag.selfClosing && startTag.tagName !== 'br') this.counter += 1;
            
            // find title to item (first <strong> has price)
            if (startTag.tagName === 'strong') {
                this.afterStrong = true;
            }
            // find link to item
            if (startTag.tagName === 'a') {
                this.aTagCounter += 1;
                !this.openItem.href ? this.openItem.href = 'https://www.ebay-kleinanzeigen.de' + startTag.attrs.find(e => e.name === 'href').value : null;
            }
            // find img for item
            if (startTag.tagName === 'div') {
                if (!this.openItem.img && startTag.attrs.some(e => e.name === 'data-imgsrc')) {
                    this.openItem.img = startTag.attrs.find(e => e.name === 'data-imgsrc').value;
                }
            }
        }

        // check if correct tag-context starts
        if (startTag.tagName === 'article' && startTag.attrs.find(e => e.name === 'class' && e.value === 'aditem')) {
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
    },

    onText: function(text) {
        // find price
        if (this.afterStrong) {
            this.afterStrong = false;
            if (!this.openItem.price) {
                const priceParts = text.match(/\d+/g); // parse price from string
                this.openItem.price = priceParts && priceParts.length ? priceParts.reduce((acc, e, i, arr) => i === arr.length-1 ? acc + '.' + e : acc + e, '') : 'unknown';
                if (this.openItem.price.startsWith('.')) this.openItem.price = this.openItem.price.replace('.', '');
            }
        }
        // find title
        if (this.openItem && !this.openItem.title && this.aTagCounter === 1) {
            this.openItem.title = text;
        }
    },

    getCollection: function () {
        return this.shoppingResults;
    }
};

module.exports = (req, res) => {
    console.log('got query:', req.query);

    request(`https://www.ebay-kleinanzeigen.de/s-suchanfrage.html?keywords=${req.query.q}`, function (error, response, body) {
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received    
        if (error) {
            console.error('error:', error); // Print the error if one occurred
            res.send(error);
            return;
        }
        
        // res.send(body);

        const results = ineed.using(ebayPlugin).collect.shoppingResults.fromHtml(body);

        res.json(results.shoppingResults);
    });
}

/* https://www.ebay-kleinanzeigen.de/s-suchanfrage.html?
keywords=table&
categoryId=&
locationStr=&
locationId=&
radius=0&
sortingField=SORTING_DATE&
adType=&
posterType=&
pageNum=1&
action=find&
maxPrice=&
minPrice= */