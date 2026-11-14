import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import AppSelect from 'src/components/AppSelect/AppSelect.jsx';
import FullScreenModal from 'src/components/Modals/FullScreenModal.jsx';
import {
  getAllBySheetIdAndCategoryAndGroup,
  getCategories, getGroups,
} from 'src/components/Scramble/practiceScramble.js';
const projectBaseUrl = import.meta.env.BASE_URL;


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

  const goToTimer = () => navigate(projectBaseUrl, { replace: false });

  return (
    <FullScreenModal title="Formulas" onClose={goToTimer} useHistory={false}>
      <div className='flex flex-wrap items-center gap-2 pb-2 pl-2'>
        <label htmlFor='category-select'><b>Category</b></label>
        <AppSelect
          id='category-select'
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={categories.map((category) => ({
            value: category,
            label: category?.replaceAll('_', ' '),
          }))}
        />
      </div>

      <div className='flex flex-wrap items-center gap-2 pb-5 pl-2'>
        <label htmlFor='group-select'><b>Group</b></label>
        <AppSelect
          id='group-select'
          value={selectedGroup}
          onChange={setSelectedGroup}
          options={groups.map((group) => ({
            value: group,
            label: group?.replaceAll('_', ' '),
          }))}
        />
      </div>

      <div className='scrambles-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {formulas.map((scramble, index) => (
          <div key={index} className='scramble-item app-card rounded-lg p-4 overflow-hidden'>
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
    </FullScreenModal>
  );
}

export default FormulasLibrary;
