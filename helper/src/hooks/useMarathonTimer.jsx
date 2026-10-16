import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

// The marathon runs on Eastern time regardless of the machine's timezone. Each day starts at the
// time of day from the start date setting and play wraps up at DAY_END_HOUR the next morning,
// after which the timer counts down to the start of the next day.
const ZONE = 'America/New_York';
const DAY_END_HOUR = 2;

const formatClock = totalMs => {
    let ms = Math.abs(totalMs);

    const hours = Math.floor(ms / 3600000);
    ms -= hours * 3600000;
    const minutes = Math.floor(ms / 60000);
    ms -= minutes * 60000;
    const seconds = Math.floor(ms / 1000);

    return [hours, minutes, seconds].map(n => String(n).padStart(2, '0')).join(':');
};

const getMarathonState = (firstDayStart) => {
    const now = DateTime.now().setZone(ZONE);

    let dayStart = now.set({
        hour: firstDayStart.hour,
        minute: firstDayStart.minute,
        second: 0,
        millisecond: 0,
    });
    if (now.hour < DAY_END_HOUR) {
        // Still playing past midnight, so this belongs to the day that started yesterday.
        dayStart = dayStart.minus({ days: 1 });
    }
    if (dayStart < firstDayStart) {
        dayStart = firstDayStart;
    }

    const day = Math.round(dayStart.startOf('day').diff(firstDayStart.startOf('day'), 'days').days) + 1;
    const totalMs = now.diff(dayStart).milliseconds;

    return {
        clock: formatClock(totalMs),
        day,
        isPlaying: totalMs >= 0,
    };
};

const useMarathonTimer = (dt) => {
    const [data, setData] = useState(undefined);

    useEffect(() => {
        if (dt === undefined || dt === null) {
            return;
        }

        // Use the wall clock date and time from the settings as Eastern time.
        const firstDayStart = DateTime.fromObject({
            year: dt.year,
            month: dt.month,
            day: dt.day,
            hour: dt.hour,
            minute: dt.minute,
        }, { zone: ZONE });

        const interval = setInterval(() => {
            setData(getMarathonState(firstDayStart));
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [dt]);

    return data;
};

export default useMarathonTimer;
