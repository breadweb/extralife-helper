import { useTranslation } from 'react-i18next';
import React from 'react';

const ErrorView = ({ message }) => {
    const { t } = useTranslation();

    return (
        <div
            className={
                'bg-rose-200 flex flex-col items-center justify-center font-cantarell p-8'
            }
        >
            <div className='flex items-center space-x-4 text-4xl font-bold mb-2'>
                <div className='-mt-1 text-rose-800'>{t('ERROR')}</div>
                <div className='fa-regular fa-face-surprise text-4xl'/>
            </div>
            <div className='text-center text-xl leading-6'>
                {message}
            </div>
            <div className='text-center leading-4 text-sm mt-4'>
                {t('VISIT_FOR_HELP')}
            </div>
        </div>
    );
};

export default React.memo(ErrorView);
