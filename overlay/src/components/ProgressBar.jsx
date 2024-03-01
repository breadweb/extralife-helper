import classNames from 'classnames';
import React from 'react';

function ProgressBar ({ backColor, current, fillColor, required, textColor }) {
    const percent = current / required * 100;

    return (
        <div className='relative overflow-hidden rounded-full h-10 w-full 5'>
            <div
                className={
                    classNames(
                        'absolute h-full w-full brightness-75',
                        backColor,
                    )
                }
            />
            <div
                className={
                    classNames(
                        'absolute h-full transition-all',
                        fillColor,
                    )
                }
                style={{
                    width: `${percent}%`,
                    backgroundImage:
                        `linear-gradient(-45deg, rgba(255,255,255,0.17) 25%, transparent 25%,
                        transparent 50%, rgba(255,255,255,0.17) 50%, rgba(255,255,255,0.17) 75%,
                        transparent 75%)`,
                    backgroundSize: '40px 40px',
                }}
            />
        </div>
    );
}

export default ProgressBar;
