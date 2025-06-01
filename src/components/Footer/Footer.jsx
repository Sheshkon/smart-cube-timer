import React from 'react';

import { Coffee, Github } from 'lucide-react';
import PropTypes from 'prop-types';

const Footer = ({ className = '' }) => (
  <footer
    className={`py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400 ${className}`}
  >
    <div className="container mx-auto">
      <div className="flex flex-col justify-between items-center">
        <div className="mb-2 md:mb-0">
          © {new Date().getFullYear()} Smart³
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/Sheshkon/smart-cube-timer"
            className="inline-flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            target="https://github.com/Sheshkon/smart-cube-timer"
            rel="noopener noreferrer"
          >
            <Github size={16} className="mr-1" />
            <span>GitHub</span>
          </a>
          <a
            href="https://github.com/Sheshkon/smart-cube-timer"
            className="inline-flex items-center hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            target="https://github.com/Sheshkon/smart-cube-timer"
            rel="noopener noreferrer"
          >
            <Coffee size={16} className="mr-1" />
            <span>Support</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

Footer.propTypes = {
  className: PropTypes.string,
};

export default Footer;
