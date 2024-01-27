import { atom } from "jotai";
import { EmploymentHistory } from "../types/EmploymentHistory";
import { FeaturedProject } from "../types/FeaturedProject";
import { Skill } from "../types/Skill";

type ResumeStateType = {
    jobTitle: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    country: string;
    city: string;
    profilePicture: string;
    profileDescription: string;
    employmentHistories: EmploymentHistory[];
    featuredProjects: FeaturedProject[];
    skills: Skill[];
}

export const ResumeState = atom<ResumeStateType>({
    jobTitle: "xxxx",
    email: "xxx@xxx.com",
    phone: "xxx-xxx-xxxx",
    firstName: "xxx",
    lastName: "xxx",
    city: "xxx",
    country: "xxx",
    profilePicture: "",
    profileDescription: "",
    employmentHistories: [],
    featuredProjects: [],
    skills: [],
})