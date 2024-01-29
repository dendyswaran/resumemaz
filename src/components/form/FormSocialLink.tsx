import { useAtom } from "jotai";
import { useState } from "react";
import { ResumeState } from "../../libs/state";
import { SocialLink } from "../../types/SocialLink";
import HistoryItem from "../shared/HistoryItem";
import DetailSocialLink from "./partials/DetailSocialLink";

export default function FormSocialLinks() {
    const [resumeState, setResumeState] = useAtom(ResumeState);
    const [toggleDetail, setToggleDetail] = useState<boolean>(false);
    const [editValue, setEditValue] = useState<SocialLink | null>(null);

    const handleAddSocialLink = (upsertSocialLink: SocialLink) => {
        if (
            upsertSocialLink.index != null &&
            typeof upsertSocialLink.index === 'number'
        ) {
            setResumeState((prevState) => {
                const currentSocialLinks = [...prevState.socialLinks];
                currentSocialLinks[upsertSocialLink.index!] = upsertSocialLink;
                return {
                    ...prevState,
                    socialLinks: currentSocialLinks,
                };
            });
        } else {
            setResumeState((prevState) => ({
                ...prevState,
                socialLinks: [
                    ...prevState.socialLinks ?? [],
                    upsertSocialLink,
                ],
            }));
        }
        setEditValue(null);
        setToggleDetail(false);
    };

    const handleDeleteSocialLink = (index: number) => {
        if (confirm('Are you sure want to delete this item?')) {
            setResumeState((prevState) => {
                const currentSocialLinks = [...prevState.socialLinks];
                currentSocialLinks.splice(index, 1);
                return {
                    ...prevState,
                    socialLinks: currentSocialLinks,
                };
            });
        }
    };

    const handleUpdateSocialLink = (
        index: number,
        updateSocialLink: SocialLink
    ) => {
        setToggleDetail(true);
        setEditValue({
            ...updateSocialLink,
            index,
        });
    };

    return (
        <div className="flex flex-col gap-2 p-5 h-full">
            <h1 className="text-gray-700 text-2xl font-bold">Social Links</h1>
            <p className="text-sm text-gray-700">
                Choose 5 important socialLinks that show you fit the position. Make sure they match the key socialLinks mentioned in the job listing (especially when applying via an online system).
            </p>
            <div className="flex flex-col gap-5 pt-[10px]">
                {resumeState.socialLinks?.map((item, index) => (
                    <HistoryItem
                        key={`ski-${index}`}
                        index={index}
                        title={item.label}
                        subTitle={item.link}
                        onDelete={handleDeleteSocialLink}
                        onUpdate={handleUpdateSocialLink}
                        data={item}
                    />
                ))}
                <div className="flex flex-col gap-2">
                    {toggleDetail ? (
                        <DetailSocialLink
                            socialLink={editValue}
                            onSubmit={handleAddSocialLink}
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
                            + Add Social Link
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}