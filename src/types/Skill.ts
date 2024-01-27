export type Skill = {
    index?: number | null;
    skillName: string;
    experience: SkillExperience
};

export type SkillExperience = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export const SkillExperiences = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
]