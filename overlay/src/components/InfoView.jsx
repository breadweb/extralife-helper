import { useTranslation } from 'react-i18next';
import React from 'react';

function InfoView ({ data, settings }) {
    const { t } = useTranslation();

    return (
        <div className='bg-zinc-200 w-full h-full flex flex-col items-center justify-center'>
            {t('MAIN_TITLE')}
        </div>
    );
}

export default InfoView;
