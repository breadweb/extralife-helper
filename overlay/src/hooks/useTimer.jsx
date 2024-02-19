import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

function useTimer (dt) {
    const [data, setData] = useState(undefined);

    useEffect(() => {
        if (dt === undefined || dt === null) {
            return;
        }

        const interval = setInterval(() => {
            const now = DateTime.now();

            const totalMs = now.diff(dt).milliseconds;

            let ms = Math.abs(totalMs);

            let hours = Math.floor(ms / 3600000);
            ms -= hours * 3600000;
            let minutes = Math.floor(ms / 60000);
            ms -= minutes * 60000;
            let seconds = Math.floor(ms / 1000);

            hours = Math.max(hours, 0);
            minutes = Math.max(minutes, 0);
            seconds = Math.max(seconds, 0);

            const h = String(hours).padStart(2, '0');
            const m = String(minutes).padStart(2, '0');
            const s = String(seconds).padStart(2, '0');

            setData({
                clock: `${h}:${m}:${s}`,
                ms: totalMs,
            });
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [dt]);

    return data;
}

export default useTimer;
