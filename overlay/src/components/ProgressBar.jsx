import classNames from 'classnames';
import React from 'react';

const ProgressBar = ({ backColor, current, fillColor, markers, required }) => {
    const percent = current / required * 100;

    // TODO: Render circle markers on the progress bar.

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
};

export default React.memo(ProgressBar);
