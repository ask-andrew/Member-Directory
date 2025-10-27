
import React from 'react';
import { SITE_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-blue text-white text-center p-4 mt-8">
      <p className="text-sm">&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
