import React from 'react';

function Money ({ amount, areCentsVisible, format }) {
    const dollars = Math.floor(amount);
    const cents = (amount - dollars) * 100;

    if (format === 'standard') {
        const currencyFormat = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: areCentsVisible ? 2 : 0,
            minimumFractionDigits: areCentsVisible && cents > 0 ? 2 : 0,
        });

        return (
            <div className='flex flex-row'>
                <div>{currencyFormat.format(amount)}</div>
            </div>
        );
    } else {
        let fraction;
        if (areCentsVisible && cents > 0) {
            fraction = (
                <div className='text-[40%] relative align-baseline mt-[0.3em]'>
                    {cents.toFixed(0).padEnd(2, '0')}
                </div>
            );
        }

        return (
            <div className='flex flex-row'>
                <div className='text-[50%] relative align-baseline mt-[0.2em]'>$</div>
                <div>{dollars.toLocaleString()}</div>
                {fraction}
            </div>
        );
    }
}

export default Money;
