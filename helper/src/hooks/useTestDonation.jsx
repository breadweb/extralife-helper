import React, { useEffect, useState } from 'react';
import { mockDonation, mockMilestone } from '../modules/mock-content';
import DonationView from '../components/DonationView';
import MilestoneView from '../components/MilestoneView';

const useTestContent = settings => {
    const [clickInfo, setClickInfo] = useState({ key: null, clicks: 0 });
    const [testContent, setTestContent] = useState(null);

    useEffect(() => {
        const onKeyPress = event => {
            if (['d', 'm'].includes(event.key)) {
                setClickInfo(prevTotalClicks => {
                    const newClickInfo = {
                        key: event.key,
                        clicks: prevTotalClicks.key === event.key ? prevTotalClicks.clicks + 1 : 1,
                    };
                    return newClickInfo;
                });
            }
        };

        document.addEventListener('keydown', onKeyPress);
        return () => {
            document.removeEventListener('keydown', onKeyPress);
        };
    }, [setClickInfo]);

    useEffect(() => {
        if (clickInfo.clicks >= 7) {
            switch (clickInfo.key) {
                case 'd':
                    setTestContent(
                        <DonationView
                            donation={mockDonation}
                            settings={settings}
                        />,
                    );
                    break;
                case 'm':
                    setTestContent(
                        <MilestoneView
                            milestone={mockMilestone}
                            settings={settings}
                        />,
                    );
                    break;
                default:
                    // Do nothing.
            }
            setClickInfo({ key: null, clicks: 0 });
        }
    }, [clickInfo, setTestContent, settings]);

    useEffect(() => {
        if (testContent === null) {
            return;
        }

        const ttl = typeof testContent === DonationView
            ? import.meta.env.VITE_DONATION_TTL
            : import.meta.env.VITE_MILESTONE_TTL;

        const timeoutId = setTimeout(() => {
            setTestContent(null);
        }, ttl);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [testContent]);

    return testContent;
};

export default useTestContent;
