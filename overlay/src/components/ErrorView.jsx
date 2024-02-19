import { useTranslation } from 'react-i18next';
import React from 'react';

function ErrorView ({ message }) {
    const { t } = useTranslation();

    return (
        <div
            className={
                'bg-rose-200 flex flex-col items-center justify-center font-cantarell p-8'
            }
        >
            <div className='flex items-center space-x-1 text-4xl font-bold mb-2'>
                <div className='fa-solid fa-circle-exclamation text-rose-500'/>
                <div className='-mt-1'>{t('ERROR')}</div>
            </div>
            <div className='text-center text-xl'>
                {message}
            </div>
        </div>
    );
}

export default ErrorView;
