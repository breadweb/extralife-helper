import React from 'react';
import logo from '../assets/images/extra-life-logo.svg';

function LogoView () {
    return (
        <div className='bg-zinc-500 flex flex-col'>
            <img src={logo} className='h-screen' alt='Extra Life' />
        </div>
    );
}

export default LogoView;
