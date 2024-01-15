import { useState } from 'react';
import DetailFeaturedProject from './partials/DetailFeaturedProject';
import { FeaturedProject } from '../../types/FeaturedProject';

export default function FormFeaturedProject() {
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>(
    []
  );
  const [toggleDetail, setToggleDetail] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-2 p-5 h-full">
      <h1 className="text-gray-700 text-2xl font-bold">Featured Project</h1>
      <p className="text-sm text-gray-700">
        Show your relevant experience (last 10 years). Use bullet points to note
        your achievements, if possible - use numbers/facts (Achieved X, measured
        by Y, by doing Z).
      </p>

      <div className="flex flex-col gap-5 pt-[10px]">
        <div className="flex flex-col gap-2">
          {toggleDetail ? (
            <DetailFeaturedProject onCancel={() => setToggleDetail(false)} />
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
