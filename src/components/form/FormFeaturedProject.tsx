import { useState } from 'react';
import DetailFeaturedProject from './partials/DetailFeaturedProject';
import { FeaturedProject } from '../../types/FeaturedProject';
import { ResumeState } from '../../libs/state';
import { useAtom } from 'jotai';
import HistoryItem from '../shared/HistoryItem';

export default function FormFeaturedProject() {
  const [resumeState, setResumeState] = useAtom(ResumeState);
  const [toggleDetail, setToggleDetail] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<FeaturedProject | null>(null);

  const handleAddFeaturedProject = (featuredProject: FeaturedProject) => {
    if (
      featuredProject.index != null &&
      typeof featuredProject.index === 'number'
    ) {
      setResumeState((prevState) => {
        const featuredProjects = [...prevState.featuredProjects];
        featuredProjects[featuredProject.index!] = featuredProject;
        return {
          ...prevState,
          featuredProjects,
        };
      });
    } else {
      setResumeState((prevState) => ({
        ...prevState,
        featuredProjects: [...prevState.featuredProjects, featuredProject],
      }));
    }
    setEditValue(null);
    setToggleDetail(false);
  };

  const handleDeleteFeaturedProject = (index: number) => {
    if (confirm('Are you sure want to delete this item?')) {
      setResumeState((prevState) => {
        const featuredProjects = [...prevState.featuredProjects];
        featuredProjects.splice(index, 1);
        return {
          ...prevState,
          featuredProjects,
        };
      });
    }
  };

  const handleUpdateFeaturedProject = (
    index: number,
    featuredProject: FeaturedProject
  ) => {
    setToggleDetail(true);
    setEditValue({
      ...featuredProject,
      index,
    });
  };

  return (
    <div className="flex flex-col gap-2 p-5 h-full">
      <h1 className="text-gray-700 text-2xl font-bold">Featured Project</h1>
      <p className="text-sm text-gray-700">
        Show your relevant experience (last 10 years). Use bullet points to note
        your achievements, if possible - use numbers/facts (Achieved X, measured
        by Y, by doing Z).
      </p>
      {resumeState.featuredProjects.map((item, index) => (
        <HistoryItem
          key={`emp-${index}`}
          index={index}
          title={item.activity}
          startDate={item.startDate}
          endDate={item.endDate}
          onDelete={handleDeleteFeaturedProject}
          onUpdate={handleUpdateFeaturedProject}
          data={item}
        />
      ))}
      <div className="flex flex-col gap-5 pt-[10px]">
        <div className="flex flex-col gap-2">
          {toggleDetail ? (
            <DetailFeaturedProject
              featuredProject={editValue}
              onSubmit={handleAddFeaturedProject}
              onCancel={() => {
                setToggleDetail(false);
                setEditValue(null);
              }}
            />
          ) : (
            <button
              className="bg-transparent text-blue-500 rounded-md p-2 w-fit text-sm font-bold"
              onClick={() => setToggleDetail(true)}
            >
              + Add Featured Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
