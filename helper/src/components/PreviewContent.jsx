import DonationView from './DonationView';
import ErrorView from './ErrorView';
import LatestDonationsView from './LatestDonationsView';
import LogoView from './LogoView';
import MilestoneView from './MilestoneView';
import React from 'react';

const mockDonation = {
    amount: 123.45,
    displayName: 'John & Jane Smith',
    message: '18 hours of games and still going? Amazing. Keep up the great work! Love, Mom and Dad.',
    recipientName: 'bread4kids',
};

const mockLatestDonations = [
    {
        donationID: 1,
        amount: 123.45,
        displayName: 'Hiiitechpower',
    },
    {
        donationID: 2,
        amount: 1234.56,
        displayName: 'Memes',
    },
    {
        donationID: 3,
        amount: 12.34,
        displayName: 'Just Blur',
    },
    {
        donationID: 4,
        amount: 1.23,
        displayName: 'Chaz',
    },
    {
        donationID: 5,
        amount: 18.77,
        displayName: 'Pintificate',
    },
];

const mockMilestone = {
    fundraisingGoal: 1000.00,
    description: 'Unlock the Gold Medal!',
};

const PreviewContent = ({ errorMessage, settings }) => {

    if (errorMessage) {
        return (
            <ErrorView
                message={errorMessage}
            />
        );
    }

    // Override some settings that aren't great for preview mode.
    const modifiedSettings = {
        ...settings,
        volume: 0,
        voice: '',
    };

    switch (settings.previewMode) {
        case 'donationAlert':
            return (
                <DonationView
                    donation={mockDonation}
                    settings={modifiedSettings}
                />
            );

        case 'milestoneAlert':
            return (
                <MilestoneView
                    milestone={mockMilestone}
                    settings={modifiedSettings}
                />
            );

        case 'latestDonations':
            return (
                <LatestDonationsView
                    latestDonations={mockLatestDonations}
                    settings={modifiedSettings}
                />
            );

        case 'logo':
            return (
                <LogoView
                    doFadeOut={false}
                    settings={settings}
                />
            );

        default:
            // Do nothing.
    }
};

export default React.memo(PreviewContent);
