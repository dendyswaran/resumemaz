import { atom } from "jotai";
import { EmploymentHistory } from "../types/EmploymentHistory";
import { FeaturedProject } from "../types/FeaturedProject";
import { Skill } from "../types/Skill";
import { EducationHistory } from "../types/EducationHistory";
import { CertificationHistory } from "../types/CertificationHistory";
import { SocialLink } from "../types/SocialLink";

type ResumeStateType = {
    jobTitle: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    country: string;
    dateOfBirth: string;
    city: string;
    profilePicture: string;
    profileDescription: string;
    employmentHistories: EmploymentHistory[];
    educationHistories: EducationHistory[];
    certificationHistories: CertificationHistory[];
    featuredProjects: FeaturedProject[];
    skills: Skill[];
    socialLinks: SocialLink[];
}

export const ResumeState = atom<ResumeStateType>({
    jobTitle: "xxxx",
    email: "xxx@xxx.com",
    phone: "xxx-xxx-xxxx",
    firstName: "xxx",
    lastName: "xxx",
    city: "xxx",
    country: "xxx",
    dateOfBirth: "xxx",
    profilePicture: "",
    profileDescription: "",
    employmentHistories: [],
    educationHistories: [],
    certificationHistories: [],
    featuredProjects: [],
    skills: [],
    socialLinks: [],
})