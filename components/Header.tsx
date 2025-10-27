
import React from 'react';
import { LOGO_URL, SITE_NAME } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="bg-primary-blue text-white shadow-lg p-4 md:p-6 flex items-center justify-center">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={LOGO_URL} alt={`${SITE_NAME} Logo`} className="h-10 md:h-12 w-auto" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {SITE_NAME}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;