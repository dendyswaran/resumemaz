import { useAtom } from "jotai";
import { useState } from "react";
import { ResumeState } from "../../libs/state";
import { Skill } from "../../types/Skill";
import HistoryItem from "../shared/HistoryItem";
import DetailSkill from "./partials/DetailSkill";

export default function FormSkills() {
    const [resumeState, setResumeState] = useAtom(ResumeState);
    const [toggleDetail, setToggleDetail] = useState<boolean>(false);
    const [editValue, setEditValue] = useState<Skill | null>(null);

    const handleAddSkill = (upsertSkill: Skill) => {
        if (
            upsertSkill.index != null &&
            typeof upsertSkill.index === 'number'
        ) {
            console.log(resumeState)
            setResumeState((prevState) => {
                const currentSkills = [...prevState.skills];
                currentSkills[upsertSkill.index!] = upsertSkill;
                return {
                    ...prevState,
                    skills: currentSkills,
                };
            });
        } else {
            setResumeState((prevState) => ({
                ...prevState,
                skills: [
                    ...prevState.skills,
                    upsertSkill,
                ],
            }));
        }
        setEditValue(null);
        setToggleDetail(false);
    };

    const handleDeleteSkill = (index: number) => {
        if (confirm('Are you sure want to delete this item?')) {
            setResumeState((prevState) => {
                const currentSkills = [...prevState.skills];
                currentSkills.splice(index, 1);
                return {
                    ...prevState,
                    skills: currentSkills,
                };
            });
        }
    };

    const handleUpdateSkill = (
        index: number,
        updateSkill: Skill
    ) => {
        setToggleDetail(true);
        setEditValue({
            ...updateSkill,
            index,
        });
    };

    return (
        <div className="flex flex-col gap-2 p-5 h-full">
            <h1 className="text-gray-700 text-2xl font-bold">Skills</h1>
            <p className="text-sm text-gray-700">
                Choose 5 important skills that show you fit the position. Make sure they match the key skills mentioned in the job listing (especially when applying via an online system).
            </p>
            <div className="flex flex-col gap-5 pt-[10px]">
                {resumeState.skills.map((item, index) => (
                    <HistoryItem
                        key={`ski-${index}`}
                        index={index}
                        title={item.skillName}
                        subTitle={item.experience.toString()}
                        onDelete={handleDeleteSkill}
                        onUpdate={handleUpdateSkill}
                        data={item}
                    />
                ))}
                <div className="flex flex-col gap-2">
                    {toggleDetail ? (
                        <DetailSkill
                            skill={editValue}
                            onSubmit={handleAddSkill}
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
                            + Add Skill
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}