# Overview
Module Name: FO Bid Adapter
Type: Bidder Adapter
Maintainer: vietlv14@fpt.com

# Description
This module connects to FO exchange for bidding NATIVE ADS (current version) via prebid.js
It's INTERNAL ADAPTER

# Test Parameters
```
var adUnits = [{
    code: 'test-div',
    mediaTypes: {
        native: {
            title: {
                required: true,
                len: 50
            },
            body: {
                required: true,
                len: 350
            },
            url: {
                required: true
            },
            image: {
                required: true,
                sizes : [300, 175]
            },
            sponsoredBy: {
                required: true
            }
        }
    },
    bids: [{
        bidder: 'fo',
        params: {
	    	placementId:"1vf88shh2-g888120311" //zoneId
        }
    }]
}];
```

# DEV-COMMANDLINES: 
- **For-testing**: gulp serve-and-test --file test/spec/modules/foBidAdapter_spec.js
- **For-building**: gulp build --modules=modules.json