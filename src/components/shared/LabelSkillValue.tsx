import { Skill } from '../../types/Skill';

// creates label component
type LabelProps = {
    skill: Skill;
    htmlFor?: string;
};

export default function LabelSkillValue({ skill }: LabelProps) {
    return (
        <div className='flex flex-col gap-1'>
            <span className="text-gray-700 text-sm">{skill.skillName}</span>
            <ExpBox skill={skill} />
        </div>
    );
}

const ExpBox = ({ skill }: { skill: Skill }) => {
    const getColor = (index: number) => {
        if (skill.experience === "Beginner" && index === 0) {
            return "bg-gray-600";
        }
        if (skill.experience === "Intermediate" && index <= 1) {
            return "bg-gray-600";
        }
        if (skill.experience === "Advanced" && index <= 2) {
            return "bg-gray-600";
        }
        if (skill.experience === "Expert" && index <= 3) {
            return "bg-gray-600";
        }
        return "bg-gray-200";
    }
    return (
        <div className='grid grid-cols-4 gap-1 w-full'>
            {Array.from(Array(4).keys()).map((_, index: number) => (
                <div key={index} className={`${getColor(index)} w-full h-2 rounded-lg`}></div>
            ))}
        </div>
    )
}
