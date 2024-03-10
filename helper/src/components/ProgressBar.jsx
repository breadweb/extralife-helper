import classNames from 'classnames';
import React from 'react';

const ProgressBar = ({ backColor, current, fillColor, markers, required }) => {
    const percent = Math.min(current / required * 100, 100);

    const markerIcons = markers.map((marker, index) => (
        <div
            className='absolute rounded-full w-3 h-3 bg-helper3 drop-shadow'
            style={{
                left: `calc(${marker / required * 100}% - 6px)`,
                top: 'calc(50% - 6px)',
            }}
            key={index}
        />
    ));

    return (
        <div className='relative overflow-hidden rounded-full h-10 w-full'>
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
                        'absolute h-full transition-all duration-[2s] ease-in-out',
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
            <div className='absolute h-full w-full'>
                {markerIcons}
            </div>
        </div>
    );
};

export default React.memo(ProgressBar);
