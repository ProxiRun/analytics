import {
    OnAuctionFailure,
    OnBidWon,
    OnNewWorkRequest,
    OnNewWorkRequestBid,
    OnWorkRequestCompleted
} from "./events.ts";

// raw interface data
export interface AllEventsInterfaceRaw {
    AllEvents: {
        data: {
            newWorkRequest: {
                data: OnNewWorkRequest
            }[],
            workRequestCompleted: {
                data: OnWorkRequestCompleted
            }[],
            newBids: {
                data: OnNewWorkRequestBid
            }[],
            bidWons: {
                data: OnBidWon
            }[],
            auctionFailures: {
                data: OnAuctionFailure
            }[]
        }
    }
    

}


export interface AllEventsInterface {


}