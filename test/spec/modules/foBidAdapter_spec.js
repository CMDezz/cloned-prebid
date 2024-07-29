import { expect } from 'chai'
import { spec, ENDPOINT } from '../../../modules/foBidAdapter.js'
import { NATIVE, BANNER } from '../../../src/mediaTypes.js'

describe('FOBidAdapter', () => {
    const bid = {
        bidder: 'fo',
        params: {
            placementId: 'bid-id',
        }
    }
    const bidRequest = {
        mediaTypes: {
            [NATIVE]: {
                title: {
                    required: true
                },
                image: {
                    required: true
                },
                sponsoredBy: {
                    required: true
                }
            }
        },
        gdprConsent: {
            consentString: 'consent_string',
            gdprApplies: true
        }
    }

    //example response
    const bidResponse = {
        ttl: 60,
        signal: 'long-signal-key',
        bidId: 'bid-id',
        auctionId: 'auction-id',
        clickUrl: 'click-url',
        price: 2
    }

    describe('isIdRequestValid', () => {
        it('should return true when required params found', () => {
            expect(spec.isBidRequestValid(bid)).to.be.true
        })
        it('should return false when placementId is missing', () => {
            // delete bid.params.placementId
            const emptyPlacementId = JSON.parse(JSON.stringify(bid))
            delete emptyPlacementId.params.placementId
            expect(spec.isBidRequestValid(emptyPlacementId)).to.be.false
        })
        bid.params.placementId = 'bid-id'
        it('should return false when placementId is invalid (zero values)', () => {
            bid.params.placementId = 0
            expect(spec.isBidRequestValid(bid)).to.be.false
        })
        it('should return false if there is not native ad bid request', () => {
            bid.params.mediaTypes == BANNER
            expect(spec.isBidRequestValid(bid)).to.be.false
        })
        it('should return true if there is native ad bid request', () => {
            bid.params.mediaTypes == NATIVE
            expect(spec.isBidRequestValid(bid)).to.be.false
        })
        it('should return falsse if there is wrong value at bid', () => {
            bid.params.mediaTypes == NATIVE
            expect(spec.isBidRequestValid(null)).to.be.false
        })
    })

    // TODO: implement test cases
    // ***** TEST CASE FOR ADAPTER METHODS *****
    // * buildRequest
    // * interprestResponse

    describe('buildRequest', () => {
        let request = spec.buildRequest([bid], bidRequest)
        it('should be create a request to server with POST method, data, valid url', () => {
            expect(request).to.exist
            expect(request.data).to.exist
            expect(request.method).to.exist
            expect(request.method).equal('POST')
            expect(request.url).exist
            expect(request.url).equal(ENDPOINT)
        })
        it('should return valid data format if bid array is valid', () => {
            expect(request.data).to.be.an('object')
            expect(request.data).to.has.all.keys('cur', 'device', 'gdprConsent', 'timeout', 'version', 'deviceWidth', 'deviceHeight', 'language', 'secure', 'placement', 'host', 'page')
            expect(request.data.deviceWidth).to.be.an("number")
            expect(request.data.deviceHeight).to.be.an("number")
            expect(request.data.device).to.be.an("string")
            expect(request.data.language).to.be.an("string")
            expect(request.data.secure).to.be.an("number").that.is.same(1)
            expect(request.data.host).to.be.an("string").that.is.not.empty
            expect(request.data.pathname).to.be.an("string").that.is.not.empty
            // expect(request.data.version).to.be.an("string").that.is.equal("1.0")
            expect(request.data.cur).to.be.an("string").that.is.equal("VND")

        })

        it('should be included gdprConsent data', () => {
            expect(request.data.gdprConsent).to.be.an('object')
        })

        it('should create placement with the same length as bid', () => {
            expect(request.data.placement).to.has.lengthOf([bid].length)
        })

        it('should create empty array on placement if there is no bid passed as empty array', () => {
            request = spec.buildRequest([], bidRequest)
            expect(request.data.placement).to.be.an('array').that.is.empty
        })

    })

    describe('interpretResponse', () => {
        const response = spec.interpretResponse({ body: [bidResponse] })
        it('should be return an array of bids response', () => {
            expect(response).to.be.an('array')
        })
        it('should be has all correct keys format for each bid response', () => {
            response.map(bid => {
                expect(bid).has.all.keys("ttl", "signal", "bidId", "auctionId", "clickUrl", "price")
                expect(bid.ttl).to.be.an("number")
                expect(bid.signal).to.be.an("string") // THIS CAN BE UNDEFINED ?? MODIFY LATER WHEN CONFIRMED
                expect(bid.bidId).to.be.an("string")
                expect(bid.clickUrl).to.be.an("string")
                expect(bid.price).to.be.an("number")
                expect(bid.price).greaterThan(0)
            })
        })
    })



    // ***** IMPLEMENT LATER IF NECESSARY *****
    // describe('onBidWon', () => {
    //     expect(spec.isBidRequestValid(bid)).to.be.true
    // })

    // describe('onTimeout', () => {
    //     expect(spec.isBidRequestValid(bid)).to.be.true
    // })

    // describe('onBidderError', () => {
    //     expect(spec.isBidRequestValid(bid)).to.be.true
    // })
})
