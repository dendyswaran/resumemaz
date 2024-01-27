import { Skill } from '../../types/Skill';

// creates label component
type LabelProps = {
    skill: Skill;
    htmlFor?: string;
};

export default function LabelSkillValue({ skill }: LabelProps) {
    const getColor = () => {
        switch (skill.experience) {
            case "Beginner":
                return "text-red-600";
            case "Intermediate":
                return "text-yellow-600";
            case "Advanced":
                return "text-blue-600";
            case "Expert":
                return "text-green-600";
            default:
        }
    }
    return (
        <div className='flex flex-col gap-0'>
            <span className="text-gray-700 text-sm font-bold">{skill.skillName}</span>
            <span className={`text-xs ${getColor()}`}>{skill.experience}</span>
        </div>
    );
}
