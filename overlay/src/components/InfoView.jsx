import React from 'react';

function InfoView ({ data, settings }) {
    return (
        <div className='flex flex-col'>
            <div className='p-2'>
                Participant ID: {settings?.data?.participantId}
            </div>
            <div className='font-mono p-2 text-sm whitespace-pre'>
                {JSON.stringify(settings?.data, null, 2)}
            </div>
            <div className='font-mono p-2 text-sm whitespace-pre'>
                {JSON.stringify(data, null, 2)}
            </div>
        </div>
    );
}

export default InfoView;
