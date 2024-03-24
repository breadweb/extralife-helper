import CountUp from 'react-countup';
import React, { useCallback } from 'react';
import usePrevious from '../hooks/usePrevious';

const MoneyDisplay = ({ amount, animationLength, areCentsVisible, format }) => {
    const prevAmount = usePrevious(amount);

    const showOnlyCents = useCallback(value => {
        return format === 'standard' ? '.' : '' + value.toFixed(2).padEnd(2, '0').split('.')[1];
    }, [format]);

    const dollars = Math.floor(amount);
    const cents = (amount - dollars) * 100;
    console.log(dollars, cents);
    const shouldDisplayCents = areCentsVisible && cents > 0;
    const centsDisplay = `${format === 'standard' ? '.' : ''}${cents.toFixed(0).padStart(2, '0')}`;
    const shouldAnimate = animationLength !== undefined && amount !== undefined && prevAmount !== undefined;

    if (format === 'standard') {
        if (shouldAnimate) {
            return (
                <CountUp
                    start={prevAmount}
                    end={amount}
                    duration={animationLength}
                    decimals={shouldDisplayCents ? 2 : 0}
                    prefix='$'
                />
            );
        } else {
            return (
                <div className='flex flex-row'>
                    <div>
                        ${dollars.toLocaleString()}
                        {shouldDisplayCents ? centsDisplay : '' }
                    </div>
                </div>
            );
        }
    } else {
        let majorPart;
        let minorPart;

        if (shouldAnimate) {
            majorPart = (
                <CountUp
                    start={prevAmount}
                    end={amount}
                    duration={animationLength}
                />
            );
        } else {
            majorPart = (
                <div>{dollars.toLocaleString()}</div>
            );
        }

        if (shouldDisplayCents) {
            if (shouldAnimate) {
                minorPart = (
                    <CountUp
                        start={prevAmount}
                        end={amount}
                        duration={animationLength}
                        decimals={2}
                        formattingFn={showOnlyCents}
                    />
                );
            } else {
                minorPart = centsDisplay;
            }
        }

        return (
            <div className='flex flex-row'>
                <div className='text-[50%] relative align-baseline mt-[0.2em]'>
                    $
                </div>
                {majorPart}
                <div className='text-[40%] relative align-baseline mt-[0.3em]'>
                    {minorPart}
                </div>
            </div>
        );
    }
};

export default React.memo(MoneyDisplay);
