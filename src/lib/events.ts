

class EventsProcessor {
    new_work_request: OnNewWorkRequest[] = []
    work_request_completed: OnWorkRequestCompleted[] = []
    new_work_request_bid: OnNewWorkRequestBid[] = []
    bid_won: OnBidWon[] = []
    auction_failure: OnAuctionFailure[] = []

    constructor(events: [{ data: any, type: string }]) {
        events.forEach((elem) => {
            let event_name = elem.type.split("::").at(-1)
            switch (event_name) {
                case "OnNewWorkRequest":
                    this.new_work_request.push(
                        elem.data
                    )
                    break;
                case "OnWorkRequestCompleted":
                    this.work_request_completed.push(
                        elem.data
                    )
                    break;
                case "OnNewWorkRequestBid":
                    this.new_work_request_bid.push(
                        elem.data
                    )
                    break;
                case "OnBidWon":
                    this.bid_won.push(
                        elem.data
                    )
                    break;
                case "OnAuctionFailure":
                    this.auction_failure.push(
                        elem.data
                    )
                    break;
                default:
                    throw new Error("unknown type: " + event_name);
            }
        })
    }
}


export type OnNewWorkRequest = {
    request_id: number,
    requester: string
    time_limit: number,
}

export type OnWorkRequestCompleted = {
    request_id: number
}

export type OnNewWorkRequestBid = {
    request_id: number,
    bidder: string,
    price: number
}

export type OnBidWon = {
    request_id: number,
    winner: string,
    bid_price: number
}

export type OnAuctionFailure = {
    request_id: number,
}
