import React from 'react';
import PropTypes from 'prop-types';
import { Github, Coffee } from 'lucide-react';

const Footer = ({ className = '' }) => {
    return (
        <footer className={`py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400 ${className}`}>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-2 md:mb-0">
                        © {new Date().getFullYear()} CubeTimer. All rights reserved.
                    </div>

                    <div className="flex items-center space-x-4">
                        <a
                            href="#"
                            className="inline-flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Github size={16} className="mr-1" />
                            <span>GitHub</span>
                        </a>

                        <a
                            href="#"
                            className="inline-flex items-center hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                            target="_blank"
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
};

Footer.propTypes = {
    className: PropTypes.string
};

export default Footer;