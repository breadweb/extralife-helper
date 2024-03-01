import classNames from 'classnames';
import Money from './Money';
import ProgressBar from './ProgressBar';
import React from 'react';

function Progress ({ amountRaised, areCentsVisible, fundraisingGoal, moneyFormat, progressFormat }) {
    const raised = (
        <Money
            amount={amountRaised}
            areCentsVisible={areCentsVisible}
            format={moneyFormat}
        />
    );

    let goal;
    if (progressFormat !== 'raisedOnly') {
        goal = (
            <Money
                amount={fundraisingGoal}
                areCentsVisible={areCentsVisible}
                format={moneyFormat}
            />
        );
    }

    if (progressFormat === 'raisedOnly') {
        return (
            <div
                className={
                    classNames(
                        'leading-none font-cantarell text-helper3 whitespace-nowrap',
                        moneyFormat === 'fancy' ? 'text-[62px]' : 'text-[54px]',
                    )
                }
            >
                {raised}
            </div>
        );
    }

    if (progressFormat === 'raisedAndGoal') {
        return (
            <div
                className={
                    classNames(
                        'flex space-x-2 leading-none font-cantarell text-helper3 whitespace-nowrap mt-1',
                        moneyFormat === 'fancy' ? 'text-[44px]' : 'text-[38px]',
                    )
                }
            >
                {raised}
                <div>/</div>
                {goal}
            </div>
        );
    }

    if (progressFormat === 'progressBar') {
        return (
            <div className='flex flex-col mt-2 text-[24px] w-full font-cantarell leading-none'>
                <ProgressBar
                    current={amountRaised}
                    required={fundraisingGoal}
                    backColor='bg-helper5'
                    fillColor='bg-helper4'
                    textColor='text-helper3'
                />
                <div className='flex mt-1 text-helper3'>
                    <div className='w-1/2'>
                        {raised}
                    </div>
                    <div className='w-1/2 flex justify-end'>
                        {goal}
                    </div>
                </div>
            </div>
        );
    }
}

export default Progress;
