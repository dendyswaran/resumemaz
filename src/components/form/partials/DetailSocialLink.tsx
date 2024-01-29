import { useState } from "react";
import { SocialLink } from "../../../types/SocialLink";
import FormGroup from "../../shared/FormGroup";
import InputText from "../../shared/InputText";
import Label from "../../shared/Label";

type DetailSocialLinkProps = {
    onCancel: () => void;
    onSubmit?: (result: SocialLink) => void;
    socialLink?: SocialLink | null;
};

export default function DetailSocialLink(props: DetailSocialLinkProps) {
    const { socialLink } = props;
    const [label, setLabel] = useState(socialLink?.label ?? '');
    const [link, setLink] = useState(socialLink?.link ?? '');

    return (
        <div className="flex flex-col gap-4 p-5 border-gray-200 border-[1px] rounded-md">
            <div className="grid grid-cols-2 gap-5 pt-[10px]">
                <section className="flex flex-col gap-2">
                    <FormGroup>
                        <Label htmlFor="name">Social Link</Label>
                        <InputText
                            type="text"
                            value={label}
                            onChange={(v) => setLabel(v.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="name">Link</Label>
                        <InputText
                            type="text"
                            value={link}
                            onChange={(v) => setLink(v.target.value)}
                        />
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
                            index: props.socialLink?.index ?? null,
                            label,
                            link
                        })
                    }
                >
                    Apply
                </button>
            </div>
        </div>
    )
}