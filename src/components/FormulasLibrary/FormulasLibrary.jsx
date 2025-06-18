import React, { useEffect, useState } from 'react';

import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const projectBaseUrl = import.meta.env.BASE_URL;

import {
  getAllBySheetIdAndCategoryAndGroup,
  getCategories, getGroups,
} from 'src/components/Scramble/practiceScramble.js';

function FormulasLibrary({ sheetId = '11-C2joy19lxXM9FXPF7STqJ2WpRksoUwm0cMyE7oyH0' }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const navigate = useNavigate();

  const updateGroups = (category) =>
    getGroups(sheetId, category).then((groups) => {
      setGroups([...groups, 'All']);
    });

  useEffect(() => {
    getCategories(sheetId).then((categories) => {
      getAllBySheetIdAndCategoryAndGroup(sheetId, categories[0]).then(setFormulas);
      setCategories(categories);
      setSelectedCategory(categories[0]);
      updateGroups(categories[0]);
    });
  }, []);

  useEffect(() => {
    getAllBySheetIdAndCategoryAndGroup(sheetId, selectedCategory, selectedGroup).then(setFormulas);
  }, [selectedGroup]);

  useEffect(() => {
    getAllBySheetIdAndCategoryAndGroup(sheetId, selectedCategory)
      .then(setFormulas)
      .then(() => updateGroups(selectedCategory));
  }, [selectedCategory]);

  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);

  const handleGroupChange = (e) => setSelectedGroup(e.target.value);

  return (
    <div className='p-5'>
      <button
        onClick={() => navigate(projectBaseUrl, { replace: false })}
        className="flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
      >
        <FiArrowLeft /> To Timer
      </button>
      <div className='pb-2'>
        <label htmlFor='category-select'><b>Category: </b></label>
        <select id='category-select' value={selectedCategory} onChange={handleCategoryChange}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category?.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className='pb-5'>
        <label htmlFor='group-select'><b>Group: </b></label>
        <select id='group-select' value={selectedGroup} onChange={handleGroupChange}>
          {groups.map((group) => (
            <option key={group} value={group}>
              {group?.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className='scrambles-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {formulas.map((scramble, index) => (
          <div key={index} className='scramble-item'>
            <h3>
              <b>{scramble.name}</b>
            </h3>
            {scramble.fileName && (
              <div className='visualization'>
                <img
                  className='w-20'
                  src={`${projectBaseUrl}formulas/${scramble.category}/${scramble.fileName}`}
                  alt={`Visualization ${scramble.name}`}
                />
              </div>
            )}

            <p>
              <strong>Setup:</strong> {scramble.scramble}
            </p>

            <div className='solutions'>
              <ul>
                {scramble.solutions.map((solution, i) => {
                  const isRecommended = solution === scramble.recommendedSolution;
                  return (
                    <li key={i}>
                      {isRecommended ? <b>{solution}</b> : solution}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FormulasLibrary;
