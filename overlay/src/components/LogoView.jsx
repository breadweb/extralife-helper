import React from 'react';
import logo from '../assets/images/extra-life-logo.svg';

const LogoView = () => {
    return (
        <div className='flex'>
            <img src={logo} className='animate-fade-in' alt='Extra Life' />
        </div>
    );
};

export default LogoView;
