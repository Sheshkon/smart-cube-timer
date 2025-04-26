import {Award, BarChart2, Clock, Trash2, TrendingUp} from 'lucide-react';
import React, {useState} from 'react';
import DeleteModal from "../../components/Model/DeleteModal.jsx";
import {formatTime} from '../../utils/time.js';

const StatsDisplay = ({onDeleteTimes, times, className = ''}) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const calculateStats = () => {
        if (times.length === 0) return {current: 0, best: 0, avg5: 0, avg12: 0, avg100: 0};

        const sortedTimes = [...times].sort((a, b) => a.originalTime.asTimestamp - b.originalTime.asTimestamp);

        const best = sortedTimes[0];
        const current = times[times.length - 1];

        const avg5 = calculateAverage(times.slice(-5));

        const avg12 = calculateAverage(times.slice(-12));

        const avg100 = calculateAverage(times.slice(-100));

        return {current, best, avg5, avg12, avg100};
    };

    const calculateAverage = (times) => {

        if (times.length === 0) return 0;
        if (times.length < 3) return times.reduce((sum, time) => sum + time.originalTime.asTimestamp, 0) / times.length;

        const sorted = [...times].sort((a, b) => a.originalTime.asTimestamp - b.originalTime.asTimestamp);
        const sliced = sorted.slice(1, -1);

        return sliced.reduce((sum, time) => sum + time.originalTime.asTimestamp, 0) / sliced.length;
    };

    const stats = calculateStats();

    const statItems = [
        {label: 'Current', value: stats.current.formattedTime, icon: <Clock size={18}/>},
        {label: 'Best', value: stats.best.formattedTime, icon: <Award size={18}/>},
        {label: 'Avg5', value: formatTime(stats.avg5.toFixed(0)), icon: <TrendingUp size={18}/>},
        {label: 'Avg12', value: formatTime(stats.avg12.toFixed(0)), icon: <BarChart2 size={18}/>}
    ];

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Statistics</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {statItems.map((item, index) => (
                    <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md flex flex-col items-center justify-center"
                    >
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                            {item.icon}
                            <span className="ml-1 text-xs font-medium">{item.label}</span>
                        </div>
                        <div className="font-mono font-semibold text-lg text-gray-900 dark:text-white">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <DeleteModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onDelete={() => onDeleteTimes()}
                    isDeleting={isDeleting}
                />

                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Session: {times.length} solves
                    <button
                        onClick={openModal}
                        className="p-1 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Delete all times"
                    >
                        <Trash2 size={16}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsDisplay;
