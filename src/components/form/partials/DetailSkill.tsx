import { useState } from "react";
import { Skill, SkillExperience, SkillExperiences } from "../../../types/Skill";
import FormGroup from "../../shared/FormGroup";
import InputText from "../../shared/InputText";
import Label from "../../shared/Label";

type DetailSkillProps = {
    onCancel: () => void;
    onSubmit?: (result: Skill) => void;
    skill?: Skill | null;
};

export default function DetailSkill(props: DetailSkillProps) {
    const { skill } = props;
    const [skillName, setSkillName] = useState(skill?.skillName ?? '');
    const [experience, setExperience] = useState<SkillExperience>(
        skill?.experience ?? "Beginner"
    );

    return (
        <div className="flex flex-col gap-4 p-5 border-gray-200 border-[1px] rounded-md">
            <div className="grid grid-cols-2 gap-5 pt-[10px]">
                <section className="flex flex-col gap-2">
                    <FormGroup>
                        <Label htmlFor="name">Skill</Label>
                        <InputText
                            type="text"
                            value={skillName}
                            onChange={(v) => setSkillName(v.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="name">Experience</Label>
                        <select
                            value={experience}
                            onChange={(v) => setExperience(v.target.value as SkillExperience)}
                            className="text-gray-700 border border-transparent rounded-md p-2 bg-gray-200 focus:outline-none"
                        >
                            {SkillExperiences.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </FormGroup>
                </section>
            </div>

            <div className="flex gap-2">
                <button
                    className="bg-gray-200 text-gray-700 text-xs rounded-md p-2 w-fit h-fit"
                    onClick={props.onCancel}
                >
                    Cancel
                </button>
                <button
                    className="bg-blue-600 text-white text-xs rounded-md p-2 w-fit h-fit"
                    onClick={() =>
                        props.onSubmit?.({
                            index: props.skill?.index ?? null,
                            skillName,
                            experience
                        })
                    }
                >
                    Apply
                </button>
            </div>
        </div>
    )
}