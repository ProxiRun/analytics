

/// From a date object, return a date with zeroed-out elements of periodicity lower than day
export function date_to_day_date(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function day_date_to_string(date: Date) {
    const day = String(date.getDate()).padStart(2, '0'); // Get the day and pad with a leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (months are 0-indexed) and pad
    const year = date.getFullYear(); // Get the full year
    
    return `${day}/${month}/${year}`;
}

/// Count number of elements occuring on the same day
export function count_dates_per_day(dates: Date[]): {[key: string]: number} {
    const processed_dates = dates.map((d) => date_to_day_date(d))

    const counter: {[key: string]: number} = {}
    processed_dates.forEach((d) => {
        const formatted = day_date_to_string(d)
        if (formatted in counter) {
            counter[formatted] += 1
        } else {
            counter[formatted] = 1
        }
    })

    return counter;
}