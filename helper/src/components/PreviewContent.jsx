import DonationView from './DonationView';
import ErrorView from './ErrorView';
import LatestDonationsView from './LatestDonationsView';
import LogoView from './LogoView';
import MilestoneView from './MilestoneView';
import React from 'react';
import { mockDonation, mockLatestDonations, mockMilestone } from '../modules/mock-content';

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
