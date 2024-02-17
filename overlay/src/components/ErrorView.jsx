import React from 'react';

function ErrorView ({ message }) {
    return (
        <div className='bg-rose-200 w-full h-screen flex flex-col items-center justify-center border-rose-500 border-4'>
            <div className='flex items-center space-x-1 text-2xl font-bold mb-2'>
                <div className='fa-solid fa-circle-exclamation text-rose-500'/>
                <div>Error</div>
            </div>
            <div className='text-center'>
                {message}
            </div>
        </div>
    );
}

export default ErrorView;
