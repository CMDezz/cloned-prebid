import { config } from '../src/config.js'
import { NATIVE } from '../src/mediaTypes.js'
import { convertOrtbRequestToProprietaryNative } from '../src/native.js'
import { getWindowTop, isFn, deepAccess } from '../src/utils.js'
import { registerBidder } from '../src/adapters/bidderFactory.js';

// ***** FO ADAPTER *****
// * CUSTOM ADAPTER
// * SUPPORT AD TYPES: [NATIVE]

const BIDDER_CODE = 'fo'
export const ENDPOINT = 'https://localhost:5432/api/v1/bid'
const DEFAULT_CUR = 'VND'
const VERSION = '1.0'
const RESPONSE_TTL = 60 // time to live
const REQUEST_TO = 300 // timeout

export const spec = {
    code: BIDDER_CODE,
    supportedMediaTypes: [NATIVE],
    isBidRequestValid: (bid) => {
        return (
            !!bid && !!bid.params && !!bid.bidder
            && !!bid.params.placementId
        )
        // && (bid.mediaType === NATIVE)
    },
    buildRequest: (validBidRequests = [], bidderRequest) => { // FORMAT REQUEST TO BID SERVER
        validBidRequests = convertOrtbRequestToProprietaryNative(validBidRequests)

        // **** CUSTOM REQUEST UPTO BID SERVER *****
        const winTop = getWindowTop();
        const device = getDevice();
        const location = winTop.location;
        const cur = [config.getConfig('currency.adServerCurrency') || DEFAULT_CUR]
        const placement = []
        const request = {
            deviceWidth: winTop.screen.width,
            deviceHeight: winTop.screen.height,
            language: navigator?.language ? navigator.language.split('-')[0] : '',
            secure: 1,
            host: location.host,
            page: location.pathname,
            version: VERSION,
            timeout: REQUEST_TO,
            placement,
            device,
            cur
        }

        // ***** SET CONSENT *****
        if (bidderRequest.gdprConsent) {
            request.gdprConsent = bidderRequest.gdprConsent
        }

        (validBidRequests.map(bid => {
            placement.push({
                placementId: bid.params.placementId,
                bidId: bid.bidId,
                adUnitcode: bid.adUnitCode,
                auctionId: bid.auctionId,
                bidfloor: getBidFloor(bid, cur),
            })
        }))

        return {
            method: 'POST',
            url: ENDPOINT,
            data: request
        }
    },
    interpretResponse: (serverResponse) => { // FORMAT RESPONSE TO PREBIDJS ON CLIENT
        return serverResponse.body.reduce((bids, bid) => {
            return [...bids, {
                ttl: RESPONSE_TTL,
                signal: bid.signal,
                ...bid
            }]
        }, [])
    },
    // * Another methods, use them if needs
    // onBidWon:(bid)=>{},
    // onTimeout:(timeoutData)=>{},
    // onBidderError:({ error, bidderRequest })=>{},
}
registerBidder(spec);


// ***** UTILS FUNC, REMOVE IF DONT NEED  *****
// * getBidFloor
// * getDevice
// * isBidResponseValid

const isBidReponseValid = (bid) => {

}
const getBidFloor = (bid, currency = DEFAULT_CUR) => {
    if (!isFn(bid.getFloor)) {
        return deepAccess(bid, 'params.bidfloor', 0);
    }

    try {
        const bidFloor = bid.getFloor({
            currency,
            mediaType: 'NATIVE',
            size: '*',
        });
        return bidFloor.floor;
    } catch (_) {
        return 0
    }
}

const getDevice = () => {
    const ua = navigator.userAgent;
    const topWindow = window.top;
    if ((/(ipad|xoom|sch-i800|playbook|silk|tablet|kindle)|(android(?!.*mobi))/i).test(ua)) {
        return 'tablet';
    }
    if ((/(smart[-]?tv|hbbtv|appletv|googletv|hdmi|netcast\.tv|viera|nettv|roku|\bdtv\b|sonydtv|inettvbrowser|\btv\b)/i).test(ua)) {
        return 'connectedtv';
    }
    if ((/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Windows\sCE|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i).test(ua)) {
        return 'smartphone';
    }
    const width = topWindow.innerWidth || topWindow.document.documentElement.clientWidth || topWindow.document.body.clientWidth;
    if (width > 320) {
        return 'desktop';
    }
    return 'other';
}
